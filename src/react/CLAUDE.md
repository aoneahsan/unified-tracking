# src/react/ - React Integration

**Last Updated**: `2026-04-03`

## Overview

React integration layer providing hooks, context, and HOC patterns for unified-tracking.

## File Structure

| File | Purpose |
|------|---------|
| `context.tsx` | `UnifiedTrackingProvider` context + `useUnifiedTracking` hook |
| `hooks.ts` | Main hooks: `useTrackEvent`, `useUnifiedTracking`, etc. |
| `hooks-new.ts` | Extended hooks (newer API surface) |
| `hoc.tsx` | Higher-order component wrappers |
| `index.ts` | Barrel exports for `unified-tracking/react` |

## Consumer Import

```typescript
import { useTracking } from 'unified-tracking/react';
```

This maps to `dist/esm/src/react/index.js` via package.json `exports` field.

## Hook Patterns

- All hooks use `useUnifiedTracking()` context internally
- Hooks provide loading state (`isTracking`) and error state (`lastError`)
- Error handling: hooks catch tracking errors and optionally forward them to error tracking providers
- Hooks use `useCallback` for stable references — follow this pattern for new hooks

## Rules

- React is an **optional peer dependency** — all react code must be tree-shakeable
- Never import React internals outside `src/react/`
- All hooks must handle the case where the provider context is not available (graceful degradation)
- Test hooks with Vitest (mock the context provider)
- Export everything through `index.ts` — consumers only import from `unified-tracking/react`

## Adding New Hooks

1. Add hook to `hooks.ts` or `hooks-new.ts`
2. Export from `index.ts`
3. Add Vitest tests
4. Update `docs/react-integration.md`

## CLAUDE.md + AGENTS.md Sync Rule

Rules in this file MUST stay in sync with `src/react/AGENTS.md`. Update both when changing either.
