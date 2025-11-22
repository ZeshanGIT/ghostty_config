# Technical Design Decisions

**Project**: Ghostty Config Editor
**Date**: 2025-11-22
**Phase**: Phase 2 Planning
**Status**: Approved and Locked

This document captures all technical design decisions made during the planning and implementation of the Ghostty Config Editor. These decisions guide implementation and ensure consistency across the codebase.

---

## Table of Contents

1. [Data Storage Strategy](#1-data-storage-strategy)
2. [Schema Generation Strategy](#2-schema-generation-strategy)
3. [Validation Depth](#3-validation-depth)
4. [Default Values Source](#4-default-values-source)
5. [Unknown Properties Handling](#5-unknown-properties-handling)
6. [Backup Strategy](#6-backup-strategy)
7. [File Change Detection](#7-file-change-detection)
8. [Config File Includes Support](#8-config-file-includes-support)
9. [Parse Error Handling](#9-parse-error-handling)
10. [Property Organization](#10-property-organization)
11. [Config File Preservation](#11-config-file-preservation)
12. [Repeatable Properties Handling](#12-repeatable-properties-handling)

---

## 1. Data Storage Strategy

### Decision: **Hybrid Approach with TypeScript Schema**

**Chosen Approach:**

- **Configuration Schema/Metadata** → TypeScript constants (generated from `ghostty_docs.txt`)
- **User's Config Files** → `.properties` format (native Ghostty format)
- **Application State** → Zustand with localStorage persistence

**Implementation:**

```typescript
// Generated schema bundled with app
import { GHOSTTY_SCHEMA } from '@/data/ghostty-schema.generated';

// User's config loaded at runtime
const userConfig = await readConfigFile('~/.config/ghostty/config');

// Parse and merge
const editorState = mergeConfigWithSchema(userConfig, GHOSTTY_SCHEMA);
```

**Rationale:**

- Schema is small (~200-300 properties), fits in memory
- User's .properties files remain in Ghostty's native format (maximum compatibility)
- No database overhead for a dataset this size
- TypeScript provides compile-time type safety
- Ghostty config updates are infrequent, so generated schema is acceptable

**Alternatives Considered:**

- ❌ SQLite database - Overkill for small dataset
- ❌ JSON schema files - Less type-safe, runtime parsing needed
- ❌ Pure TypeScript constants - Harder to update when Ghostty changes

---

## 2. Schema Generation Strategy

### Decision: **Manual Script, Committed Schema** (Option A)

**Implementation:**

```bash
# Run manually when ghostty_docs.txt updates
pnpm generate:schema

# Generates: src/data/ghostty-schema.generated.ts
# File is committed to version control
```

**Rationale:**

- Ghostty updates are infrequent (every few months)
- Faster build times (no regeneration on every build)
- Schema changes can be reviewed in git diffs
- Build doesn't depend on ghostty_docs.txt being present

**Script Location:**

- `scripts/generateSchema.ts` - Main schema generator
- Parses `ghostty_docs.txt` + all `.properties` files in `ghostty_configs/`
- Outputs to `src/data/ghostty-schema.generated.ts`

**Workflow:**

1. Ghostty releases new version with config changes
2. Update `ghostty_docs.txt` in repo
3. Run `pnpm generate:schema`
4. Review generated schema changes
5. Commit updated schema

**Alternatives Considered:**

- ❌ Build-time generation - Slower builds, needs docs at build time
- ❌ Manual TypeScript editing - Too much maintenance overhead

---

## 3. Validation Depth

### Decision: **Detailed Validation** (min/max, enums, patterns)

**Schema Structure:**

```typescript
interface ConfigProperty {
  key: string;
  displayName: string;
  type: PropertyType;
  category: string;
  section: string;
  description: string;
  defaultValue: string | null;

  // Validation rules
  validation?: {
    min?: number; // For numbers
    max?: number; // For numbers
    pattern?: string; // Regex pattern for strings
    enum?: string[]; // Allowed values for enums
  };

  isRepeatable: boolean;
  examples?: string[];
}
```

**Validation Examples:**

```typescript
// Number with range
{
  key: 'window-width',
  type: 'number',
  validation: { min: 400, max: 7680 }
}

// Enum with allowed values
{
  key: 'cursor-style',
  type: 'enum',
  validation: { enum: ['block', 'bar', 'underline'] }
}

// String with pattern
{
  key: 'font-family',
  type: 'string',
  validation: { pattern: '^[\\w\\s-]+$' }
}
```

**Rationale:**

- Provides immediate feedback to users
- Prevents invalid configurations
- Extracted automatically from ghostty_docs.txt
- Balances UX with implementation complexity

**Not Included (for now):**

- ❌ Custom validators (e.g., checking if font is installed)
- ❌ Cross-property validation (e.g., width < height)
- ❌ Async validation (e.g., network checks)

These can be added in future phases if needed.

---

## 4. Default Values Source

### Decision: **Parse from ghostty_docs.txt** (Option A)

**Implementation:**
The schema generator will extract default values from documentation:

```
# From ghostty_docs.txt:
# font-family
#
# The font family to use. This is the default font family...
# Default: monospace

font-family = monospace
```

**Parser extracts:**

```typescript
{
  key: 'font-family',
  defaultValue: 'monospace',  // ← Extracted from "Default: monospace"
}
```

**Rationale:**

- Default values already documented in ghostty_docs.txt
- Automatic extraction keeps schema in sync with Ghostty
- No manual maintenance required
- Ghostty's documentation is the source of truth

**Fallback:**
If parser can't extract default, set to `null`:

```typescript
{
  key: 'some-property',
  defaultValue: null,  // UI will show "unset" or "use Ghostty default"
}
```

**Alternatives Considered:**

- ❌ Hardcode defaults - Manual maintenance, prone to drift
- ❌ No defaults - Less helpful to users

---

## 5. Unknown Properties Handling

### Decision: **Preserve with Warning** (Option A)

**Behavior:**
When user's config contains a property not in our schema:

```properties
# User's config
font-family = JetBrains Mono
experimental-new-feature = true  # ← Not in schema!
```

**Implementation:**

1. **During Load:**
   - Parse all properties (known and unknown)
   - Flag unknown properties
   - Store in separate map: `unknownProperties: Map<string, string>`

2. **In UI:**
   - Don't show unknown properties in editor
   - Show warning banner: "⚠️ Config contains 2 unknown properties. [View Details]"
   - Details dialog lists unknown properties (read-only)

3. **During Save:**
   - Preserve unknown properties exactly as they were
   - Include in saved file at original positions
   - Don't modify their values

**Rationale:**

- **Forward compatibility**: User might have newer Ghostty version
- **Safety**: Don't delete what we don't understand
- **Transparency**: User knows about unknown properties
- **Non-destructive**: Never lose user data

**Edge Cases:**

- Typos in property names → Preserved (user can fix manually)
- Deprecated properties → Preserved (Ghostty will ignore)
- Custom properties → Preserved (might be for future Ghostty versions)

**Alternatives Considered:**

- ❌ Remove unknown properties - Too dangerous, data loss
- ❌ Preserve silently - User should know about issues
- ❌ Prompt for each - Too many interruptions

---

## 6. Backup Strategy

### Decision: **Always Create .bak File** (Option A)

**Implementation:**
Before saving config file, create backup:

```typescript
async function saveConfig(filePath: string, content: string) {
  const backupPath = `${filePath}.bak`;

  // Step 1: Create backup of current file (if exists)
  if (await fileExists(filePath)) {
    await copyFile(filePath, backupPath);
  }

  // Step 2: Write new config
  await writeFile(filePath, content);

  // Step 3: Show confirmation
  showNotification('Config saved. Backup created at: config.bak');
}
```

**Backup Behavior:**

- **Location**: Same directory as config file
- **Name**: `config.bak` (overwrites previous backup)
- **Timing**: Created immediately before each save
- **Retention**: Only 1 backup kept (most recent)

**User Experience:**

- Automatic (no user action required)
- Unobtrusive (just a notification)
- Simple recovery: `cp config.bak config` to restore

**Rationale:**

- **Safety net**: Users can always undo last save
- **Simple**: No complex versioning or UI
- **Standard**: Many config editors use `.bak` convention
- **Low overhead**: Single file, overwritten each time

**Future Enhancements (Phase 3+):**

- Multiple backups with timestamps
- User preference to disable backups
- Backup history viewer

**Alternatives Considered:**

- ❌ Timestamped backups - Clutter, cleanup needed
- ❌ Optional backups - Safety should be default
- ❌ No backups - Too risky for config files

---

## 7. File Change Detection

### Decision: **Check on Save** (Option B)

**Implementation:**

```typescript
async function saveConfig(filePath: string, newContent: string) {
  // Step 1: Read current file stats
  const stats = await getFileStats(filePath);

  // Step 2: Check if modified since we loaded it
  if (stats.modifiedTime > loadedFileTimestamp) {
    // Show conflict dialog
    const action = await showDialog({
      title: 'File Changed',
      message: 'Config file was modified outside this editor. What would you like to do?',
      buttons: [
        'Overwrite', // Save our changes anyway
        'Reload', // Discard our changes, reload from disk
        'Compare', // Show diff (future enhancement)
      ],
    });

    if (action === 'Reload') {
      await reloadConfig(filePath);
      return;
    }
  }

  // Step 3: Proceed with save
  await createBackup(filePath);
  await writeFile(filePath, newContent);
}
```

**Rationale:**

- **Prevents data loss**: User won't accidentally overwrite external changes
- **Simple**: Only checks at save time (no continuous watching)
- **No overhead**: No file watchers running in background
- **Clear choice**: User decides how to resolve conflict

**Not Implemented (for Phase 2):**

- ❌ Live file watching - Adds complexity
- ❌ Automatic reload - Could lose user's work
- ❌ Three-way merge - Too complex for Phase 2

**Future Enhancement (Phase 3+):**

- Diff viewer to compare changes
- Three-way merge for conflicting edits

**Alternatives Considered:**

- ❌ Watch for changes continuously - Performance overhead, battery drain
- ❌ Don't detect changes - Risk of data loss

---

## 8. Config File Includes Support

### Decision: **Phase 3+ Feature** (Option A for Phase 2)

**Phase 2 Behavior:**
Ghostty supports including other config files:

```properties
# Main config
font-family = JetBrains Mono
config-file = /path/to/shared-theme.properties
```

**In Phase 2:**

- **Parse**: Recognize `config-file` directive
- **Display**: Show in UI (read-only, not editable)
- **Warning**: "This config includes other files. Included properties are not shown."
- **Preserve**: Keep `config-file` lines when saving

**Not Supported in Phase 2:**

- ❌ Following includes and parsing referenced files
- ❌ Editing properties from included files
- ❌ Showing merged view of all includes

**Rationale:**

- **Scope management**: Keep Phase 2 focused on core functionality
- **Complexity**: Include resolution adds significant complexity
- **Edge cases**: Circular includes, missing files, relative paths
- **User base**: Most users have single config file

**Phase 3+ Implementation:**
When we add full include support:

1. Recursively parse all included files
2. Build merged view (show which file each property comes from)
3. Allow editing properties in included files
4. Save to correct file (main or included)
5. Handle include path resolution (relative/absolute)

**Alternatives Considered:**

- ❌ Full support in Phase 2 - Too much scope creep
- ❌ Ignore includes entirely - Would confuse users who use them

---

## 9. Parse Error Handling

### Decision: **Best-Effort Parsing** (Option A)

**Behavior:**
When parsing user's config with errors:

```properties
# Example config with errors
font-family = JetBrains Mono    # ✅ Valid
broken line without equals      # ❌ Invalid (no =)
palette = 0=#zzz                # ❌ Invalid (bad color)
window-width = 1200             # ✅ Valid
```

**Implementation:**

```typescript
interface ParseResult {
  valid: ConfigProperty[]; // Successfully parsed
  invalid: InvalidLine[]; // Parse errors
  warnings: Warning[]; // Non-fatal issues
}

function parseConfig(content: string): ParseResult {
  const result: ParseResult = {
    valid: [],
    invalid: [],
    warnings: [],
  };

  content.split('\n').forEach((line, lineNumber) => {
    try {
      const property = parseLine(line);
      result.valid.push(property);
    } catch (error) {
      result.invalid.push({
        lineNumber,
        content: line,
        error: error.message,
      });
    }
  });

  return result;
}
```

**UI Handling:**

1. **Load**: Parse everything possible, skip invalid lines
2. **Display**: Show valid properties in editor
3. **Warning**: Show notification: "⚠️ 2 lines couldn't be parsed. [View Errors]"
4. **Error Dialog**: List all parse errors with line numbers
5. **Save**: Preserve invalid lines exactly as they were

**Error Types:**

- **Syntax errors**: Line doesn't match `key = value` format
- **Type errors**: Value doesn't match expected type (e.g., `width = abc`)
- **Validation errors**: Value out of range (e.g., `width = -100`)

**Rationale:**

- **User-friendly**: Don't block entire config due to one error
- **Non-destructive**: Preserve lines we don't understand
- **Informative**: User knows what's wrong and where
- **Practical**: Real configs often have experimental/custom properties

**Future Enhancement:**

- Auto-fix suggestions for common errors
- Syntax highlighting for invalid lines
- Quick-fix actions in error dialog

**Alternatives Considered:**

- ❌ Strict parsing - Too rigid, rejects valid configs
- ❌ Auto-fix - Too risky, might change user intent
- ❌ Silent errors - User doesn't know about issues

---

## 10. Property Organization

### Decision: **Use Existing Structure** (Option A)

**Current Organization** (from `ghostty_configs/`):

```
ghostty_configs/
├── appearance/
│   ├── theme.properties
│   ├── font.properties
│   ├── cursor.properties
│   ├── shader.properties
│   └── background.properties
├── input/
│   ├── keybinds.properties
│   ├── mouse.properties
│   └── clipboard.properties
├── terminal/
│   ├── terminal.properties
│   ├── links.properties
│   ├── osc.properties
│   ├── vt.properties
│   └── shell-integration.properties
├── window/
│   ├── window.properties
│   └── management.properties
├── ui/
│   ├── behavior.properties
│   ├── focus.properties
│   ├── quick-terminal.properties
│   ├── command-palette.properties
│   └── resize-overlay.properties
├── platform/
│   ├── macos.properties
│   ├── linux.properties
│   └── gtk.properties
├── system/
│   ├── async.properties
│   └── auto-update.properties
├── notifications/
│   ├── bell.properties
│   └── notifications.properties
└── config/
    └── config.properties
```

**Schema Structure:**

```typescript
interface GhosttySchema {
  categories: ConfigCategory[]; // 9 categories (appearance, input, etc.)
}

interface ConfigCategory {
  id: string; // e.g., "appearance"
  displayName: string; // e.g., "Appearance"
  icon: string; // Icon name from lucide-react
  sections: ConfigSection[];
}

interface ConfigSection {
  id: string; // e.g., "font"
  displayName: string; // e.g., "Font Settings"
  properties: ConfigProperty[];
}
```

**Mapping:**

- **Folder name** → Category ID
- **File name** → Section ID
- **Properties in file** → Section's properties

**Rationale:**

- **Already organized**: Existing structure is logical and well thought out
- **1:1 mapping**: Easy to understand and maintain
- **Consistent**: Schema matches file structure exactly
- **Tested**: Structure already validated through Python scripts

**UI Navigation:**

```
Sidebar:
├─ 🎨 Appearance
│  ├── Theme
│  ├── Font
│  ├── Cursor
│  ├── Shader
│  └── Background
├─ ⌨️  Input
│  ├── Keybinds
│  ├── Mouse
│  └── Clipboard
├─ 🖥️  Terminal
│  ├── Terminal
│  ├── Links
│  ├── OSC
│  ├── VT
│  └── Shell Integration
└─ ... (etc)
```

**Alternatives Considered:**

- ❌ Reorganize for UI - Would diverge from file structure, confusing
- ❌ Flatten structure - Would lose logical grouping
- ❌ Add new groupings - Unnecessary complexity

---

## 11. Config File Preservation

### Decision: **Smart Merge with Surgical Updates**

**Principle:** When saving, preserve the user's original file structure and only update modified values.

**What We Preserve:**

- ✅ **Comments** (lines starting with `#`)
- ✅ **Blank lines**
- ✅ **Property order**
- ✅ **Whitespace formatting** (spaces around `=`)
- ✅ **Unknown properties** (not in schema)

**What We Update:**

- ✅ **Property values** (only for modified properties)
- ✅ **Add new properties** (when user adds them via UI)

**Implementation:**

```typescript
interface ConfigLine {
  type: 'comment' | 'blank' | 'property';
  content: string; // Original line text
  lineNumber: number;

  // For property lines only:
  key?: string;
  value?: string;
  raw?: string; // Full original line (for format preservation)
}

interface ParsedConfigFile {
  lines: ConfigLine[];
  propertyMap: Map<string, number>; // key -> line number
}
```

**Save Algorithm:**

1. Read original file, parse into `ConfigLine[]`
2. For each line:
   - If comment/blank → Keep as-is
   - If property and modified → Update value only
   - If property and not modified → Keep as-is
3. Append new properties at end (or in category section)

**Example:**

```properties
# My custom config
font-family = Monaco    # User changes to "JetBrains Mono"

# Window settings
window-width = 1200     # Not modified

# Comment about theme
theme = nord            # Not modified
```

**After Save (only font-family modified):**

```properties
# My custom config
font-family = JetBrains Mono    # ← Only this line changed

# Window settings
window-width = 1200

# Comment about theme
theme = nord
```

**Rationale:**

- **Respects user**: Don't destroy manual organization
- **Minimal diffs**: Git shows only actual changes
- **Safe**: Easy to review what changed
- **Familiar**: Matches how text editors work

**Alternatives Considered:**

- ❌ Rewrite entire file - Loses comments and organization
- ❌ Append all changes - Creates duplicates
- ❌ Sort alphabetically - Loses user's preferred order

---

## 12. Repeatable Properties Handling

### Decision: **Smart Update with Comment Tracking** (Option C) + Warning

**Context:**
Ghostty config does NOT support inline comments. Only full-line comments (lines starting with `#`) are preserved.

**Repeatable Properties:**
Properties that can appear multiple times, like `palette`:

```properties
# Color scheme
palette = 0=#1d1f21
palette = 1=#cc6666
palette = 2=#b5bd68
# This is my favorite blue
palette = 3=#81a2be
palette = 4=#b294bb
```

**Behavior When Reordering:**

**Option C Implementation:**

1. **Parse** all palette entries as a group
2. **Track** block comments above palette section
3. **Preserve** block comments when reordering
4. **Warn** user that comments might become inaccurate

**Example:**
User reorders: moves blue (index 3) to position 1

**Before:**

```properties
# Color scheme
palette = 0=#1d1f21
palette = 1=#cc6666
palette = 2=#b5bd68
# This is my favorite blue
palette = 3=#81a2be
palette = 4=#b294bb
```

**After:**

```properties
# Color scheme
palette = 0=#1d1f21
palette = 1=#81a2be  # ← Moved here
palette = 2=#b5bd68
# This is my favorite blue  ← Comment stays but now refers to wrong color
palette = 3=#cc6666  # ← Moved here
palette = 4=#b294bb
```

**Warning Dialog:**

```
⚠️ Reordering Palette Colors

Reordering will update palette indices but block comments
will stay in their original positions. This may make your
comments inaccurate.

Recommendation: Review your comments after saving.

[Cancel] [Proceed with Reorder]
```

**Rationale:**

- **User awareness**: Clear warning about comment impact
- **Preserve data**: Don't delete comments
- **User choice**: Let user decide if they want to reorder
- **Simplicity**: No complex comment association logic

**Future Enhancement (Phase 3+):**

- UI to edit comments alongside palette entries
- Auto-detect comment-to-property associations
- Suggest comment updates after reordering

**Alternatives Considered:**

- ❌ Update in-place - Comments become wrong, confusing
- ❌ Remove and re-add - Loses all block comments
- ❌ Try to associate comments - Too complex, error-prone for block comments

---

## Removed Properties Handling

### Decision: **Remove Line Entirely** (From Question 2)

**Behavior:**
When user removes a property value (sets back to default/unset):

**Before:**

```properties
font-family = JetBrains Mono
window-width = 1200
theme = nord
```

**User Action:** Remove `theme` property (use Ghostty default)

**After:**

```properties
font-family = JetBrains Mono
window-width = 1200
# theme line is completely removed
```

**Rationale:**

- **Clean**: No clutter from commented-out properties
- **Clear**: Absence of property means "use default"
- **Standard**: Matches Ghostty's convention

**Not Chosen:**

- ❌ Comment out: `# theme = nord` - Creates clutter
- ❌ Empty value: `theme = ` - Ambiguous meaning

---

## New Properties Placement

### Decision: **Append at End (default) with User Preference** (From Question 1)

**Default Behavior:**
When user adds a new property via UI that wasn't in original config:

```properties
# Original config
font-family = JetBrains Mono
window-width = 1200

# Properties added by Ghostty Config Editor
window-height = 800
```

**User Preference (Phase 3+):**
In app preferences, user can choose:

- **Option A (default)**: Append at end of file
- **Option B**: Insert in appropriate category section

**Rationale:**

- **Safe**: Appending can't break existing structure
- **Clear**: User knows which properties were added by editor
- **Flexible**: Advanced users can choose organized insertion later

---

## Document Maintenance

**Review Schedule:**

- Review after each major phase completion
- Update when architecture changes
- Add new sections for new technical decisions

**Change Process:**

1. Propose change with rationale
2. Document why previous decision is being changed
3. Update this document
4. Update CHANGELOG with reference

**Version History:**

- v1.0 (2025-11-22): Initial decisions for Phase 2

---

## Related Documents

- `VISION.md` - High-level project vision and goals
- `IMPLEMENTATION_PLAN.md` - Detailed phase-by-phase implementation plan
- `CLAUDE.md` - Development guidelines and architecture overview
- `README.md` - User-facing setup and usage instructions

---

**End of Technical Decisions Document**
