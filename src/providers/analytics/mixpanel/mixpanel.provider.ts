import { BaseAnalyticsProvider } from '../../base-analytics-provider';
import { RegisterProvider } from '../../registry';
import type { ProviderConfig, ProviderType, ConsentSettings } from '../../../types/provider';
import type { RevenueData } from '../../../definitions';

interface MixpanelConfig extends ProviderConfig {
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
  superProperties?: Record<string, any>;
}

interface MixpanelInstance {
  init: (token: string, config?: any, name?: string) => void;
  track: (eventName: string, properties?: any, callback?: () => void) => void;
  identify: (distinctId: string) => void;
  alias: (alias: string, originalId?: string) => void;
  people: {
    set: (properties: any, callback?: () => void) => void;
    set_once: (properties: any, callback?: () => void) => void;
    increment: (properties: any, callback?: () => void) => void;
    append: (properties: any, callback?: () => void) => void;
    union: (properties: any, callback?: () => void) => void;
    track_charge: (amount: number, properties?: any, callback?: () => void) => void;
    clear_charges: (callback?: () => void) => void;
    delete_user: () => void;
  };
  reset: () => void;
  get_distinct_id: () => string;
  opt_out_tracking: () => void;
  opt_in_tracking: (properties?: any) => void;
  register: (properties: any, days?: number) => void;
  register_once: (properties: any, defaultValue?: any, days?: number) => void;
  unregister: (property: string) => void;
  has_opted_out_tracking: () => boolean;
  clear_opt_in_out_tracking: () => void;
  set_config: (config: any) => void;
  get_config: (propertyName?: string) => any;
  track_pageview: (properties?: any) => void;
  track_links: (selector: string, eventName: string, properties?: any) => void;
  track_forms: (selector: string, eventName: string, properties?: any) => void;
  time_event: (eventName: string) => void;
  get_property: (propertyName: string) => any;
}

declare global {
  interface Window {
    mixpanel?: MixpanelInstance;
  }
}

@RegisterProvider({
  id: 'mixpanel',
  name: 'Mixpanel Analytics',
  type: 'analytics' as ProviderType,
  version: '1.0.0',
  supportedPlatforms: ['web', 'ios', 'android'],
  configSchema: {
    token: { type: 'string', required: true },
    debug: { type: 'boolean', default: false },
    trackAutomaticEvents: { type: 'boolean', default: true },
    persistence: { type: 'string', default: 'localStorage' },
    ipTracking: { type: 'boolean', default: true },
  },
})
export class MixpanelAnalyticsProvider extends BaseAnalyticsProvider {
  readonly id = 'mixpanel';
  readonly name = 'Mixpanel Analytics';
  readonly version = '1.0.0';

  private mixpanel?: MixpanelInstance;
  private scriptLoaded = false;
  // @ts-ignore - Reserved for future use
  private _mixpanelConfig?: MixpanelConfig;

  protected async doInitialize(config: MixpanelConfig): Promise<void> {
    if (!config.token) {
      throw new Error('Mixpanel token is required');
    }

    this._mixpanelConfig = config;

    // Load Mixpanel SDK
    await this.loadMixpanelSDK();

    // Initialize Mixpanel
    if (window.mixpanel) {
      this.mixpanel = window.mixpanel;

      const initConfig: any = {
        debug: this.debugMode || false,
        track_pageview: config.trackAutomaticEvents !== false,
        persistence: config.persistence || 'localStorage',
        persistence_name: config.persistencePrefix,
        cookie_domain: config.cookieDomain,
        cross_site_cookie: config.crossSiteCookie !== undefined ? config.crossSiteCookie : true,
        secure_cookie: config.secureCookie !== undefined ? config.secureCookie : true,
        ip: config.ipTracking !== undefined ? config.ipTracking : true,
        property_blacklist: config.propertyBlocklist,
        // Convert session duration from milliseconds to seconds
        cookie_expiration: config.sessionDuration ? config.sessionDuration / 86400000 : undefined,
        api_host: config.apiHost,
        opt_out_tracking_by_default: config.optOutByDefault,
        batch_requests: config.batching !== undefined ? config.batching : true,
        batch_size: config.batchSize,
        batch_flush_interval_ms: config.batchFlushInterval,
        disable_notifications: config.disableNotifications,
        loaded: (_mixpanel: any) => {
          this.logger.info('Mixpanel SDK loaded callback');
        },
      };

      // Remove undefined values to let Mixpanel use its defaults
      Object.keys(initConfig).forEach((key) => {
        if (initConfig[key] === undefined) {
          delete initConfig[key];
        }
      });

      this.mixpanel.init(config.token, initConfig);

      // Set super properties if provided
      if (config.superProperties && Object.keys(config.superProperties).length > 0) {
        this.mixpanel.register(config.superProperties);
        this.logger.info('Mixpanel super properties set', { count: Object.keys(config.superProperties).length });
      }

      this.logger.info('Mixpanel initialized successfully', { token: config.token });
    } else {
      throw new Error('Failed to load Mixpanel SDK');
    }
  }

  protected async doTrack(eventName: string, properties: Record<string, any>): Promise<void> {
    if (!this.mixpanel) {
      throw new Error('Mixpanel not initialized');
    }

    const sanitizedName = this.sanitizeEventName(eventName);
    const sanitizedProperties = this.sanitizeProperties(properties);

    return new Promise((resolve) => {
      this.mixpanel!.track(sanitizedName, sanitizedProperties, () => resolve());
    });
  }

