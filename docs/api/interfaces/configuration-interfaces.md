# Configuration Interfaces

Interfaces for plugin configuration and settings.

## ConsentSettings

User consent preferences for data collection.

### Definition

```typescript
export interface ConsentSettings {
  /**
   * Consent for analytics tracking
   * @default false
   */
  analytics?: boolean;

  /**
   * Consent for error tracking
   * @default false
   */
  errorTracking?: boolean;

  /**
   * Consent for marketing/advertising
   * @default false
   */
  marketing?: boolean;

  /**
   * Consent for personalization
   * @default false
   */
  personalization?: boolean;

  /**
   * Consent for ad tracking
   * @default false
   */
  adTracking?: boolean;
}
```

### Usage

```typescript
// Set initial consent
await UnifiedTracking.setConsent({
  analytics: true,
  errorTracking: true,
  marketing: false,
  personalization: true,
  adTracking: false,
});

// Update consent after user changes preferences
await UnifiedTracking.setConsent({
  analytics: true,
  errorTracking: true,
  marketing: true,
  personalization: true,
  adTracking: true,
});
```

### GDPR Compliance

The consent settings help ensure GDPR compliance by:

- Defaulting all consent to `false`
- Allowing granular control over different tracking types
- Persisting consent choices across sessions
- Respecting user preferences before tracking

## ProviderConfig

Base configuration interface for all providers.

### Definition

```typescript
export interface ProviderConfig {
  /**
   * Provider identifier
   */
  id?: string;

  /**
   * Enable/disable the provider
   * @default true
   */
  enabled?: boolean;

  /**
   * Provider-specific debug mode
   * @default false
   */
  debug?: boolean;

  /**
   * Custom initialization options
   */
  customOptions?: Record<string, any>;
}
```

### Extension

All provider-specific configurations extend this base interface:

```typescript
interface GoogleAnalyticsConfig extends ProviderConfig {
  measurementId: string;
  // ... other GA-specific options
}
```

## ProviderState

Runtime state of a provider.

### Definition

```typescript
export interface ProviderState {
  /**
   * Provider identifier
   */
  id: string;

  /**
   * Provider type
   */
  type: ProviderType;

  /**
   * Initialization status
   */
  initialized: boolean;

  /**
   * Provider enabled status
   */
  enabled: boolean;

  /**
   * Last error if any
   */
  error?: Error;

  /**
   * Provider metadata
   */
  metadata?: {
    name: string;
    version?: string;
    sdkLoaded?: boolean;
  };
}
```

### Usage

```typescript
// Get active providers
const { providers } = await UnifiedTracking.getActiveProviders();

// Each provider ID can be used to query state
const providerStates: ProviderState[] = providers.map((id) => getProviderState(id));
```

## SessionConfig

Session tracking configuration.

### Definition

```typescript
export interface SessionConfig {
  /**
   * Session timeout in milliseconds
   * @default 1800000 (30 minutes)
   */
  timeout?: number;

  /**
   * Track session start/end events
   * @default true
   */
  trackSessionEvents?: boolean;

  /**
   * Session ID generator function
   */
  generateSessionId?: () => string;

  /**
   * Session storage key
   * @default "unified_tracking_session"
   */
  storageKey?: string;
}
```

## NetworkConfig

Network and connectivity settings.

### Definition

```typescript
export interface NetworkConfig {
  /**
   * Retry failed requests
   * @default true
   */
  retryEnabled?: boolean;

  /**
   * Maximum retry attempts
   * @default 3
   */
  maxRetries?: number;

  /**
   * Retry delay in milliseconds
   * @default 1000
   */
  retryDelay?: number;

  /**
   * Request timeout in milliseconds
   * @default 30000
   */
  timeout?: number;

  /**
   * Only send events when online
   * @default true
   */
  onlineOnly?: boolean;
}
```

## StorageConfig

Local storage configuration.

### Definition

```typescript
export interface StorageConfig {
  /**
   * Storage type
   * @default "localStorage"
   */
  type?: 'localStorage' | 'sessionStorage' | 'memory' | 'custom';

  /**
   * Storage key prefix
   * @default "unified_tracking_"
   */
  prefix?: string;

  /**
   * Custom storage implementation
   */
  customStorage?: {
    getItem: (key: string) => Promise<string | null>;
    setItem: (key: string, value: string) => Promise<void>;
    removeItem: (key: string) => Promise<void>;
    clear: () => Promise<void>;
  };

  /**
   * Encrypt stored data
   * @default false
   */
  encrypt?: boolean;
}
```

## ValidationConfig

Data validation settings.

### Definition

```typescript
export interface ValidationConfig {
  /**
   * Validate event names
   * @default true
   */
  validateEventNames?: boolean;

  /**
   * Maximum event name length
   * @default 100
   */
  maxEventNameLength?: number;

  /**
   * Validate property values
   * @default true
   */
  validateProperties?: boolean;

  /**
   * Maximum property depth
   * @default 5
   */
  maxPropertyDepth?: number;

  /**
   * Allowed property types
   */
  allowedPropertyTypes?: Array<'string' | 'number' | 'boolean' | 'object' | 'array'>;

  /**
   * Custom validation function
   */
  customValidator?: (event: any) => boolean | string;
}
```

## DebugConfig

Debug mode configuration.

### Definition

```typescript
export interface DebugConfig {
  /**
   * Enable debug logging
   * @default false
   */
  enabled?: boolean;

  /**
   * Log level
   * @default "info"
   */
  logLevel?: 'debug' | 'info' | 'warn' | 'error';

  /**
   * Log to console
   * @default true
   */
  console?: boolean;

  /**
   * Log to custom logger
   */
  customLogger?: {
    debug: (...args: any[]) => void;
    info: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    error: (...args: any[]) => void;
  };

  /**
   * Include timestamps in logs
   * @default true
   */
  timestamps?: boolean;

  /**
   * Pretty print JSON
   * @default true
   */
  prettyPrint?: boolean;
}
```

### Usage

```typescript
// Enable debug mode with custom settings
const config: UnifiedTrackingConfig = {
  debug: {
    enabled: true,
    logLevel: 'debug',
    console: true,
    timestamps: true,
    prettyPrint: true,
  },
};

// Or simply enable with defaults
const config: UnifiedTrackingConfig = {
  debug: true,
};
```

## See Also

- [Core Interfaces](./core-interfaces.md) - Main plugin interfaces
- [Provider Interfaces](./provider-interfaces.md) - Provider-specific configurations
- [Configuration Guide](../../setup-guide.md) - Complete setup guide
