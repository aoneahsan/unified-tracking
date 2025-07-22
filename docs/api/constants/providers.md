# Provider Constants

Constants for provider identifiers, configurations, and defaults.

## Provider Identifiers

### Analytics Providers

```typescript
export const ANALYTICS_PROVIDERS = {
  GOOGLE_ANALYTICS: 'google-analytics',
  FIREBASE_ANALYTICS: 'firebase-analytics',
  MIXPANEL: 'mixpanel',
  AMPLITUDE: 'amplitude',
  SEGMENT: 'segment',
  POSTHOG: 'posthog',
  HEAP: 'heap',
  MATOMO: 'matomo',
} as const;

export type AnalyticsProviderId = (typeof ANALYTICS_PROVIDERS)[keyof typeof ANALYTICS_PROVIDERS];
```

### Error Tracking Providers

```typescript
export const ERROR_PROVIDERS = {
  SENTRY: 'sentry',
  BUGSNAG: 'bugsnag',
  ROLLBAR: 'rollbar',
  DATADOG: 'datadog',
  LOGROCKET: 'logrocket',
  RAYGUN: 'raygun',
  APPCENTER: 'appcenter',
  FIREBASE_CRASHLYTICS: 'firebase-crashlytics',
} as const;

export type ErrorProviderId = (typeof ERROR_PROVIDERS)[keyof typeof ERROR_PROVIDERS];
```

## Provider URLs

### SDK URLs

```typescript
export const PROVIDER_SDK_URLS = {
  // Analytics
  [ANALYTICS_PROVIDERS.GOOGLE_ANALYTICS]: 'https://www.googletagmanager.com/gtag/js',
  [ANALYTICS_PROVIDERS.MIXPANEL]: 'https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js',
  [ANALYTICS_PROVIDERS.AMPLITUDE]: 'https://cdn.amplitude.com/libs/analytics-browser-2.0.0-min.js.gz',
  [ANALYTICS_PROVIDERS.SEGMENT]: 'https://cdn.segment.com/analytics.js/v1/analytics.min.js',
  [ANALYTICS_PROVIDERS.POSTHOG]: 'https://app.posthog.com/static/posthog.js',
  [ANALYTICS_PROVIDERS.HEAP]: 'https://cdn.heapanalytics.com/js/heap.js',
  [ANALYTICS_PROVIDERS.MATOMO]: 'https://cdn.matomo.cloud/matomo.js',

  // Error Tracking
  [ERROR_PROVIDERS.SENTRY]: 'https://browser.sentry-cdn.com/7.0.0/bundle.min.js',
  [ERROR_PROVIDERS.BUGSNAG]: 'https://d2wy8f7a9ursnm.cloudfront.net/v7/bugsnag.min.js',
  [ERROR_PROVIDERS.ROLLBAR]: 'https://cdn.rollbar.com/rollbarjs/refs/tags/v2.26.0/rollbar.min.js',
  [ERROR_PROVIDERS.LOGROCKET]: 'https://cdn.logrocket.io/LogRocket.min.js',
  [ERROR_PROVIDERS.RAYGUN]: 'https://cdn.raygun.io/raygun4js/raygun.min.js',
} as const;
```

### API Endpoints

```typescript
export const PROVIDER_API_ENDPOINTS = {
  // Analytics
  [ANALYTICS_PROVIDERS.GOOGLE_ANALYTICS]: 'https://www.google-analytics.com',
  [ANALYTICS_PROVIDERS.MIXPANEL]: 'https://api.mixpanel.com',
  [ANALYTICS_PROVIDERS.AMPLITUDE]: 'https://api2.amplitude.com',
  [ANALYTICS_PROVIDERS.SEGMENT]: 'https://api.segment.io',
  [ANALYTICS_PROVIDERS.POSTHOG]: 'https://app.posthog.com',

  // Error Tracking
  [ERROR_PROVIDERS.SENTRY]: 'https://sentry.io',
  [ERROR_PROVIDERS.BUGSNAG]: 'https://notify.bugsnag.com',
  [ERROR_PROVIDERS.ROLLBAR]: 'https://api.rollbar.com',
} as const;
```

## Default Configurations

### Analytics Defaults

