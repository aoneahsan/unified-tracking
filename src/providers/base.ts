import type { ErrorContext, RevenueData } from '../definitions';
import type { Provider, ProviderConfig, ProviderType, ConsentSettings } from '../types/provider';

/**
 * Base interface for all providers
 */
export interface BaseProvider extends Provider {
  /**
   * Provider unique identifier
   */
  readonly id: string;

  /**
   * Provider name
   */
  readonly name: string;

  /**
   * Provider type
   */
  readonly type: ProviderType;

  /**
   * Provider version
   */
  readonly version: string;

  /**
   * Initialize the provider
   */
  initialize(config: ProviderConfig): Promise<void>;

  /**
   * Shutdown the provider
   */
  shutdown(): Promise<void>;

  /**
   * Update user consent
   */
  updateConsent(consent: ConsentSettings): Promise<void>;

  /**
   * Check if provider is ready
   */
  isReady(): boolean;

  /**
   * Get current configuration
   */
  getConfig(): ProviderConfig;

  /**
   * Enable or disable the provider
   */
  setEnabled(enabled: boolean): void;

  /**
   * Check if provider is enabled
   */
  isEnabled(): boolean;

  /**
   * Set debug mode
   */
  setDebugMode(enabled: boolean): void;

  /**
   * Reset provider data
   */
  reset(): Promise<void>;

  /**
   * Pause provider (optional)
   */
  pause?(): Promise<void>;

  /**
   * Resume provider (optional)
   */
  resume?(): Promise<void>;
}

/**
 * Base interface for analytics providers
 */
export interface AnalyticsProvider extends BaseProvider {
  /**
   * Track a custom event
   */
  track(eventName: string, properties?: Record<string, any>): Promise<void>;

  /**
   * Track a custom event (alias for track)
   */
  trackEvent(eventName: string, properties?: Record<string, any>): Promise<void>;

  /**
   * Identify a user
   */
  identifyUser(userId: string, traits?: Record<string, any>): Promise<void>;

  /**
   * Set user properties
   */
  setUserProperties(properties: Record<string, any>): Promise<void>;

  /**
   * Log a screen view
   */
  logScreenView(screenName: string, properties?: Record<string, any>): Promise<void>;

  /**
   * Log revenue
   */
  logRevenue(data: RevenueData): Promise<void>;

  /**
   * Start a timed event
   */
  startTimedEvent?(eventName: string): void;

  /**
   * End a timed event
   */
  endTimedEvent?(eventName: string, properties?: Record<string, any>): Promise<void>;

  /**
   * Set super properties (properties included with all events)
   */
  setSuperProperties?(properties: Record<string, any>): void;

  /**
   * Increment a user property
   */
  incrementUserProperty?(property: string, value?: number): Promise<void>;
}

/**
 * Base interface for error tracking providers
 */
export interface ErrorTrackingProvider extends BaseProvider {
  /**
   * Log an error
   */
  logError(error: Error | string, context?: ErrorContext): Promise<void>;

  /**
   * Log a message
   */
  logMessage?(message: string, level?: 'debug' | 'info' | 'warning'): Promise<void>;

  /**
   * Add breadcrumb
   */
  addBreadcrumb?(message: string, category?: string, data?: Record<string, any>): void;

  /**
   * Set user context
   */
  setUserContext(user: { id?: string; email?: string; username?: string; [key: string]: any }): void;

  /**
   * Set extra context
   */
  setExtraContext(key: string, value: any): void;

  /**
   * Set tags
   */
  setTags(tags: Record<string, string>): void;

  /**
   * Capture unhandled exceptions
   */
  captureException(exception: Error, context?: ErrorContext): Promise<void>;

  /**
   * Start a transaction/span
   */
  startTransaction?(name: string, operation?: string): any;

  /**
   * Finish a transaction/span
   */
  finishTransaction?(transaction: any): void;
}

/**
 * Provider that supports both analytics and error tracking
 */
export interface UnifiedProvider extends AnalyticsProvider, ErrorTrackingProvider {
  /**
   * Provider capabilities
   */
  readonly capabilities: {
    analytics: boolean;
    errorTracking: boolean;
  };
}

/**
 * Provider factory function type
 */
export type ProviderFactory<T extends BaseProvider> = () => T;

/**
 * Provider registry interface
 */
export interface IProviderRegistry {
  analytics: Map<string, ProviderFactory<AnalyticsProvider>>;
  errorTracking: Map<string, ProviderFactory<ErrorTrackingProvider>>;
  unified: Map<string, ProviderFactory<UnifiedProvider>>;
}
