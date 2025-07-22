# Plugin Methods

Detailed documentation for all UnifiedTracking plugin methods.

## initialize()

Initialize the plugin with configuration options.

### Signature

```typescript
initialize(config?: UnifiedTrackingConfig): Promise<void>
```

### Parameters

- `config` (optional): Plugin configuration object containing analytics and error tracking provider settings

### Description

Initializes all configured providers and prepares the plugin for tracking. This method should be called once at application startup.

### Example

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
        dsn: 'https://your-dsn@sentry.io/project',
      },
    },
  ],
  debug: true,
});
```

### Notes

- Initialization is idempotent - calling it multiple times has no effect
- Providers are initialized in parallel for better performance
- Failed provider initializations don't block other providers
- Auto-detection runs if configured

---

## track()

Track a custom event with optional properties.

### Signature

```typescript
track(eventName: string, properties?: Record<string, any>): Promise<void>
```

### Parameters

- `eventName`: Name of the event to track
- `properties` (optional): Object containing event properties

### Description

Sends a custom event to all active analytics providers. Event names should be descriptive and follow a consistent naming convention.

### Example

```typescript
// Simple event
await UnifiedTracking.track('button_clicked');

// Event with properties
await UnifiedTracking.track('purchase_completed', {
  value: 99.99,
  currency: 'USD',
  items: [{ id: 'SKU123', name: 'Product', price: 99.99 }],
});
```

### Best Practices

- Use snake_case for event names
- Keep event names consistent across your app
- Include relevant properties for better insights
- Avoid PII in event properties

---

## identify()

Identify a user and optionally set user traits.

### Signature

```typescript
identify(userId: string, traits?: Record<string, any>): Promise<void>
```

### Parameters

- `userId`: Unique identifier for the user
- `traits` (optional): Object containing user properties

### Description

Associates events with a specific user. All subsequent events will be attributed to this user until `reset()` is called.

### Example

```typescript
// Basic identification
await UnifiedTracking.identify('user-123');

// With user traits
await UnifiedTracking.identify('user-123', {
  email: 'user@example.com',
  name: 'John Doe',
  plan: 'premium',
  createdAt: '2024-01-01',
});
```

### Privacy Considerations

- Hash sensitive identifiers if needed
- Comply with privacy regulations (GDPR, CCPA)
- Get user consent before identifying

---

## setUserProperties()

Update user properties without changing the user ID.

### Signature

```typescript
setUserProperties(properties: Record<string, any>): Promise<void>
```

### Parameters

- `properties`: Object containing user properties to set or update

### Description

Updates the current user's properties. Unlike `identify()`, this doesn't change the user ID.

### Example

```typescript
await UnifiedTracking.setUserProperties({
  plan: 'enterprise',
  role: 'admin',
  company: 'Acme Corp',
  preferences: {
    theme: 'dark',
    notifications: true,
  },
});
```

### Notes

- Properties are merged with existing properties
- Set a property to `null` to remove it
- Some providers may have property name restrictions

---

## logError()

Log an error with optional context information.

### Signature

```typescript
logError(error: Error | string, context?: Record<string, any>): Promise<void>
```

### Parameters

- `error`: Error object or error message string
- `context` (optional): Additional context about the error

### Description

Captures errors and sends them to all active error tracking providers. Automatically extracts stack traces from Error objects.

### Example

```typescript
// Log an Error object
try {
  await riskyOperation();
} catch (error) {
  await UnifiedTracking.logError(error, {
    operation: 'riskyOperation',
    userId: 'user-123',
    severity: 'error',
  });
}

// Log a string message
await UnifiedTracking.logError('Custom error message', {
  component: 'PaymentForm',
  action: 'submit',
});
```

### Context Properties

- `severity`: 'fatal' | 'error' | 'warning' | 'info' | 'debug'
- `tags`: Key-value pairs for categorization
- `extra`: Additional custom data
- `user`: User information at time of error

---

## logRevenue()

Track revenue or purchase events.

### Signature

```typescript
logRevenue(data: RevenueData): Promise<void>
```

### Parameters

- `data`: Revenue event data object

### Description

Tracks monetary transactions and purchases. Automatically formats data for each provider's revenue tracking requirements.

### Example

```typescript
await UnifiedTracking.logRevenue({
  amount: 99.99,
  currency: 'USD',
  productId: 'premium-plan',
  productName: 'Premium Subscription',
  category: 'subscription',
  quantity: 1,
  properties: {
    couponCode: 'SAVE20',
    paymentMethod: 'credit_card',
    billingCycle: 'monthly',
  },
});
```

### RevenueData Interface

```typescript
interface RevenueData {
  amount: number; // Required: Revenue amount
  currency: string; // Required: ISO 4217 currency code
  productId?: string; // Product SKU or ID
  productName?: string; // Human-readable product name
  category?: string; // Product category
  quantity?: number; // Number of items (default: 1)
  properties?: Record<string, any>; // Additional properties
}
```

---

## logScreenView()

Track screen or page views.

### Signature

```typescript
logScreenView(data: ScreenViewData | string): Promise<void>
```

### Parameters

- `data`: Screen view data object or screen name string

### Description

Tracks navigation events. Accepts either a simple screen name or a detailed data object.

### Example

```typescript
// Simple screen name
await UnifiedTracking.logScreenView('product-details');

