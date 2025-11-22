# Ghostty Config Editor - Implementation Plan

**Version**: 2.0
**Date**: 2025-11-23
**Status**: Planning
**Schema Source**: `ghosttyConfigSchema.json`

---

## Executive Summary

This implementation plan rebuilds the Ghostty Config Editor using the new **`ghosttyConfigSchema.json`** as the single source of truth. The previous implementation used a TypeScript-generated schema; this version leverages a comprehensive JSON schema with richer metadata, better type definitions, and complete documentation.

**Key Changes from Previous Implementation:**

- Schema source: `ghosttyConfigSchema.json` (JSON) instead of TypeScript-generated schema
- 180 config properties across 7 tabs and 26 sections
- 15 distinct value types (boolean, enum, color, number, text, keybinding, etc.)
- Inline comment blocks for documentation
- Enhanced validation and options metadata
- Platform-specific property support

---

## Schema Overview

**Structure:**

```json
{
  "version": "1.0.0",
  "ghosttyVersion": "latest",
  "tabs": [
    {
      "id": "appearance",
      "label": "Appearance",
      "icon": "Palette",
      "sections": [
        {
          "id": "font",
          "label": "Font",
          "keys": [
            {
              "type": "comment",
              "content": "Documentation..."
            },
            {
              "type": "config",
              "key": "font-family",
              "valueType": "repeatable-text",
              "required": false,
              "repeatable": true,
              "defaultValue": [""],
              "label": "Font Family",
              "validation": { ... },
              "options": { ... },
              "platforms": ["macos", "linux"]
            }
          ]
        }
      ]
    }
  ]
}
```

**Statistics:**

- **7 tabs**: appearance, window, input, terminal, ui, notifications, system
- **26 sections**: font, colors, theme, behavior, keyboard, mouse, etc.
- **180 config properties**
- **15 value types**: boolean, enum, color, number, text, keybinding, filepath, etc.

**Value Types Distribution:**

- `enum`: 53 properties (29%)
- `boolean`: 35 properties (19%)
- `number`: 18 properties (10%)
- `color`: 15 properties (8%)
- `adjustment`: 13 properties (7%)
- `repeatable-text`: 12 properties (7%)
- `text`: 12 properties (7%)
- Others: 22 properties (13%)

---

## Implementation Phases

### Phase 1: Schema Integration & Type System ✅ COMPLETE

**Goal**: Load and parse `ghosttyConfigSchema.json` with full TypeScript type safety.

**Tasks:**

1. **Create TypeScript interfaces for schema structure** ✅
   - Define `GhosttyConfigSchema` interface ✅
   - Define `Tab`, `Section`, `Item` interfaces ✅
   - Define `CommentBlock`, `ConfigProperty` interfaces ✅
   - Define union types for all 15 value types ✅
   - Define `ValidationRule` and `Options` interfaces ✅

2. **Schema loader utility** ✅
   - Create `src/lib/schemaLoader.ts` ✅
   - Load JSON file at runtime (direct import) ✅
   - Validate schema structure ✅
   - Export typed schema object ✅
   - Schema statistics function ✅

3. **Type guards and validators** ✅
   - Create `src/lib/schemaValidators.ts` ✅
   - Type guard: `isConfigProperty(item: Item): item is ConfigProperty` ✅
   - Type guard: `isCommentBlock(item: Item): item is CommentBlock` ✅
   - Type guards for all 15 value types ✅

4. **Schema query utilities** ✅
   - Create `src/lib/schemaQueries.ts` ✅
   - `getPropertyByKey(schema, key): ConfigProperty | null` ✅
   - `getPropertiesByTab(schema, tabId): ConfigProperty[]` ✅
   - `getPropertiesBySection(schema, tabId, sectionId): ConfigProperty[]` ✅
   - `getCommentForProperty(schema, key): string | null` ✅
   - Additional query functions (20+ utility functions) ✅
   - `createPropertyMap(schema): PropertyMap` for O(1) lookups ✅

**Definition of Done:**

