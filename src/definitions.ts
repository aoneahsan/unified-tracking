import type { PluginListenerHandle } from '@capacitor/core';

export interface UnifiedTrackingPlugin {
  /**
   * Initialize the plugin with configuration
   */
  initialize(options?: UnifiedTrackingConfig): Promise<InitializeResult>;

  /**
   * Track a custom event
   */
  track(event: string, properties?: Record<string, unknown>): Promise<void>;

  /**
   * Identify a user
   */
  identify(userId: string, traits?: Record<string, unknown>): Promise<void>;

  /**
   * Set user properties
   */
  setUserProperties(properties: Record<string, unknown>): Promise<void>;

  /**
   * Log an error
   */
  logError(error: Error | string, context?: ErrorContext): Promise<void>;

  /**
   * Log revenue
   */
  logRevenue(revenue: RevenueData): Promise<void>;

  /**
   * Log screen view
   */
  logScreenView(screenName: string, properties?: Record<string, unknown>): Promise<void>;

  /**
   * Set user consent
   */
  setConsent(consent: ConsentSettings): Promise<void>;

  /**
   * Reset user data
   */
  reset(): Promise<void>;

  /**
   * Flush any buffered events across providers that support it (e.g. Segment, Sentry).
   */
  flush(): Promise<void>;

  /**
   * Get active providers
   */
  getActiveProviders(): Promise<ActiveProvidersResult>;

  /**
   * Enable debug mode
   */
  enableDebugMode(enabled: boolean): Promise<void>;

  /**
   * Add event listener
   */
  addListener(
    eventName: 'trackingEvent' | 'error' | 'providerStatusChange',
    listenerFunc: (event: TrackingEventPayload) => void,
  ): Promise<PluginListenerHandle>;
}

/**
 * Payload delivered to {@link UnifiedTrackingPlugin.addListener} callbacks. Which fields
 * are populated depends on the event: `trackingEvent` carries `event` + `properties`
 * (+ `timestamp`); `error` carries `error` + `context`; `providerStatusChange` carries
 * `provider` + `status`.
 */
export interface TrackingEventPayload {
  event?: string;
  properties?: Record<string, unknown>;
  error?: Error | string;
  context?: ErrorContext;
  provider?: string;
  status?: string;
  message?: string;
  timestamp?: string;
}

export interface UnifiedTrackingConfig {
  /**
   * Analytics provider configurations
   */
  analytics?: AnalyticsConfig;

  /**
   * Error tracking provider configurations
   */
  errorTracking?: ErrorTrackingConfig;

  /**
   * Global settings
   */
  settings?: GlobalSettings;

  /**
   * Auto-detect providers from installed packages
   */
  autoDetect?: boolean;
}

export interface AnalyticsConfig {
  /**
   * List of analytics providers to enable
   */
  providers?: AnalyticsProvider[];

  /**
   * Provider-specific configurations
   */
  google?: GoogleAnalyticsConfig;
  firebase?: FirebaseAnalyticsConfig;
  amplitude?: AmplitudeConfig;
  mixpanel?: MixpanelConfig;
  segment?: SegmentConfig;
  posthog?: PostHogConfig;
  heap?: HeapConfig;
  matomo?: MatomoConfig;
}

export interface ErrorTrackingConfig {
  /**
   * List of error tracking providers to enable
   */
  providers?: ErrorProvider[];

  /**
   * Provider-specific configurations
   */
  sentry?: SentryConfig;
  crashlytics?: CrashlyticsConfig;
  datadog?: DataDogConfig;
  bugsnag?: BugsnagConfig;
  rollbar?: RollbarConfig;
  logrocket?: LogRocketConfig;
  raygun?: RaygunConfig;
  appcenter?: AppCenterConfig;
}

export interface GlobalSettings {
  /**
   * Enable debug logging
   */
  debug?: boolean;

  /**
   * Default user consent settings
   */
  defaultConsent?: ConsentSettings;

  /**
   * Session timeout in milliseconds
   */
  sessionTimeout?: number;

  /**
   * Enable automatic screen tracking
   */
  autoTrackScreens?: boolean;

  /**
   * Enable automatic error tracking
   */
  autoTrackErrors?: boolean;

  /**
   * Custom user ID generator
   */
  userIdGenerator?: () => string;

  /**
   * Event batching settings
   */
  batching?: BatchingSettings;

  /**
   * Privacy settings
   */
  privacy?: PrivacySettings;
}

export interface BatchingSettings {
  /**
   * Enable event batching
   */
  enabled: boolean;

  /**
   * Maximum batch size
   */
  maxSize?: number;

  /**
   * Batch timeout in milliseconds
   */
  timeout?: number;
}

export interface PrivacySettings {
  /**
   * Anonymize IP addresses
   */
  anonymizeIp?: boolean;

  /**
   * Excluded event properties
   */
  excludedProperties?: string[];

  /**
   * Data retention days
   */
  dataRetentionDays?: number;
}

/**
 * Unified consent categories. NOTE: only `analytics` and `errorTracking` gate event
 * dispatch in the engine; the rest are forwarded to provider-native consent APIs
 * (e.g. GA Consent Mode) where supported. Identical to types/provider.ts ConsentSettings.
 */
export interface ConsentSettings {
  analytics?: boolean;
  errorTracking?: boolean;
  marketing?: boolean;
  personalization?: boolean;
  advertising?: boolean;
  functional?: boolean;
  performance?: boolean;
  [key: string]: boolean | undefined;
}

export interface InitializeResult {
  success: boolean;
  activeProviders: ActiveProvidersResult;
  warnings?: string[];
}

