# React Integration Guide

`unified-tracking/react` provides **provider-free hooks** — there is **no** React Context, `<Provider>`, or higher-order component. The hooks call the core singleton directly, so they work anywhere (including dynamically injected components). React is an **optional peer dependency** (React 19+).

> **Note:** A previous Provider/context/HOC API was removed in 3.1.0 (it was never actually exported). If you followed older docs that referenced `UnifiedTrackingProvider`, `useTracking`, `usePageTracking`, `useErrorBoundary`, `withTracking`, `withPageTracking`, or `MockTrackingProvider` — **none of those exist**. Use the two hooks documented below.

## Installation

```bash
yarn add unified-tracking
# React 19+ must already be installed (it is an optional peer dependency)
```

## Initialize once at startup

Initialize the tracker a single time. Events fired **before** `initialize()` resolves are buffered and replayed in order once it completes, so you don't need to gate early calls.

```ts
import { UnifiedTracking } from 'unified-tracking';

await UnifiedTracking.initialize({
  analytics: {
    providers: ['google'],
    google: { measurementId: 'G-XXXXXXXXXX' },
  },
  errorTracking: {
    providers: ['sentry'],
    sentry: { dsn: 'https://examplePublicKey@o0.ingest.sentry.io/0' },
  },
  settings: {
    debug: false,
    defaultConsent: { analytics: true, errorTracking: true },
  },
});
```

## `useUnifiedTracking()`

Returns the bound core methods. The returned object has a **stable identity** across renders, so it is safe to list in effect dependency arrays.

```tsx
import { useUnifiedTracking } from 'unified-tracking/react';

function CheckoutButton() {
  const { track, logRevenue } = useUnifiedTracking();
  return (
    <button
      onClick={() => {
        void track('checkout_started', { plan: 'pro' });
        void logRevenue({ amount: 49, currency: 'USD' });
      }}
    >
      Checkout
    </button>
  );
}
```

Available methods: `track`, `identify`, `setUserProperties`, `logError`, `logRevenue`, `logScreenView`, `setConsent`, `reset`, `getActiveProviders`, `enableDebugMode`.

## `useTrackEvent()`

Wraps `track()` with local loading/error state — handy for buttons and forms.

```tsx
import { useTrackEvent } from 'unified-tracking/react';

function SignupButton() {
  const { trackEvent, isTracking, lastError } = useTrackEvent();
  return (
    <>
      <button disabled={isTracking} onClick={() => void trackEvent('signup_completed')}>
        {isTracking ? 'Saving…' : 'Sign up'}
      </button>
      {lastError && <p role="alert">Tracking failed: {lastError.message}</p>}
    </>
  );
}
```

## Screen tracking with React Router

There is no built-in router hook — compose `logScreenView` with your router:

```tsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useUnifiedTracking } from 'unified-tracking/react';

function RouteTracker() {
  const location = useLocation();
  const { logScreenView } = useUnifiedTracking();
  useEffect(() => {
    void logScreenView(location.pathname);
  }, [location.pathname, logScreenView]);
  return null;
}
```

## SSR

The hooks are SSR-safe at module load (they never touch `window`/`document`). The web providers themselves require a browser; if `initialize()` runs server-side, web providers are skipped and surfaced in `InitializeResult.warnings`.

## See also

- [`AI-INTEGRATION-GUIDE.md`](../AI-INTEGRATION-GUIDE.md) — full, accurate API reference.
- [`Readme.md`](../Readme.md) — provider matrix and configuration.