- [x] All TypeScript interfaces created and exported ✅
- [x] Schema loads successfully with no type errors ✅
- [~] All type guards pass unit tests (integration tested, formal tests in Phase 7)
- [x] Schema query functions return correct data ✅
- [x] `pnpm type-check` passes with 0 errors ✅
- [x] `pnpm build` succeeds ✅
- [~] Unit tests for schema loader (deferred to Phase 7)
- [x] Documentation: Schema structure documented in code comments ✅

**Implementation Files:**

- `src/types/schema.ts` - Complete type system for all 15 value types
- `src/lib/schemaLoader.ts` - Schema loader with validation
- `src/lib/schemaValidators.ts` - Type guards for all value types
- `src/lib/schemaQueries.ts` - 20+ query utility functions
- `ghosttyConfigSchema.json` - Source schema (180 properties)

---

### Phase 2: Config File Parser & Saver ✅ COMPLETE

**Goal**: Parse and save Ghostty config files while preserving structure, comments, and formatting.

**Tasks:**

1. **Config file parser** ✅
   - Created `src/lib/parser/propertiesParser.ts` (primary implementation)
   - Created `src/lib/configParser.ts` (standalone utilities)
   - Parses `.properties` format (key = value)
   - Handles comments (lines starting with `#`)
   - Handles blank lines
   - Handles repeatable properties (e.g., `palette`, `keybind`)
   - Returns structured parse result with warnings

2. **Value type parsers** ✅
   - Created `src/lib/valueTypeParsers.ts`
   - Parsers for all 15 value types:
     - `parseBoolean` - true/false values
     - `parseEnum` - predefined options
     - `parseColor` - hex colors, named colors
     - `parseNumber` - integers and decimals
     - `parseKeybinding` - key>action format
     - `parseFilePath` - file and directory paths
     - `parseCommand` - command entries
     - `parseAdjustment` - integer or percentage
     - `parseOpacity` - 0.0 to 1.0
     - `parsePadding` - single or pair values
     - `parseFontStyle` - style names or false
     - `parseRepeatableText` - array values
     - `parseSpecialNumber` - numbers with special formats
     - `parseString` - text values
     - `parseKeyCombo` - key combinations

3. **Value type serializers** ✅
   - Created `src/lib/valueTypeSerializers.ts`
   - Serializer for each value type (reverse of parser)
   - Formats values correctly for `.properties` file

4. **Config file saver (smart merge)** ✅
   - Created `src/lib/parser/propertiesSaver.ts` (primary implementation)
   - Created `src/lib/configSaver.ts` (standalone utilities)
   - Preserves original file structure (comments, blank lines, order)
   - Updates only modified properties (surgical updates)
   - Appends new properties at end
   - Removes deleted properties
   - Backup creation deferred to Tauri file commands (Phase 3)

5. **Validation engine** ✅
   - Created `src/lib/configValidator.ts` (comprehensive validation)
   - Created `src/lib/validation.ts` (schema-based validation)
   - Inline validation in `propertiesParser.ts`
   - Validates using schema's `validation` rules
   - Checks min/max for numbers
   - Checks allowed values for enums
   - Checks platform compatibility
   - Returns validation errors with line numbers

**Definition of Done:**

- [x] Parser handles all 15 value types correctly ✅
- [x] Parser preserves comments and blank lines ✅
- [x] Parser handles repeatable properties ✅
- [x] Saver preserves file structure (surgical updates only) ✅
- [~] Saver creates backup before saving (deferred to Tauri - Phase 3)
- [x] Validation catches all invalid values ✅
- [~] Unit tests: 90%+ coverage for parser and saver (integration tests passing, formal framework in Phase 4)
- [x] Integration test: Parse → Modify → Save → Parse (round-trip) ✅
- [~] Test file: Can parse Ghostty's official example config (test config created, official config in Phase 4)

**Test Results**: 4/4 tests passing (100%) - Run `pnpm test:parser`

**Implementation Files**:

- `src/lib/parser/propertiesParser.ts` - Main parser with schema integration
- `src/lib/parser/propertiesSaver.ts` - Smart merge saver with surgical updates
- `test-config.properties` - Test configuration file
- `scripts/testParser.ts` - Parser test script (existing)

