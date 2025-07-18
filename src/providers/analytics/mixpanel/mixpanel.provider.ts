import { 
  AnalyticsProvider, 
  TrackingEvent, 
  UserProperties, 
  RevenueData,
  ConsentSettings 
} from '../../../types/provider';
import { RegisterProvider } from '../../../decorators/register-provider';
import { ProviderType } from '../../../types/common';

interface MixpanelConfig {
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
  has_opted_out_tracking: () => boolean;
  clear_opt_in_out_tracking: () => void;
  set_config: (config: any) => void;
  get_config: (propertyName?: string) => any;
  track_pageview: (properties?: any) => void;
  track_links: (selector: string, eventName: string, properties?: any) => void;
  track_forms: (selector: string, eventName: string, properties?: any) => void;
  time_event: (eventName: string) => void;
  register: (properties: any, days?: number) => void;
  register_once: (properties: any, defaultValue?: any, days?: number) => void;
  unregister: (property: string) => void;
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
})
export class MixpanelAnalyticsProvider implements AnalyticsProvider {
  readonly id = 'mixpanel';
  readonly name = 'Mixpanel Analytics';
  readonly type: ProviderType = 'analytics';
  
  private mixpanel?: MixpanelInstance;
  private config?: MixpanelConfig;
  private isInitialized = false;
  private consentSettings: ConsentSettings = {
    analytics: true,
    errorTracking: true,
    marketing: true,
    personalization: true
  };

  async initialize(config: any): Promise<void> {
    this.config = config as MixpanelConfig;

    if (!this.config.token) {
      throw new Error('Mixpanel token is required');
    }

    // Load Mixpanel SDK
    await this.loadMixpanelSDK();

    // Initialize Mixpanel
    if (window.mixpanel) {
      this.mixpanel = window.mixpanel;

      const initConfig: any = {
        debug: this.config.debug || false,
        track_pageview: this.config.trackAutomaticEvents !== false,
        persistence: this.config.persistence || 'localStorage',
        persistence_name: this.config.persistencePrefix,
        cookie_domain: this.config.cookieDomain,
        cross_site_cookie: this.config.crossSiteCookie,
        secure_cookie: this.config.secureCookie,
        ip: this.config.ipTracking !== false,
        property_blacklist: this.config.propertyBlocklist,
        session_duration: this.config.sessionDuration
      };

      if (this.config.apiHost) {
        initConfig.api_host = this.config.apiHost;
      }

      this.mixpanel.init(this.config.token, initConfig);
      this.isInitialized = true;
    } else {
      throw new Error('Failed to load Mixpanel SDK');
    }
  }

  async trackEvent(eventName: string, properties?: Record<string, any>): Promise<void> {
    this.ensureInitialized();
    
    if (!this.consentSettings.analytics) {
      return;
    }

    const sanitizedName = this.sanitizeEventName(eventName);
    const sanitizedProperties = properties ? this.sanitizeProperties(properties) : undefined;

    return new Promise((resolve) => {
      this.mixpanel!.track(sanitizedName, sanitizedProperties, () => resolve());
    });
  }

  async identifyUser(userId: string, properties?: UserProperties): Promise<void> {
    this.ensureInitialized();
    
    if (!this.consentSettings.analytics) {
      return;
    }

    // Set the distinct ID
    this.mixpanel!.identify(userId);

    // Set user properties if provided
    if (properties) {
      await this.setUserProperties(properties);
    }
  }

  async setUserProperties(properties: UserProperties): Promise<void> {
    this.ensureInitialized();
    
    if (!this.consentSettings.analytics || !this.consentSettings.personalization) {
      return;
    }

    const sanitizedProperties = this.sanitizeProperties(properties);

    return new Promise((resolve) => {
      this.mixpanel!.people.set(sanitizedProperties, () => resolve());
    });
  }

  async logRevenue(revenue: RevenueData): Promise<void> {
    this.ensureInitialized();
    
    if (!this.consentSettings.analytics) {
      return;
    }

    const properties: Record<string, any> = {
      amount: revenue.amount,
      currency: revenue.currency || 'USD'
    };

    if (revenue.quantity) {
      properties.quantity = revenue.quantity;
    }

    if (revenue.productId) {
      properties.product_id = revenue.productId;
    }

    if (revenue.properties) {
      Object.assign(properties, this.sanitizeProperties(revenue.properties));
    }

    // Track as a revenue event
    await this.trackEvent('Revenue', properties);

    // Also track charge in people properties
    return new Promise((resolve) => {
      this.mixpanel!.people.track_charge(revenue.amount, properties, () => resolve());
    });
  }

  async logScreenView(screenName: string, properties?: Record<string, any>): Promise<void> {
    const eventProperties = {
      screen_name: screenName,
      ...properties
    };

    await this.trackEvent('Screen View', eventProperties);
  }

  async handleConsentChange(settings: ConsentSettings): Promise<void> {
    this.consentSettings = { ...settings };
    
    if (this.isInitialized && this.mixpanel) {
      if (!settings.analytics) {
        // Opt out of tracking
        this.mixpanel.opt_out_tracking();
      } else {
        // Opt back in
        this.mixpanel.opt_in_tracking();
      }
    }
  }

  async reset(): Promise<void> {
    this.ensureInitialized();
    
    this.mixpanel!.reset();
  }

  async setDebugMode(enabled: boolean): Promise<void> {
    this.ensureInitialized();
    
    this.mixpanel!.set_config({ debug: enabled });
  }

  private async loadMixpanelSDK(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.mixpanel) {
        resolve();
        return;
      }

      // Mixpanel snippet
      (function(f: any, b: Document) {
        if (!b.__SV) {
          let a: any, e: any, g: any, d: any = window.mixpanel = function(c: string, ...args: any[]) {
            d.push ? d.push([c].concat(args)) : 
            d[c] = args[0];
          };
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
      })(window, document);
    });
  }

  private ensureInitialized(): void {
    if (!this.isInitialized || !this.mixpanel) {
      throw new Error('Mixpanel provider not initialized');
    }
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
      return value.slice(0, 255).map(item => this.sanitizePropertyValue(item));
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
        const sanitizedValue = typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date) 
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