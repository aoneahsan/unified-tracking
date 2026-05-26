import { BaseAnalyticsProvider } from '../../base-analytics-provider.js';
import { RegisterProvider } from '../../registry.js';
import type { ProviderConfig, ProviderType, ConsentSettings } from '../../../types/provider.js';
import type { RevenueData } from '../../../definitions.js';

declare global {
  interface Window {
    firebase?: any;
    gtag?: (...args: any[]) => void;
  }
}

@RegisterProvider({
  id: 'firebase',
  name: 'Firebase Analytics',
  type: 'analytics' as ProviderType,
  version: '1.0.0',
  supportedPlatforms: ['web', 'ios', 'android'],
})
export class FirebaseAnalyticsProvider extends BaseAnalyticsProvider {
  readonly id = 'firebase';
  readonly name = 'Firebase Analytics';
  readonly version = '1.0.0';

  private analytics: any;

  protected async doInitialize(config: ProviderConfig): Promise<void> {
    // Preserve original behavior: when disabled by configuration, skip SDK setup entirely.
    if (!this.enabled) {
      this.logger.info('Firebase Analytics disabled by configuration');
      return;
    }

    if (typeof window !== 'undefined' && window.firebase) {
      const analytics = window.firebase.analytics;

      if (!analytics) {
        throw new Error('Firebase Analytics not found. Make sure to include Firebase Analytics in your app.');
      }

      this.analytics = analytics();

      if (config.debug) {
        this.doSetDebugMode(true);
      }

      this.logger.info('Firebase Analytics initialized successfully');
    } else {
      throw new Error('Firebase not found. Make sure to initialize Firebase before using Firebase Analytics.');
    }
  }

  protected async doShutdown(): Promise<void> {
    this.analytics = null;
    this.logger.info('Firebase Analytics shut down');
  }

  protected async doUpdateConsent(consent: ConsentSettings): Promise<void> {
    if (!this.analytics) return;

    if (consent.analytics === false) {
      await this.analytics.setAnalyticsCollectionEnabled(false);
      this.logger.info('Firebase Analytics collection disabled');
    } else if (consent.analytics === true) {
      await this.analytics.setAnalyticsCollectionEnabled(true);
      this.logger.info('Firebase Analytics collection enabled');
    }
  }

  protected doSetDebugMode(enabled: boolean): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        debug_mode: enabled,
      });
    }
  }

  protected async doProviderReset(): Promise<void> {
    if (!this.analytics) return;

    await this.analytics.setUserId(null);
    this.logger.info('Firebase Analytics reset');
  }

  protected async doTrack(eventName: string, properties: Record<string, any>): Promise<void> {
    if (!this.analytics) {
      throw new Error('Firebase Analytics not initialized');
    }

    const cleanEventName = this.sanitizeEventName(eventName);
    const cleanProperties = this.sanitizeProperties(properties);

    await this.analytics.logEvent(cleanEventName, cleanProperties);
    this.logger.debug('Event tracked:', cleanEventName, cleanProperties);
  }

  protected async doIdentifyUser(userId: string, traits: Record<string, any>): Promise<void> {
    if (!this.analytics) {
      throw new Error('Firebase Analytics not initialized');
    }

    await this.analytics.setUserId(userId);

    if (Object.keys(traits).length > 0) {
      await this.doSetUserProperties(traits);
    }

    this.logger.debug('User identified:', userId);
  }

  protected async doSetUserProperties(properties: Record<string, any>): Promise<void> {
    if (!this.analytics) {
      throw new Error('Firebase Analytics not initialized');
    }

    const cleanProperties = this.sanitizeProperties(properties);

    for (const [key, value] of Object.entries(cleanProperties)) {
      await this.analytics.setUserProperties({ [key]: value });
    }

    this.logger.debug('User properties set:', cleanProperties);
  }

  protected async doLogScreenView(screenName: string, properties: Record<string, any>): Promise<void> {
    if (!this.analytics) {
      throw new Error('Firebase Analytics not initialized');
    }

    const params = {
      screen_name: screenName,
      screen_class: properties?.screenClass || screenName,
      ...this.sanitizeProperties(properties),
    };

    await this.analytics.logEvent('screen_view', params);
    this.logger.debug('Screen view logged:', screenName, params);
  }

  protected async doLogRevenue(data: RevenueData): Promise<void> {
    if (!this.analytics) {
      throw new Error('Firebase Analytics not initialized');
    }

    const params: any = {
      value: data.amount,
      currency: data.currency || 'USD',
    };

    if (data.productId) {
      params.items = [
        {
          item_id: data.productId,
          item_name: data.productName || data.productId,
          quantity: data.quantity || 1,
          price: data.amount,
        },
      ];
    }

    const eventName = data.productId ? 'purchase' : 'earn_virtual_currency';
    await this.analytics.logEvent(eventName, params);

    this.logger.debug('Revenue logged:', params);
  }

  private sanitizeEventName(eventName: string): string {
    // Firebase has specific event name requirements
    return eventName
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .substring(0, 40);
  }

  private sanitizeProperties(properties?: Record<string, any>): Record<string, any> {
    if (!properties) return {};

    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(properties)) {
      // Firebase parameter names must be 40 characters or less
      const sanitizedKey = key
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '_')
        .substring(0, 40);

      // Firebase parameter values must be 100 characters or less for strings
      let sanitizedValue = value;
      if (typeof value === 'string' && value.length > 100) {
        sanitizedValue = value.substring(0, 100);
      }

      sanitized[sanitizedKey] = sanitizedValue;
    }

    return sanitized;
  }
}
