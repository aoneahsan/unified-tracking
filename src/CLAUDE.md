# src/ - Source Code Conventions

**Last Updated**: `2026-05-26`

## Imports

Source modules use **relative imports** (e.g. `../../base-analytics-provider`). The path aliases below are declared in `tsconfig.json` but are **not used in source** — relative imports are the convention here. To adopt aliases, also configure the Rollup build to resolve them, then migrate consistently.

| Alias (declared, unused) | Maps To             |
| ------------------------ | ------------------- |
| `@/*`                    | `./src/*`           |
| `@providers/*`           | `./src/providers/*` |
| `@utils/*`               | `./src/utils/*`     |
| `@types/*`               | `./src/types/*`     |

## TypeScript Rules

- **Strict mode** is enabled (`strict: true` in tsconfig)
- `noImplicitAny`, `noUnusedLocals`, `noUnusedParameters` are enforced
- Target: `es2022`, Module: `esnext`, JSX: `react`
- All public APIs must have JSDoc documentation
- Export types from their source module, re-export through `index.ts` barrel files

## File Organization

```
src/
  core/           # Core UnifiedTrackingCore engine
  config/         # Configuration support utilities
  decorators/     # TypeScript decorators (provider registration)
  types/          # Shared TypeScript type definitions
  utils/          # Utilities (logger, config-manager, event-queue)
  providers/      # Analytics + error tracking provider implementations
  react/          # React hooks, context, HOC integration
  capacitor/      # Capacitor native bridge adapter
  index.ts        # Main entry point (barrel exports)
  definitions.ts  # API type definitions
  web.ts          # Web platform implementation
```

## Coding Patterns

- **Singleton pattern**: `Logger`, `ConfigManager`, `EventQueue` use `getInstance()`
- **Abstract base classes**: `BaseAnalyticsProvider`, `BaseErrorTrackingProvider` — providers extend these
- **Template method pattern**: Base classes call `doXxx()` abstract methods that providers implement
- **Barrel exports**: Each folder has `index.ts` re-exporting public APIs
- All async operations must have try/catch with proper error logging via `this.logger`

## CLAUDE.md + AGENTS.md Sync Rule

Rules in this file MUST stay in sync with `src/AGENTS.md`. Update both when changing either.
