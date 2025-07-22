import type { AnalyticsProvider } from '../../base';
import type { ProviderConfig, ProviderType, ConsentSettings } from '../../../types/provider';
import type { RevenueData } from '../../../definitions';
import { RegisterProvider } from '../../registry';
import { Logger } from '../../../utils/logger';

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
export class FirebaseAnalyticsProvider implements AnalyticsProvider {
  readonly id = 'firebase';
  readonly name = 'Firebase Analytics';
  readonly type: ProviderType = 'analytics';
  readonly version = '1.0.0';

  private logger: Logger;
  private config: ProviderConfig = {};
  private ready = false;
  private enabled = true;
  private analytics: any;

  constructor() {
    this.logger = new Logger('FirebaseAnalytics');
  }

  async initialize(config: ProviderConfig): Promise<void> {
    this.config = config;

    if (config.enabled === false) {
      this.enabled = false;
      this.logger.info('Firebase Analytics disabled by configuration');
      return;
    }

    try {
      if (typeof window !== 'undefined' && window.firebase) {
        const analytics = window.firebase.analytics;

        if (!analytics) {
          throw new Error('Firebase Analytics not found. Make sure to include Firebase Analytics in your app.');
        }

        this.analytics = analytics();

        if (config.debug) {
          this.setDebugMode(true);
        }

        this.ready = true;
        this.logger.info('Firebase Analytics initialized successfully');
      } else {
        throw new Error('Firebase not found. Make sure to initialize Firebase before using Firebase Analytics.');
      }
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Analytics', error);
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    this.ready = false;
    this.analytics = null;
    this.logger.info('Firebase Analytics shut down');
  }

  async updateConsent(consent: ConsentSettings): Promise<void> {
    if (!this.analytics) return;

    if (consent.analytics === false) {
      await this.analytics.setAnalyticsCollectionEnabled(false);
      this.logger.info('Firebase Analytics collection disabled');
    } else if (consent.analytics === true) {
      await this.analytics.setAnalyticsCollectionEnabled(true);
      this.logger.info('Firebase Analytics collection enabled');
    }
  }

  isReady(): boolean {
    return this.ready && this.enabled;
  }

  getConfig(): ProviderConfig {
    return this.config;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (this.analytics) {
      this.analytics.setAnalyticsCollectionEnabled(enabled);
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  setDebugMode(enabled: boolean): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        debug_mode: enabled,
      });
    }
  }

  async reset(): Promise<void> {
    if (!this.isReady()) return;

    try {
      await this.analytics.setUserId(null);
      this.logger.info('Firebase Analytics reset');
    } catch (error) {
      this.logger.error('Failed to reset Firebase Analytics', error);
    }
  }

  async track(eventName: string, properties?: Record<string, any>): Promise<void> {
    await this.trackEvent(eventName, properties);
  }

  async trackEvent(eventName: string, properties?: Record<string, any>): Promise<void> {
    if (!this.isReady()) {
      this.logger.warn('Firebase Analytics not ready, event not tracked:', eventName);
      return;
    }

    try {
      const cleanEventName = this.sanitizeEventName(eventName);
      const cleanProperties = this.sanitizeProperties(properties);

      await this.analytics.logEvent(cleanEventName, cleanProperties);
      this.logger.debug('Event tracked:', cleanEventName, cleanProperties);
    } catch (error) {
      this.logger.error('Failed to track event', error);
      throw error;
    }
  }

  async identifyUser(userId: string, traits?: Record<string, any>): Promise<void> {
    if (!this.isReady()) {
      this.logger.warn('Firebase Analytics not ready, user not identified');
      return;
    }

    try {
      await this.analytics.setUserId(userId);

      if (traits) {
        await this.setUserProperties(traits);
      }

      this.logger.debug('User identified:', userId);
    } catch (error) {
      this.logger.error('Failed to identify user', error);
      throw error;
    }
  }

  async setUserProperties(properties: Record<string, any>): Promise<void> {
    if (!this.isReady()) {
      this.logger.warn('Firebase Analytics not ready, user properties not set');
      return;
    }

    try {
      const cleanProperties = this.sanitizeProperties(properties);

      for (const [key, value] of Object.entries(cleanProperties)) {
        await this.analytics.setUserProperties({ [key]: value });
      }

      this.logger.debug('User properties set:', cleanProperties);
    } catch (error) {
      this.logger.error('Failed to set user properties', error);
      throw error;
    }
  }

  async logScreenView(screenName: string, properties?: Record<string, any>): Promise<void> {
    if (!this.isReady()) {
      this.logger.warn('Firebase Analytics not ready, screen view not logged');
      return;
    }

    try {
      const params = {
        screen_name: screenName,
        screen_class: properties?.screenClass || screenName,
        ...this.sanitizeProperties(properties),
      };

      await this.analytics.logEvent('screen_view', params);
      this.logger.debug('Screen view logged:', screenName, params);
    } catch (error) {
      this.logger.error('Failed to log screen view', error);
      throw error;
    }
  }

  async logRevenue(data: RevenueData): Promise<void> {
    if (!this.isReady()) {
      this.logger.warn('Firebase Analytics not ready, revenue not logged');
      return;
    }

    try {
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
    } catch (error) {
      this.logger.error('Failed to log revenue', error);
      throw error;
    }
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
