# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository is a **Ghostty Terminal Configuration GUI Editor** project. The goal is to create a modern desktop application (using Tauri + React + TypeScript) that provides an intuitive interface for editing Ghostty terminal configuration files.

**Schema Source**: `ghosttyConfigSchema.json` - A comprehensive JSON schema with 180 configuration properties across 7 tabs and 26 sections, featuring 15 distinct value types and rich metadata.

The project contains:

- **Tauri 2.x + React + TypeScript** GUI application
- **ghosttyConfigSchema.json** - Single source of truth for all config properties with full documentation
- Python scripts for parsing and organizing Ghostty configuration documentation
- Structured `.properties` files organized by category (appearance, input, terminal, window, UI, platform, system, notifications, config)
- Source documentation extracted from Ghostty's official documentation (`ghostty_docs.txt`)
- Complete implementation plan in `IMPLEMENTATION_PLAN.md`

## Package Manager

**CRITICAL: This project uses pnpm as the package manager. Always use pnpm for all package management operations.**

```bash
# Install dependencies
pnpm install

# Development server (Tauri dev with hot-reload)
pnpm tauri dev

# Build for production
pnpm build

# Run linter
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code with Prettier
pnpm format

# Check formatting
pnpm format:check

# Type check without emitting
pnpm type-check
```

## Repository Structure

```
ghostty_config/
├── src/                          # React application source
│   ├── components/               # React components
│   │   ├── editors/             # Type-specific property editors
│   │   └── ui/                  # shadcn/ui components
│   ├── hooks/                   # Custom React hooks
│   ├── lib/                     # Utility libraries
│   │   ├── parser/              # Config file parser
│   │   ├── schemaLoader.ts      # JSON schema loader
│   │   ├── schemaQueries.ts     # Schema query utilities
│   │   ├── validation.ts        # Property validation
│   │   └── utils.ts             # cn() utility for className merging
│   ├── stores/                  # Zustand state stores
│   │   └── configStore.ts       # Main config state management
│   ├── types/                   # TypeScript type definitions
│   │   └── schema.ts            # Schema type definitions
│   ├── App.tsx                  # Main app component
│   ├── main.tsx                 # React entry point
│   └── index.css                # Tailwind CSS + theme variables
├── src-tauri/                   # Tauri Rust backend
│   ├── src/                     # Rust source code
│   ├── icons/                   # Application icons
│   └── tauri.conf.json          # Tauri configuration
├── ghosttyConfigSchema.json     # ⭐ SINGLE SOURCE OF TRUTH - 180 properties with full metadata
├── ghostty_configs/             # Organized .properties files by category
│   ├── appearance/              # Theme, font, cursor, shader, background
│   ├── input/                   # Keybinds, mouse, clipboard
│   ├── terminal/                # Terminal behavior, links, OSC, VT, shell integration
│   ├── window/                  # Window management and settings
│   ├── ui/                      # UI behavior, focus, quick-terminal, command palette
│   ├── platform/                # Platform-specific (macOS, Linux, GTK)
│   ├── system/                  # Async, auto-update
│   ├── notifications/           # Bell, notifications
│   ├── config/                  # Config file management
│   └── docs/                    # Generated .properties files WITH documentation
├── generate_docs_properties.py  # Combines .properties with docs from ghostty_docs.txt
├── verify_config_split.py       # Verifies all properties match the original config
├── ghostty_config.properties    # Original monolithic config file
├── ghostty_docs.txt             # Source documentation from Ghostty
├── VISION.md                    # Complete project vision and roadmap
├── IMPLEMENTATION_PLAN.md       # ⭐ Detailed implementation plan with phases
├── package.json                 # Node.js dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── vite.config.ts               # Vite build configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── eslint.config.js             # ESLint configuration
└── .prettierrc                  # Prettier configuration
```

## Tech Stack

### Frontend

- **Tauri 2.x**: Rust-based desktop application framework
- **React 19**: UI library with hooks
- **TypeScript 5.8**: Type-safe JavaScript
- **Vite 7**: Build tool and dev server
- **Tailwind CSS 4**: Utility-first CSS framework
- **shadcn/ui**: Accessible UI component library built on Radix UI
- **Zustand**: Lightweight state management
- **Lucide React**: Icon library

### Development Tools

- **ESLint 9**: Linting with React, TypeScript, and accessibility rules
- **Prettier 3**: Code formatting
- **Husky**: Git hooks
- **lint-staged**: Pre-commit linting

## Path Aliases

The project uses TypeScript path aliases for cleaner imports:

```typescript
import { Button } from '@/components/ui/button';
import { useConfigStore } from '@/stores/configStore';
import { cn } from '@/lib/utils';
```

Available aliases:

- `@/*` → `./src/*`
- `@/components/*` → `./src/components/*`
- `@/hooks/*` → `./src/hooks/*`
- `@/lib/*` → `./src/lib/*`
- `@/stores/*` → `./src/stores/*`
- `@/types/*` → `./src/types/*`

## Python Scripts

### generate_docs_properties.py

Merges base `.properties` files with their documentation from `ghostty_docs.txt`.

```bash
python3 generate_docs_properties.py
```

### verify_config_split.py

Ensures the split `.properties` files contain all keys/values from the original monolithic `ghostty_config.properties`.

```bash
python3 verify_config_split.py
```

## TypeScript Scripts

