# AI Integration Guide - unified-tracking

Quick reference for AI development agents (Claude Code, Cursor, Copilot, etc.) to integrate `unified-tracking` accurately. Every snippet below matches the actual public API as of `3.1.0`.

## Installation

```bash
yarn add unified-tracking
```

## Core Concepts

- **Zero runtime dependencies** — React and Capacitor are optional peer dependencies.
- **Provider-less** — React hooks call the core singleton directly; no Context/Provider.
- **Analytics providers** — `google`, `firebase`, `amplitude`, `mixpanel`, `segment`, `posthog`, `heap`, `matomo`.
- **Error providers** — `sentry`, `crashlytics`, `datadog`, `bugsnag`, `rollbar`, `logrocket`, `raygun`, `appcenter`.
- **Delivery** — runs in the browser and inside the Capacitor WebView. Native iOS/Android SDK bridges are planned, not yet implemented.

## Quick Start

### Initialize

The provider name in `providers` must match the config key (`'google'` → `google: {...}`).

```typescript
import { UnifiedTracking } from 'unified-tracking';

await UnifiedTracking.initialize({
  analytics: {
    providers: ['google', 'mixpanel'],
    google: { measurementId: 'G-XXXXXXXXXX' },
    mixpanel: { token: 'YOUR_MIXPANEL_TOKEN' },
  },
  errorTracking: {
    providers: ['sentry'],
    sentry: { dsn: 'YOUR_SENTRY_DSN' },
  },
  settings: {
    // Optional: opt-in consent + data minimization
    defaultConsent: { analytics: true, errorTracking: true },
    privacy: { excludedProperties: ['email', 'ssn'], anonymizeIp: true },
  },
});
```

`initialize()` returns `{ success, activeProviders, warnings? }` — check `warnings` for providers that failed to load.

### Track events, screens, revenue

```typescript
await UnifiedTracking.track('purchase_completed', { product_id: '123', price: 99.99 });

await UnifiedTracking.logScreenView('/checkout', { title: 'Checkout' });

await UnifiedTracking.logRevenue({ amount: 99.99, currency: 'USD', productId: 'premium' });
```

### Identify users

```typescript
await UnifiedTracking.identify('user-123', { email: 'user@example.com', plan: 'premium' });
await UnifiedTracking.setUserProperties({ plan: 'premium', theme: 'dark' });
```

### Track errors

`logError` takes an `Error | string` and an optional `ErrorContext` (`{ tags, extra, user, severity, breadcrumbs }`).

```typescript
try {
  await riskyOperation();
} catch (error) {
  await UnifiedTracking.logError(error, {
    tags: { context: 'checkout_process' },
    user: { id: 'user-123' },
    extra: { cartItems: 3 },
  });
}
```

## React Integration

Two hooks are exported from `unified-tracking/react`. There is no provider and no other hook.

```tsx
import { useUnifiedTracking, useTrackEvent } from 'unified-tracking/react';

function MyComponent() {
  // Bound core methods: track, identify, setUserProperties, logError, logRevenue,
  // logScreenView, setConsent, reset, getActiveProviders, enableDebugMode
  const { track, logError, logRevenue } = useUnifiedTracking();

  const handlePurchase = async () => {
    try {
      await processPayment();
      await track('purchase_completed', { amount: 99.99 });
      await logRevenue({ amount: 99.99, currency: 'USD' });
    } catch (error) {
      await logError(error as Error, { tags: { context: 'purchase' } });
    }
  };

  return <button onClick={handlePurchase}>Buy Now</button>;
}

function TrackButton() {
  // useTrackEvent wraps track() with local loading/error state
  const { trackEvent, isTracking, lastError } = useTrackEvent();
  return (
    <button onClick={() => trackEvent('button_clicked', { buttonId: 'cta' })} disabled={isTracking}>
      Track Me
    </button>
  );
}
```

## API Reference (core singleton `UnifiedTracking`)

| Method                        | Description               | Returns                          |
| ----------------------------- | ------------------------- | -------------------------------- |
| `initialize(config?)`         | Initialize providers      | `Promise<InitializeResult>`      |
| `track(name, props?)`         | Track a custom event      | `Promise<void>`                  |
| `identify(userId, traits?)`   | Identify a user           | `Promise<void>`                  |
| `setUserProperties(props)`    | Set user properties       | `Promise<void>`                  |
| `logScreenView(name, props?)` | Track a screen/page view  | `Promise<void>`                  |
| `logRevenue(data)`            | Track a revenue event     | `Promise<void>`                  |
| `logError(error, context?)`   | Log an error to providers | `Promise<void>`                  |
| `setConsent(consent)`         | Update consent settings   | `Promise<void>`                  |
| `reset()`                     | Reset tracking state      | `Promise<void>`                  |
| `getActiveProviders()`        | Active providers by type  | `Promise<ActiveProvidersResult>` |
| `enableDebugMode(enabled)`    | Toggle debug logging      | `Promise<void>`                  |

