import { BaseAnalyticsProvider } from '../../base-analytics-provider';
import { RegisterProvider } from '../../registry';
import type { ProviderConfig, ProviderType, ConsentSettings } from '../../../types/provider';
import type { RevenueData } from '../../../definitions';

interface PostHogConfig extends ProviderConfig {
  apiKey: string;
  apiHost?: string;
  loaded?: (posthog: any) => void;
  autocapture?: boolean;
  capturePageview?: boolean;
  capturePageleave?: boolean;
  crossSubdomainCookie?: boolean;
  persistence?: 'localStorage' | 'cookie' | 'memory';
  cookieName?: string;
  cookieExpiration?: number;
  respectDnt?: boolean;
  propertyBlacklist?: string[];
  xhr_headers?: Record<string, string>;
  ipCapture?: boolean;
  optOutCapturingByDefault?: boolean;
  mask_all_text?: boolean;
  mask_all_element_attributes?: boolean;
  featureFlags?: Record<string, any>;
  sessionRecording?: {
    enabled?: boolean;
    maskAllInputs?: boolean;
    maskInputOptions?: Record<string, any>;
    sampleRate?: number;
    minimumDuration?: number;
  };
}

interface PostHogSDK {
  init: (apiKey: string, config?: any) => void;
  capture: (event: string, properties?: any, options?: any) => void;
  identify: (distinctId: string, properties?: any, options?: any) => void;
  people: {
    set: (properties: any) => void;
    set_once: (properties: any) => void;
    increment: (properties: any) => void;
    append: (properties: any) => void;
    delete: () => void;
  };
  alias: (alias: string, distinctId?: string) => void;
  reset: (resetDeviceId?: boolean) => void;
  get_distinct_id: () => string;
  get_session_id: () => string;
  opt_out_capturing: () => void;
  opt_in_capturing: () => void;
  has_opted_out_capturing: () => boolean;
  set_config: (config: any) => void;
  register: (properties: any) => void;
  register_once: (properties: any) => void;
  unregister: (property: string) => void;
  get_property: (property: string) => any;
  startSessionRecording: () => void;
  stopSessionRecording: () => void;
  feature_flags: {
    reloadFeatureFlags: () => void;
    isFeatureEnabled: (flag: string) => boolean;
    getFeatureFlag: (flag: string) => any;
    onFeatureFlags: (callback: (flags: Record<string, any>) => void) => void;
  };
  group: (groupType: string, groupKey: string, properties?: any) => void;
  debug: (enable?: boolean) => void;
  setPersonProperties: (properties: any) => void;
  setPersonPropertiesForFlags: (properties: any) => void;
  isFeatureEnabled: (flag: string) => boolean;
  getFeatureFlag: (flag: string) => any;
  onFeatureFlags: (callback: (flags: Record<string, any>) => void) => void;
  reloadFeatureFlags: () => void;
}

declare global {
  interface Window {
    posthog?: PostHogSDK;
  }
}

@RegisterProvider({
  id: 'posthog',
  name: 'PostHog Analytics',
  type: 'analytics' as ProviderType,
  version: '1.0.0',
  supportedPlatforms: ['web'],
  configSchema: {
    apiKey: { type: 'string', required: true },
    apiHost: { type: 'string', default: 'https://app.posthog.com' },
    autocapture: { type: 'boolean', default: true },
    capturePageview: { type: 'boolean', default: true },
    capturePageleave: { type: 'boolean', default: true },
    crossSubdomainCookie: { type: 'boolean', default: true },
    persistence: { type: 'string', default: 'localStorage' },
    respectDnt: { type: 'boolean', default: false },
    ipCapture: { type: 'boolean', default: true },
    optOutCapturingByDefault: { type: 'boolean', default: false },
  },
})
export class PostHogAnalyticsProvider extends BaseAnalyticsProvider {
  readonly id = 'posthog';
  readonly name = 'PostHog Analytics';
  readonly version = '1.0.0';

  private posthog?: PostHogSDK;
  // @ts-ignore - Reserved for future use
  private _posthogConfig: PostHogConfig | null = null;
  private scriptLoaded = false;

  /**
   * Get provider name
   */
  getName(): string {
    return this.name;
  }