  protected async doIdentifyUser(userId: string, traits: Record<string, any>): Promise<void> {
    if (!this.mixpanel) {
      throw new Error('Mixpanel not initialized');
    }

    // Set the distinct ID
    this.mixpanel.identify(userId);

    // Set user properties if provided
    if (Object.keys(traits).length > 0) {
      await this.doSetUserProperties(traits);
    }
  }

  protected async doSetUserProperties(properties: Record<string, any>): Promise<void> {
    if (!this.mixpanel) {
      throw new Error('Mixpanel not initialized');
    }

    const sanitizedProperties = this.sanitizeProperties(properties);

    return new Promise((resolve) => {
      this.mixpanel!.people.set(sanitizedProperties, () => resolve());
    });
  }

  protected async doLogRevenue(data: RevenueData): Promise<void> {
    if (!this.mixpanel) {
      throw new Error('Mixpanel not initialized');
    }

    const properties: Record<string, any> = {
      amount: data.amount,
      currency: data.currency || 'USD',
    };

    if (data.quantity) {
      properties.quantity = data.quantity;
    }

    if (data.productId) {
      properties.product_id = data.productId;
    }

    if (data.properties) {
      Object.assign(properties, this.sanitizeProperties(data.properties));
    }

    // Track as a revenue event
    await this.track('Revenue', properties);

    // Also track charge in people properties
    return new Promise((resolve) => {
      this.mixpanel!.people.track_charge(data.amount, properties, () => resolve());
    });
  }

  protected async doLogScreenView(screenName: string, properties: Record<string, any>): Promise<void> {
    const eventProperties = {
      screen_name: screenName,
      ...properties,
    };

    await this.doTrack('Screen View', eventProperties);
  }

  protected async doUpdateConsent(consent: ConsentSettings): Promise<void> {
    if (!this.mixpanel) return;

    if (consent.analytics === false) {
      // Opt out of tracking
      this.mixpanel.opt_out_tracking();
      this.logger.info('Mixpanel tracking disabled by consent');
    } else if (consent.analytics === true) {
      // Opt back in
      this.mixpanel.opt_in_tracking();
      this.logger.info('Mixpanel tracking enabled by consent');
    }
  }

  protected async doProviderReset(): Promise<void> {
    if (!this.mixpanel) return;

    this.mixpanel.reset();
  }

  protected doSetDebugMode(enabled: boolean): void {
    if (this.mixpanel) {
      this.mixpanel.set_config({ debug: enabled });
    }
  }

  protected async doShutdown(): Promise<void> {
    this.mixpanel = undefined;
    this._mixpanelConfig = undefined;
    this.scriptLoaded = false;
  }

  private async loadMixpanelSDK(): Promise<void> {
    if (this.scriptLoaded || window.mixpanel) {
      return;
    }

    return new Promise((resolve, reject) => {
      // Mixpanel snippet
      const loadScript = (_f: any, b: any) => {
        if (!(b as any).__SV) {
          let a: any,
            e: any,
            d: any = function (c: string, ...args: any[]) {
              if (d.push) {
                d.push([c].concat(args));
              } else {
                d[c] = args[0];
              }
            };
          (window as any).mixpanel = d;
          d.push = [];
          d.loaded = false;
          d.version = '2.0';
          d.queue = [];
          a = b.createElement('script');
          a.type = 'text/javascript';
          a.async = true;
          a.src = 'https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js';
          e = b.getElementsByTagName('script')[0];
          e.parentNode!.insertBefore(a, e);

          a.onload = () => {
            if (window.mixpanel && typeof window.mixpanel === 'object') {
              this.scriptLoaded = true;
              resolve();
            } else {
              reject(new Error('Mixpanel SDK loaded but not available'));
            }
          };

          a.onerror = () => {
            reject(new Error('Failed to load Mixpanel SDK'));
          };
        } else {
          resolve();
        }
      };
      loadScript(window, document);
    });
  }

  private sanitizeEventName(name: string): string {
    // Mixpanel has a 255 character limit for event names
    return name.substring(0, 255);
  }

  private sanitizePropertyKey(key: string): string {
    // Mixpanel has a 255 character limit for property keys
    return key.substring(0, 255);
  }

  private sanitizePropertyValue(value: any): any {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === 'string') {
      // Mixpanel has a 255 character limit for string values
      return value.substring(0, 255);
    }

    if (Array.isArray(value)) {
      // Mixpanel supports arrays but recommends keeping them small
      return value.slice(0, 255).map((item) => this.sanitizePropertyValue(item));
    }

    if (typeof value === 'object' && value instanceof Date) {
      // Convert dates to ISO string
      return value.toISOString();
    }

    if (typeof value === 'object') {
      // Mixpanel supports nested objects to one level
      const sanitized: Record<string, any> = {};
      Object.entries(value).forEach(([k, v]) => {
        const sanitizedKey = this.sanitizePropertyKey(k);
        // Don't nest objects deeper than one level
        const sanitizedValue =
          typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date)
            ? JSON.stringify(v)
            : this.sanitizePropertyValue(v);
        sanitized[sanitizedKey] = sanitizedValue;
      });
      return sanitized;
    }

    return value;
  }

  private sanitizeProperties(properties: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};

    Object.entries(properties).forEach(([key, value]) => {
      const sanitizedKey = this.sanitizePropertyKey(key);
      const sanitizedValue = this.sanitizePropertyValue(value);

      if (sanitizedValue !== undefined) {
        sanitized[sanitizedKey] = sanitizedValue;
      }
    });

    return sanitized;
  }
}
