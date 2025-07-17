import { BaseAnalyticsProvider } from '../../base-analytics-provider';
import { RegisterProvider } from '../../registry';
import type { ProviderConfig, ConsentSettings } from '../../../types/provider';
import type { RevenueData } from '../../../definitions';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

interface GoogleAnalyticsConfig extends ProviderConfig {
  measurementId: string;
  sendPageView?: boolean;
  anonymizeIp?: boolean;
  allowAdFeatures?: boolean;
  cookieDomain?: string;
  cookieExpires?: number;
  cookiePrefix?: string;
  customDimensions?: Record<string, any>;
  customMetrics?: Record<string, any>;
}

@RegisterProvider({
  id: 'google-analytics',
  name: 'Google Analytics 4',
  type: 'analytics',
  version: '1.0.0',
  supportedPlatforms: ['web'],
  configSchema: {
    measurementId: { type: 'string', required: true },
    sendPageView: { type: 'boolean', default: true },
    anonymizeIp: { type: 'boolean', default: false },
    allowAdFeatures: { type: 'boolean', default: true },
  },
})
export class GoogleAnalyticsProvider extends BaseAnalyticsProvider {
  readonly id = 'google-analytics';
  readonly name = 'Google Analytics 4';
  readonly version = '1.0.0';

  private measurementId = '';
  private scriptLoaded = false;
  private gtagConfig: GoogleAnalyticsConfig | null = null;

  protected async doInitialize(config: GoogleAnalyticsConfig): Promise<void> {
    if (!config.measurementId) {
      throw new Error('Google Analytics measurementId is required');
    }

    this.measurementId = config.measurementId;
    this.gtagConfig = config;

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];

    // Define gtag function
    window.gtag = function() {
      window.dataLayer!.push(arguments);
    };

    // Set default consent
    window.gtag('consent', 'default', {
      analytics_storage: 'granted',
      ad_storage: config.allowAdFeatures ? 'granted' : 'denied',
    });

    // Configure gtag
    window.gtag('js', new Date());
    window.gtag('config', this.measurementId, {
      send_page_view: config.sendPageView !== false,
      anonymize_ip: config.anonymizeIp === true,
      cookie_domain: config.cookieDomain,
      cookie_expires: config.cookieExpires,
      cookie_prefix: config.cookiePrefix,
      custom_map: config.customDimensions,
    });

    // Load GA4 script
    await this.loadScript();

    this.logger.info('Google Analytics 4 initialized', { measurementId: this.measurementId });
  }

  private async loadScript(): Promise<void> {
    if (this.scriptLoaded) {
      return;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
      
      script.onload = () => {
        this.scriptLoaded = true;
        resolve();
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load Google Analytics script'));
      };

      document.head.appendChild(script);
    });
  }

  protected async doShutdown(): Promise<void> {
    // GA4 doesn't have a specific shutdown method
    // Just clear our state
    this.scriptLoaded = false;
    this.measurementId = '';
    this.gtagConfig = null;
  }

  protected async doUpdateConsent(consent: ConsentSettings): Promise<void> {
    if (!window.gtag) {
      return;
    }

    window.gtag('consent', 'update', {
      analytics_storage: consent.analytics !== false ? 'granted' : 'denied',
      ad_storage: consent.advertising !== false ? 'granted' : 'denied',
    });
  }

  protected async doTrack(eventName: string, properties: Record<string, any>): Promise<void> {
    if (!window.gtag) {
      throw new Error('Google Analytics not loaded');
    }

    // Convert event name to GA4 format (snake_case)
    const ga4EventName = this.convertToGA4EventName(eventName);
    
    // Filter and convert properties to GA4 format
    const ga4Properties = this.convertToGA4Properties(properties);

    window.gtag('event', ga4EventName, ga4Properties);
  }

  protected async doIdentifyUser(userId: string, traits: Record<string, any>): Promise<void> {
    if (!window.gtag) {
      throw new Error('Google Analytics not loaded');
    }

    // Set user ID
    window.gtag('config', this.measurementId, {
      user_id: userId,
    });

    // Set user properties
    if (Object.keys(traits).length > 0) {
      window.gtag('event', 'user_traits', {
        user_properties: traits,
      });
    }
  }

  protected async doSetUserProperties(properties: Record<string, any>): Promise<void> {
    if (!window.gtag) {
      throw new Error('Google Analytics not loaded');
    }

    window.gtag('event', 'user_properties_update', {
      user_properties: properties,
    });
  }

  protected async doLogScreenView(screenName: string, properties: Record<string, any>): Promise<void> {
    if (!window.gtag) {
      throw new Error('Google Analytics not loaded');
    }

    window.gtag('event', 'screen_view', {
      screen_name: screenName,
      ...this.convertToGA4Properties(properties),
    });
  }

  protected async doLogRevenue(data: RevenueData): Promise<void> {
    if (!window.gtag) {
      throw new Error('Google Analytics not loaded');
    }

    const purchaseEvent: Record<string, any> = {
      currency: data.currency || 'USD',
      value: data.amount,
    };

    if (data.transactionId) {
      purchaseEvent.transaction_id = data.transactionId;
    }

    if (data.items) {
      purchaseEvent.items = data.items.map(item => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity || 1,
        item_category: item.category,
      }));
    }

    window.gtag('event', 'purchase', purchaseEvent);
  }

  protected async doProviderReset(): Promise<void> {
    // GA4 doesn't have a reset method
    // Could clear user properties if needed
  }

  protected doSetDebugMode(enabled: boolean): void {
    if (window.gtag) {
      window.gtag('config', this.measurementId, {
        debug_mode: enabled,
      });
    }
  }

  /**
   * Convert event name to GA4 format
   */
  private convertToGA4EventName(eventName: string): string {
    // GA4 recommends snake_case for event names
    return eventName
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase()
      .replace(/^_/, '')
      .replace(/[^a-z0-9_]/g, '_')
      .substring(0, 40); // GA4 limit
  }

  /**
   * Convert properties to GA4 format
   */
  private convertToGA4Properties(properties: Record<string, any>): Record<string, any> {
    const ga4Properties: Record<string, any> = {};

    for (const [key, value] of Object.entries(properties)) {
      // Convert key to snake_case
      const ga4Key = key
        .replace(/([A-Z])/g, '_$1')
        .toLowerCase()
        .replace(/^_/, '')
        .replace(/[^a-z0-9_]/g, '_')
        .substring(0, 40); // GA4 limit

      // GA4 has specific value type requirements
      if (value !== null && value !== undefined) {
        ga4Properties[ga4Key] = value;
      }
    }

    return ga4Properties;
  }
}