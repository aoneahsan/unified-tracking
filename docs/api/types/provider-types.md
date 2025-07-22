# Provider Types

Type definitions for provider-specific implementations.

## Provider Base Types

### Provider

Base interface for all providers.

```typescript
interface Provider {
  initialize(config: any): Promise<void>;
  isAvailable(): boolean;
  setDebugMode(enabled: boolean): void;
  isInitialized(): boolean;
}
```

### AnalyticsProvider

Interface for analytics providers.

```typescript
interface AnalyticsProvider extends Provider {
  track(eventName: string, properties?: Record<string, any>): Promise<void>;
  identify(userId: string, traits?: Record<string, any>): Promise<void>;
  setUserProperties(properties: Record<string, any>): Promise<void>;
  logRevenue(data: RevenueData): Promise<void>;
  logScreenView(data: ScreenViewData | string): Promise<void>;
  reset(): Promise<void>;
}
```

### ErrorTrackingProvider

Interface for error tracking providers.

```typescript
interface ErrorTrackingProvider extends Provider {
  logError(error: Error | string, context?: ErrorContext): Promise<void>;
  setUserContext(user: UserContext): Promise<void>;
  clearUserContext(): Promise<void>;
  addBreadcrumb(breadcrumb: Breadcrumb): Promise<void>;
}
```

## Provider Instance Types

### GoogleAnalyticsInstance

Type for Google Analytics gtag instance.

```typescript
interface GoogleAnalyticsInstance {
  (command: 'config', targetId: string, config?: any): void;
  (command: 'event', eventName: string, parameters?: any): void;
  (command: 'set', parameters: any): void;
  (command: 'consent', type: 'default' | 'update', parameters: any): void;
}
```

### MixpanelInstance

Type for Mixpanel library instance.

```typescript
interface MixpanelInstance {
  init(token: string, config?: any, name?: string): void;
  track(eventName: string, properties?: any, callback?: () => void): void;
  identify(distinctId: string): void;
  people: {
    set(properties: any): void;
    set_once(properties: any): void;
    increment(properties: any): void;
    append(properties: any): void;
    union(properties: any): void;
    unset(properties: any): void;
  };
  reset(): void;
  opt_out_tracking(): void;
  opt_in_tracking(): void;
  has_opted_out_tracking(): boolean;
}
```

### AmplitudeInstance

Type for Amplitude SDK instance.

```typescript
interface AmplitudeInstance {
  init(apiKey: string, userId?: string, options?: any, callback?: () => void): void;
  logEvent(eventType: string, eventProperties?: any, callback?: () => void): void;
  setUserId(userId: string | null): void;
  setUserProperties(properties: any): void;
  clearUserProperties(): void;
  identify(identify: any): void;
  logRevenue(revenue: any): void;
  regenerateDeviceId(): void;
  setDeviceId(deviceId: string): void;
  setOptOut(enable: boolean): void;
}
```

### SentryInstance

Type for Sentry SDK instance.

```typescript
interface SentryInstance {
  init(options: any): void;
  captureException(error: any, captureContext?: any): string;
  captureMessage(message: string, captureContext?: any): string;
  captureEvent(event: any): string;
  setUser(user: any): void;
  setContext(name: string, context: any): void;
  setTag(key: string, value: string): void;
  setExtra(key: string, extra: any): void;
  addBreadcrumb(breadcrumb: any): void;
  configureScope(callback: (scope: any) => void): void;
  withScope(callback: (scope: any) => void): void;
}
```

## Provider Factory Types

### ProviderFactory

Type for provider factory function.

```typescript
type ProviderFactory<T extends Provider> = (config: any) => T;
```

### ProviderRegistry

Type for provider registry.

```typescript
interface ProviderRegistry {
  analytics: Map<string, ProviderFactory<AnalyticsProvider>>;
  errorTracking: Map<string, ProviderFactory<ErrorTrackingProvider>>;
}
```

## Provider Configuration Types

### ProviderOptions

Common options for all providers.

```typescript
interface ProviderOptions {
  enabled?: boolean;
  debug?: boolean;
  timeout?: number;
  retryLimit?: number;
  customInitializer?: () => Promise<void>;
}
```

### ProviderMetadata

Metadata about a provider.

