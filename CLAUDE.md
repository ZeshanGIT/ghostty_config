# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository is a **Ghostty Terminal Configuration GUI Editor** project. The goal is to create a modern desktop application (using Tauri + React + TypeScript) that provides an intuitive interface for editing Ghostty terminal configuration files.

The project contains:

- **Tauri 2.x + React + TypeScript** GUI application
- Python scripts for parsing and organizing Ghostty configuration documentation
- Structured `.properties` files organized by category (appearance, input, terminal, window, UI, platform, system, notifications, config)
- Source documentation extracted from Ghostty's official documentation (`ghostty_docs.txt`)
- Technical architecture decisions documented in `docs/TECHNICAL_DECISIONS.md`

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
│   │   └── ui/                  # shadcn/ui components (Button, Card, Input)
│   ├── hooks/                   # Custom React hooks
│   ├── lib/                     # Utility libraries
│   │   └── utils.ts             # cn() utility for className merging
│   ├── stores/                  # Zustand state stores
│   │   └── configStore.ts       # Main config state management
│   ├── types/                   # TypeScript type definitions
│   ├── App.tsx                  # Main app component
│   ├── main.tsx                 # React entry point
│   └── index.css                # Tailwind CSS + theme variables
├── src-tauri/                   # Tauri Rust backend
│   ├── src/                     # Rust source code
│   ├── icons/                   # Application icons
│   └── tauri.conf.json          # Tauri configuration
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
├── IMPLEMENTATION_PLAN.md       # Detailed implementation plan with phases
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

## TypeScript Scripts (Phase 2)

### Schema Generator

Generates TypeScript schema from `ghostty_docs.txt` and `.properties` files.

```bash
pnpm generate:schema
```

**Output**: `src/data/ghostty-schema.generated.ts`

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

## Important Notes

- **Always use pnpm** - Never use npm or yarn for this project
- **Do not modify** `ghostty_docs.txt` - it's the source of truth from Ghostty documentation
- **Do not modify** `ghostty_config.properties` - it's the original monolithic config for verification
- When adding new properties, add them to the appropriate category file in `ghostty_configs/`
- Always run `verify_config_split.py` after modifying property files to ensure consistency
- The `docs/` subdirectory is **generated** - modifications should be made to source files and regenerated

## Project Status

**Current Phase**: Phase 3 - UI Components & Category Navigation (COMPLETE ✅)

**Phase 1 Completed**:

- ✅ Tauri 2.x project initialized with React + TypeScript
- ✅ Build tooling configured (Vite, TypeScript strict mode, ESLint, Prettier)
- ✅ Pre-commit hooks set up (husky + lint-staged)
- ✅ Tailwind CSS 4 + shadcn/ui components installed (Button, Card, Input)
- ✅ Project structure organized (components, hooks, lib, stores, types)
- ✅ Path aliases configured
- ✅ Zustand state management configured
- ✅ Application launches successfully with Ghostty Config Editor branding
- ✅ Hot-reload development environment working
- ✅ Production build compiles without errors

**Phase 2 Completed**:

- ✅ TypeScript schema and config type definitions created
- ✅ Schema generator script built and tested (28 properties, 9 categories)
- ✅ Properties file parser with validation and error handling
- ✅ Properties file saver with smart merge (preserves comments and structure)
- ✅ Tauri file system commands for config operations
- ✅ Validation utilities based on schema
- ✅ ConfigStore fully integrated with parser, saver, and Tauri commands
- ✅ All components tested and verified (4/4 tests passed)

**Phase 3 Completed**:

- ✅ Created 9 shadcn/ui components (label, select, switch, badge, separator, scroll-area, alert, dialog, collapsible)
- ✅ Built CategorySidebar with expandable sections and modification badges
- ✅ Created 5 type-specific property editors (text, number, boolean, enum, repeatable)
- ✅ Built PropertyEditor wrapper with smart type detection
- ✅ Implemented FileLoader with Tauri dialog integration
- ✅ Created WarningsPanel for validation errors and parser warnings
- ✅ Built ChangeSummary component with color-coded statistics
- ✅ Implemented SaveDialog with detailed change preview
- ✅ Complete three-column application layout in App.tsx
- ✅ All TypeScript types valid and ESLint passing (0 errors)

**Next Phase**: Phase 4 - Advanced Features & Testing

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

The project uses Zustand for state management with persistence:

```typescript
import { useConfigStore } from '@/stores/configStore';

// In a component
const {
  config,
  loadConfigFile,
  saveConfig,
  updateProperty,
  setActiveCategory,
  setActiveSection,
  getChangeSummary,
} = useConfigStore();
```

**Phase 2 Store Features**:

- **Config data storage**: Map-based with proper types (string | string[])
- **File operations**: Load, save with smart merge, backup creation
- **Change detection**: File modification timestamp tracking
- **Validation**: Schema-based property validation
- **Warnings**: Parse warnings and unknown property tracking
- **Change tracking**: Modified, added, removed properties
- **Navigation**: Active category/section tracking
- **State**: Loading, saving, error states
- **Persistence**: File path and UI state persisted to localStorage

**Key Actions**:

```typescript
loadConfigFile(path); // Load and parse config file
loadDefaultConfig(); // Load platform default config
saveConfig(); // Save with smart merge and backup
updateProperty(key, val); // Update a property
removeProperty(key); // Remove a property
resetProperty(key); // Reset to default value
getChangeSummary(); // Get counts of modified/added/removed
```
