# Phase 3: UI Components & Category Navigation - PLAN

**Status**: In Progress 🚧
**Started**: 2025-11-22

## Overview

Phase 3 focuses on building the user interface components that allow users to navigate categories, edit properties, and manage their Ghostty configuration files visually.

## Goals

1. Create intuitive navigation between configuration categories and sections
2. Build type-specific property editor components
3. Implement file loading and saving UI
4. Display validation warnings and errors to users
5. Show change summaries before saving
6. Provide a complete working GUI for config editing

## Components to Build

### 1. CategorySidebar Component

**Purpose**: Navigate between configuration categories and sections

**Features**:

- Display all 9 categories (Appearance, Window, Terminal, Input, Platform, System, Notifications, Config, UI)
- Expand/collapse sections within categories
- Highlight active category/section
- Show count of modified properties per category
- Responsive sidebar with collapsible state

**File**: `src/components/CategorySidebar.tsx`

### 2. Property Editor Components

**Purpose**: Type-specific input controls for editing property values

**Components**:

1. **TextInput** (`src/components/editors/TextInput.tsx`)
   - For string properties
   - Pattern validation support
   - Placeholder with default value

2. **NumberInput** (`src/components/editors/NumberInput.tsx`)
   - For number properties
   - Min/max validation
   - Step controls

3. **BooleanToggle** (`src/components/editors/BooleanToggle.tsx`)
   - For boolean properties
   - Switch/toggle UI
   - True/false labels

4. **EnumSelect** (`src/components/editors/EnumSelect.tsx`)
   - For enum properties
   - Dropdown/combobox
   - Show all valid options

5. **RepeatableEditor** (`src/components/editors/RepeatableEditor.tsx`)
   - For repeatable properties (palette, keybind)
   - Add/remove entries
   - List UI with controls

### 3. PropertyEditor Wrapper

**Purpose**: Smart component that renders the correct editor based on property type

**Features**:

- Auto-selects correct editor component
- Shows property metadata (description, type, default)
- Displays validation errors inline
- Reset to default button
- Remove property button

**File**: `src/components/PropertyEditor.tsx`

### 4. FileLoader Component

**Purpose**: Load configuration files from disk

**Features**:

- File picker button using Tauri dialog
- Load default config button
- Display current file path
- Show file metadata (last modified)
- Handle loading errors

**File**: `src/components/FileLoader.tsx`

### 5. WarningsPanel Component

**Purpose**: Display parser warnings and validation errors

**Features**:

- Show unknown properties
- Display validation errors
- Show parse errors
- Expandable/collapsible
- Clear warnings action

**File**: `src/components/WarningsPanel.tsx`

### 6. ChangeSummary Component

**Purpose**: Show what will change when saving

**Features**:

- Display modified properties count
- Display added properties count
- Display removed properties count
- Expandable list of changes
- Diff view (optional)

**File**: `src/components/ChangeSummary.tsx`

### 7. SaveDialog Component

**Purpose**: Confirm and execute save operation

**Features**:

- Show change summary
- Confirm before save
- Handle save errors
- Success feedback
- Backup confirmation

**File**: `src/components/SaveDialog.tsx`

### 8. App Layout Update

**Purpose**: Integrate all components into working application

**Updates to** `src/App.tsx`:

- Three-column layout: Sidebar | Properties | Preview
- Header with file controls
- Footer with save button
- Loading states
- Error boundaries

## UI Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Header: [Load File] [Load Default] | filepath.properties    │
├──────────┬────────────────────────────────┬─────────────────┤
│          │                                │                 │
│ Category │  Property Editors              │  Change Summary │
│ Sidebar  │                                │  & Warnings     │
│          │  [Font Settings]               │                 │
│ • App... │  Font Family: [_______]        │  Modified: 3    │
│   - Font │  Font Size:   [14_____]        │  Added: 1       │
│   - Curs │  Font Weight: [normal ▾]       │  Removed: 0     │
│ • Window │                                │                 │
│ • Term.. │  [Terminal Behavior]           │  Warnings: 1    │
│ • Input  │  ...                           │  ⚠ Unknown prop │
│          │                                │                 │
├──────────┴────────────────────────────────┴─────────────────┤
│ Footer: [Reset All] [Save Config]                          │
└─────────────────────────────────────────────────────────────┘
```

## shadcn/ui Components Needed

We already have:

- ✅ Button
- ✅ Card
- ✅ Input

Need to add:

- Select (for enum properties)
- Switch (for boolean properties)
- Label (for form labels)
- Badge (for counts/status)
- Separator (for visual dividers)
- ScrollArea (for long lists)
- Alert (for warnings/errors)
- Dialog (for save confirmation)
- Collapsible (for expandable sections)

## Implementation Order

1. ✅ Create plan document
2. Add missing shadcn/ui components
3. Build CategorySidebar (navigation first)
4. Create property editor components
5. Build PropertyEditor wrapper
6. Create FileLoader component
7. Build WarningsPanel
8. Create ChangeSummary component
9. Build SaveDialog
10. Update App.tsx with complete layout
11. Test full application flow
12. Create Phase 3 completion documentation

## Testing Approach

- Test each component in isolation first
- Use test-config.properties for integration testing
- Verify type-specific editors work correctly
- Test file loading and saving
- Verify change tracking works
- Test warning display
- End-to-end test: load → edit → save → verify

## Success Criteria

- ✅ User can navigate all categories and sections
- ✅ User can edit properties with appropriate controls
- ✅ User can load config files
- ✅ User can save changes with smart merge
- ✅ User sees validation errors clearly
- ✅ User sees change summary before saving
- ✅ Application runs without errors
- ✅ All TypeScript types are satisfied
- ✅ ESLint passes with no errors

## Next Phase Preview

**Phase 4: Advanced Features**

- Search and filter properties
- Keyboard shortcuts
- Undo/redo
- Import/export
- Theme customization
- Settings panel

---

**Let's build the UI! 🎨**
