# src/react/ - React Integration Agent Instructions

**Last Updated**: `2026-05-26`

## Overview

Provider-free React hooks for unified-tracking. No React Context or `<Provider>` is required — the hooks call the core singleton directly, so they work in dynamically injected components.

## Files

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

Rules in this file MUST stay in sync with `src/react/CLAUDE.md`. Update both when changing either.