---

### Phase 3: State Management & Tauri Integration ✅ COMPLETE

**Goal**: Zustand store with Tauri file system commands for loading, saving, and managing config.

**Tasks:**

1. **Zustand store for config state** ✅
   - Created `src/stores/configStore.ts` ✅
   - State:
     - `schema: GhosttyConfigSchema` (loaded from JSON) ✅
     - `config: Map<string, string | string[]>` (parsed config) ✅
     - `originalConfig: Map<string, string | string[]>` (for change detection) ✅
     - `filePath: string | null` ✅
     - `activeTab: string` ✅
     - `activeSection: string` ✅
     - `warnings: ConfigWarning[]` ✅
     - `isLoading: boolean` ✅
     - `isSaving: boolean` ✅
     - `error: string | null` ✅

2. **Store actions** ✅
   - `loadSchema()`: Load and parse `ghosttyConfigSchema.json` ✅
   - `loadConfigFile(path: string)`: Parse config file ✅
   - `loadDefaultConfig()`: Load platform default config ✅
   - `openConfigFile()`: Open file dialog and load config ✅
   - `saveConfig()`: Save with smart merge and backup ✅
   - `saveConfigAs()`: Save to new file path ✅
   - `updateProperty(key: string, value: string | string[])`: Update single property ✅
   - `removeProperty(key: string)`: Remove property ✅
   - `resetProperty(key: string)`: Reset to default value ✅
   - `setActiveTab(tabId: string)`: Navigate to tab ✅
   - `setActiveSection(sectionId: string)`: Navigate to section ✅
   - `getChangeSummary()`: Get modified/added/removed counts ✅
   - `hasUnsavedChanges()`: Check for unsaved changes ✅
   - `discardChanges()`: Revert to original config ✅

3. **Change tracking** ✅
   - Track modified properties (value changed) ✅
   - Track added properties (new to file) ✅
   - Track removed properties (deleted from file) ✅
   - Compute dirty state (has unsaved changes) ✅

4. **Tauri file system commands** ✅
   - Existing commands in `src-tauri/src/lib.rs` (already implemented) ✅
   - Command: `read_config_file(path: String) -> Result<String>` ✅
   - Command: `write_config_file(path: String, content: String) -> Result<()>` ✅
   - Command: `create_backup(path: String) -> Result<String>` ✅
   - Command: `get_default_config_path() -> Result<String>` ✅
   - Command: `file_exists(path: String) -> bool` ✅
   - Command: `get_file_metadata(path: String) -> Result<FileMetadata>` ✅

5. **Tauri dialog integration** ✅
   - Added `tauri-plugin-dialog` to Cargo.toml ✅
   - Initialized plugin in Tauri builder ✅
   - Use Tauri's file dialog for "Open Config" ✅
   - Use Tauri's file dialog for "Save As" ✅
   - Filter: `.properties`, `.conf`, and `.config` files ✅

**Definition of Done:**

- [x] Store loads schema successfully ✅
- [x] Store loads and parses config files ✅
- [x] Store tracks changes correctly (modified/added/removed) ✅
- [x] Store saves config with smart merge ✅
- [x] All Tauri commands work on macOS and Linux ✅
- [x] File dialogs work correctly ✅
- [x] State persists to localStorage (active tab, file path) ✅
- [~] Unit tests: 80%+ coverage for store (deferred to Phase 7)
- [~] Integration test: Full load → modify → save flow (deferred to Phase 7)
- [x] Error handling: All errors displayed to user ✅

**Implementation Files:**

- `src/stores/configStore.ts` - Complete Zustand store with all actions
- `src-tauri/src/lib.rs` - Tauri commands for file I/O and dialogs
- `src-tauri/Cargo.toml` - Added tauri-plugin-dialog dependency

**Notes:**

- The store uses Zustand's persist middleware for localStorage persistence
- File operations use Tauri's invoke system for secure cross-platform file access
- Change tracking compares current state with original config using JSON serialization
- Smart merge is handled by the existing `saveConfigFile` and `buildSaveOptions` functions from Phase 2

---

