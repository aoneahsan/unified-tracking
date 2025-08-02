# Unified Tracking

A zero-dependency, provider-less analytics and error tracking solution for React and web applications. Track events, identify users, and monitor errors with a simple, unified API that works everywhere - no providers or wrappers needed!

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

## 🚀 Quick Start

### Installation

```bash
npm install unified-tracking
# or
yarn add unified-tracking
```

### Basic Usage (No Providers Needed!)

```typescript
// 1. Initialize once in your app (e.g., in index.tsx or App.tsx)
import { UnifiedTracking } from 'unified-tracking';

await UnifiedTracking.initialize({
  analytics: {
    providers: ['google-analytics'], // Auto-loads if gtag is available
    googleAnalytics: {
      measurementId: 'G-XXXXXXXXXX'
    }
  }
});

// 2. Use anywhere - no providers or setup needed!
import { useTrackEvent } from 'unified-tracking/react';

function MyComponent() {
  const { trackEvent } = useTrackEvent();

  const handleClick = () => {
    trackEvent('button_clicked', {
      button_name: 'Subscribe',
      page: 'homepage'
    });
  };

  return <button onClick={handleClick}>Subscribe</button>;
}

// 3. Works in dynamically injected components!
const DynamicWidget = () => {
  const { track } = useUnifiedTracking();

  React.useEffect(() => {
    track('widget_loaded');
  }, []);

  return <div>I can be injected anywhere!</div>;
};
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

## 📄 License

MIT © [Your Name]

## 🤝 Contributing

Contributions are welcome! Please read our [contributing guidelines](./CONTRIBUTING.md) first.

## 🐛 Found a Bug?

Please [open an issue](https://github.com/yourusername/unified-tracking/issues) with reproduction steps.
