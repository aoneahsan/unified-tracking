# Provider Interfaces

Interfaces for analytics and error tracking provider configurations.

## Analytics Provider Interfaces

### GoogleAnalyticsConfig

Configuration for Google Analytics 4.

```typescript
export interface GoogleAnalyticsConfig {
  /**
   * Google Analytics Measurement ID
   * @example "G-XXXXXXXXXX"
   */
  measurementId: string;

  /**
   * Send page views automatically
   * @default true
   */
  sendPageView?: boolean;

  /**
   * Custom cookie domain
   */
  cookieDomain?: string;

  /**
   * Cookie expiration in days
   * @default 63072000 (2 years)
   */
  cookieExpires?: number;

  /**
   * Cookie prefix
   * @default "_ga"
   */
  cookiePrefix?: string;

  /**
   * Cookie flags
   */
  cookieFlags?: string;

  /**
   * Enable debug mode
   * @default false
   */
  debugMode?: boolean;

  /**
   * Custom parameters to send with every event
   */
  customParameters?: Record<string, any>;

  /**
   * Transport type
   */
  transportType?: 'beacon' | 'xhr' | 'image';

  /**
   * Enhanced measurement settings
   */
  enhancedMeasurement?: {
    scrollTracking?: boolean;
    outboundClicks?: boolean;
    siteSearch?: boolean;
    videoEngagement?: boolean;
    fileDownloads?: boolean;
    pageChanges?: boolean;
    formInteractions?: boolean;
  };
}
```

### MixpanelConfig

Configuration for Mixpanel analytics.

```typescript
export interface MixpanelConfig {
  /**
   * Mixpanel project token
   */
  token: string;

  /**
   * API host override
   * @default "https://api.mixpanel.com"
   */
  apiHost?: string;

  /**
   * Enable debug mode
   * @default false
   */
  debug?: boolean;

  /**
   * Track automatic events (page views, clicks, etc.)
   * @default false
   */
  trackAutomaticEvents?: boolean;

  /**
   * Persistence type
   * @default "localStorage"
   */
  persistence?: 'localStorage' | 'cookie' | 'none';

  /**
   * Persistence name prefix
   */
  persistencePrefix?: string;

  /**
   * Cookie domain for persistence
   */
  cookieDomain?: string;

  /**
   * Enable cross-site cookies
   * @default true
   */
  crossSiteCookie?: boolean;

  /**
   * Use secure cookies
   * @default true
   */
  secureCookie?: boolean;

  /**
   * Track IP address
   * @default true
   */
  ipTracking?: boolean;

  /**
   * Properties to exclude from tracking
   */
  propertyBlocklist?: string[];

  /**
   * Session duration in milliseconds
   * @default 1800000 (30 minutes)
   */
  sessionDuration?: number;

  /**
   * Opt out by default
   * @default false
   */
  optOutByDefault?: boolean;

  /**
   * Enable event batching
   * @default true
   */
  batching?: boolean;

  /**
   * Batch size
   * @default 50
   */
  batchSize?: number;

  /**
   * Batch flush interval in milliseconds
   * @default 5000
   */
  batchFlushInterval?: number;

  /**
   * Disable notifications
   * @default false
   */
  disableNotifications?: boolean;

  /**
   * Super properties to set on initialization
   */
  superProperties?: Record<string, any>;
}
```

### AmplitudeConfig

Configuration for Amplitude analytics.

```typescript
export interface AmplitudeConfig {
  /**
   * Amplitude API key
   */
  apiKey: string;

  /**
   * Server URL override
   */
  serverUrl?: string;

  /**
   * Use batch API
   * @default false
   */
  useBatch?: boolean;

  /**
   * Batch size
   * @default 30
   */
  batchSize?: number;

  /**
   * Event upload threshold
   * @default 30
   */
  eventUploadThreshold?: number;

  /**
   * Event upload period in milliseconds
   * @default 30000
   */
  eventUploadPeriod?: number;

  /**
   * Include UTM parameters
   * @default true
   */
  includeUtm?: boolean;

  /**
   * Include referrer
   * @default true
   */
  includeReferrer?: boolean;

  /**
   * Include gclid
   * @default true
   */
  includeGclid?: boolean;

  /**
   * Track session events
   * @default true
   */
  trackingSessionEvents?: boolean;
}
```

### SegmentConfig

Configuration for Segment analytics.

```typescript
export interface SegmentConfig {
  /**
   * Segment write key
   */
  writeKey: string;

  /**
   * Enable default integrations
   * @default true
   */
  defaultIntegrations?: boolean;

  /**
   * Integration settings
   */
  integrations?: Record<string, boolean>;
}
```

### PostHogConfig

Configuration for PostHog analytics.

