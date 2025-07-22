# BaseAnalyticsProvider Class

Abstract base class for analytics providers.

## Overview

`BaseAnalyticsProvider` extends `BaseProvider` and provides a common foundation for all analytics providers. It defines the standard analytics methods that must be implemented.

## Class Definition

```typescript
export abstract class BaseAnalyticsProvider extends BaseProvider implements AnalyticsProvider {
  abstract track(eventName: string, properties?: Record<string, any>): Promise<void>;
  abstract identify(userId: string, traits?: Record<string, any>): Promise<void>;
  abstract setUserProperties(properties: Record<string, any>): Promise<void>;
  abstract logRevenue(data: RevenueData): Promise<void>;
  abstract logScreenView(data: ScreenViewData | string): Promise<void>;
  abstract reset(): Promise<void>;
}
```

## Abstract Methods

All analytics providers must implement these methods:

### track()

Track custom events.

```typescript
abstract track(eventName: string, properties?: Record<string, any>): Promise<void>
```

#### Parameters

- `eventName`: Name of the event to track
- `properties`: Optional event properties

### identify()

Identify a user.

```typescript
abstract identify(userId: string, traits?: Record<string, any>): Promise<void>
```

#### Parameters

- `userId`: Unique user identifier
- `traits`: Optional user properties

### setUserProperties()

Update user properties.

```typescript
abstract setUserProperties(properties: Record<string, any>): Promise<void>
```

#### Parameters

- `properties`: User properties to set or update

### logRevenue()

Track revenue events.

```typescript
abstract logRevenue(data: RevenueData): Promise<void>
```

#### Parameters

- `data`: Revenue event data

### logScreenView()

Track screen/page views.

```typescript
abstract logScreenView(data: ScreenViewData | string): Promise<void>
```

#### Parameters

- `data`: Screen view data or screen name

### reset()

Reset user session.

```typescript
abstract reset(): Promise<void>
```

## Implementation Example

```typescript
import { BaseAnalyticsProvider, RevenueData, ScreenViewData } from 'unified-tracking';

export class MyAnalyticsProvider extends BaseAnalyticsProvider {
  private sdk: any;

  async initialize(config: MyAnalyticsConfig): Promise<void> {
    if (this.initialized) return;

    // Initialize your SDK
    this.sdk = new MyAnalyticsSDK(config.apiKey);
    await this.sdk.init();

    this.config = config;
    this.initialized = true;
  }

  isAvailable(): boolean {
    return typeof MyAnalyticsSDK !== 'undefined';
  }

  async track(eventName: string, properties?: Record<string, any>): Promise<void> {
    this.ensureInitialized();

    if (this.debugMode) {
      console.log(`[MyAnalytics] Track: ${eventName}`, properties);
    }

    await this.sdk.track(eventName, properties);
  }

  async identify(userId: string, traits?: Record<string, any>): Promise<void> {
    this.ensureInitialized();

    await this.sdk.identify(userId, traits);
  }

  async setUserProperties(properties: Record<string, any>): Promise<void> {
    this.ensureInitialized();

    await this.sdk.setUserProperties(properties);
  }

  async logRevenue(data: RevenueData): Promise<void> {
    this.ensureInitialized();

    // Transform data to provider format
    await this.sdk.trackPurchase({
      value: data.amount,
      currency: data.currency,
      productId: data.productId,
      quantity: data.quantity || 1,
      ...data.properties,
    });
  }

  async logScreenView(data: ScreenViewData | string): Promise<void> {
    this.ensureInitialized();

    const screenName = typeof data === 'string' ? data : data.screenName;
    const properties = typeof data === 'string' ? {} : data.properties;

    await this.sdk.trackScreenView(screenName, properties);
  }

  async reset(): Promise<void> {
    this.ensureInitialized();

    await this.sdk.reset();
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('Provider not initialized');
    }
  }
}
```

## Helper Methods

Common helper methods you might add to your implementation:

```typescript
export class MyAnalyticsProvider extends BaseAnalyticsProvider {
  // ... required methods ...

  // Helper to format properties
  protected formatProperties(properties?: Record<string, any>): Record<string, any> {
    if (!properties) return {};

    // Remove undefined values
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(properties)) {
      if (value !== undefined) {
        cleaned[key] = value;
      }
    }

    return cleaned;
  }

  // Helper to validate event names
  protected validateEventName(eventName: string): void {
    if (!eventName || typeof eventName !== 'string') {
      throw new Error('Event name must be a non-empty string');
    }

    if (eventName.length > 100) {
      throw new Error('Event name too long (max 100 characters)');
    }
  }

  // Helper for batch operations
  protected async batchOperation<T>(items: T[], operation: (item: T) => Promise<void>): Promise<void> {
    const batchSize = 10;

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      await Promise.all(batch.map(operation));
    }
  }
}
```

## Common Patterns

### 1. SDK Initialization

```typescript
async initialize(config: Config): Promise<void> {
  if (this.initialized) return;

  // Load SDK if needed
  if (!this.isAvailable()) {
    await this.loadSDK(config.sdkUrl);
  }

  // Initialize with config
  await this.initializeSDK(config);

  this.initialized = true;
}
```

### 2. Event Queuing

```typescript
private eventQueue: Array<() => Promise<void>> = [];
private processing = false;

async track(eventName: string, properties?: Record<string, any>): Promise<void> {
  if (!this.initialized) {
    // Queue events before initialization
    this.eventQueue.push(() => this.track(eventName, properties));
    return;
  }

  // Process event
  await this.processTrack(eventName, properties);
}

protected async processQueue(): Promise<void> {
  if (this.processing) return;

  this.processing = true;
  while (this.eventQueue.length > 0) {
    const event = this.eventQueue.shift();
    if (event) await event();
  }
  this.processing = false;
}
```

### 3. Error Handling

```typescript
async track(eventName: string, properties?: Record<string, any>): Promise<void> {
  try {
    this.ensureInitialized();
    this.validateEventName(eventName);

    await this.sdk.track(eventName, this.formatProperties(properties));
  } catch (error) {
    if (this.debugMode) {
      console.error(`[${this.constructor.name}] Track error:`, error);
    }

    // Don't throw - analytics shouldn't break the app
    this.handleError(error);
  }
}
```

## Best Practices

1. **Graceful Degradation**: Never let analytics errors break the application
2. **Validation**: Validate inputs but handle errors gracefully
3. **Queuing**: Queue events if provider isn't ready
4. **Formatting**: Format data according to provider requirements
5. **Debugging**: Provide helpful debug logs when debug mode is enabled

## See Also

- [BaseProvider](./base-provider.md) - Parent class
- [Provider Implementations](../../providers/analytics/README.md) - Example implementations
- [AnalyticsProvider Interface](../interfaces/core-interfaces.md#analyticsprovider) - Interface definition
