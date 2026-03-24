# AI Integration Guide - unified-tracking

Quick reference for AI development agents (Claude Code, Cursor, Copilot, etc.) to integrate unified-tracking into projects.

## Installation

```bash
yarn add unified-tracking
```

## Core Concepts

unified-tracking provides:

- **Zero Dependencies** - Works out of the box
- **Provider-less Architecture** - No React Context needed
- **Multi-Provider Support** - Analytics: GA4, Mixpanel, Segment, PostHog, Amplitude, Firebase, Heap, Matomo
- **Error Tracking** - Sentry, Bugsnag, Rollbar, DataDog, LogRocket, Raygun, AppCenter
- **Cross-Platform** - Web, iOS, Android via Capacitor

## Quick Start

### Basic Initialization

```typescript
import { UnifiedTracking } from 'unified-tracking';

await UnifiedTracking.initialize({
  analytics: {
    providers: ['google-analytics'],
    googleAnalytics: {
      measurementId: 'G-XXXXXXXXXX',
    },
  },
  errorTracking: {
    providers: ['sentry'],
    sentry: {
      dsn: 'YOUR_SENTRY_DSN',
    },
  },
});
```

### Track Events

```typescript
import { UnifiedTracking } from 'unified-tracking';

// Track custom event
await UnifiedTracking.trackEvent('purchase_completed', {
  product_id: '123',
  price: 99.99,
  currency: 'USD',
});

// Track page view
await UnifiedTracking.trackPageView('/checkout', {
  title: 'Checkout Page',
});

// Track revenue
await UnifiedTracking.logRevenue({
  amount: 99.99,
  currency: 'USD',
  productId: 'premium-plan',
});
```

### Identify Users

```typescript
await UnifiedTracking.identify('user-123', {
  email: 'user@example.com',
  name: 'John Doe',
  plan: 'premium',
  createdAt: '2024-01-01',
});
```

### Track Errors

```typescript
try {
  await riskyOperation();
} catch (error) {
  await UnifiedTracking.logError(error, {
    context: 'checkout_process',
    userId: 'user-123',
    additionalData: { cartItems: 3 },
  });
}
```

## React Integration

```tsx
import { useUnifiedTracking, useTrackEvent } from 'unified-tracking/react';

function MyComponent() {
  const { trackEvent, identify, logError, logRevenue } = useUnifiedTracking();

  const handlePurchase = async () => {
    try {
      await processPayment();
      await trackEvent('purchase_completed', { amount: 99.99 });
      await logRevenue({ amount: 99.99, currency: 'USD' });
    } catch (error) {
      await logError(error, { context: 'purchase' });
    }
  };

  return <button onClick={handlePurchase}>Buy Now</button>;
}

// Or use the simpler hook
function TrackButton() {
  const { trackEvent, isTracking } = useTrackEvent();

  return (
    <button onClick={() => trackEvent('button_clicked', { buttonId: 'cta' })} disabled={isTracking}>
      Track Me
    </button>
  );
}
```

## API Reference

### Core Functions

| Function                      | Description               | Returns               |
| ----------------------------- | ------------------------- | --------------------- |
| `initialize(config)`          | Initialize with providers | `Promise<void>`       |
| `trackEvent(name, props?)`    | Track custom event        | `Promise<void>`       |
| `trackPageView(path, props?)` | Track page/screen view    | `Promise<void>`       |
| `identify(userId, traits?)`   | Identify user             | `Promise<void>`       |
| `logError(error, context?)`   | Log error to providers    | `Promise<void>`       |
| `logRevenue(data)`            | Track revenue event       | `Promise<void>`       |
| `setConsent(consent)`         | Update consent settings   | `Promise<void>`       |
| `reset()`                     | Reset all tracking state  | `Promise<void>`       |
| `getActiveProviders()`        | Get initialized providers | `Promise<Provider[]>` |

### Configuration

```typescript
interface UnifiedTrackingConfig {
  analytics?: {
    providers: AnalyticsProvider[];
    googleAnalytics?: { measurementId: string };
    mixpanel?: { token: string };
    segment?: { writeKey: string };
    posthog?: { apiKey: string; host?: string };
    amplitude?: { apiKey: string };
    firebase?: {
      /* Firebase config */
    };
    heap?: { appId: string };
    matomo?: { url: string; siteId: string };
  };
  errorTracking?: {
    providers: ErrorProvider[];
    sentry?: { dsn: string; environment?: string };
    bugsnag?: { apiKey: string };
    rollbar?: { accessToken: string };
    datadog?: { clientToken: string; applicationId: string };
    logrocket?: { appId: string };
    raygun?: { apiKey: string };
    appcenter?: { appSecret: string };
  };
  consent?: ConsentSettings;
}
```

