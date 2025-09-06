# API Reference

Complete API documentation for the Unified Tracking plugin.

## Core API

### UnifiedTracking

The main class for interacting with the unified tracking system.

#### Static Methods

##### `initialize(config: UnifiedTrackingConfig): Promise<InitializeResult>`

Initialize the unified tracking system with the provided configuration.

```typescript
const result = await UnifiedTracking.initialize({
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
        dsn: 'https://your-sentry-dsn@sentry.io/project-id',
      },
    },
  ],
  debug: false,
});
```

**Parameters:**

- `config`: Configuration object containing provider settings

**Returns:** Promise resolving to initialization result with active providers

##### `track(event: string, properties?: Record<string, any>): Promise<void>`

Track a custom event across all initialized analytics providers.

```typescript
await UnifiedTracking.track('button_click', {
  button_text: 'Sign Up',
  page: '/landing',
  category: 'conversion',
});
```

**Parameters:**

- `event`: Event name (string)
- `properties`: Optional event properties (object)

##### `identify(userId: string, traits?: Record<string, any>): Promise<void>`

Identify a user across all initialized providers.

```typescript
await UnifiedTracking.identify('user-123', {
  email: 'user@example.com',
  name: 'John Doe',
  plan: 'premium',
});
```

**Parameters:**

- `userId`: Unique user identifier
- `traits`: Optional user traits/properties

##### `setUserProperties(properties: Record<string, any>): Promise<void>`

Set user properties across all initialized providers.

```typescript
await UnifiedTracking.setUserProperties({
  subscription_tier: 'pro',
  last_login: new Date().toISOString(),
});
```

**Parameters:**

- `properties`: User properties to set

##### `logError(error: Error | string, context?: ErrorContext): Promise<void>`

Log an error across all initialized error tracking providers.

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

**Parameters:**

- `error`: Error object or string
- `context`: Optional error context

##### `logRevenue(revenue: RevenueData): Promise<void>`

Log revenue events across all initialized providers.

```typescript
await UnifiedTracking.logRevenue({
  amount: 29.99,
  currency: 'USD',
  productId: 'premium-plan',
  productName: 'Premium Subscription',
  quantity: 1,
  properties: {
    billing_cycle: 'monthly',
  },
});
```

**Parameters:**

- `revenue`: Revenue data object

##### `logScreenView(screenName: string, properties?: Record<string, any>): Promise<void>`

Log screen view events across all initialized providers.

```typescript
await UnifiedTracking.logScreenView('home', {
  referrer: document.referrer,
  user_type: 'premium',
});
```

**Parameters:**

- `screenName`: Name of the screen/page
- `properties`: Optional screen properties

##### `setConsent(consent: ConsentSettings): Promise<void>`

Update consent settings across all providers.

```typescript
await UnifiedTracking.setConsent({
  analytics: true,
  errorTracking: true,
  marketing: false,
  personalization: false,
});
```

**Parameters:**

- `consent`: Consent settings object

##### `reset(): Promise<void>`

Reset all providers, clearing user data and session information.

```typescript
await UnifiedTracking.reset();
```

##### `enableDebugMode(enabled: boolean): Promise<void>`

Enable or disable debug mode across all providers.

```typescript
await UnifiedTracking.enableDebugMode(true);
```

**Parameters:**

- `enabled`: Whether to enable debug mode

##### `getActiveProviders(): Promise<ActiveProvidersResult>`

Get information about currently active providers.

```typescript
const providers = await UnifiedTracking.getActiveProviders();
console.log('Active analytics providers:', providers.analytics);
console.log('Active error tracking providers:', providers.errorTracking);
```

**Returns:** Promise resolving to active providers information

## React Integration

### UnifiedTrackingProvider

React context provider for unified tracking.

```typescript
import { UnifiedTrackingProvider } from 'unified-tracking/react';

function App() {
  return (
    <UnifiedTrackingProvider
      config={trackingConfig}
      autoInitialize={true}
      onError={(error) => console.error('Tracking error:', error)}
      onInitialized={(providers) => console.log('Initialized:', providers)}
      onEvent={(event, properties) => console.log('Event:', event, properties)}
    >
      <YourApp />
    </UnifiedTrackingProvider>
  );
}
```

**Props:**

- `config`: Unified tracking configuration
- `autoInitialize`: Whether to auto-initialize (default: true)
- `onError`: Error callback
- `onInitialized`: Initialization callback
- `onEvent`: Event callback

### Hooks

#### `useUnifiedTracking()`

Access the unified tracking context.

