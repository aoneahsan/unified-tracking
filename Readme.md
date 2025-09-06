# Unified Tracking

[![npm version](https://badge.fury.io/js/unified-tracking.svg)](https://badge.fury.io/js/unified-tracking)
[![npm downloads](https://img.shields.io/npm/dm/unified-tracking.svg)](https://www.npmjs.com/package/unified-tracking)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Platform](https://img.shields.io/badge/platform-Web%20%7C%20iOS%20%7C%20Android-lightgrey.svg)](https://capacitorjs.com/)
[![CI Status](https://github.com/aoneahsan/unified-tracking/workflows/CI/badge.svg)](https://github.com/aoneahsan/unified-tracking/actions)
[![Coverage](https://img.shields.io/codecov/c/github/aoneahsan/unified-tracking.svg)](https://codecov.io/gh/aoneahsan/unified-tracking)

A comprehensive Capacitor plugin that provides a unified API for multiple analytics and error tracking providers. Track events, identify users, and monitor errors across all major platforms with a single, consistent interface.

## ✨ Features

- 🚀 **Zero Dependencies** - Works out of the box, no required dependencies
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
npm install unified-tracking

# For iOS
npx cap add ios
npx cap sync ios

# For Android
npx cap add android
npx cap sync android
```

### For React Web Projects

```bash
# Install the plugin
npm install unified-tracking

# Install peer dependencies for React support
npm install react@^19.0.0 @capacitor/core@^7.4.3
```

### Manual Setup (CLI Helper)

The plugin includes a setup helper to guide you through configuration:

```bash
npx unified-tracking-setup
```

## 🚀 Quick Start

### 1. Initialize the Plugin

```typescript
import { UnifiedTracking } from 'unified-tracking';

// Initialize with your providers
await UnifiedTracking.initialize({
  analytics: {
    providers: ['google-analytics', 'mixpanel'],
    googleAnalytics: {
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
await UnifiedTracking.trackEvent('purchase_completed', {
  product_id: '123',
  price: 99.99,
  currency: 'USD'
});

// React Hook usage
import { useUnifiedTracking } from 'unified-tracking/react';

function MyComponent() {
  const { trackEvent, identify, logError } = useUnifiedTracking();

  const handlePurchase = async () => {
    await trackEvent('purchase_completed', {
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

````typescript
try {
  // Your code
} catch (error) {
  await UnifiedTracking.logError(error, {
    context: 'checkout_process',
    userId: 'user-123'
  });
}

## 📦 Installation Options

### Pure JavaScript/TypeScript

```typescript
import { UnifiedTracking } from 'unified-tracking';
````

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
    providers: ['google-analytics', 'mixpanel'],
    googleAnalytics: {
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

Built-in consent management:

```typescript
await UnifiedTracking.setConsent({
  analytics: true,
  errorTracking: true,
  marketing: false,
  personalization: false,
});
```

## 📱 Platform Support

- ✅ Web (all modern browsers)
- ✅ React 16.8+
- ✅ React Native (via Capacitor)
- ✅ iOS (via Capacitor)
- ✅ Android (via Capacitor)
- ✅ Electron

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

- [API Reference](./docs/api/README.md) - Complete API documentation
- [React Hooks Guide](./docs/react-integration.md) - All available React hooks
- [Provider Configuration](./docs/api/interfaces/provider-interfaces.md) - Provider-specific settings
- [Migration Guide](./docs/migration-guide.md) - Migrate from other solutions
- [Examples](./examples) - Complete examples for various use cases

## 🏗️ Advanced Usage

### Custom Providers

```typescript
import { ProviderRegistry, BaseAnalyticsProvider } from 'unified-tracking';

@RegisterProvider({
  id: 'my-analytics',
  name: 'My Analytics',
  type: 'analytics',
})
class MyAnalyticsProvider extends BaseAnalyticsProvider {
  // Implementation
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

- **GDPR Compliant**: Built-in consent management
- **CCPA Support**: California Consumer Privacy Act compliance
- **Data Minimization**: Only collect necessary data
- **Anonymization**: Option to anonymize sensitive data
- **User Control**: Users can opt-out of tracking

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

# Run tests
yarn test

# Run linting
yarn lint
```

### Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

## 📄 License

MIT © [Ahsan Mahmood](https://github.com/aoneahsan)

## 🤝 Support

- 📖 [Documentation](./docs/README.md)
- 🐛 [Issues](https://github.com/aoneahsan/unified-tracking/issues)
- 💬 [Discussions](https://github.com/aoneahsan/unified-tracking/discussions)
- 📧 [Email Support](mailto:aoneahsan@gmail.com)

## 🌟 Show Your Support

Give a ⭐️ if this project helped you!

[![Star History Chart](https://api.star-history.com/svg?repos=aoneahsan/unified-tracking&type=Date)](https://star-history.com/#aoneahsan/unified-tracking&Date)