```typescript
interface ProviderMetadata {
  id: string;
  name: string;
  type: 'analytics' | 'error-tracking';
  version?: string;
  sdkUrl?: string;
  documentationUrl?: string;
  capabilities?: string[];
}
```

## Provider State Types

### ProviderLoadState

Loading state for providers.

```typescript
type ProviderLoadState = 'pending' | 'loading' | 'loaded' | 'failed';
```

### ProviderStatus

Complete provider status.

```typescript
interface ProviderStatus {
  id: string;
  type: ProviderType;
  loadState: ProviderLoadState;
  initialized: boolean;
  error?: Error;
  lastActivity?: Date;
  eventCount?: number;
}
```

## Provider Event Types

### ProviderEvent

Events emitted by providers.

```typescript
interface ProviderEvent {
  type: 'initialized' | 'error' | 'event_sent' | 'state_changed';
  providerId: string;
  timestamp: Date;
  data?: any;
  error?: Error;
}
```

### ProviderEventHandler

Event handler type.

```typescript
type ProviderEventHandler = (event: ProviderEvent) => void;
```

## Provider Capability Types

### AnalyticsCapabilities

Capabilities of analytics providers.

```typescript
interface AnalyticsCapabilities {
  customEvents: boolean;
  userProperties: boolean;
  revenue: boolean;
  screenViews: boolean;
  userIdentification: boolean;
  sessionTracking: boolean;
  ecommerce: boolean;
  socialInteractions: boolean;
  timing: boolean;
  exceptions: boolean;
}
```

### ErrorTrackingCapabilities

Capabilities of error tracking providers.

```typescript
interface ErrorTrackingCapabilities {
  errorCapture: boolean;
  breadcrumbs: boolean;
  userContext: boolean;
  customContext: boolean;
  sourceMapping: boolean;
  releaseTracking: boolean;
  performance: boolean;
  attachments: boolean;
  offline: boolean;
  filtering: boolean;
}
```

## Type Guards

### Provider Type Guards

```typescript
function isAnalyticsProvider(provider: Provider): provider is AnalyticsProvider {
  return 'track' in provider && 'identify' in provider && 'logRevenue' in provider;
}

function isErrorTrackingProvider(provider: Provider): provider is ErrorTrackingProvider {
  return 'logError' in provider && 'setUserContext' in provider && 'addBreadcrumb' in provider;
}
```

### Configuration Type Guards

```typescript
function isGoogleAnalyticsConfig(config: any): config is GoogleAnalyticsConfig {
  return config && typeof config.measurementId === 'string';
}

function isMixpanelConfig(config: any): config is MixpanelConfig {
  return config && typeof config.token === 'string';
}

function isSentryConfig(config: any): config is SentryConfig {
  return config && typeof config.dsn === 'string';
}
```

## Usage Examples

### Creating a Provider

```typescript
class CustomProvider implements AnalyticsProvider {
  private instance: CustomSDKInstance;

  async initialize(config: CustomConfig): Promise<void> {
    this.instance = new CustomSDK(config);
    await this.instance.init();
  }

  isAvailable(): boolean {
    return typeof CustomSDK !== 'undefined';
  }

  // Implement other required methods...
}
```

### Type-safe Provider Registry

```typescript
const providerRegistry: ProviderRegistry = {
  analytics: new Map([
    ['google-analytics', (config) => new GoogleAnalyticsProvider(config)],
    ['mixpanel', (config) => new MixpanelProvider(config)],
  ]),
  errorTracking: new Map([
    ['sentry', (config) => new SentryProvider(config)],
    ['bugsnag', (config) => new BugsnagProvider(config)],
  ]),
};

// Type-safe provider creation
function createProvider<T extends Provider>(type: 'analytics' | 'error-tracking', id: string, config: any): T {
  const registry = type === 'analytics' ? providerRegistry.analytics : providerRegistry.errorTracking;

  const factory = registry.get(id);
  if (!factory) {
    throw new Error(`Unknown provider: ${id}`);
  }

  return factory(config) as T;
}
```

## See Also

- [Core Types](./core-types.md) - Basic type definitions
- [Event Types](./event-types.md) - Event-related types
- [Provider Interfaces](../interfaces/provider-interfaces.md) - Provider configurations