```typescript
const { track, identify, logError, isInitialized, activeProviders } = useUnifiedTracking();
```

#### `useTrackEvent()`

Hook for tracking events with error handling.

```typescript
const { trackEvent, isTracking, lastError } = useTrackEvent();

const handleClick = async () => {
  await trackEvent('button_click', { button: 'header' });
};
```

#### `useIdentifyUser()`

Hook for user identification.

```typescript
const { identifyUser, isIdentifying, lastError } = useIdentifyUser();

const handleLogin = async (user) => {
  await identifyUser(user.id, { email: user.email });
};
```

#### `useScreenView(screenName, properties?, options?)`

Hook for automatic screen view tracking.

```typescript
const { trackScreen, isTracking, lastError } = useScreenView(
  'home',
  {
    section: 'dashboard',
  },
  {
    trackOnMount: true,
    trackOnUpdate: true,
  },
);
```

#### `useRevenueTracking()`

Hook for revenue tracking with validation.

```typescript
const { trackRevenue, isTracking, lastError } = useRevenueTracking();

const handlePurchase = async (purchase) => {
  await trackRevenue({
    amount: purchase.amount,
    currency: purchase.currency,
    productId: purchase.productId,
  });
};
```

#### `useConsent()`

Hook for consent management.

```typescript
const { consent, updateConsent, acceptAll, rejectAll, acceptEssential, isUpdating } = useConsent();
```

#### `useErrorTracking()`

Hook for error tracking with automatic error boundaries.

```typescript
const { trackError, isLogging, lastError } = useErrorTracking();

const handleError = async (error) => {
  await trackError(error, {
    severity: 'error',
    tags: { component: 'checkout' },
  });
};
```

#### `useFeatureFlags()`

Hook for feature flags (PostHog integration).

```typescript
const { flags, isFeatureEnabled, getFeatureFlag, refreshFlags, isLoading } = useFeatureFlags();

const showNewFeature = isFeatureEnabled('new_feature');
```

### Higher-Order Components

#### `withScreenTracking(Component, options?)`

HOC for automatic screen view tracking.

```typescript
const TrackedComponent = withScreenTracking(MyComponent, {
  screenName: 'settings',
  trackOnMount: true,
  trackOnUpdate: false,
});
```

**Options:**

- `screenName`: Static screen name
- `getScreenName`: Function to get screen name from props
- `getScreenProperties`: Function to get screen properties from props
- `trackOnMount`: Track on component mount (default: true)
- `trackOnUnmount`: Track on component unmount (default: false)
- `trackOnUpdate`: Track on props update (default: false)

#### `withEventTracking(Component, options?)`

HOC for automatic event tracking.

```typescript
const TrackedComponent = withEventTracking(MyComponent, {
  trackClicks: true,
  trackHovers: false,
  events: {
    submit: {
      eventName: 'form_submit',
      getProperties: (props) => ({ form_id: props.formId }),
    },
  },
});
```

**Options:**

- `trackClicks`: Auto-track click events
- `trackHovers`: Auto-track hover events
- `trackFocus`: Auto-track focus events
- `events`: Custom event configuration
- `getEventProperties`: Function to get event properties

#### `withErrorTracking(Component, options?)`

HOC for automatic error boundary with error tracking.

```typescript
const TrackedComponent = withErrorTracking(MyComponent, {
  fallbackComponent: CustomErrorFallback,
  onError: (error, errorInfo) => console.error(error),
  getErrorContext: (error, errorInfo, props) => ({
    tags: { component: props.componentName },
  }),
});
```

**Options:**

- `fallbackComponent`: Custom error fallback component
- `onError`: Error callback
- `getErrorContext`: Function to get error context

#### `withPerformanceTracking(Component, options?)`

HOC for automatic performance tracking.

```typescript
const TrackedComponent = withPerformanceTracking(MyComponent, {
  trackRenderTime: true,
  trackMountTime: true,
  trackUpdateTime: false,
});
```

**Options:**

- `trackRenderTime`: Track render performance
- `trackMountTime`: Track mount performance
- `trackUpdateTime`: Track update performance
- `getPerformanceProperties`: Function to get performance properties

#### `withTracking(Component, options?)`

Combined HOC that applies multiple tracking HOCs.

```typescript
const FullyTrackedComponent = withTracking(MyComponent, {
  enableScreenTracking: true,
  enableEventTracking: true,
  enableErrorTracking: true,
  enablePerformanceTracking: false,
  // ... options for individual HOCs
});
```

## Type Definitions

### UnifiedTrackingConfig

