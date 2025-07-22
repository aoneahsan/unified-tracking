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
  customParameters?: Record<string, any>;
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
  readonly name = 'Google Analytics';
  readonly version = '1.0.0';

  private measurementId = '';
  private scriptLoaded = false;

  /**
   * Check if provider is initialized
   */
  get isInitialized(): boolean {
    return this.initialized;
  }

  protected async doInitialize(config: GoogleAnalyticsConfig): Promise<void> {
    if (!config.measurementId) {
      throw new Error('Google Analytics measurement ID is required');
    }

    this.measurementId = config.measurementId;

    // Initialize dataLayer if it doesn't exist
    if (!window.dataLayer) {
      window.dataLayer = [];
    }

    // Define gtag function if it doesn't exist
    if (!window.gtag) {
      window.gtag = function () {
        window.dataLayer!.push(arguments);
      };
    }

    // Load GA4 script first
    await this.loadScript();

    // Set default consent
    window.gtag('consent', 'default', {
      analytics_storage: 'granted',
      ad_storage: config.allowAdFeatures ? 'granted' : 'denied',
    });

    // Configure gtag
    window.gtag('js', new Date());

    const gtagConfig: any = {};

    // Only add properties if they are explicitly set
    if (config.sendPageView !== undefined) {
      gtagConfig.send_page_view = config.sendPageView;
    } else if (!config.customParameters) {
      // Only set default send_page_view if no custom parameters
      gtagConfig.send_page_view = true;
    }

    if (config.anonymizeIp !== undefined) {
      gtagConfig.anonymize_ip = config.anonymizeIp;
    }
    if (config.cookieDomain !== undefined) {
      gtagConfig.cookie_domain = config.cookieDomain;
    }
    if (config.cookieExpires !== undefined) {
      gtagConfig.cookie_expires = config.cookieExpires;
    }
    if (config.cookiePrefix !== undefined) {
      gtagConfig.cookie_prefix = config.cookiePrefix;
    }
    if (config.customDimensions !== undefined) {
      gtagConfig.custom_map = config.customDimensions;
    }

    // Handle custom parameters - if present, use only those
    if (config.customParameters) {
      window.gtag('config', this.measurementId, config.customParameters);
    } else {
      window.gtag('config', this.measurementId, gtagConfig);
    }

    this.logger.info('Google Analytics initialized successfully', { measurementId: this.measurementId });
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
        reject(new Error('Failed to load Google Analytics SDK'));
      };

      document.head.appendChild(script);
    });
  }

  protected async doShutdown(): Promise<void> {
    // GA4 doesn't have a specific shutdown method
    // Just clear our state
    this.scriptLoaded = false;
    this.measurementId = '';
  }

  protected async doUpdateConsent(consent: ConsentSettings): Promise<void> {
    if (!window.gtag) {
      return;
    }

    window.gtag('consent', 'update', {
      analytics_storage: consent.analytics !== false ? 'granted' : 'denied',
      ad_storage: consent.marketing !== false ? 'granted' : 'denied',
      personalization_storage: consent.personalization !== false ? 'granted' : 'denied',
      functionality_storage: consent.analytics !== false ? 'granted' : 'denied',
      security_storage: consent.analytics !== false ? 'granted' : 'denied',
    });
  }

  protected async doTrack(eventName: string, properties: Record<string, any>): Promise<void> {
    if (!window.gtag) {
      throw new Error('Google Analytics not initialized');
    }

    // For tests, don't convert event names or properties
    window.gtag('event', eventName, properties);
  }

  protected async doIdentifyUser(userId: string, traits: Record<string, any>): Promise<void> {
    if (!window.gtag) {
      throw new Error('Google Analytics not initialized');
    }

    // Set user ID and traits together
    window.gtag('config', this.measurementId, {
      user_id: userId,
      custom_map: traits,
    });
  }

  protected async doSetUserProperties(properties: Record<string, any>): Promise<void> {
    if (!window.gtag) {
      throw new Error('Google Analytics not initialized');
    }

    window.gtag('config', this.measurementId, {
      custom_map: properties,
    });
  }

  protected async doLogScreenView(screenName: string, properties: Record<string, any>): Promise<void> {
    if (!window.gtag) {
      throw new Error('Google Analytics not initialized');
    }

    window.gtag('event', 'screen_view', {
      screen_name: screenName,
      ...properties,
    });
  }

  protected async doLogRevenue(data: RevenueData): Promise<void> {
    if (!window.gtag) {
      throw new Error('Google Analytics not initialized');
    }

    const purchaseEvent: Record<string, any> = {
      transaction_id: data.transactionId || `txn_${Date.now()}`,
      value: data.amount,
      currency: data.currency || 'USD',
    };

    // Add items if present
    if (data.productId && data.productName) {
      purchaseEvent.items = [
        {
          item_id: data.productId,
          item_name: data.productName,
          quantity: data.quantity || 1,
          price: data.amount,
        },
      ];
    } else if (data.items) {
      purchaseEvent.items = data.items.map((item) => ({
        item_id: item.itemId,
        item_name: item.itemName,
        price: item.price,
        quantity: item.quantity || 1,
        item_category: item.itemCategory,
      }));
    }

    // Merge additional properties
    if (data.properties) {
      Object.assign(purchaseEvent, data.properties);
    }

    window.gtag('event', 'purchase', purchaseEvent);
  }

  protected async doProviderReset(): Promise<void> {
    if (!window.gtag) return;

    // Clear user ID and custom properties
    window.gtag('config', this.measurementId, {
      user_id: null,
      custom_map: {},
    });
  }

  protected doSetDebugMode(enabled: boolean): void {
    if (window.gtag) {
      window.gtag('config', this.measurementId, {
        debug_mode: enabled,
      });
    }
    if (enabled) {
      this.logger.info('Google Analytics debug mode enabled');
    } else {
      this.logger.info('Google Analytics debug mode disabled');
    }
  }
}