### Phase 4: UI Components & Property Editors

**Goal**: Build React components for each value type with proper validation and UX.

**Tasks:**

1. **shadcn/ui components installation**
   - Install required components:
     - `label`, `input`, `textarea`, `select`, `switch`
     - `badge`, `separator`, `scroll-area`, `alert`, `dialog`
     - `collapsible`, `tooltip`, `popover`, `slider`, `tabs`
     - `dropdown-menu`, `command`

2. **Value type editors (15 components)**
   - Create `src/components/editors/` directory
   - `BooleanEditor.tsx`: Switch component
   - `EnumEditor.tsx`: Select or radio group (based on option count)
   - `NumberEditor.tsx`: Number input with min/max validation
   - `TextEditor.tsx`: Text input with validation
   - `ColorEditor.tsx`: Color picker with hex preview
   - `KeybindingEditor.tsx`: Keybinding recorder
   - `FilepathEditor.tsx`: File path input with browse button
   - `RepeatableTextEditor.tsx`: List of text inputs (add/remove)
   - `AdjustmentEditor.tsx`: Specialized adjustment input
   - `OpacityEditor.tsx`: Slider (0-100)
   - `PaddingEditor.tsx`: 4-value input (top, right, bottom, left)
   - `CommandEditor.tsx`: Command input with validation
   - `FontFamilyEditor.tsx`: Font family picker
   - `FontStyleEditor.tsx`: Font style selector
   - `SpecialNumberEditor.tsx`: Number with special values (e.g., "unlimited")

3. **Property editor wrapper**
   - Create `src/components/PropertyEditor.tsx`
   - Props: `property: ConfigProperty`, `value: string | string[]`, `onChange: (value) => void`
   - Smart type detection based on `valueType`
   - Render appropriate editor component
   - Display validation errors
   - Display comment/documentation tooltip

4. **Section editor**
   - Create `src/components/SectionEditor.tsx`
   - Display all properties in a section
   - Group by comment blocks
   - Show comment content as section headers
   - Render PropertyEditor for each config property

5. **Tab navigation**
   - Create `src/components/TabNavigation.tsx`
   - Display all 7 tabs with icons
   - Highlight active tab
   - Badge for tabs with modifications

6. **Section sidebar**
   - Create `src/components/SectionSidebar.tsx`
   - Display sections for active tab
   - Highlight active section
   - Badge for sections with modifications
   - Click to navigate to section

**Definition of Done:**

- [ ] All 15 value type editors implemented
- [ ] Each editor validates input correctly
- [ ] Each editor displays errors clearly
- [ ] PropertyEditor wrapper routes to correct editor
- [ ] SectionEditor displays properties grouped by comments
- [ ] TabNavigation shows all tabs with icons
- [ ] SectionSidebar shows sections with badges
- [ ] All components accessible (WCAG 2.1 AA)
- [ ] All components responsive (mobile, tablet, desktop)
- [ ] `pnpm lint` passes with 0 errors

---

### Phase 5: Application Layout & Navigation

**Goal**: Complete three-column layout with file loading, saving, and navigation.

**Tasks:**

1. **File loader component**
   - Create `src/components/FileLoader.tsx`
   - "Open Config" button → Tauri file dialog
   - "Load Default Config" button → Load platform default
   - Display current file path
   - Display last saved timestamp

2. **Warnings panel**
   - Create `src/components/WarningsPanel.tsx`
   - Display parse warnings (invalid lines, unknown properties)
   - Display validation errors
   - Collapsible panel
   - Badge with warning count

3. **Change summary**
   - Create `src/components/ChangeSummary.tsx`
   - Display counts: modified, added, removed
   - Color-coded badges (modified: blue, added: green, removed: red)
   - "Discard Changes" button
   - "Save" button (disabled if no changes)

4. **Save dialog**
   - Create `src/components/SaveDialog.tsx`
   - Display detailed change preview
   - Show before/after for modified properties
   - List added properties
   - List removed properties
   - "Backup created at: <path>" message
   - Confirm and cancel buttons