```typescript
export const ANALYTICS_DEFAULTS = {
  // Common defaults
  BATCH_SIZE: 50,
  FLUSH_INTERVAL: 30000, // 30 seconds
  SESSION_TIMEOUT: 1800000, // 30 minutes
  MAX_QUEUE_SIZE: 1000,

  // Provider-specific defaults
  [ANALYTICS_PROVIDERS.GOOGLE_ANALYTICS]: {
    sendPageView: true,
    cookieExpires: 63072000, // 2 years
    cookiePrefix: '_ga',
    anonymizeIp: true,
  },

  [ANALYTICS_PROVIDERS.MIXPANEL]: {
    trackAutomaticEvents: false,
    persistence: 'localStorage',
    ipTracking: true,
    sessionDuration: 1800000,
    batchSize: 50,
    batchFlushInterval: 5000,
  },

  [ANALYTICS_PROVIDERS.AMPLITUDE]: {
    batchSize: 30,
    eventUploadThreshold: 30,
    eventUploadPeriod: 30000,
    includeUtm: true,
    includeReferrer: true,
    includeGclid: true,
  },
} as const;
```

### Error Tracking Defaults

```typescript
export const ERROR_DEFAULTS = {
  // Common defaults
  MAX_BREADCRUMBS: 100,
  ATTACHMENT_MAX_SIZE: 20 * 1024 * 1024, // 20MB
  SAMPLE_RATE: 1.0,

  // Provider-specific defaults
  [ERROR_PROVIDERS.SENTRY]: {
    environment: 'production',
    tracesSampleRate: 1.0,
    attachStacktrace: true,
    autoSessionTracking: true,
    maxBreadcrumbs: 100,
  },

  [ERROR_PROVIDERS.BUGSNAG]: {
    releaseStage: 'production',
    enabledReleaseStages: ['production', 'staging'],
    autoDetectErrors: true,
    maxBreadcrumbs: 100,
  },

  [ERROR_PROVIDERS.ROLLBAR]: {
    environment: 'production',
    captureUncaught: true,
    captureUnhandledRejections: true,
    payload: {
      client: {
        javascript: {
          source_map_enabled: true,
        },
      },
    },
  },
} as const;
```

## Provider Capabilities

```typescript
export const PROVIDER_CAPABILITIES = {
  // Analytics capabilities
  [ANALYTICS_PROVIDERS.GOOGLE_ANALYTICS]: {
    customEvents: true,
    userProperties: true,
    revenue: true,
    screenViews: true,
    ecommerce: true,
    enhancedEcommerce: true,
    customDimensions: true,
    customMetrics: true,
    audiences: true,
    conversions: true,
  },

  [ANALYTICS_PROVIDERS.MIXPANEL]: {
    customEvents: true,
    userProperties: true,
    revenue: true,
    screenViews: true,
    cohorts: true,
    funnels: true,
    retention: true,
    peopleProfiles: true,
    groupAnalytics: true,
    predictiveAnalytics: true,
  },

  // Error tracking capabilities
  [ERROR_PROVIDERS.SENTRY]: {
    errorCapture: true,
    breadcrumbs: true,
    userContext: true,
    customContext: true,
    sourceMapping: true,
    releaseTracking: true,
    performance: true,
    attachments: true,
    sessionReplay: true,
    codeowners: true,
  },
} as const;
```

## Provider Limits

```typescript
export const PROVIDER_LIMITS = {
  // Event name limits
  EVENT_NAME_MAX_LENGTH: {
    [ANALYTICS_PROVIDERS.GOOGLE_ANALYTICS]: 500,
    [ANALYTICS_PROVIDERS.MIXPANEL]: 255,
    [ANALYTICS_PROVIDERS.AMPLITUDE]: 100,
  },

  // Property limits
  PROPERTY_NAME_MAX_LENGTH: {
    [ANALYTICS_PROVIDERS.GOOGLE_ANALYTICS]: 40,
    [ANALYTICS_PROVIDERS.MIXPANEL]: 255,
    [ANALYTICS_PROVIDERS.AMPLITUDE]: 100,
  },

  PROPERTY_VALUE_MAX_LENGTH: {
    [ANALYTICS_PROVIDERS.GOOGLE_ANALYTICS]: 100,
    [ANALYTICS_PROVIDERS.MIXPANEL]: 255,
    [ANALYTICS_PROVIDERS.AMPLITUDE]: 1000,
  },

  // Event limits
  MAX_PROPERTIES_PER_EVENT: {
    [ANALYTICS_PROVIDERS.GOOGLE_ANALYTICS]: 25,
    [ANALYTICS_PROVIDERS.MIXPANEL]: 255,
    [ANALYTICS_PROVIDERS.AMPLITUDE]: 1000,
  },

  // User property limits
  MAX_USER_PROPERTIES: {
    [ANALYTICS_PROVIDERS.GOOGLE_ANALYTICS]: 25,
    [ANALYTICS_PROVIDERS.MIXPANEL]: 1000,
    [ANALYTICS_PROVIDERS.AMPLITUDE]: 1000,
  },
} as const;
```