## Configuration

```typescript
interface UnifiedTrackingConfig {
  analytics?: {
    providers?: AnalyticsProvider[]; // 'google' | 'firebase' | 'amplitude' | 'mixpanel' | 'segment' | 'posthog' | 'heap' | 'matomo'
    google?: { measurementId: string };
    firebase?: { customParameters?: Record<string, unknown> };
    amplitude?: { apiKey: string };
    mixpanel?: { token: string };
    segment?: { writeKey: string };
    posthog?: { apiKey: string; host?: string };
    heap?: { appId: string };
    matomo?: { siteId: string; url: string };
  };
  errorTracking?: {
    providers?: ErrorProvider[]; // 'sentry' | 'crashlytics' | 'datadog' | 'bugsnag' | 'rollbar' | 'logrocket' | 'raygun' | 'appcenter'
    sentry?: { dsn: string; environment?: string };
    bugsnag?: { apiKey: string };
    rollbar?: { accessToken: string };
    datadog?: { clientToken: string; applicationId: string };
    logrocket?: { appId: string };
    raygun?: { apiKey: string };
    appcenter?: { appSecret: string };
  };
  settings?: {
    debug?: boolean;
    defaultConsent?: ConsentSettings;
    privacy?: { anonymizeIp?: boolean; excludedProperties?: string[]; dataRetentionDays?: number };
  };
  autoDetect?: boolean; // detect SDKs already on `window`
}
```

## Consent & Privacy

Consent is enforced at dispatch. `analytics`/`errorTracking` default to `true`; `marketing`/`personalization` default to `false`.

```typescript
await UnifiedTracking.setConsent({
  analytics: true,
  errorTracking: true,
  marketing: false,
  personalization: false,
});
```

Keys in `settings.privacy.excludedProperties` are stripped from every event, trait, user-property set, revenue payload, and error context before any provider receives them.

## Capacitor

The default `unified-tracking` import works everywhere (browser + WebView). To register the Capacitor plugin wrapper explicitly:

```typescript
import { registerCapacitorPlugin } from 'unified-tracking/capacitor';

const plugin = registerCapacitorPlugin();
await plugin.initialize(config);
```

Note: events are delivered by the web/JS layer running in the WebView. Native-SDK bridges are not yet implemented.

## Custom Provider

Providers register via the `@RegisterProvider` decorator and implement the `doXxx` template methods of the base class.

```typescript
import { RegisterProvider, BaseAnalyticsProvider } from 'unified-tracking';

@RegisterProvider({
  id: 'my-analytics',
  name: 'My Analytics',
  type: 'analytics',
  version: '1.0.0',
  supportedPlatforms: ['web'],
})
class MyAnalyticsProvider extends BaseAnalyticsProvider {
  readonly id = 'my-analytics';
  readonly name = 'My Analytics';
  readonly version = '1.0.0';

  protected async doInitialize(config: ProviderConfig): Promise<void> {
    /* set up the SDK */
  }
  protected async doTrack(eventName: string, properties?: Record<string, unknown>): Promise<void> {
    /* forward to your service */
  }
  // ...implement the remaining doXxx() abstract methods
}
```

## Troubleshooting

| Issue                                                 | Solution                                                                                                   |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Events not tracking                                   | Confirm the provider is in `providers` and its config key matches; check `initialize()` result `warnings`. |
| Nothing sent after `setConsent({ analytics: false })` | Expected — consent gating drops events for denied categories.                                              |
| Properties missing at the provider                    | Check `settings.privacy.excludedProperties` isn't stripping them.                                          |
| React hooks no-op                                     | Call `UnifiedTracking.initialize(...)` before the hooks dispatch.                                          |
| Native build has no data                              | Native SDK bridges are not yet implemented; tracking runs via the WebView's JS layer.                      |

## Links

- [Full Documentation](./Readme.md)
- [API Reference](./docs/api/README.md)
- [React Integration](./docs/react-integration.md)
- [GitHub](https://github.com/aoneahsan/unified-tracking)
