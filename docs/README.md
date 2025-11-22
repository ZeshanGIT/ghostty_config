# Documentation

This directory contains comprehensive documentation for the Ghostty Config Editor project.

## Technical Documentation

### [TECHNICAL_DECISIONS.md](./TECHNICAL_DECISIONS.md)

Technical decisions and architecture documentation for the project.

**Contents**:

- Technology stack choices and rationale
- Data storage strategy (TypeScript schema + .properties files)
- Schema generation approach
- Validation rules and error handling
- File preservation strategy (comments, formatting, structure)
- Backup and file change detection
- Config file includes support
- Repeatable properties handling (palette, keybinds)
- Parse error handling with best-effort parsing

## Quick Links

- [Main README](../README.md) - Project overview and getting started
- [CLAUDE.md](../CLAUDE.md) - Development guidelines and instructions for Claude Code
- [Scripts README](../scripts/README.md) - Python and TypeScript utility scripts

## Project Status

**Completed Phases**:

- ✅ **Phase 1**: Tauri 2.x + React + TypeScript setup with build tooling
- ✅ **Phase 2**: Schema generation, config parser/saver, Zustand state management
- ✅ **Phase 3**: UI components, category navigation, property editors, three-column layout

**Current Phase**: Phase 4 - Advanced Features & Testing

## Schema Overview

The project uses a TypeScript schema generated from Ghostty's official documentation:

- **180 config properties** across 9 categories
- **Type-safe validation** with enums, ranges, and patterns
- **Smart file preservation** maintains comments, formatting, and structure
- **Repeatable properties** support (palette, keybinds)

Run `pnpm generate:schema` to regenerate from `ghostty_docs.txt`

## File Organization

```
docs/
├── README.md                  # This file
└── TECHNICAL_DECISIONS.md     # Architecture and design decisions
```