  protected async doInitialize(config: PostHogConfig): Promise<void> {
    if (!config.apiKey) {
      throw new Error('PostHog API key is required');
    }

    this._posthogConfig = config;

    // Load PostHog SDK
    await this.loadPostHogSDK();

    if (!window.posthog) {
      throw new Error('Failed to load PostHog SDK');
    }

    this.posthog = window.posthog;

    // Configure PostHog
    const posthogOptions: any = {
      api_host: config.apiHost || 'https://app.posthog.com',
      autocapture: config.autocapture !== false,
      capture_pageview: config.capturePageview !== false,
      capture_pageleave: config.capturePageleave !== false,
      cross_subdomain_cookie: config.crossSubdomainCookie !== false,
      persistence: config.persistence || 'localStorage',
      cookie_name: config.cookieName,
      cookie_expiration: config.cookieExpiration,
      respect_dnt: config.respectDnt === true,
      property_blacklist: config.propertyBlacklist,
      xhr_headers: config.xhr_headers,
      ip: config.ipCapture !== false,
      opt_out_capturing_by_default: config.optOutCapturingByDefault === true,
      mask_all_text: config.mask_all_text === true,
      mask_all_element_attributes: config.mask_all_element_attributes === true,
      loaded: config.loaded,
    };

    if (config.sessionRecording) {
      posthogOptions.session_recording = {
        enabled: config.sessionRecording.enabled !== false,
        maskAllInputs: config.sessionRecording.maskAllInputs,
        maskInputOptions: config.sessionRecording.maskInputOptions,
        sampleRate: config.sessionRecording.sampleRate,
        minimumDuration: config.sessionRecording.minimumDuration,
      };
    }

    // Initialize PostHog
    this.posthog.init(config.apiKey, posthogOptions);

    // Call loaded callback if provided
    if (config.loaded) {
      config.loaded(this.posthog);
    }

    this.logger.info('PostHog Analytics initialized successfully', {
      apiKey: config.apiKey,
      apiHost: config.apiHost,
    });
  }

