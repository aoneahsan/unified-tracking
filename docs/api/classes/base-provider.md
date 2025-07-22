# BaseProvider Class

Base class for implementing custom providers.

## Overview

`BaseProvider` is an abstract base class that provides common functionality for all analytics and error tracking providers. Custom providers should extend this class to inherit standard behavior.

## Class Definition

```typescript
export abstract class BaseProvider implements Provider {
  protected initialized: boolean = false;
  protected config: any;
  protected debugMode: boolean = false;

  abstract initialize(config: any): Promise<void>;
  abstract isAvailable(): boolean;

  // Common methods implemented
  setDebugMode(enabled: boolean): void;
  isInitialized(): boolean;
}
```

## Constructor

```typescript
constructor(config?: any)
```

### Parameters

- `config` (optional): Initial configuration for the provider

## Abstract Methods

### initialize()

Must be implemented by subclasses to initialize the provider.

```typescript
abstract initialize(config: any): Promise<void>
```

### isAvailable()

Must be implemented to check if the provider's SDK is available.

```typescript
abstract isAvailable(): boolean
```

## Implemented Methods

### setDebugMode()

Enable or disable debug mode for the provider.

```typescript
setDebugMode(enabled: boolean): void
```

### isInitialized()

Check if the provider has been initialized.

```typescript
isInitialized(): boolean
```

Returns `true` if the provider has been successfully initialized.

## Protected Properties

### initialized

```typescript
protected initialized: boolean = false
```

Tracks the initialization state of the provider.

### config

```typescript
protected config: any
```

Stores the provider configuration.

### debugMode

```typescript
protected debugMode: boolean = false
```

Indicates whether debug mode is enabled.

## Creating a Custom Provider

### Example: Custom Analytics Provider

```typescript
import { BaseProvider } from 'unified-tracking';

export class CustomAnalyticsProvider extends BaseProvider {
  private client: any;

  async initialize(config: CustomConfig): Promise<void> {
    if (this.initialized) return;

    // Validate configuration
    if (!config.apiKey) {
      throw new Error('API key is required');
    }

    // Initialize SDK
    this.client = new CustomAnalyticsSDK({
      apiKey: config.apiKey,
      debug: this.debugMode,
    });

    await this.client.init();

    this.config = config;
    this.initialized = true;
  }

  isAvailable(): boolean {
    return typeof window !== 'undefined' && 'CustomAnalyticsSDK' in window;
  }

  async track(eventName: string, properties?: Record<string, any>): Promise<void> {
    if (!this.initialized) {
      throw new Error('Provider not initialized');
    }

    await this.client.track(eventName, properties);
  }

  async identify(userId: string, traits?: Record<string, any>): Promise<void> {
    if (!this.initialized) {
      throw new Error('Provider not initialized');
    }

    await this.client.identify(userId, traits);
  }
}
```

### Example: Custom Error Provider

```typescript
import { BaseProvider } from 'unified-tracking';

export class CustomErrorProvider extends BaseProvider {
  private errorClient: any;

  async initialize(config: CustomErrorConfig): Promise<void> {
    if (this.initialized) return;

    this.errorClient = new CustomErrorSDK({
      projectId: config.projectId,
      environment: config.environment || 'production',
    });

    this.config = config;
    this.initialized = true;
  }

  isAvailable(): boolean {
    return typeof CustomErrorSDK !== 'undefined';
  }

  async logError(error: Error, context?: Record<string, any>): Promise<void> {
    if (!this.initialized) {
      throw new Error('Provider not initialized');
    }

    await this.errorClient.captureError(error, {
      ...context,
      timestamp: new Date().toISOString(),
    });
  }
}
```

## Best Practices

1. **Initialization**: Always check if already initialized to prevent duplicate initialization
2. **Validation**: Validate configuration in the `initialize` method
3. **Error Handling**: Throw descriptive errors for invalid states
4. **SDK Availability**: Implement proper checks in `isAvailable()`
5. **Debug Mode**: Respect the debug mode setting when initializing SDKs

## Inheritance Hierarchy

```
Provider (interface)
    └── BaseProvider (abstract class)
        ├── BaseAnalyticsProvider
        └── BaseErrorTrackingProvider
```

## See Also

- [BaseAnalyticsProvider](./base-analytics-provider.md) - Base class for analytics providers
- [BaseErrorTrackingProvider](./base-error-tracking-provider.md) - Base class for error providers
- [Provider Interface](../interfaces/core-interfaces.md#provider) - Provider interface definition