```typescript
export interface PostHogConfig {
  /**
   * PostHog API key
   */
  apiKey: string;

  /**
   * PostHog host
   * @default "https://app.posthog.com"
   */
  host?: string;

  /**
   * Enable feature flags
   * @default true
   */
  featureFlags?: boolean;

  /**
   * Enable session recording
   * @default false
   */
  sessionRecording?: boolean;
}
```

### HeapConfig

Configuration for Heap analytics.

```typescript
export interface HeapConfig {
  /**
   * Heap app ID
   */
  appId: string;

  /**
   * Enable autocapture
   * @default true
   */
  enableAutocapture?: boolean;
}
```

### MatomoConfig

Configuration for Matomo analytics.

```typescript
export interface MatomoConfig {
  /**
   * Matomo site ID
   */
  siteId: string;

  /**
   * Matomo server URL
   */
  url: string;

  /**
   * Custom dimensions mapping
   */
  customDimensions?: Record<number, string>;
}
```

### FirebaseAnalyticsConfig

Configuration for Firebase Analytics.

```typescript
export interface FirebaseAnalyticsConfig {
  /**
   * Enable Firebase Analytics
   * @default true
   */
  enabled?: boolean;

  /**
   * Collection enabled
   * @default true
   */
  collectionEnabled?: boolean;
}
```

## Error Tracking Provider Interfaces

### SentryConfig

Configuration for Sentry error tracking.

```typescript
export interface SentryConfig {
  /**
   * Sentry DSN
   */
  dsn: string;

  /**
   * Environment name
   * @default "production"
   */
  environment?: string;

  /**
   * Release version
   */
  release?: string;

  /**
   * Sample rate for performance monitoring (0.0 to 1.0)
   * @default 1.0
   */
  tracesSampleRate?: number;

  /**
   * Attach stack traces to messages
   * @default true
   */
  attachStacktrace?: boolean;
}
```

### BugsnagConfig

Configuration for Bugsnag error tracking.

```typescript
export interface BugsnagConfig {
  /**
   * Bugsnag API key
   */
  apiKey: string;

  /**
   * Release stage
   * @default "production"
   */
  releaseStage?: string;

  /**
   * Enabled release stages
   */
  enabledReleaseStages?: string[];

  /**
   * App version
   */
  appVersion?: string;
}
```

### RollbarConfig

Configuration for Rollbar error tracking.

```typescript
export interface RollbarConfig {
  /**
   * Rollbar access token
   */
  accessToken: string;

  /**
   * Environment name
   * @default "production"
   */
  environment?: string;

  /**
   * Code version
   */
  codeVersion?: string;

  /**
   * Capture uncaught exceptions
   * @default true
   */
  captureUncaught?: boolean;

  /**
   * Capture unhandled rejections
   * @default true
   */
  captureUnhandledRejections?: boolean;
}
```

### DataDogConfig

Configuration for DataDog RUM.

```typescript
export interface DataDogConfig {
  /**
   * DataDog client token
   */
  clientToken: string;

  /**
   * Application ID
   */
  applicationId: string;

  /**
   * DataDog site
   * @default "datadoghq.com"
   */
  site?: string;

  /**
   * Service name
   */
  service?: string;

  /**
   * Environment name
   * @default "production"
   */
  env?: string;
}
```

### LogRocketConfig

Configuration for LogRocket.

```typescript
export interface LogRocketConfig {
  /**
   * LogRocket app ID
   */
  appId: string;

  /**
   * Console capture settings
   */
  console?: {
    shouldAggregateConsoleErrors?: boolean;
  };

  /**
   * Network capture settings
   */
  network?: {
    requestSanitizer?: (request: any) => any;
    responseSanitizer?: (response: any) => any;
  };
}
```

### RaygunConfig

Configuration for Raygun.

```typescript
export interface RaygunConfig {
  /**
   * Raygun API key
   */
  apiKey: string;

  /**
   * Application version
   */
  version?: string;

  /**
   * Enable crash reporting
   * @default true
   */
  enableCrashReporting?: boolean;

  /**
   * Enable real user monitoring
   * @default false
   */
  enableRUM?: boolean;
}
```

### AppCenterConfig

Configuration for Microsoft App Center.

```typescript
export interface AppCenterConfig {
  /**
   * App Center app secret
   */
  appSecret: string;

  /**
   * Analytics enabled
   * @default true
   */
  analytics?: boolean;

  /**
   * Crashes enabled
   * @default true
   */
  crashes?: boolean;
}
```

### CrashlyticsConfig

Configuration for Firebase Crashlytics.

```typescript
export interface CrashlyticsConfig {
  /**
   * Enable Crashlytics
   * @default true
   */
  enabled?: boolean;

  /**
   * Collection enabled
   * @default true
   */
  collectionEnabled?: boolean;
}
```

## See Also

- [Core Interfaces](./core-interfaces.md) - Main plugin interfaces
- [Configuration Interfaces](./configuration-interfaces.md) - General configuration interfaces
- [Provider Setup Guide](../../providers/README.md) - Detailed setup for each provider
