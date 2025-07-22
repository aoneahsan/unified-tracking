# Core Interfaces

Core interfaces that define the main plugin API and functionality.

## UnifiedTrackingPlugin

The main plugin interface that defines all available methods.

### Definition

```typescript
export interface UnifiedTrackingPlugin {
  initialize(config?: UnifiedTrackingConfig): Promise<void>;
  track(eventName: string, properties?: Record<string, any>): Promise<void>;
  identify(userId: string, traits?: Record<string, any>): Promise<void>;
  setUserProperties(properties: Record<string, any>): Promise<void>;
  logError(error: Error | string, context?: Record<string, any>): Promise<void>;
  logRevenue(data: RevenueData): Promise<void>;
  logScreenView(data: ScreenViewData | string): Promise<void>;
  setConsent(consent: ConsentSettings): Promise<void>;
  reset(): Promise<void>;
  getActiveProviders(): Promise<{ providers: string[] }>;
  enableDebugMode(enable: boolean): Promise<void>;
}
```

### Properties

All methods return Promises that resolve when the operation completes.

### Usage

```typescript
import { UnifiedTracking } from 'unified-tracking';

// UnifiedTracking implements UnifiedTrackingPlugin
await UnifiedTracking.track('event_name', { property: 'value' });
```

## UnifiedTrackingConfig

The main configuration interface for initializing the plugin.

### Definition

```typescript
export interface UnifiedTrackingConfig {
  /**
   * Array of analytics provider configurations
   */
  analytics?: AnalyticsConfig[];

  /**
   * Array of error tracking provider configurations
   */
  errorTracking?: ErrorTrackingConfig[];

  /**
   * Enable debug mode for verbose logging
   * @default false
   */
  debug?: boolean;

  /**
   * Auto-detection settings for providers
   */
  autoDetect?: AutoDetectSettings;

  /**
   * Event batching settings
   */
  batching?: BatchingSettings;

  /**
   * Privacy settings
   */
  privacy?: PrivacySettings;
}
```

### Example

```typescript
const config: UnifiedTrackingConfig = {
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
  batching: {
    enabled: true,
    maxSize: 100,
    timeout: 5000,
  },
};
```

## AnalyticsConfig

Configuration for analytics providers.

### Definition

```typescript
export interface AnalyticsConfig {
  /**
   * The provider identifier
   */
  id: AnalyticsProvider;

  /**
   * Provider-specific configuration
   */
  config:
    | GoogleAnalyticsConfig
    | MixpanelConfig
    | AmplitudeConfig
    | SegmentConfig
    | PostHogConfig
    | HeapConfig
    | MatomoConfig
    | FirebaseAnalyticsConfig;
}
```

### Example

```typescript
const analyticsConfig: AnalyticsConfig = {
  id: 'mixpanel',
  config: {
    token: 'your-mixpanel-token',
    trackAutomaticEvents: true,
  },
};
```

## ErrorTrackingConfig

Configuration for error tracking providers.

### Definition

```typescript
export interface ErrorTrackingConfig {
  /**
   * The provider identifier
   */
  id: ErrorProvider;

  /**
   * Provider-specific configuration
   */
  config:
    | SentryConfig
    | BugsnagConfig
    | RollbarConfig
    | DataDogConfig
    | LogRocketConfig
    | RaygunConfig
    | AppCenterConfig
    | CrashlyticsConfig;
}
```

### Example

```typescript
const errorConfig: ErrorTrackingConfig = {
  id: 'bugsnag',
  config: {
    apiKey: 'your-bugsnag-api-key',
    releaseStage: 'production',
  },
};
```

## BatchingSettings

Settings for event batching to optimize network usage.

### Definition

```typescript
export interface BatchingSettings {
  /**
   * Enable event batching
   * @default true
   */
  enabled: boolean;

  /**
   * Maximum batch size before automatic flush
   * @default 50
   */
  maxSize?: number;

  /**
   * Batch timeout in milliseconds
   * @default 30000 (30 seconds)
   */
  timeout?: number;
}
```

## PrivacySettings

Privacy configuration for data collection.

### Definition

```typescript
export interface PrivacySettings {
  /**
   * Anonymize IP addresses
   * @default true
   */
  anonymizeIp?: boolean;

  /**
   * Properties to exclude from tracking
   */
  excludedProperties?: string[];

  /**
   * Data retention period in days
   * @default 365
   */
  dataRetention?: number;

  /**
   * Require explicit consent before tracking
   * @default false
   */
  requireConsent?: boolean;
}
```

## AutoDetectSettings

Settings for automatic provider detection.

### Definition

```typescript
export interface AutoDetectSettings {
  /**
   * Enable auto-detection of installed SDKs
   * @default false
   */
  enabled: boolean;

  /**
   * Providers to exclude from auto-detection
   */
  exclude?: string[];

  /**
   * Timeout for auto-detection in milliseconds
   * @default 5000
   */
  timeout?: number;
}
```

## See Also

- [Provider Interfaces](./provider-interfaces.md) - Provider-specific interfaces
- [Event Interfaces](./event-interfaces.md) - Event data interfaces
- [Configuration Interfaces](./configuration-interfaces.md) - Detailed configuration interfaces
