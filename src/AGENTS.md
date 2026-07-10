# src/ - Source Code Agent Instructions

**Last Updated**: `2026-05-26`

## Imports

Source modules use **relative imports** (e.g. `../../base-analytics-provider`). The path aliases below are declared in `tsconfig.json` but are **not used in source**. To adopt them, configure the Rollup build to resolve aliases first, then migrate consistently.

| Alias (declared, unused) | Maps To             |
| ------------------------ | ------------------- |
| `@/*`                    | `./src/*`           |
| `@providers/*`           | `./src/providers/*` |
| `@utils/*`               | `./src/utils/*`     |
| `@types/*`               | `./src/types/*`     |

## TypeScript Rules

- **Strict mode** enabled — `noImplicitAny`, `noUnusedLocals`, `noUnusedParameters` enforced
- Target: `es2022`, Module: `esnext`, JSX: `react`
- All public APIs must have JSDoc documentation
- Export types from source module, re-export through `index.ts` barrel files

## File Organization

```
core/           # Core UnifiedTrackingCore engine
config/         # Configuration support utilities
decorators/     # TypeScript decorators (provider registration)
types/          # Shared TypeScript type definitions
utils/          # Utilities (logger, config-manager, event-queue)
providers/      # Analytics + error tracking provider implementations
react/          # React hooks, context, HOC integration
capacitor/      # Capacitor native bridge adapter
```

## Key Patterns

- **Singleton pattern**: `Logger`, `ConfigManager`, `EventQueue` use `getInstance()`
- **Abstract base classes**: Providers extend `BaseAnalyticsProvider` or `BaseErrorTrackingProvider`
- **Template method pattern**: Base classes call `doXxx()` abstract methods
- **Barrel exports**: Each folder has `index.ts` re-exporting public APIs
- All async operations must have try/catch with proper error logging

## CLAUDE.md + AGENTS.md Sync Rule

Rules in this file MUST stay in sync with `src/CLAUDE.md`. Update both when changing either.


## Sub-agents & Skills — Main-Context-First (IRON-SOLID)
Default/built-in sub-agents (`general-purpose`, `Explore`, `Plan`, `claude`, `fork`, …) do NOT have
access to `/skills`, so delegating to them silently SKIPS the skills RULE #0 requires. Do all
skill-relevant work in the **MAIN context**; use a sub-agent ONLY when a **custom** agent exists in
`.claude/agents/` for that job; a default `Explore`/`Plan` agent is allowed ONLY for read-only,
no-skill search/exploration. When a relevant skill is missing, **install/enable it** rather than
proceeding skill-less. (Owner directive 2026-07-11; full text in `~/.claude/CLAUDE.md`.)
