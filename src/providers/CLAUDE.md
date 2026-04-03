# src/providers/ - Provider Architecture

**Last Updated**: `2026-04-03`

## Architecture Overview

Provider system uses a layered inheritance chain:

```
BaseProviderImpl (base-provider-impl.ts)
  ├── BaseAnalyticsProvider (base-analytics-provider.ts)
  │     ├── AmplitudeProvider
  │     ├── FirebaseProvider
  │     ├── GoogleAnalyticsProvider
  │     ├── HeapProvider
  │     ├── MatomoProvider
  │     ├── MixpanelProvider
  │     ├── PostHogProvider
  │     └── SegmentProvider
  └── BaseErrorTrackingProvider (base-error-tracking-provider.ts)
        ├── SentryProvider
        ├── BugsnagProvider
        ├── RollbarProvider
        ├── LogRocketProvider
        ├── RaygunProvider
        ├── DataDogProvider
        ├── AppCenterProvider
        └── FirebaseCrashlyticsProvider
```

## Key Files

| File | Purpose |
|------|---------|
| `base.ts` | Provider interface definitions (`AnalyticsProvider`, `ErrorTrackingProvider`) |
| `base-provider-impl.ts` | Abstract base with lifecycle (init, ready check, reset, destroy) |
| `base-analytics-provider.ts` | Analytics base: track, identify, screen view, revenue, timed events |
| `base-error-tracking-provider.ts` | Error base: logError, breadcrumbs, user/extra context, tags, transactions |
| `provider-manager.ts` | Orchestrates all registered providers, routes API calls |
| `registry.ts` | Provider registration system |
| `index.ts` | Barrel exports |

## Template Method Pattern

Base classes define public API methods that call `doXxx()` abstract methods. Providers implement only the `doXxx()` methods:

```typescript
// Base class handles: validation, logging, error handling, property merging
async track(eventName, properties) {
  this.checkReady();
  const merged = { ...this.superProperties, ...properties };
  await this.doTrack(eventName, merged);  // Provider implements this
}

// Provider only implements the SDK-specific logic
protected abstract doTrack(eventName: string, properties: Record<string, any>): Promise<void>;
```

### Analytics abstract methods to implement
`doTrack`, `doIdentifyUser`, `doSetUserProperties`, `doLogScreenView`, `doLogRevenue`, `doProviderReset`

### Error tracking abstract methods to implement
`doLogError`, `doSetUserContext`, `doSetExtraContext`, `doSetTags`, `doCaptureException`, `doProviderReset`

## Adding a New Provider

1. Create folder: `analytics/<name>/` or `error-handling/<name>/`
2. Create `<name>.provider.ts` extending the appropriate base class
3. Create `index.ts` barrel export
4. Create `<name>.provider.test.ts` with Vitest tests
5. Register in `registry.ts`
6. Export from `providers/index.ts`
7. Update root `src/index.ts` exports
8. Update `docs/` and root `Readme.md`

## Testing Providers

- Mock the external SDK — never import real analytics/error SDKs
- Test all abstract method implementations
- Test error handling paths (SDK failures should be caught and logged)
- Test `checkReady()` guard (should throw when not initialized)
- Test reset clears internal state

## ProviderManager

- Singleton that initializes all configured providers
- Routes `track()`, `logError()`, etc. to appropriate provider type
- Handles consent filtering before dispatching to providers
- Uses `ConfigManager` for configuration, `EventQueue` for buffering

## CLAUDE.md + AGENTS.md Sync Rule

Rules in this file MUST stay in sync with `src/providers/AGENTS.md`. Update both when changing either.