// Detailed screen view
await UnifiedTracking.logScreenView({
  screenName: 'product-details',
  screenClass: 'ProductDetailsViewController',
  properties: {
    productId: 'PROD-123',
    category: 'electronics',
    source: 'search',
  },
});
```

### ScreenViewData Interface

```typescript
interface ScreenViewData {
  screenName: string; // Required: Screen/page name
  screenClass?: string; // Mobile: View controller class name
  properties?: Record<string, any>; // Additional properties
}
```

---

## setConsent()

Update user consent preferences for data collection.

### Signature

```typescript
setConsent(consent: ConsentSettings): Promise<void>
```

### Parameters

- `consent`: Object containing consent preferences

### Description

Updates consent settings for different types of data collection. Providers will respect these settings and adjust their behavior accordingly.

### Example

```typescript
await UnifiedTracking.setConsent({
  analytics: true, // Track analytics events
  errorTracking: true, // Track errors
  marketing: false, // Marketing/advertising tracking
  personalization: true, // Personalization features
  adTracking: false, // Ad conversion tracking
});
```

### ConsentSettings Interface

```typescript
interface ConsentSettings {
  analytics?: boolean;
  errorTracking?: boolean;
  marketing?: boolean;
  personalization?: boolean;
  adTracking?: boolean;
}
```

### GDPR Compliance

- All consent defaults to `false`
- Consent is persisted across sessions
- Changes take effect immediately

---

## reset()

Reset the current session and clear user identification.

### Signature

```typescript
reset(): Promise<void>
```

### Description

Clears the current user identification and resets the session. Useful when users log out or switch accounts.

### Example

```typescript
// On user logout
await UnifiedTracking.reset();

// The next events will be anonymous
await UnifiedTracking.track('app_opened');
```

### Effects

- Clears user ID and properties
- Generates new session ID
- Clears provider-specific user data
- Does not affect consent settings

---

## getActiveProviders()

Get a list of currently active providers.

### Signature

```typescript
getActiveProviders(): Promise<{ providers: string[] }>
```

### Returns

Promise resolving to an object containing an array of active provider IDs.

### Description

Returns the IDs of all successfully initialized and active providers.

### Example

```typescript
const { providers } = await UnifiedTracking.getActiveProviders();
console.log('Active providers:', providers);
// Output: ['google-analytics', 'mixpanel', 'sentry']
```

### Use Cases

- Debugging provider initialization
- Conditional logic based on active providers
- Health checks and monitoring

---

## enableDebugMode()

Enable or disable debug logging.

### Signature

```typescript
enableDebugMode(enable: boolean): Promise<void>
```

### Parameters

- `enable`: Whether to enable debug mode

### Description

Toggles verbose logging for debugging purposes. When enabled, the plugin logs detailed information about all operations.

### Example

```typescript
// Enable debug mode
await UnifiedTracking.enableDebugMode(true);

// Disable debug mode
await UnifiedTracking.enableDebugMode(false);
```

### Debug Output Includes

- Provider initialization status
- Event tracking calls
- Error details
- Network requests (some providers)
- Configuration validation

### Warning

Debug mode may log sensitive information. Only use in development environments.

## Error Handling

All methods return Promises that may reject with errors:

```typescript
try {
  await UnifiedTracking.track('event_name');
} catch (error) {
  console.error('Tracking failed:', error);
  // Handle error appropriately
}
```

Common error scenarios:

- Provider not initialized
- Invalid parameters
- Network failures
- Provider-specific errors

## Method Chaining

All methods return Promises, allowing for async/await chaining:

```typescript
// Initialize and track in sequence
await UnifiedTracking.initialize(config);
await UnifiedTracking.identify('user-123');
await UnifiedTracking.track('app_opened');
await UnifiedTracking.logScreenView('home');
```

## See Also

- [Core Interfaces](./interfaces/core-interfaces.md) - Interface definitions
- [Configuration Guide](../setup-guide.md) - Setup instructions
- [Provider Documentation](../providers/README.md) - Provider-specific details
