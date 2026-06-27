# Unified Tracking

- **[AI Integration Guide](./AI-INTEGRATION-GUIDE.md)** - Quick reference for AI development agents (Claude, Cursor, Copilot)

[![npm version](https://badge.fury.io/js/unified-tracking.svg)](https://badge.fury.io/js/unified-tracking)
[![npm downloads](https://img.shields.io/npm/dm/unified-tracking.svg)](https://www.npmjs.com/package/unified-tracking)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Platform](https://img.shields.io/badge/platform-Web%20%7C%20iOS%20%7C%20Android-lightgrey.svg)](https://capacitorjs.com/)
[![CI Status](https://github.com/aoneahsan/unified-tracking/workflows/CI/badge.svg)](https://github.com/aoneahsan/unified-tracking/actions)
[![Coverage](https://img.shields.io/codecov/c/github/aoneahsan/unified-tracking.svg)](https://codecov.io/gh/aoneahsan/unified-tracking)

A comprehensive Capacitor plugin that provides a unified API for multiple analytics and error tracking providers. Track events, identify users, and monitor errors across all major platforms with a single, consistent interface.

## Current State

- Package version: `3.3.0`
- Verified on: `2026-05-27`
- `yarn install`: passed (all dependencies at latest stable)
- `yarn type-check`: passed (TypeScript 6, NodeNext)
- `yarn build`: passed cleanly
- `yarn lint`: passed — `0` warnings, `0` errors
- Node ESM import smoke check: passed

`3.3.0` completes the polish backlog deferred from `3.2.0` (all additive, no breaking
changes): a unified **`flush()`**, **typed event listeners**, the Firebase & Amplitude
providers now **extend the shared base** (so `setSuperProperties()` + timed events work
there too), a clear non-browser/SSR error, stronger public types (`any` → `unknown` on the
base classes/interfaces), and a corrected `unified-tracking-setup` CLI. `3.2.0` before it
fixed two CRITICAL packaging/loader defects (Node-ESM import + reliable provider
registration) plus secret-safe logging and an honest API docs rewrite. See
[`CHANGELOG.md`](./CHANGELOG.md) for the full history. Native iOS/Android SDK bridges
remain scaffolding (not yet wired) — tracking runs via the web layer (incl. the Capacitor
WebView).

## ✨ Features

- 🚀 **No runtime npm dependencies** - the package ships zero runtime deps; each provider's vendor SDK loads from its CDN at runtime (needs a CSP `script-src` allowlist for those origins, and is not compatible with Manifest-V3 browser extensions)
- 🎯 **Provider-less** - No React Context/Providers needed, works in dynamic components
- 📊 **Multiple Analytics** - Support for Google Analytics, Mixpanel, Segment, PostHog, Amplitude, Firebase
- 🐛 **Error Tracking** - Integrated Sentry, Bugsnag, Rollbar, DataDog, LogRocket support
- ⚛️ **React Ready** - Simple hooks that work anywhere, even in dynamically injected components
- 📱 **Cross Platform** - Web, iOS, Android support via optional Capacitor integration
- 🛡️ **Privacy First** - Built-in consent management
- 📦 **Tree-Shakeable** - Only bundle what you use
- 🎯 **TypeScript** - Full type safety and autocompletion

## 📦 Installation

### For Capacitor Projects

```bash
# Install the plugin
yarn add unified-tracking

# For iOS
yarn cap add ios
yarn cap sync ios

# For Android
yarn cap add android
yarn cap sync android
```

### For React Web Projects

```bash
# Install the plugin
yarn add unified-tracking

# Install peer dependencies for React support
yarn add react@^19.0.0 @capacitor/core@^8.0.0
```

### Manual Setup (CLI Helper)

The plugin includes a setup helper to guide you through configuration:

```bash
yarn unified-tracking-setup
```

## 🚀 Quick Start

### 1. Initialize the Plugin

```typescript
import { UnifiedTracking } from 'unified-tracking';

// Initialize with your providers
await UnifiedTracking.initialize({
  analytics: {
    providers: ['google', 'mixpanel'],
    google: {
      measurementId: 'G-XXXXXXXXXX',
    },
    mixpanel: {
      token: 'YOUR_MIXPANEL_TOKEN',
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

### 2. Track Events

```typescript
// Direct API usage
await UnifiedTracking.track('purchase_completed', {
  product_id: '123',
  price: 99.99,
  currency: 'USD'
});

// React Hook usage
import { useUnifiedTracking } from 'unified-tracking/react';

function MyComponent() {
  const { track, identify, logError } = useUnifiedTracking();

  const handlePurchase = async () => {
    await track('purchase_completed', {
      product_id: '123',
      price: 99.99
    });
  };

  return <button onClick={handlePurchase}>Buy Now</button>;
}
```

### 3. Identify Users

```typescript
await UnifiedTracking.identify('user-123', {
  email: 'user@example.com',
  name: 'John Doe',
  plan: 'premium',
});
```

### 4. Track Errors

```typescript
try {
  // Your code
} catch (error) {
  await UnifiedTracking.logError(error, {
    tags: { context: 'checkout_process' },
    user: { id: 'user-123' },
  });
}
```

## 📦 Installation Options

### Pure JavaScript/TypeScript

```typescript
import { UnifiedTracking } from 'unified-tracking';
```

### React Integration

```typescript
import { useTrackEvent, useUnifiedTracking } from 'unified-tracking/react';
```

### Capacitor Integration (Optional)

```typescript
import { UnifiedTracking } from 'unified-tracking/capacitor';
```

## 🔧 Configuration

### Minimal Configuration

```typescript
// Auto-detects available SDKs
await UnifiedTracking.initialize();
```

### With Provider Configuration

```typescript
await UnifiedTracking.initialize({
  analytics: {
    providers: ['google', 'mixpanel'],
    google: {
      measurementId: 'G-XXXXXXXXXX',
    },
    mixpanel: {
      token: 'YOUR_MIXPANEL_TOKEN',
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

## 🎣 React Hooks (No Providers Required!)

### useTrackEvent

```typescript
const { trackEvent, isTracking, lastError } = useTrackEvent();

await trackEvent('purchase_completed', {
  product_id: '123',
  price: 99.99,
});
```

### useUnifiedTracking

```typescript
const tracking = useUnifiedTracking();

// All methods available
await tracking.track('event_name', { properties });
await tracking.identify('user123', { email: 'user@example.com' });
await tracking.logError(new Error('Something went wrong'));
await tracking.logRevenue({ amount: 99.99, currency: 'USD' });
```

## 📊 Supported Providers

### Analytics

- Google Analytics 4
- Mixpanel
- Segment
- PostHog
- Amplitude
- Firebase Analytics
- Heap
- Matomo

### Error Tracking

- Sentry
- Bugsnag
- Rollbar
- LogRocket
- Raygun
- DataDog RUM
- AppCenter
- Firebase Crashlytics

## 🔌 Dynamic Provider Loading

Providers are loaded dynamically based on availability:

```typescript
// The package detects which SDKs are available
// and only initializes those providers

// If you have gtag loaded, Google Analytics will work
// If you have mixpanel loaded, Mixpanel will work
// No errors if SDKs are missing - graceful degradation
```

## 🛡️ Privacy & Consent

Consent is enforced at dispatch: when a category is denied, matching events are
dropped before any provider is called. `analytics` and `errorTracking` default to
`true`; `marketing` and `personalization` default to `false` (opt-in).

```typescript
await UnifiedTracking.setConsent({
  analytics: true,
  errorTracking: true,
  marketing: false,
  personalization: false,
});

// Strip sensitive keys from every event before it reaches a provider:
await UnifiedTracking.initialize({
  settings: { privacy: { excludedProperties: ['email', 'ssn', 'creditCard'] } },
});
```

## 📱 Platform Support

- ✅ Web — all modern browsers
- ✅ React 19+ (optional peer dependency)
- ✅ Capacitor 7.4.3+ / 8.x (optional peer dependency)
- ✅ Electron / any JS runtime with a DOM
- 🚧 iOS / Android **native SDK bridges** — see the note below

> **Native (iOS / Android):** In a Capacitor app, all 16 providers run through the
> web/JS layer inside the WebView — that path is fully implemented and is what
> delivers tracking today. Dedicated **native-SDK bridges** (invoking the platform
> Firebase / Sentry / etc. SDKs directly from Swift/Kotlin) are on the roadmap; the
> `ios/` and `android/` plugin scaffolding ships as the foundation for that work and
> does not yet forward events to native SDKs.

## 🤝 Migration

### From React Context-based Analytics

```typescript
// Before (with providers)
<AnalyticsProvider config={config}>
  <App />
</AnalyticsProvider>

// After (no providers!)
UnifiedTracking.initialize(config);
// Use hooks anywhere!
```

### From Individual SDKs

```typescript
// Before
gtag('event', 'purchase', { value: 99.99 });
mixpanel.track('purchase', { value: 99.99 });

// After
UnifiedTracking.track('purchase', { value: 99.99 });
// Automatically sent to all configured providers
```

## 📚 Documentation

- [API Reference](./docs/api-reference.md) - Complete API documentation
- [AI Integration Guide](./AI-INTEGRATION-GUIDE.md) - Full, accurate API reference
- [React Hooks Guide](./docs/react-integration.md) - The two React hooks
- [Native Implementation Status](./docs/native-implementation.md) - Web-first / native status
- [Migration Guide](./docs/migration-guide.md) - Migrate from other solutions
- [Examples](./examples) - Complete examples for various use cases

## 🏗️ Advanced Usage

### Custom Providers

```typescript
import { BaseAnalyticsProvider, RegisterProvider } from 'unified-tracking';

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

  protected async doInitialize(): Promise<void> {
    /* load your SDK */
  }
  protected async doTrack(event: string, properties?: Record<string, unknown>): Promise<void> {
    /* forward to your SDK */
  }
  // …implement the remaining doXxx() methods — see AI-INTEGRATION-GUIDE.md
}
```

### Direct SDK Access

```typescript
// Access underlying provider instances
const providers = await UnifiedTracking.getActiveProviders();
```

## 📊 Analytics & Metrics

This plugin provides comprehensive analytics tracking:

- **Event Tracking**: Custom events with properties
- **User Identification**: Associate events with users
- **Revenue Tracking**: E-commerce and subscription revenue
- **Screen/Page Views**: Automatic or manual page tracking
- **User Properties**: Set custom user attributes
- **Session Tracking**: Track user sessions across platforms

## 🚨 Error Tracking

Built-in error handling capabilities:

- **Automatic Error Capture**: Unhandled exceptions
- **Manual Error Logging**: Log custom errors with context
- **User Context**: Associate errors with specific users
- **Breadcrumbs**: Track user actions leading to errors
- **Performance Monitoring**: Track performance metrics
- **Custom Tags**: Add custom metadata to errors

## 🔒 Privacy & Compliance

- **Consent gating**: analytics and error events are dropped at dispatch when the matching consent category is denied (via `setConsent` or `settings.defaultConsent`).
- **Data minimization**: keys listed in `settings.privacy.excludedProperties` are stripped from event properties, identify traits, user properties, revenue properties, and error context before any provider receives them.
- **No secrets in logs**: provider API keys/DSNs are redacted and never written to the console.
- **IP anonymization**: applied per provider where the vendor supports it (e.g. Google Analytics `anonymizeIp`).
- **User control**: consent can be revoked at any time; revoked providers stop receiving events.

## 🛠️ Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/aoneahsan/unified-tracking.git
cd unified-tracking

# Install dependencies
yarn install

# Build the plugin
yarn build

# Run linting
yarn lint
```

### Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

## 📄 License

MIT © [Ahsan Mahmood](https://aoneahsan.com)

## 🤝 Support

- 📖 [Documentation](./docs/README.md)
- 🐛 [Issues](https://github.com/aoneahsan/unified-tracking/issues)
- 💬 [Discussions](https://github.com/aoneahsan/unified-tracking/discussions)
- 📧 [Email Support](mailto:aoneahsan@gmail.com)

## 🌟 Show Your Support

Give a ⭐️ if this project helped you!

[![Star History Chart](https://api.star-history.com/svg?repos=aoneahsan/unified-tracking&type=Date)](https://star-history.com/#aoneahsan/unified-tracking&Date)

<!-- project-links:start -->

## Links

- Live: https://npmjs.com/package/unified-tracking
- NPM: https://npmjs.com/package/unified-tracking

_URL source of truth: `01-code/projects/project-live-urls.json` (auto-generated — do not hand-edit between these markers)._

<!-- project-links:end -->
