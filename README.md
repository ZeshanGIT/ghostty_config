# Ghostty Config Editor

A modern desktop GUI editor for Ghostty terminal configuration files built with Tauri, React, and TypeScript.

## Features

- 🎨 Intuitive interface for editing Ghostty terminal configurations
- 🔍 Category-based organization of configuration options
- 📝 Inline documentation for all configuration properties
- 🌗 Dark/light mode support
- 💾 Load and save configuration files
- ✨ Modern UI built with Tailwind CSS and shadcn/ui

## Prerequisites

- **Node.js** 18 or later
- **pnpm** (package manager - required)
- **Rust** 1.70 or later (for Tauri)
- **Platform-specific dependencies** (see [Tauri Prerequisites](https://v2.tauri.app/start/prerequisites/))

## Installation

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd ghostty_config
   ```

2. **Install dependencies using pnpm**:
   ```bash
   pnpm install
   ```

## Development

**Start the development server with hot-reload**:

```bash
pnpm tauri dev
```

This will launch the Tauri application in development mode. Changes to the React code will automatically reload.

## Building

**Build for production**:

```bash
pnpm build           # Build the web application
pnpm tauri build     # Build the Tauri application
```

The built application will be available in `src-tauri/target/release/`.

## Available Scripts

- `pnpm dev` - Start Vite development server
- `pnpm build` - Build the web application
- `pnpm tauri dev` - Start Tauri in development mode
- `pnpm tauri build` - Build Tauri application for production
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix linting issues automatically
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting
- `pnpm type-check` - Run TypeScript type checking

## Project Structure

```
ghostty_config/
├── src/                          # React application source
│   ├── components/               # React components
│   │   └── ui/                  # shadcn/ui components
│   ├── hooks/                   # Custom React hooks
│   ├── lib/                     # Utility libraries
│   ├── stores/                  # Zustand state stores
│   ├── types/                   # TypeScript type definitions
│   └── App.tsx                  # Main application component
├── src-tauri/                   # Tauri Rust backend
├── scripts/                     # Utility scripts
│   ├── archive/                 # Archived source files
│   ├── *.py                     # Python scripts (schema generation, validation)
│   └── *.ts                     # TypeScript scripts
├── docs/                        # Documentation
│   ├── phase-completion/        # Phase milestone docs
│   ├── SCHEMA_ENRICHMENT.md     # Schema enrichment guide
│   ├── ENRICHMENT_COMPLETE.md   # Enrichment summary
│   └── VERIFICATION_COMPLETE.md # Validation results
├── ghostty_configs/             # Legacy config property files
├── public/                      # Static assets
└── ghosttyConfigSchema.json     # Main configuration schema
```

## Tech Stack

- **Tauri 2.x** - Desktop application framework
- **React 19** - UI library
- **TypeScript 5.8** - Type-safe JavaScript
- **Vite 7** - Build tool
- **Tailwind CSS 4** - Styling
- **shadcn/ui** - UI components
- **Zustand** - State management

## Development Workflow

1. Make changes to the code
2. Pre-commit hooks will automatically lint and format staged files
3. Run tests and type-checking before pushing
4. Follow the implementation plan in `IMPLEMENTATION_PLAN.md`

## Documentation

- **[CLAUDE.md](./CLAUDE.md)** - Development guidelines and project instructions
- **[docs/](./docs/)** - Comprehensive documentation
  - [Schema Enrichment Guide](./docs/SCHEMA_ENRICHMENT.md)
  - [Enrichment Summary](./docs/ENRICHMENT_COMPLETE.md)
  - [Verification Results](./docs/VERIFICATION_COMPLETE.md)
  - [Technical Decisions](./docs/TECHNICAL_DECISIONS.md)
  - [Phase Completion Docs](./docs/phase-completion/)
- **[scripts/](./scripts/)** - Utility scripts documentation

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/)
- Extensions:
  - [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)
  - [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
  - [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
  - [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
  - [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

## License

See LICENSE file for details.