5. **Main application layout**
   - Update `src/App.tsx`
   - Three-column layout:
     - **Left**: TabNavigation + SectionSidebar (240px fixed width)
     - **Center**: SectionEditor (flexible width, scrollable)
     - **Right**: ChangeSummary + WarningsPanel (280px fixed width, collapsible)
   - Top bar: FileLoader + app title
   - Bottom bar: Status message

6. **Keyboard shortcuts**
   - `Cmd/Ctrl + O`: Open file
   - `Cmd/Ctrl + S`: Save file
   - `Cmd/Ctrl + Z`: Undo (future enhancement)
   - `Cmd/Ctrl + Shift + Z`: Redo (future enhancement)
   - `Escape`: Close dialogs

**Definition of Done:**

- [ ] Three-column layout implemented and responsive
- [ ] File loading works with Tauri dialog
- [ ] Warnings panel displays all warnings
- [ ] Change summary shows accurate counts
- [ ] Save dialog shows detailed change preview
- [ ] Keyboard shortcuts work correctly
- [ ] Layout adapts to window resize
- [ ] All navigation smooth and intuitive
- [ ] `pnpm tauri dev` launches without errors
- [ ] Manual testing: Load config → modify → save → reload (verify changes)

---

### Phase 6: Advanced Features

**Goal**: Search, filter, platform-specific properties, and quality-of-life improvements.

**Tasks:**

1. **Search functionality**
   - Create `src/components/SearchBar.tsx`
   - Search by property key
   - Search by property label
   - Search by comment content
   - Highlight matching properties
   - Jump to first match

2. **Platform filter**
   - Create `src/components/PlatformFilter.tsx`
   - Filter: "All", "macOS", "Linux", "Windows"
   - Hide properties not applicable to selected platform
   - Show badge on platform-specific properties

3. **Property grouping options**
   - Group by: Tab (default), Section, Type, Platform
   - Toggle in settings

4. **Dark mode**
   - Implement dark theme toggle
   - Use Tailwind CSS dark mode
   - Persist preference to localStorage

5. **Export/Import**
   - Export current config as `.properties` file
   - Import config from `.properties` file
   - Merge import with existing config (optional)

6. **Undo/Redo**
   - Implement undo/redo stack in store
   - `Cmd/Ctrl + Z`: Undo
   - `Cmd/Ctrl + Shift + Z`: Redo
   - Max 50 history entries

7. **Property favorites**
   - "Star" favorite properties
   - Quick access panel for favorites
   - Persist to localStorage

**Definition of Done:**

- [ ] Search filters properties in real-time
- [ ] Platform filter hides irrelevant properties
- [ ] Dark mode toggle works correctly
- [ ] Export creates valid `.properties` file
- [ ] Import merges config correctly
- [ ] Undo/Redo works for all modifications
- [ ] Favorites persist across sessions
- [ ] All features tested manually
- [ ] Performance: Search returns results in <100ms

---

### Phase 7: Testing & Polish

**Goal**: Comprehensive testing, bug fixes, and production-ready polish.

**Tasks:**

1. **Unit tests**
   - Test schema loader and validators
   - Test config parser and saver
   - Test value type parsers and serializers
   - Test store actions and state transitions
   - Target: 85%+ code coverage

2. **Integration tests**
   - Test full load → modify → save flow
   - Test all 15 value type editors
   - Test change tracking accuracy
   - Test backup creation
   - Test platform filtering

3. **End-to-end tests**
   - Use Tauri's testing framework
   - Test file dialogs
   - Test keyboard shortcuts
   - Test window resize behavior
   - Test error handling

4. **Performance optimization**
   - Lazy load schema on demand
   - Virtualize long section lists
   - Debounce search input
   - Optimize re-renders with React.memo

5. **Error handling**
   - Graceful handling of corrupted config files
   - User-friendly error messages
   - Retry mechanisms for file I/O errors
   - Fallback to default config on parse failure

6. **Accessibility audit**
   - Keyboard navigation for all features
   - Screen reader support
   - ARIA labels for all interactive elements
   - Color contrast ratio: 4.5:1 minimum

7. **Documentation**
   - User guide (how to use the app)
   - Developer guide (how to extend the app)
   - Update README.md with screenshots
   - Update CLAUDE.md with current architecture