### Schema Loader

Loads and validates the `ghosttyConfigSchema.json` file at runtime.

```bash
# Schema is loaded automatically by the app
# No build step required - JSON is imported directly
```

**Source**: `ghosttyConfigSchema.json`
**Loader**: `src/lib/schemaLoader.ts`

### Parser Tests

Tests the config file parser and saver functionality.

```bash
pnpm test:parser
```

**Tests**:

- Save without modifications (preserves file exactly)
- Modify property (updates only that line)
- Add new property (appends at end)
- Remove property (deletes line)

## Documentation Policy

### When to Create New Documentation Files

**DO NOT create separate .md files for:**

- ✅ Status updates (use chat messages)
- ✅ Completion reports (use ✅ checkmarks in IMPLEMENTATION_PLAN.md)
- ✅ Verification/alignment documents (mention in chat)
- ✅ Progress tracking (use TodoWrite tool + chat)

**ONLY create new .md files when ALL of these are true:**

1. Many checklist items (5+ items with complexity)
2. Significant problems requiring user attention (blocking issues, critical decisions)
3. Cannot be handled with a chat message or simple checklist

**Standard practice:**

- Phase completion → Add ✅ to IMPLEMENTATION_PLAN.md
- Quick updates → Chat message
- Work progress → TodoWrite tool
- Issues found → Mention in chat (create doc only if blocking + needs decisions)

**Key principle:** "When in doubt, don't create a file. Chat or IMPLEMENTATION_PLAN.md is usually enough."

## Important Notes

- **Always use pnpm** - Never use npm or yarn for this project
- **Do not modify** `ghostty_docs.txt` - it's the source of truth from Ghostty documentation
- **Do not modify** `ghostty_config.properties` - it's the original monolithic config for verification
- When adding new properties, add them to the appropriate category file in `ghostty_configs/`
- Always run `verify_config_split.py` after modifying property files to ensure consistency
- The `docs/` subdirectory is **generated** - modifications should be made to source files and regenerated

## Project Status

**Current Phase**: Phase 1 - Schema Integration & Type System (IN PROGRESS 🚧)

**Implementation Plan**: See `IMPLEMENTATION_PLAN.md` for detailed phase breakdown.

### Schema Overview

- **Source**: `ghosttyConfigSchema.json`
- **Properties**: 180 configuration options
- **Tabs**: 7 (appearance, window, input, terminal, ui, notifications, system)
- **Sections**: 26
- **Value Types**: 15 (text, number, boolean, enum, color, keybinding, filepath, etc.)

### Completed Work

**Foundation** (Legacy from previous implementation):

- ✅ Tauri 2.x + React + TypeScript project initialized
- ✅ Build tooling configured (Vite, ESLint, Prettier, Husky)
- ✅ Tailwind CSS 4 + shadcn/ui component system
- ✅ Path aliases and project structure
- ✅ Hot-reload development environment

**Phase 2: Config File Parser & Saver** ✅:

- ✅ Properties file parser (`src/lib/parser/propertiesParser.ts`)
- ✅ Value type parsers for all 15 types (`src/lib/valueTypeParsers.ts`)
- ✅ Properties file saver with smart merge (`src/lib/parser/propertiesSaver.ts`)
- ✅ All parser tests passing (4/4)

### Current Work

**Phase 1: Schema Integration & Type System** 🚧:

- 🚧 TypeScript interfaces for schema structure (`src/types/schema.ts`)
- ⏳ Schema loader utility (`src/lib/schemaLoader.ts`)
- ⏳ Type guards and validators
- ⏳ Schema query utilities

### Next Phases

- **Phase 3**: State Management & Tauri Integration
- **Phase 4**: UI Components & Property Editors
- **Phase 5**: Application Layout & Navigation
- **Phase 6**: Advanced Features
- **Phase 7**: Testing & Polish

## Development Workflow

1. **Start development server**:

   ```bash
   pnpm tauri dev
   ```

2. **Before committing**:
   - Husky pre-commit hooks will automatically run lint-staged
   - Linting and formatting will be applied to staged files

3. **Manual checks**:

   ```bash
   pnpm lint        # Check for linting errors
   pnpm type-check  # Check for TypeScript errors
   pnpm format      # Format all files
   ```

4. **Build for production**:
   ```bash
   pnpm build       # Build the web app
   pnpm tauri build # Build the Tauri application
   ```

## Tauri Configuration

The application is configured as:

- **Product Name**: Ghostty Config Editor
- **Identifier**: com.ghostty.config-editor
- **Default Window Size**: 1200x800 (min 800x600)

## State Management

The project uses Zustand for state management. The store will be implemented in Phase 3 with the following features:

```typescript
import { useConfigStore } from '@/stores/configStore';

// In a component (Phase 3+)
const {
  config,
  loadConfigFile,
  saveConfig,
  updateProperty,
  setActiveTab,
  setActiveSection,
  getChangeSummary,
} = useConfigStore();
```

**Planned Store Features (Phase 3)**:

- **Config data storage**: Typed values for all 15 value types
- **File operations**: Load, save, backup with smart merge
- **Change tracking**: Modified, added, removed properties
- **Validation**: Schema-based validation with error messages
- **Navigation**: Active tab/section tracking
- **State management**: Loading, saving, error states
- **Persistence**: Last file path and UI state to localStorage