## Provider Status

```typescript
export const PROVIDER_STATUS = {
  NOT_INITIALIZED: 'not_initialized',
  INITIALIZING: 'initializing',
  READY: 'ready',
  ERROR: 'error',
  DISABLED: 'disabled',
} as const;

export type ProviderStatus = (typeof PROVIDER_STATUS)[keyof typeof PROVIDER_STATUS];
```

## Provider Events

```typescript
export const PROVIDER_EVENTS = {
  // Lifecycle events
  INITIALIZED: 'provider_initialized',
  ERROR: 'provider_error',
  DISABLED: 'provider_disabled',
  ENABLED: 'provider_enabled',

  // Operation events
  EVENT_SENT: 'event_sent',
  EVENT_FAILED: 'event_failed',
  BATCH_SENT: 'batch_sent',
  BATCH_FAILED: 'batch_failed',

  // State events
  ONLINE: 'provider_online',
  OFFLINE: 'provider_offline',
  CONSENT_UPDATED: 'consent_updated',
} as const;
```

## Provider Metadata

```typescript
export const PROVIDER_METADATA = {
  [ANALYTICS_PROVIDERS.GOOGLE_ANALYTICS]: {
    name: 'Google Analytics',
    category: 'analytics',
    website: 'https://analytics.google.com',
    documentation: 'https://developers.google.com/analytics',
    pricing: 'free',
    platforms: ['web', 'ios', 'android'],
  },

  [ANALYTICS_PROVIDERS.MIXPANEL]: {
    name: 'Mixpanel',
    category: 'analytics',
    website: 'https://mixpanel.com',
    documentation: 'https://developer.mixpanel.com',
    pricing: 'freemium',
    platforms: ['web', 'ios', 'android'],
  },

  [ERROR_PROVIDERS.SENTRY]: {
    name: 'Sentry',
    category: 'error-tracking',
    website: 'https://sentry.io',
    documentation: 'https://docs.sentry.io',
    pricing: 'freemium',
    platforms: ['web', 'ios', 'android'],
  },
} as const;
```

## Usage Examples

### Type-safe Provider Check

```typescript
import { ANALYTICS_PROVIDERS, AnalyticsProviderId } from 'unified-tracking/constants';

function isValidAnalyticsProvider(id: string): id is AnalyticsProviderId {
  return Object.values(ANALYTICS_PROVIDERS).includes(id as any);
}

// Usage
const providerId = 'google-analytics';
if (isValidAnalyticsProvider(providerId)) {
  // TypeScript knows providerId is a valid AnalyticsProviderId
  const config = ANALYTICS_DEFAULTS[providerId];
}
```

### Provider Configuration

```typescript
import { ANALYTICS_PROVIDERS, ANALYTICS_DEFAULTS, PROVIDER_LIMITS } from 'unified-tracking/constants';

// Create provider config with defaults
const gaConfig = {
  id: ANALYTICS_PROVIDERS.GOOGLE_ANALYTICS,
  config: {
    measurementId: 'G-XXXXXXXXXX',
    ...ANALYTICS_DEFAULTS[ANALYTICS_PROVIDERS.GOOGLE_ANALYTICS],
  },
};

// Validate event name length
function validateEventName(provider: string, eventName: string): boolean {
  const maxLength = PROVIDER_LIMITS.EVENT_NAME_MAX_LENGTH[provider];
  return eventName.length <= maxLength;
}
```

### Provider Capability Check

```typescript
import { PROVIDER_CAPABILITIES } from 'unified-tracking/constants';

function supportsFeature(provider: string, feature: keyof (typeof PROVIDER_CAPABILITIES)[string]): boolean {
  return PROVIDER_CAPABILITIES[provider]?.[feature] === true;
}

// Check if provider supports e-commerce
if (supportsFeature('google-analytics', 'ecommerce')) {
  // Track e-commerce events
}
```

## Best Practices

1. **Use Constants**: Always use constants instead of hardcoding provider IDs
2. **Check Capabilities**: Verify provider capabilities before using features
3. **Respect Limits**: Stay within provider-specific limits
4. **Apply Defaults**: Use default configurations as a starting point
5. **Type Safety**: Leverage TypeScript types for compile-time safety

## See Also

- [Event Constants](./events.md) - Event-related constants
- [Error Constants](./errors.md) - Error tracking constants
- [Provider Interfaces](../interfaces/provider-interfaces.md) - Provider configurations
