# Core Types

Basic type definitions used throughout the plugin.

## AnalyticsProvider

Type representing available analytics providers.

### Definition

```typescript
export type AnalyticsProvider =
  | 'google-analytics'
  | 'firebase-analytics'
  | 'mixpanel'
  | 'amplitude'
  | 'segment'
  | 'posthog'
  | 'heap'
  | 'matomo';
```

### Usage

```typescript
const provider: AnalyticsProvider = 'google-analytics';

// In configuration
const config: AnalyticsConfig = {
  id: provider,
  config: {
    measurementId: 'G-XXXXXXXXXX',
  },
};
```

## ErrorProvider

Type representing available error tracking providers.

### Definition

```typescript
export type ErrorProvider =
  | 'sentry'
  | 'bugsnag'
  | 'rollbar'
  | 'datadog'
  | 'logrocket'
  | 'raygun'
  | 'appcenter'
  | 'firebase-crashlytics';
```

### Usage

```typescript
const errorProvider: ErrorProvider = 'sentry';

// In configuration
const config: ErrorTrackingConfig = {
  id: errorProvider,
  config: {
    dsn: 'https://example@sentry.io/project',
  },
};
```

## ProviderType

Type representing the category of provider.

### Definition

```typescript
export type ProviderType = 'analytics' | 'error-tracking';
```

### Usage

```typescript
function getProviderType(providerId: string): ProviderType {
  const analyticsProviders = ['google-analytics', 'mixpanel', ...];
  return analyticsProviders.includes(providerId) ? 'analytics' : 'error-tracking';
}
```

## EventName

Type for event names with common predefined events.

### Definition

```typescript
export type EventName = string;

// Common event names
export type CommonEventName =
  | 'page_view'
  | 'screen_view'
  | 'click'
  | 'scroll'
  | 'search'
  | 'share'
  | 'sign_up'
  | 'login'
  | 'logout'
  | 'purchase'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'begin_checkout'
  | 'add_payment_info'
  | 'add_shipping_info'
  | 'view_item'
  | 'view_item_list'
  | 'select_content'
  | 'select_item'
  | 'start_trial'
  | 'subscribe'
  | 'complete_registration';
```

### Usage

```typescript
// Using predefined event names
const eventName: CommonEventName = 'purchase';
await UnifiedTracking.track(eventName, { value: 99.99 });

// Using custom event names
const customEvent: EventName = 'video_played';
await UnifiedTracking.track(customEvent, {
  videoId: '123',
  duration: 180,
});
```

## Severity

Error severity levels.

### Definition

```typescript
export type Severity = 'fatal' | 'error' | 'warning' | 'info' | 'debug';
```

### Usage

```typescript
await UnifiedTracking.logError(error, {
  severity: 'error',
  tags: { component: 'api' },
});

// Helper function
function getSeverity(error: Error): Severity {
  if (error.name === 'NetworkError') return 'warning';
  if (error.name === 'SecurityError') return 'fatal';
  return 'error';
}
```

## Currency

ISO 4217 currency codes.

### Definition

```typescript
export type Currency = string;

// Common currencies
export type CommonCurrency =
  | 'USD' // US Dollar
  | 'EUR' // Euro
  | 'GBP' // British Pound
  | 'JPY' // Japanese Yen
  | 'CNY' // Chinese Yuan
  | 'AUD' // Australian Dollar
  | 'CAD' // Canadian Dollar
  | 'CHF' // Swiss Franc
  | 'HKD' // Hong Kong Dollar
  | 'SGD'; // Singapore Dollar
```

### Usage

```typescript
await UnifiedTracking.logRevenue({
  amount: 99.99,
  currency: 'USD' as Currency,
  productId: 'premium-plan',
});
```

## Platform

Supported platforms.

### Definition

```typescript
export type Platform = 'web' | 'ios' | 'android';
```

### Usage

```typescript
function getPlatform(): Platform {
  if (Capacitor.getPlatform() === 'ios') return 'ios';
  if (Capacitor.getPlatform() === 'android') return 'android';
  return 'web';
}
```

## LogLevel

Logging levels for debug output.

### Definition

```typescript
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
```

### Usage

```typescript
const logger = new Logger({
  level: 'debug' as LogLevel,
  enabled: true,
});

logger.debug('Initializing provider');
logger.info('Provider initialized');
logger.warn('Fallback to default config');
logger.error('Failed to load SDK');
```

## Callback Types

Common callback function types.

### Definition

```typescript
// Generic callback
export type Callback<T = void> = (error?: Error | null, result?: T) => void;

// Event callback
export type EventCallback = (eventName: string, properties?: Record<string, any>) => void;

// Error callback
export type ErrorCallback = (error: Error, context?: Record<string, any>) => void;

// Success callback
export type SuccessCallback<T = any> = (result: T) => void;
```

### Usage

```typescript
// Using callbacks
function trackWithCallback(eventName: string, properties: Record<string, any>, callback?: Callback) {
  UnifiedTracking.track(eventName, properties)
    .then(() => callback?.(null))
    .catch((error) => callback?.(error));
}

// Event listener pattern
const onEvent: EventCallback = (eventName, properties) => {
  console.log(`Event: ${eventName}`, properties);
};
```

## Primitive Types

Basic value types for properties.

### Definition

```typescript
export type PrimitiveValue = string | number | boolean | null | undefined;

export type PropertyValue = PrimitiveValue | Date | PropertyValue[] | { [key: string]: PropertyValue };

export type Properties = Record<string, PropertyValue>;
```

### Usage

```typescript
const properties: Properties = {
  // Primitive values
  name: 'John Doe',
  age: 30,
  isSubscribed: true,

  // Date
  createdAt: new Date(),

  // Nested object
  address: {
    city: 'New York',
    country: 'USA',
  },

  // Array
  interests: ['tech', 'music', 'travel'],
};
```

## Type Guards

Helper type guard functions.

### Definition

```typescript
// Check if value is an analytics provider
export function isAnalyticsProvider(value: string): value is AnalyticsProvider {
  const providers: AnalyticsProvider[] = [
    'google-analytics',
    'firebase-analytics',
    'mixpanel',
    'amplitude',
    'segment',
    'posthog',
    'heap',
    'matomo',
  ];
  return providers.includes(value as AnalyticsProvider);
}

// Check if value is an error provider
export function isErrorProvider(value: string): value is ErrorProvider {
  const providers: ErrorProvider[] = [
    'sentry',
    'bugsnag',
    'rollbar',
    'datadog',
    'logrocket',
    'raygun',
    'appcenter',
    'firebase-crashlytics',
  ];
  return providers.includes(value as ErrorProvider);
}

// Check if value is a valid severity
export function isValidSeverity(value: string): value is Severity {
  const severities: Severity[] = ['fatal', 'error', 'warning', 'info', 'debug'];
  return severities.includes(value as Severity);
}
```

### Usage

```typescript
const providerId = 'google-analytics';

if (isAnalyticsProvider(providerId)) {
  // TypeScript knows providerId is AnalyticsProvider
  const config: AnalyticsConfig = {
    id: providerId,
    config: {
      /* ... */
    },
  };
}
```

## See Also

- [Provider Types](./provider-types.md) - Provider-specific types
- [Event Types](./event-types.md) - Event-related types
- [Core Interfaces](../interfaces/core-interfaces.md) - Main interfaces