### Consent Management

```typescript
await UnifiedTracking.setConsent({
  analytics: true, // Allow analytics tracking
  errorTracking: true, // Allow error tracking
  marketing: false, // Disallow marketing pixels
  personalization: false, // Disallow personalization
});
```

## Supported Providers

### Analytics Providers

| Provider           | Config Key        | Required Field  |
| ------------------ | ----------------- | --------------- |
| Google Analytics 4 | `googleAnalytics` | `measurementId` |
| Mixpanel           | `mixpanel`        | `token`         |
| Segment            | `segment`         | `writeKey`      |
| PostHog            | `posthog`         | `apiKey`        |
| Amplitude          | `amplitude`       | `apiKey`        |
| Firebase Analytics | `firebase`        | Firebase config |
| Heap               | `heap`            | `appId`         |
| Matomo             | `matomo`          | `url`, `siteId` |

### Error Tracking Providers

| Provider    | Config Key  | Required Field                 |
| ----------- | ----------- | ------------------------------ |
| Sentry      | `sentry`    | `dsn`                          |
| Bugsnag     | `bugsnag`   | `apiKey`                       |
| Rollbar     | `rollbar`   | `accessToken`                  |
| DataDog RUM | `datadog`   | `clientToken`, `applicationId` |
| LogRocket   | `logrocket` | `appId`                        |
| Raygun      | `raygun`    | `apiKey`                       |
| AppCenter   | `appcenter` | `appSecret`                    |

## React Hooks

```typescript
import { useUnifiedTracking, useTrackEvent, useIdentify, useLogError } from 'unified-tracking/react';

// Full tracking hook
const { trackEvent, trackPageView, identify, logError, logRevenue, setConsent, reset } = useUnifiedTracking();

// Event tracking hook
const { trackEvent, isTracking, lastError } = useTrackEvent();

// User identification hook
const { identify, isIdentifying } = useIdentify();

// Error logging hook
const { logError, isLogging } = useLogError();
```

## Capacitor Integration

```typescript
import { UnifiedTracking } from 'unified-tracking/capacitor';

// Works the same way on native platforms
await UnifiedTracking.initialize(config);
await UnifiedTracking.trackEvent('app_opened');
```

## Common Patterns

### Initialize in App Entry

```typescript
// src/main.tsx
import { UnifiedTracking } from 'unified-tracking';

const initTracking = async () => {
  await UnifiedTracking.initialize({
    analytics: {
      providers: ['google-analytics', 'mixpanel'],
      googleAnalytics: {
        measurementId: import.meta.env.VITE_GA_MEASUREMENT_ID,
      },
      mixpanel: {
        token: import.meta.env.VITE_MIXPANEL_TOKEN,
      },
    },
    errorTracking: {
      providers: ['sentry'],
      sentry: {
        dsn: import.meta.env.VITE_SENTRY_DSN,
        environment: import.meta.env.MODE,
      },
    },
  });
};

initTracking();
```

### Track User Journey

```typescript
import { UnifiedTracking } from 'unified-tracking';

// On user login
await UnifiedTracking.identify(user.id, {
  email: user.email,
  plan: user.subscription,
});

// On page navigation
await UnifiedTracking.trackPageView(location.pathname);

// On key actions
await UnifiedTracking.trackEvent('feature_used', {
  feature: 'export',
  format: 'csv',
});

// On errors
try {
  await saveData();
} catch (error) {
  await UnifiedTracking.logError(error, { action: 'save_data' });
}

// On logout
await UnifiedTracking.reset();
```

### Custom Provider

```typescript
import { ProviderRegistry, BaseAnalyticsProvider } from 'unified-tracking';

class MyAnalyticsProvider extends BaseAnalyticsProvider {
  async initialize(config: MyConfig) {
    // Setup
  }

  async trackEvent(name: string, properties?: Record<string, unknown>) {
    // Send to your service
  }

  async identify(userId: string, traits?: Record<string, unknown>) {
    // Identify user
  }
}

ProviderRegistry.register('my-analytics', new MyAnalyticsProvider());
```

## Troubleshooting

| Issue                       | Solution                                                     |
| --------------------------- | ------------------------------------------------------------ |
| Events not tracking         | Verify provider is in `providers` array and has valid config |
| Sentry not receiving errors | Check DSN is correct and environment allows errors           |
| Consent blocking tracking   | Ensure `setConsent()` is called with appropriate permissions |
| React hooks not working     | Ensure `initialize()` is called before using hooks           |
| Native not working          | Run `npx cap sync` after installation                        |

## Links

- [Full Documentation](./Readme.md)
- [API Reference](./docs/api/README.md)
- [React Integration](./docs/react-integration.md)
- [GitHub](https://github.com/aoneahsan/unified-tracking)
