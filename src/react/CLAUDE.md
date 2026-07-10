# src/react/ - React Integration

**Last Updated**: `2026-05-26`

## Overview

Provider-free React hooks for unified-tracking. No React Context or `<Provider>` is required — the hooks call the core singleton directly, so they work in dynamically injected components.

## File Structure

| File           | Purpose                                             |
| -------------- | --------------------------------------------------- |
| `hooks-new.ts` | The hooks: `useUnifiedTracking` and `useTrackEvent` |
| `index.ts`     | Barrel export for `unified-tracking/react`          |

> A previous provider/context/HOC layer (`context.tsx`, `hooks.ts`, `hoc.tsx`) was removed in `3.1.0` — it was never re-exported from `index.ts`, so it was dead code (~1,142 LOC). Do not reintroduce a context-based API without exporting it and updating these docs + the root README.

## Public API (`unified-tracking/react`)

```typescript
import { useUnifiedTracking, useTrackEvent } from 'unified-tracking/react';

// useUnifiedTracking() returns the bound core methods (no provider needed):
//   track, identify, setUserProperties, logError, logRevenue, logScreenView,
//   setConsent, reset, getActiveProviders, enableDebugMode
const { track, identify, logError } = useUnifiedTracking();

// useTrackEvent() wraps track() with local loading/error state:
const { trackEvent, isTracking, lastError } = useTrackEvent();
```

## Rules

- React is an **optional peer dependency** — keep this layer tree-shakeable.
- Hooks must be SSR-safe — never touch `window`/`document` at module top level.
- `useTrackEvent` uses `useCallback` for a stable reference — follow this for new hooks.
- Export everything through `index.ts`; consumers only import from `unified-tracking/react`.
- The core must be initialized (`UnifiedTracking.initialize(...)`) before hooks dispatch events.

## Adding New Hooks

1. Add the hook to `hooks-new.ts`.
2. Export it from `index.ts`.
3. Update `docs/react-integration.md` and the root `Readme.md` React section.

## CLAUDE.md + AGENTS.md Sync Rule

Rules in this file MUST stay in sync with `src/react/AGENTS.md`. Update both when changing either.


## Sub-agents & Skills — Main-Context-First (IRON-SOLID)
Default/built-in sub-agents (`general-purpose`, `Explore`, `Plan`, `claude`, `fork`, …) do NOT have
access to `/skills`, so delegating to them silently SKIPS the skills RULE #0 requires. Do all
skill-relevant work in the **MAIN context**; use a sub-agent ONLY when a **custom** agent exists in
`.claude/agents/` for that job; a default `Explore`/`Plan` agent is allowed ONLY for read-only,
no-skill search/exploration. When a relevant skill is missing, **install/enable it** rather than
proceeding skill-less. (Owner directive 2026-07-11; full text in `~/.claude/CLAUDE.md`.)
