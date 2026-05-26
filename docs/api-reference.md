# API Reference

Accurate reference for `unified-tracking`. The TypeScript declarations in `dist/` (generated from `src/definitions.ts`) are the canonical source of truth; this page summarizes the public surface.

> The main entry exports a singleton (`UnifiedTracking` / `UnifiedTrackingPlugin`). There is **no** React `<Provider>`, context, or HOC, and no `useIdentifyUser`/`useScreenView`/`useConsent`/`with*` helpers — those were never implemented. The real React surface is the two hooks in [`react-integration.md`](./react-integration.md).

## Import

```ts
import { UnifiedTracking } from 'unified-tracking';
// React hooks (optional peer): import from 'unified-tracking/react'
```

## Configuration (`UnifiedTrackingConfig`)

```ts
await UnifiedTracking.initialize({
  analytics?: {
    providers?: ('google' | 'firebase' | 'amplitude' | 'mixpanel' | 'segment' | 'posthog' | 'heap' | 'matomo')[];
    google?: { measurementId: string; customDimensions?: Record<string, string>; sendPageView?: boolean; /* … */ };
    firebase?: { /* … */ };
    amplitude?: { apiKey: string; /* … */ };
    mixpanel?: { token: string; apiHost?: string; /* … */ };
    segment?: { writeKey: string; enabledIntegrations?: Record<string, boolean>; /* … */ };
    posthog?: { apiKey: string; apiHost?: string; /* … */ };
    heap?: { appId: string; /* … */ };
    matomo?: { siteId: string | number; trackerUrl: string; /* … */ };
  };
  errorTracking?: {
    providers?: ('sentry' | 'crashlytics' | 'datadog' | 'bugsnag' | 'rollbar' | 'logrocket' | 'raygun' | 'appcenter')[];
    sentry?: { dsn: string; /* … */ };
    logrocket?: { appId: string; /* … */ };
    // … one optional key per provider
  };
  settings?: {
    debug?: boolean;
    defaultConsent?: ConsentSettings;
    autoTrackScreens?: boolean;
    autoTrackErrors?: boolean;
    batching?: { enabled: boolean; maxSize?: number; timeout?: number };
    privacy?: { anonymizeIp?: boolean; excludedProperties?: string[]; dataRetentionDays?: number };
  };
  autoDetect?: boolean;
});
```

Provider config keys match the names above. For back-compat, the older documented aliases are still accepted at runtime: Matomo `url`→`trackerUrl`, PostHog `host`→`apiHost`, Segment `integrations`→`enabledIntegrations`, LogRocket `appID`/`appId`.

## Core methods

| Method               | Signature                                                                                                       | Notes                                                                                                                                                              |
| -------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `initialize`         | `(config?: UnifiedTrackingConfig) => Promise<InitializeResult>`                                                 | Loads config + initializes providers; replays any events buffered before it resolved. Provider load/init failures are collected in `result.warnings` (not thrown). |
| `track`              | `(event: string, properties?: Record<string, unknown>) => Promise<void>`                                        | Empty/non-string event names are ignored with a warning.                                                                                                           |
| `identify`           | `(userId: string, traits?: Record<string, unknown>) => Promise<void>`                                           |                                                                                                                                                                    |
| `setUserProperties`  | `(properties: Record<string, unknown>) => Promise<void>`                                                        |                                                                                                                                                                    |
| `logError`           | `(error: Error \| string, context?: ErrorContext) => Promise<void>`                                             |                                                                                                                                                                    |
| `logRevenue`         | `(revenue: RevenueData) => Promise<void>`                                                                       | `revenue.amount` must be a finite number, else ignored.                                                                                                            |
| `logScreenView`      | `(screenName: string, properties?: Record<string, unknown>) => Promise<void>`                                   | Note: positional args, not an object.                                                                                                                              |
| `setConsent`         | `(consent: ConsentSettings) => Promise<void>`                                                                   | May be called before `initialize()`.                                                                                                                               |
| `reset`              | `() => Promise<void>`                                                                                           | Clears user-scoped state; keeps providers running.                                                                                                                 |
| `shutdown`           | `() => Promise<void>`                                                                                           | Full teardown: shuts down/unregisters providers, clears listeners, returns to uninitialized.                                                                       |
| `getActiveProviders` | `() => Promise<ActiveProvidersResult>`                                                                          |                                                                                                                                                                    |
| `enableDebugMode`    | `(enabled: boolean) => Promise<void>`                                                                           |                                                                                                                                                                    |
| `addListener`        | `(eventName: 'trackingEvent' \| 'error' \| 'providerStatusChange', fn) => Promise<{ remove(): Promise<void> }>` |                                                                                                                                                                    |

## Key result types

```ts
interface InitializeResult {
  success: boolean;
  activeProviders: ActiveProvidersResult;
  warnings?: string[]; // providers that failed to load/init
}

interface ActiveProvidersResult {
  analytics: { name: string; enabled: boolean; initialized: boolean; version: string }[];
  errorTracking: { name: string; enabled: boolean; initialized: boolean; version: string }[];
}

// Only `analytics` and `errorTracking` gate event dispatch; the others are forwarded
// to provider-native consent APIs (e.g. GA Consent Mode) where supported.
interface ConsentSettings {
  analytics?: boolean;
  errorTracking?: boolean;
  marketing?: boolean;
  personalization?: boolean;
  advertising?: boolean;
  functional?: boolean;
  performance?: boolean;
}

interface RevenueData {
  amount: number; // required, finite
  currency?: string;
  productId?: string;
  quantity?: number;
  properties?: Record<string, unknown>;
}
```

For the exhaustive `ErrorContext`, `RevenueData`, and per-provider config fields, consult the bundled `.d.ts` types or `src/definitions.ts`.

## React

See [`react-integration.md`](./react-integration.md). Two hooks: `useUnifiedTracking()` (bound methods, stable reference) and `useTrackEvent()` (track + `isTracking`/`lastError`).