  private async loadPostHogSDK(): Promise<void> {
    if (this.scriptLoaded || window.posthog) {
      return;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.src = 'https://app.posthog.com/static/array.js';

      script.onload = () => {
        this.scriptLoaded = true;
        // Wait a bit for posthog to initialize
        setTimeout(() => {
          if (window.posthog) {
            resolve();
          } else {
            reject(new Error('PostHog SDK loaded but window.posthog is not available'));
          }
        }, 100);
      };

      script.onerror = () => {
        reject(new Error('Failed to load PostHog SDK'));
      };

      document.head.appendChild(script);
    });
  }

  protected async doShutdown(): Promise<void> {
    this.posthog = undefined;
    this._posthogConfig = null;
    this.scriptLoaded = false;
  }

  protected async doProviderReset(): Promise<void> {
    if (!this.posthog) return;

    // PostHog reset clears the user ID and super properties
    this.posthog.reset();
  }

  protected async doUpdateConsent(consent: ConsentSettings): Promise<void> {
    if (!this.posthog) return;

    if (consent.analytics === false) {
      this.posthog.opt_out_capturing();
      this.logger.info('PostHog tracking disabled by consent');
    } else if (consent.analytics === true) {
      this.posthog.opt_in_capturing();
      this.logger.info('PostHog tracking enabled by consent');
    }
  }

  async track(eventName: string, properties?: Record<string, any>): Promise<void> {
    if (!this.initialized || !this.posthog) {
      throw new Error('PostHog not initialized');
    }
    return super.track(eventName, properties);
  }

  protected async doTrack(eventName: string, properties: Record<string, any>): Promise<void> {
    if (!this.posthog) {
      throw new Error('PostHog not initialized');
    }

    const cleanProperties = this.sanitizeProperties(properties);
    this.posthog.capture(eventName, cleanProperties);
  }

  protected async doIdentifyUser(userId: string, traits: Record<string, any>): Promise<void> {
    if (!this.posthog) {
      throw new Error('PostHog not initialized');
    }

    const cleanTraits = this.sanitizeProperties(traits);
    this.posthog.identify(userId, cleanTraits);
  }

  /**
   * Alias for identifyUser to match test expectations
   */
  async identify(userId: string, traits?: Record<string, any>): Promise<void> {
    if (!this.initialized || !this.posthog) {
      throw new Error('PostHog not initialized');
    }
    return this.identifyUser(userId, traits);
  }

  async setUserProperties(properties: Record<string, any>): Promise<void> {
    if (!this.initialized || !this.posthog) {
      throw new Error('PostHog not initialized');
    }
    return super.setUserProperties(properties);
  }

  protected async doSetUserProperties(properties: Record<string, any>): Promise<void> {
    if (!this.posthog) {
      throw new Error('PostHog not initialized');
    }

    const cleanProperties = this.sanitizeProperties(properties);
    this.posthog.people.set(cleanProperties);
  }

  async logScreenView(screenName: string, properties?: Record<string, any>): Promise<void> {
    if (!this.initialized || !this.posthog) {
      throw new Error('PostHog not initialized');
    }
    return super.logScreenView(screenName, properties);
  }

  protected async doLogScreenView(screenName: string, properties: Record<string, any>): Promise<void> {
    if (!this.posthog) {
      throw new Error('PostHog not initialized');
    }

    // Remove screen_name from properties to avoid duplication
    const { screen_name, ...otherProperties } = properties;
    
    const screenProperties = {
      $screen_name: screenName,
      ...this.sanitizeProperties(otherProperties),
    };

    this.posthog.capture('$pageview', screenProperties);
  }

  async logRevenue(data: RevenueData): Promise<void> {
    if (!this.initialized || !this.posthog) {
      throw new Error('PostHog not initialized');
    }
    return super.logRevenue(data);
  }

  protected async doLogRevenue(data: RevenueData): Promise<void> {
    if (!this.posthog) {
      throw new Error('PostHog not initialized');
    }

    // PostHog recommends using a purchase event for revenue tracking
    const revenueProperties: Record<string, any> = {
      $revenue: data.amount,
      currency: data.currency || 'USD',
      value: data.amount, // Some integrations use 'value'
    };

    if (data.productId) {
      revenueProperties.product_id = data.productId;
    }

    if (data.productName) {
      revenueProperties.product_name = data.productName;
    }

    if (data.quantity) {
      revenueProperties.quantity = data.quantity;
    }

    if (data.properties) {
      Object.assign(revenueProperties, this.sanitizeProperties(data.properties));
    }

    this.posthog.capture('Purchase', revenueProperties);
  }

  protected async doReset(): Promise<void> {
    if (!this.posthog) return;

    this.posthog.reset();
  }

  protected doSetDebugMode(enabled: boolean): void {
    if (this.posthog) {
      this.posthog.debug(enabled);
    }
  }

  /**
   * Set super properties (properties sent with every event)
   */
  setSuperProperties(properties: Record<string, any>): void {
    if (!this.posthog) return;

    const cleanProperties = this.sanitizeProperties(properties);
    this.posthog.register(cleanProperties);
  }

  /**
   * Set super properties once (properties sent with every event, but only set once)
   */
  setSuperPropertiesOnce(properties: Record<string, any>): void {
    if (!this.posthog) return;

    const cleanProperties = this.sanitizeProperties(properties);
    this.posthog.register_once(cleanProperties);
  }

  /**
   * Unregister a super property
   */
  unregisterSuperProperty(property: string): void {
    if (!this.posthog) return;

    this.posthog.unregister(property);
  }

  /**
   * Get a super property
   */
  getSuperProperty(property: string): any {
    if (!this.posthog) return null;

    return this.posthog.get_property(property);
  }

  /**
   * Get the distinct ID
   */
  getDistinctId(): string | null {
    if (!this.posthog) return null;

    return this.posthog.get_distinct_id();
  }

  /**
   * Get the session ID
   */
  getSessionId(): string | null {
    if (!this.posthog) return null;

    return this.posthog.get_session_id();
  }

  /**
   * Alias a user
   */
  alias(alias: string, distinctId?: string): void {
    if (!this.posthog) return;

    this.posthog.alias(alias, distinctId);
  }

  /**
   * Associate a user with a group
   */
  group(groupType: string, groupKey: string, properties?: Record<string, any>): void {
    if (!this.posthog) return;

    const cleanProperties = properties ? this.sanitizeProperties(properties) : undefined;
    this.posthog.group(groupType, groupKey, cleanProperties);
  }

  /**
   * Check if a feature flag is enabled
   */
  isFeatureEnabled(flag: string): boolean {
    if (!this.posthog) return false;

    return this.posthog.isFeatureEnabled(flag);
  }

  /**
   * Get the value of a feature flag
   */
  getFeatureFlag(flag: string): any {
    if (!this.posthog) return null;

    return this.posthog.getFeatureFlag(flag);
  }

  /**
   * Listen for feature flag changes
   */
  onFeatureFlags(callback: (flags: Record<string, any>) => void): void {
    if (!this.posthog) return;

    this.posthog.onFeatureFlags(callback);
  }

  /**
   * Reload feature flags
   */
  reloadFeatureFlags(): void {
    if (!this.posthog) return;

    this.posthog.reloadFeatureFlags();
  }

  /**
   * Start session recording
   */
  startSessionRecording(): void {
    if (!this.posthog) return;

    this.posthog.startSessionRecording();
  }

  /**
   * Stop session recording
   */
  stopSessionRecording(): void {
    if (!this.posthog) return;

    this.posthog.stopSessionRecording();
  }

  /**
   * Set person properties for feature flags
   */
  setPersonPropertiesForFlags(properties: Record<string, any>): void {
    if (!this.posthog) return;

    const cleanProperties = this.sanitizeProperties(properties);
    this.posthog.setPersonPropertiesForFlags(cleanProperties);
  }

  /**
   * Sanitize properties for PostHog
   */
  private sanitizeProperties(properties: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(properties)) {
      // Only exclude null and undefined values
      if (value !== null && value !== undefined) {
        // PostHog has some reserved properties that start with $
        // We'll keep them as is
        sanitized[key] = value;
      }
    }

    return sanitized;
  }
}