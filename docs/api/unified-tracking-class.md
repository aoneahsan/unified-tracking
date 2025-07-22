# UnifiedTracking Class

The main class that provides the unified API for all analytics and error tracking operations.

## Import

```typescript
import { UnifiedTracking } from 'unified-tracking';
```

## Overview

The `UnifiedTracking` class is a singleton that manages all tracking providers and exposes a unified API for analytics and error tracking. It is created using Capacitor's `registerPlugin` function and provides both web and native implementations.

## Properties

### Instance

The plugin is accessed as a singleton instance:

```typescript
const tracking = UnifiedTracking;
```

## Methods

### initialize

Initializes the plugin with the specified configuration.

#### Signature

```typescript
initialize(config?: UnifiedTrackingConfig): Promise<void>
```

#### Parameters

- `config` (optional): [UnifiedTrackingConfig](./interfaces/configuration-interfaces.md#unifiedtrackingconfig) - The configuration object

#### Returns

`Promise<void>` - Resolves when initialization is complete

#### Example

```typescript
await UnifiedTracking.initialize({
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
  debug: true,
});
```

### track

Tracks a custom event with optional properties.

#### Signature

```typescript
track(eventName: string, properties?: Record<string, any>): Promise<void>
```

#### Parameters

- `eventName`: string - The name of the event to track
- `properties` (optional): Record<string, any> - Additional properties to attach to the event

#### Returns

`Promise<void>` - Resolves when the event is tracked

#### Example

```typescript
await UnifiedTracking.track('button_clicked', {
  button_name: 'subscribe',
  page: '/pricing',
  plan: 'premium',
});
```

### identify

Identifies a user with an ID and optional traits.

#### Signature

```typescript
identify(userId: string, traits?: Record<string, any>): Promise<void>
```

#### Parameters

- `userId`: string - The unique identifier for the user
- `traits` (optional): Record<string, any> - Additional user properties

#### Returns

`Promise<void>` - Resolves when the user is identified

#### Example

```typescript
await UnifiedTracking.identify('user-123', {
  email: 'user@example.com',
  name: 'John Doe',
  plan: 'premium',
  createdAt: new Date().toISOString(),
});
```

### setUserProperties

Sets or updates user properties without changing the user ID.

#### Signature

```typescript
setUserProperties(properties: Record<string, any>): Promise<void>
```

#### Parameters

- `properties`: Record<string, any> - The properties to set or update

#### Returns

`Promise<void>` - Resolves when properties are set

#### Example

```typescript
await UnifiedTracking.setUserProperties({
  lastLogin: new Date().toISOString(),
  preferences: {
    theme: 'dark',
    notifications: true,
  },
});
```

### logError

Logs an error to all configured error tracking providers.

#### Signature

```typescript
logError(error: Error | string, context?: Record<string, any>): Promise<void>
```

#### Parameters

- `error`: Error | string - The error to log
- `context` (optional): Record<string, any> - Additional context information

#### Returns

`Promise<void>` - Resolves when the error is logged

#### Example

```typescript
try {
  // Some operation that might fail
  await riskyOperation();
} catch (error) {
  await UnifiedTracking.logError(error, {
    severity: 'error',
    tags: {
      component: 'payment-processor',
      action: 'charge-card',
    },
    extra: {
      orderId: '12345',
      amount: 99.99,
    },
  });
}
```

### logRevenue

Tracks revenue events.

#### Signature

```typescript
logRevenue(data: RevenueData): Promise<void>
```

#### Parameters

- `data`: [RevenueData](./interfaces/event-interfaces.md#revenuedata) - The revenue data

#### Returns

`Promise<void>` - Resolves when revenue is logged

#### Example

```typescript
await UnifiedTracking.logRevenue({
  amount: 49.99,
  currency: 'USD',
  productId: 'pro-plan-monthly',
  quantity: 1,
  category: 'subscription',
  properties: {
    coupon: 'SAVE20',
    paymentMethod: 'credit_card',
  },
});
```

### logScreenView

Logs a screen or page view.

#### Signature

```typescript
logScreenView(data: ScreenViewData | string): Promise<void>
```

#### Parameters

- `data`: [ScreenViewData](./interfaces/event-interfaces.md#screenviewdata) | string - The screen view data or screen name

#### Returns

`Promise<void>` - Resolves when screen view is logged

#### Example

```typescript
// Simple usage with just screen name
await UnifiedTracking.logScreenView('home');

// Advanced usage with additional data
await UnifiedTracking.logScreenView({
  screenName: 'product-details',
  screenClass: 'ProductDetailsScreen',
  properties: {
    productId: 'SKU-123',
    category: 'electronics',
  },
});
```

### setConsent

Sets user consent preferences for data collection.

#### Signature

```typescript
setConsent(consent: ConsentSettings): Promise<void>
```

#### Parameters

- `consent`: [ConsentSettings](./interfaces/configuration-interfaces.md#consentsettings) - The consent settings

#### Returns

`Promise<void>` - Resolves when consent is set

#### Example

```typescript
await UnifiedTracking.setConsent({
  analytics: true,
  errorTracking: true,
  marketing: false,
  personalization: true,
  adTracking: false,
});
```

### reset

Resets the current user session and clears user data.

#### Signature

```typescript
reset(): Promise<void>
```

#### Returns

`Promise<void>` - Resolves when reset is complete

#### Example

```typescript
// On user logout
await UnifiedTracking.reset();
```

### getActiveProviders

Returns information about currently active providers.

#### Signature

```typescript
getActiveProviders(): Promise<{ providers: string[] }>
```

#### Returns

`Promise<{ providers: string[] }>` - Array of active provider IDs

#### Example

```typescript
const { providers } = await UnifiedTracking.getActiveProviders();
console.log('Active providers:', providers);
// Output: ['google-analytics', 'mixpanel', 'sentry']
```

### enableDebugMode

Enables or disables debug mode for verbose logging.

#### Signature

```typescript
enableDebugMode(enable: boolean): Promise<void>
```

#### Parameters

- `enable`: boolean - Whether to enable debug mode

#### Returns

`Promise<void>` - Resolves when debug mode is set

#### Example

```typescript
// Enable debug mode in development
if (process.env.NODE_ENV === 'development') {
  await UnifiedTracking.enableDebugMode(true);
}
```

## Platform-Specific Implementation

The UnifiedTracking plugin provides platform-specific implementations:

### Web Implementation

On web platforms, the plugin dynamically loads provider SDKs and manages them through the browser's global scope.

### iOS Implementation

On iOS, the plugin uses native Swift code to interface with provider SDKs through CocoaPods.

### Android Implementation

On Android, the plugin uses native Java code to interface with provider SDKs through Gradle dependencies.

## Error Handling

All methods return promises that may reject with errors. Common error scenarios:

1. **Not Initialized**: Calling methods before `initialize()`
2. **Invalid Configuration**: Missing required provider configuration
3. **Network Errors**: Provider SDK loading or API call failures
4. **Platform Limitations**: Some features may not be available on all platforms

Example error handling:

```typescript
try {
  await UnifiedTracking.track('event', { data: 'value' });
} catch (error) {
  console.error('Tracking failed:', error);
  // Implement fallback or retry logic
}
```

## Best Practices

1. **Initialize Early**: Call `initialize()` as early as possible in your app lifecycle
2. **Handle Errors**: Always handle promise rejections for tracking calls
3. **Batch Events**: The plugin automatically batches events for better performance
4. **Use Debug Mode**: Enable debug mode during development for troubleshooting
5. **Respect User Privacy**: Always implement proper consent management

## See Also

- [Plugin Methods](./plugin-methods.md) - Detailed method documentation
- [Configuration](./configuration.md) - Configuration options
- [Provider Setup](../providers/README.md) - Provider-specific setup guides