```typescript
interface UnifiedTrackingConfig {
  analytics: AnalyticsProviderConfig[];
  errorTracking: ErrorTrackingProviderConfig[];
  consent?: ConsentConfig;
  debug?: boolean;
  autoInitialize?: boolean;
}
```

### AnalyticsProviderConfig

```typescript
interface AnalyticsProviderConfig {
  id: string;
  config: Record<string, any>;
  enabled?: boolean;
}
```

### ErrorTrackingProviderConfig

```typescript
interface ErrorTrackingProviderConfig {
  id: string;
  config: Record<string, any>;
  enabled?: boolean;
}
```

### ConsentSettings

```typescript
interface ConsentSettings {
  analytics: boolean;
  errorTracking: boolean;
  marketing: boolean;
  personalization: boolean;
}
```

### ErrorContext

```typescript
interface ErrorContext {
  severity?: 'debug' | 'info' | 'warning' | 'error' | 'fatal';
  tags?: Record<string, string>;
  extra?: Record<string, any>;
  user?: {
    id?: string;
    email?: string;
    name?: string;
  };
  level?: string;
  fingerprint?: string | string[];
}
```

### RevenueData

```typescript
interface RevenueData {
  amount: number;
  currency?: string;
  productId?: string;
  productName?: string;
  quantity?: number;
  properties?: Record<string, any>;
}
```

### InitializeResult

```typescript
interface InitializeResult {
  success: boolean;
  activeProviders: ActiveProvidersResult;
  errors?: Array<{
    providerId: string;
    error: string;
  }>;
}
```

### ActiveProvidersResult

```typescript
interface ActiveProvidersResult {
  analytics: Array<{
    id: string;
    name: string;
    version: string;
    isInitialized: boolean;
  }>;
  errorTracking: Array<{
    id: string;
    name: string;
    version: string;
    isInitialized: boolean;
  }>;
}
```

## Provider-Specific APIs

### Google Analytics

```typescript
// Set custom parameters
await UnifiedTracking.track('custom_event', {
  custom_parameter_1: 'value1',
  event_category: 'engagement',
  event_label: 'header_button',
});

// Enhanced ecommerce
await UnifiedTracking.logRevenue({
  amount: 29.99,
  currency: 'USD',
  productId: 'product-123',
  productName: 'Premium Plan',
  quantity: 1,
  properties: {
    item_category: 'subscription',
    item_brand: 'MyBrand',
  },
});
```

### Mixpanel

```typescript
// Set super properties (sent with every event)
await UnifiedTracking.track('$set', {
  $distinct_id: 'user-123',
  plan_type: 'premium',
});

// Track user engagement
await UnifiedTracking.track('page_view', {
  page_name: 'dashboard',
  time_on_page: 45,
});
```

### Sentry

```typescript
// Set user context
await UnifiedTracking.identify('user-123', {
  email: 'user@example.com',
  subscription: 'premium',
});

// Custom error context
await UnifiedTracking.logError(new Error('Payment failed'), {
  severity: 'error',
  tags: {
    component: 'checkout',
    payment_method: 'stripe',
  },
  extra: {
    order_id: '12345',
    amount: 29.99,
  },
});
```

### PostHog

```typescript
// Feature flags
const { isFeatureEnabled } = useFeatureFlags();
const showNewCheckout = isFeatureEnabled('new_checkout_flow');

// Event tracking with feature flag context
await UnifiedTracking.track('checkout_started', {
  checkout_version: showNewCheckout ? 'v2' : 'v1',
});
```

## Error Handling

All methods return Promises that can be caught for error handling:

```typescript
try {
  await UnifiedTracking.track('event');
} catch (error) {
  console.error('Tracking failed:', error);
}

// Or with async/await in React
const { trackEvent } = useTrackEvent();

const handleClick = async () => {
  try {
    await trackEvent('button_click');
  } catch (error) {
    // Handle error
  }
};
```

## Debug Mode

Enable debug mode to see detailed logging:

```typescript
const config = {
  debug: true,
  analytics: [
    /*...*/
  ],
  errorTracking: [
    /*...*/
  ],
};

await UnifiedTracking.initialize(config);
```

Debug mode will log:

- Provider initialization status
- Event tracking calls
- Error tracking calls
- Consent updates
- Provider failures

## Environment Variables

Support for environment-specific configuration:

```typescript
const config = {
  debug: process.env.NODE_ENV === 'development',
  analytics: [
    {
      id: 'google-analytics',
      config: {
        measurementId: process.env.REACT_APP_GA_MEASUREMENT_ID,
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
