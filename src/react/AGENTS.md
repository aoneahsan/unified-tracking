# src/react/ - React Integration Agent Instructions

**Last Updated**: `2026-04-03`

## Overview

React integration layer: hooks, context, and HOC patterns for unified-tracking.

## Files

| File | Purpose |
|------|---------|
| `context.tsx` | `UnifiedTrackingProvider` + `useUnifiedTracking` hook |
| `hooks.ts` | Main hooks: `useTrackEvent`, etc. |
| `hooks-new.ts` | Extended hooks (newer API) |
| `hoc.tsx` | Higher-order component wrappers |
| `index.ts` | Barrel exports for `unified-tracking/react` |

## Consumer Import

```typescript
import { useTracking } from 'unified-tracking/react';
```

## Key Patterns

- Hooks use `useUnifiedTracking()` context internally
- Hooks provide `isTracking` + `lastError` state
- Use `useCallback` for stable references
- React is optional peer dep — code must be tree-shakeable
- All hooks must gracefully handle missing context provider

## Adding New Hooks

1. Add to `hooks.ts` or `hooks-new.ts`
2. Export from `index.ts`
3. Add Vitest tests
4. Update `docs/react-integration.md`

## CLAUDE.md + AGENTS.md Sync Rule

Rules in this file MUST stay in sync with `src/react/CLAUDE.md`. Update both when changing either.
