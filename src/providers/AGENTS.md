# src/providers/ - Provider Architecture Agent Instructions

**Last Updated**: `2026-04-03`

## Architecture Overview

Layered inheritance chain:

```
BaseProviderImpl
  ├── BaseAnalyticsProvider → 8 analytics providers
  └── BaseErrorTrackingProvider → 8 error tracking providers
```

**Analytics**: Amplitude, Firebase, Google Analytics, Heap, Matomo, Mixpanel, PostHog, Segment
**Error Tracking**: Sentry, Bugsnag, Rollbar, LogRocket, Raygun, DataDog, AppCenter, Firebase Crashlytics

## Key Files

| File                              | Purpose                                               |
| --------------------------------- | ----------------------------------------------------- |
| `base.ts`                         | Provider interface definitions                        |
| `base-provider-impl.ts`           | Abstract base with lifecycle                          |
| `base-analytics-provider.ts`      | Analytics base: track, identify, screen view, revenue |
| `base-error-tracking-provider.ts` | Error base: logError, breadcrumbs, context, tags      |
| `provider-manager.ts`             | Orchestrates providers, routes API calls              |
| `registry.ts`                     | Provider registration system                          |

## Template Method Pattern

Base classes define public API → call `doXxx()` abstract methods → providers implement only `doXxx()`.

### Analytics: implement `doTrack`, `doIdentifyUser`, `doSetUserProperties`, `doLogScreenView`, `doLogRevenue`, `doProviderReset`

### Error tracking: implement `doLogError`, `doSetUserContext`, `doSetExtraContext`, `doSetTags`, `doCaptureException`, `doProviderReset`

## Adding a New Provider

1. Create folder: `analytics/<name>/` or `error-handling/<name>/`
2. Create `<name>.provider.ts` extending the appropriate base class
3. Create `index.ts` barrel export
4. Create `<name>.provider.test.ts` with Vitest tests
5. Register in `registry.ts` and export from `providers/index.ts`
6. Update `src/index.ts`, docs, and `Readme.md`

## Testing Providers

- Mock external SDK — never import real SDKs
- Test all abstract method implementations
- Test error handling paths
- Test `checkReady()` guard
- Test reset clears internal state
- Framework: **Vitest** (NEVER Jest)

## CLAUDE.md + AGENTS.md Sync Rule

Rules in this file MUST stay in sync with `src/providers/CLAUDE.md`. Update both when changing either.
