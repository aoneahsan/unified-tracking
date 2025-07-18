# Unified Tracking

A comprehensive Capacitor plugin that provides a unified API for multiple analytics and error tracking providers. Track events, identify users, and monitor errors across all major platforms with a single, consistent interface.

## Features

- 🚀 **Unified API** - Single interface for all providers
- 📊 **Multiple Analytics** - Google Analytics, Mixpanel, Segment, PostHog, Amplitude, Firebase
- 🐛 **Error Tracking** - Sentry, Bugsnag, Rollbar, DataDog, LogRocket
- ⚛️ **React Integration** - Hooks, HOCs, and Context providers
- 🔧 **Auto Setup** - NPX script for quick configuration
- 📱 **Cross Platform** - Web, iOS, Android support
- 🛡️ **Privacy First** - Built-in consent management
- 📦 **TypeScript** - Full type safety and autocompletion
- 🎯 **Zero Config** - Works out of the box with sensible defaults

## Quick Start

### Automatic Setup (Recommended)

```bash
npx unified-tracking-setup
```

This will guide you through provider setup, generate configuration files, and create usage examples.

### Manual Installation

```bash
# npm
npm install unified-tracking

# yarn
yarn add unified-tracking
```

## Basic Usage

### Initialize

```typescript
import { UnifiedTracking } from 'unified-tracking';

const config = {
  analytics: [
    {
      id: 'google-analytics',
      config: {
        measurementId: 'G-XXXXXXXXXX',
      },
    },
  ],
  errorTracking: [
    {
      id: 'sentry',
      config: {
        dsn: 'https://your-dsn@sentry.io/project-id',
      },
    },
  ],
  debug: false,
};

await UnifiedTracking.initialize(config);
```

### Track Events

```typescript
// Track a custom event
await UnifiedTracking.track('button_click', {
  button_text: 'Sign Up',
  page: '/landing',
  category: 'conversion',
});

// Track screen views
await UnifiedTracking.logScreenView('dashboard', {
  user_type: 'premium',
  feature_flags: ['new_ui'],
});

// Track revenue
await UnifiedTracking.logRevenue({
  amount: 29.99,
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
});
```

### Error Tracking

```typescript
try {
  // Some operation
} catch (error) {
  await UnifiedTracking.logError(error, {
    severity: 'error',
    tags: { component: 'checkout' },
    extra: { orderId: '12345' },
  });
}
```

## React Integration

### Provider Setup

```tsx
import { UnifiedTrackingProvider } from 'unified-tracking/react';

function App() {
  return (
    <UnifiedTrackingProvider config={config}>
      <YourApp />
    </UnifiedTrackingProvider>
  );
}
```

### Using Hooks

```tsx
import { useTrackEvent, useIdentifyUser } from 'unified-tracking/react';

function MyComponent() {
  const { trackEvent } = useTrackEvent();
  const { identifyUser } = useIdentifyUser();

  const handleClick = async () => {
    await trackEvent('button_click', { button: 'header' });
  };

  const handleLogin = async (user) => {
    await identifyUser(user.id, { email: user.email });
  };

  return (
    <button onClick={handleClick}>
      Track This Click
    </button>
  );
}
```

### Higher-Order Components

```tsx
import { withTracking } from 'unified-tracking/react';

const TrackedComponent = withTracking(MyComponent, {
  enableScreenTracking: true,
  enableEventTracking: true,
  enableErrorTracking: true,
});
```

## Supported Providers

### Analytics

- **Google Analytics 4** - Web analytics and user behavior tracking
- **Mixpanel** - Advanced product analytics and user segmentation  
- **Segment** - Customer data platform and event routing
- **PostHog** - Product analytics with feature flags and session replay
- **Amplitude** - Digital product analytics and user journey tracking
- **Firebase Analytics** - Mobile and web app analytics

### Error Tracking

- **Sentry** - Error tracking and performance monitoring
- **Bugsnag** - Error monitoring and stability management
- **Rollbar** - Real-time error tracking and debugging
- **DataDog RUM** - Full-stack observability and monitoring
- **LogRocket** - Session replay and error tracking

## Configuration Examples

### Multiple Analytics Providers

```typescript
const config = {
  analytics: [
    {
      id: 'google-analytics',
      config: { measurementId: 'G-XXXXXXXXXX' },
    },
    {
      id: 'mixpanel',
      config: { token: 'your-mixpanel-token' },
    },
    {
      id: 'posthog',
      config: { 
        apiKey: 'your-posthog-key',
        sessionRecording: { enabled: true },
      },
    },
  ],
  errorTracking: [
    {
      id: 'sentry',
      config: { 
        dsn: 'your-sentry-dsn',
        tracesSampleRate: 1.0,
      },
    },
  ],
};
```

### Environment-Based Configuration

```typescript
const config = {
  debug: process.env.NODE_ENV === 'development',
  analytics: [
    {
      id: 'google-analytics',
      config: {
        measurementId: process.env.REACT_APP_GA_MEASUREMENT_ID,
        debugMode: process.env.NODE_ENV === 'development',
      },
    },
  ],
  errorTracking: [
    {
      id: 'sentry',
      config: {
        dsn: process.env.REACT_APP_SENTRY_DSN,
        environment: process.env.NODE_ENV,
      },
    },
  ],
};
```

## Privacy & Consent

Built-in consent management for GDPR compliance:

```typescript
// Set consent preferences
await UnifiedTracking.setConsent({
  analytics: true,
  errorTracking: true,
  marketing: false,
  personalization: false,
});

// Or use the React hook
const { consent, updateConsent, acceptAll, rejectAll } = useConsent();
```

## Migration

### From Google Analytics

```typescript
// Before
gtag('event', 'click', { button: 'header' });

// After
await UnifiedTracking.track('click', { button: 'header' });
```

### From Mixpanel

```typescript
// Before
mixpanel.track('Page View', { page: 'dashboard' });

// After  
await UnifiedTracking.logScreenView('dashboard');
```

### From Sentry

```typescript
// Before
Sentry.captureException(error);

// After
await UnifiedTracking.logError(error);
```

## Documentation

- [Setup Guide](./docs/setup-guide.md) - Detailed installation and configuration
- [API Reference](./docs/api-reference.md) - Complete API documentation
- [React Integration](./docs/react-integration.md) - React-specific features
- [Migration Guide](./docs/migration-guide.md) - Migrate from existing solutions

## Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Support

- 🐛 [Bug Reports](https://github.com/your-org/unified-tracking/issues)
- 💡 [Feature Requests](https://github.com/your-org/unified-tracking/issues)
- 📚 [Documentation](https://docs.unified-tracking.dev)
- 💬 [Discussions](https://github.com/your-org/unified-tracking/discussions)