8. **Build and packaging**
   - Test production build: `pnpm build`
   - Test Tauri build: `pnpm tauri build`
   - Generate macOS `.dmg` installer
   - Generate Linux `.AppImage` installer
   - Test installation on clean systems

**Definition of Done:**

- [ ] Unit tests: 85%+ coverage
- [ ] Integration tests: All critical paths tested
- [ ] E2E tests: All user flows tested
- [ ] Performance: App loads in <2 seconds
- [ ] Accessibility: WCAG 2.1 AA compliant
- [ ] Documentation: Complete and up-to-date
- [ ] Production build: No errors or warnings
- [ ] Installers: Successfully install on macOS and Linux
- [ ] Manual QA: All features tested by 2+ people
- [ ] Release notes: Written and reviewed

---

## Technology Stack

**Frontend:**

- React 19 + TypeScript 5.8
- Vite 7 (build tool)
- Tailwind CSS 4 (styling)
- shadcn/ui (UI components)
- Zustand (state management)
- Lucide React (icons)

**Backend:**

- Tauri 2.x (Rust)
- Rust file I/O for config operations

**Development Tools:**

- ESLint 9 (linting)
- Prettier 3 (formatting)
- Husky + lint-staged (pre-commit hooks)
- pnpm (package manager)

**Testing:**

- Vitest (unit tests)
- React Testing Library (component tests)
- Tauri Testing (E2E tests)

---

## Migration Notes

**Changes from Previous Implementation:**

1. **Schema Source:**
   - **Old**: TypeScript-generated schema from `ghostty_docs.txt`
   - **New**: JSON schema (`ghosttyConfigSchema.json`)

2. **Schema Structure:**
   - **Old**: 9 categories, 28 properties
   - **New**: 7 tabs, 26 sections, 180 properties

3. **Value Types:**
   - **Old**: Basic types (string, number, boolean, enum)
   - **New**: 15 specialized types (color, keybinding, filepath, adjustment, etc.)

4. **Documentation:**
   - **Old**: Separate doc strings
   - **New**: Inline comment blocks in schema

5. **Validation:**
   - **Old**: Basic min/max
   - **New**: Comprehensive validation rules per type

**Migration Steps:**

1. Delete old schema generator: `scripts/generateSchema.ts`
2. Delete old generated schema: `src/data/ghostty-schema.generated.ts`
3. Keep config parser/saver (needs updates for new types)
4. Keep Zustand store structure (needs schema updates)
5. Rebuild UI components for new value types

---

## Timeline Estimate

**Phase 1**: 2-3 days
**Phase 2**: 4-5 days
**Phase 3**: 2-3 days
**Phase 4**: 5-7 days
**Phase 5**: 3-4 days
**Phase 6**: 4-5 days
**Phase 7**: 5-7 days

**Total**: 25-34 days (~5-7 weeks)

---

## Success Criteria

**Functionality:**

- [ ] Can load any valid Ghostty config file
- [ ] Can edit all 180 config properties
- [ ] Can save changes without losing comments or formatting
- [ ] All 15 value type editors work correctly
- [ ] Search and filter work smoothly
- [ ] Undo/redo works reliably

**Quality:**

- [ ] 85%+ test coverage
- [ ] 0 TypeScript errors
- [ ] 0 ESLint errors
- [ ] WCAG 2.1 AA accessible
- [ ] Loads in <2 seconds
- [ ] Works on macOS, Linux, Windows

**User Experience:**

- [ ] Intuitive navigation
- [ ] Clear error messages
- [ ] Helpful tooltips and documentation
- [ ] Smooth animations
- [ ] Responsive design

---

## Related Documents

- [CLAUDE.md](./CLAUDE.md) - Development guidelines
- [README.md](./README.md) - Project overview
- [docs/TECHNICAL_DECISIONS.md](./docs/TECHNICAL_DECISIONS.md) - Architecture decisions
- [ghosttyConfigSchema.json](./ghosttyConfigSchema.json) - Schema source of truth

---

**End of Implementation Plan**
