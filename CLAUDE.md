# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Capacitor plugin project called "unified-tracking" that provides a unified analytics and error tracking solution for mobile and web applications. The plugin supports multiple analytics providers (Google Analytics, Firebase, Mixpanel, etc.) and error handling services (Sentry, Bugsnag, Rollbar, etc.).

## Current Project Status

**Important**: This project is currently in the planning phase. The codebase needs to be initialized before development can begin.

### Required Initialization Steps

1. Initialize the Capacitor plugin structure:

   ```bash
   npx @capacitor/create-plugin@latest unified-tracking
   ```

2. Use yarn (MANDATORY):

   ```bash
   rm package-lock.json pnpm-lock.yaml
   yarn install
   ```

3. Update all packages to latest versions:
   ```bash
   yarn upgrade --latest
   ```

## Development Commands

Once the project is initialized, use these commands:

```bash
# Install dependencies
yarn install

# Build the plugin
yarn build

# Run tests
yarn test

# Lint code
yarn lint

# Format code
yarn format

# Run specific test file
yarn test path/to/test.spec.ts

# Watch mode for development
yarn dev
```

## Architecture

The plugin follows a modular architecture with:

- **Core Plugin Interface**: Defined in `src/definitions.ts`
- **Provider Pattern**: Each analytics/error service has its own provider implementation
- **Platform-Specific Implementations**: Separate implementations for Web, iOS, and Android
- **React Integration**: Hooks and context providers for React applications

### Key Directories

- `src/providers/`: Contains all provider implementations
- `src/react/`: React-specific integration (hooks, context)
- `src/utils/`: Shared utilities and helpers
- `android/`: Android native implementation
- `ios/`: iOS native implementation

## Development Guidelines

1. **Package Management**: Always use yarn (NEVER npm or pnpm)
2. **TypeScript**: Use strict typing throughout the codebase
3. **Testing**: Use Vitest (not Jest) for testing per user preferences
4. **Code Quality**: Run lint and type checks before committing
5. **Imports**: Use absolute imports with aliases (`@/` for src directory)

## Provider Implementation Pattern

When implementing a new provider:

1. Create provider directory in `src/providers/analytics/` or `src/providers/error-handling/`
2. Implement the provider interface defined in `src/definitions.ts`
3. Add provider to the factory in `src/providers/index.ts`
4. Create unit tests for the provider
5. Update documentation with configuration examples

## Testing Strategy

- Unit tests for all providers and utilities
- Integration tests for provider initialization
- E2E tests with example Capacitor applications
- Performance benchmarks for tracking overhead
- Bundle size monitoring

## Important Reminders

- The project follows a 12-week development plan as outlined in Readme.md
- Phase 1 focuses on core implementation and web providers
- Native implementations come in Phase 2
- Always ensure offline support and data privacy compliance

---

## Package Update History

| Date       | Updated By | Notes                                                               |
| ---------- | ---------- | ------------------------------------------------------------------- |
| 2026-02-02 | Claude     | Full update to latest versions, build passes, lint has known issues |

---

## Comprehensive Audit Record

| Date       | Audit Type     | Status             | Issues Found | Issues Resolved |
| ---------- | -------------- | ------------------ | ------------ | --------------- |
| 2026-02-02 | Package Update | Passed with issues | 2            | 0               |
| 2026-01-23 | Full Audit     | Passed with issues | 2            | 0               |

### Last Audit Details

- **Package Manager**: yarn confirmed
- **Dependencies**: Updated to latest (2026-02-02)
- **Build**: Passes (docgen warning expected)
- **Lint**: WARNINGS - 8 errors (example app files not in tsconfig), 636 warnings (no-explicit-any)
- **Features**: Core features complete
- **TODOs**: None found
- **SEO**: N/A (npm package)
- **OG Assets**: N/A (npm package)

### Outstanding Issues

1. ESLint errors: examples/react-app files not included in tsconfig project
2. 636 `no-explicit-any` warnings throughout codebase

### Next Audit Due: 2026-02-09 (7 days from last)