export interface ErrorContext {
  severity?: 'debug' | 'info' | 'warning' | 'error' | 'fatal';
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  user?: {
    id?: string;
    email?: string;
    username?: string;
  };
  breadcrumbs?: Array<{
    message: string;
    category?: string;
    timestamp?: number;
    data?: Record<string, unknown>;
  }>;
  timestamp?: string;
  platform?: string;
}

export interface RevenueData {
  amount: number;
  currency?: string;
  productId?: string;
  productName?: string;
  quantity?: number;
  transactionId?: string;
  items?: Array<{
    itemId?: string;
    itemName?: string;
    itemCategory?: string;
    itemVariant?: string;
    itemBrand?: string;
    price?: number;
    quantity?: number;
    currency?: string;
    index?: number;
  }>;
  properties?: Record<string, unknown>;
}

export interface ActiveProvidersResult {
  analytics: ProviderStatus[];
  errorTracking: ProviderStatus[];
}

export interface ProviderStatus {
  name: string;
  enabled: boolean;
  initialized: boolean;
  version?: string;
}

// Provider Types
export type AnalyticsProvider =
  | 'google'
  | 'firebase'
  | 'amplitude'
  | 'mixpanel'
  | 'segment'
  | 'posthog'
  | 'heap'
  | 'matomo';

export type ErrorProvider =
  | 'sentry'
  | 'crashlytics'
  | 'datadog'
  | 'bugsnag'
  | 'rollbar'
  | 'logrocket'
  | 'raygun'
  | 'appcenter';

// Provider Configurations
export interface GoogleAnalyticsConfig {
  measurementId: string;
  customDimensions?: Record<string, string>;
  customMetrics?: Record<string, number>;
  sendPageView?: boolean;
}

export interface FirebaseAnalyticsConfig {
  enabled?: boolean;
  customParameters?: Record<string, unknown>;
}

export interface AmplitudeConfig {
  apiKey: string;
  serverUrl?: string;
  trackingOptions?: {
    disableCookies?: boolean;
    trackingSessionEvents?: boolean;
  };
}

export interface MixpanelConfig {
  token: string;
  apiHost?: string;
  debug?: boolean;
  trackAutomaticEvents?: boolean;
  persistence?: 'localStorage' | 'cookie' | 'none';
  persistencePrefix?: string;
  cookieDomain?: string;
  crossSiteCookie?: boolean;
  secureCookie?: boolean;
  ipTracking?: boolean;
  propertyBlocklist?: string[];
  sessionDuration?: number;
  optOutByDefault?: boolean;
  batching?: boolean;
  batchSize?: number;
  batchFlushInterval?: number;
  disableNotifications?: boolean;
  superProperties?: Record<string, unknown>;
}

export interface SegmentConfig {
  writeKey: string;
  defaultIntegrations?: boolean;
  /** Per-integration enable/disable map forwarded to analytics.js. */
  enabledIntegrations?: Record<string, boolean>;
  /** @deprecated Use `enabledIntegrations`. Still accepted as a runtime alias. */
  integrations?: Record<string, boolean>;
}

export interface PostHogConfig {
  apiKey: string;
  /** PostHog API host, e.g. https://app.posthog.com or your self-hosted URL. */
  apiHost?: string;
  /** @deprecated Use `apiHost`. Still accepted as a runtime alias. */
  host?: string;
  /** Enable feature flags (boolean) or provide bootstrap flag values. */
  featureFlags?: boolean | Record<string, unknown>;
  /** Enable session recording (true) or pass a recording-options object. */
  sessionRecording?:
    | boolean
    | {
        enabled?: boolean;
        maskAllInputs?: boolean;
        maskInputOptions?: Record<string, boolean>;
        sampleRate?: number;
        minimumDuration?: number;
      };
}

export interface HeapConfig {
  appId: string;
  enableAutocapture?: boolean;
}

export interface MatomoConfig {
  /** Matomo site id (string or number both accepted). */
  siteId: string | number;
  /** Matomo tracker base URL, e.g. https://analytics.example.com. */
  trackerUrl: string;
  /** @deprecated Use `trackerUrl`. Still accepted as a runtime alias. */
  url?: string;
  customDimensions?: Record<number, string>;
}

export interface SentryConfig {
  dsn: string;
  environment?: string;
  release?: string;
  tracesSampleRate?: number;
  attachStacktrace?: boolean;
}

export interface CrashlyticsConfig {
  enabled?: boolean;
  collectionEnabled?: boolean;
}

export interface DataDogConfig {
  clientToken: string;
  applicationId: string;
  site?: string;
  service?: string;
  env?: string;
}

export interface BugsnagConfig {
  apiKey: string;
  releaseStage?: string;
  enabledReleaseStages?: string[];
  appVersion?: string;
}

export interface RollbarConfig {
  accessToken: string;
  environment?: string;
  captureUncaught?: boolean;
  captureUnhandledRejections?: boolean;
}

export interface LogRocketConfig {
  /** LogRocket app id, e.g. "org/app". */
  appId: string;
  /** @deprecated Casing alias for `appId`. Still accepted as a runtime alias. */
  appID?: string;
  shouldCaptureIP?: boolean;
  network?: {
    isEnabled?: boolean;
    requestSanitizer?: (request: unknown) => unknown;
  };
}

export interface RaygunConfig {
  apiKey: string;
  version?: string;
  enableCrashReporting?: boolean;
  enableRealUserMonitoring?: boolean;
}

export interface AppCenterConfig {
  appSecret: string;
  analytics?: {
    enableAutoPageTracking?: boolean;
  };
  crashes?: {
    askBeforeSending?: boolean;
  };
}
