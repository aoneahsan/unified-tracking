import type { AnalyticsProvider } from '../../base';
import type { ProviderConfig, ProviderType, ConsentSettings } from '../../../types/provider';
import type { RevenueData } from '../../../definitions';
import { RegisterProvider } from '../../registry';
import { Logger } from '../../../utils/logger';

interface AmplitudeConfig {
  apiKey: string;
  serverUrl?: string;
  defaultTracking?: {
    sessions?: boolean;
    pageViews?: boolean;
    formInteractions?: boolean;
    fileDownloads?: boolean;
  };
  trackingOptions?: {
    disableCookies?: boolean;
    deviceId?: string;
    userId?: string;
    sessionTimeout?: number;
    minTimeBetweenSessionsMillis?: number;
  };
}

interface AmplitudeInstance {
  init: (apiKey: string, userId?: string, options?: any) => void;
  setUserId: (userId: string | null) => void;
  setDeviceId: (deviceId: string) => void;
  setUserProperties: (properties: any) => void;
  track: (eventName: string, eventProperties?: any) => void;
  revenue: (revenue: any) => void;
  setOptOut: (optOut: boolean) => void;
  reset: () => void;
  setServerUrl: (url: string) => void;
  logEvent: (eventName: string, eventProperties?: any) => void;
  identify: (identify: any) => void;
  Identify: new () => any;
  Revenue: new () => any;
}

declare global {
  interface Window {
    amplitude?: AmplitudeInstance;
  }
}

@RegisterProvider({
  id: 'amplitude',
  name: 'Amplitude Analytics',
  type: 'analytics' as ProviderType,
  version: '1.0.0',
  supportedPlatforms: ['web', 'ios', 'android'],
})
export class AmplitudeAnalyticsProvider implements AnalyticsProvider {
  readonly id = 'amplitude';
  readonly name = 'Amplitude Analytics';
  readonly type: ProviderType = 'analytics';
  readonly version = '1.0.0';
  
  private logger: Logger;
  private amplitude?: AmplitudeInstance;
  private config: ProviderConfig = {};
  private ready = false;
  private enabled = true;
  private userId?: string;

  constructor() {
    this.logger = new Logger('AmplitudeAnalytics');
  }

  async initialize(config: ProviderConfig): Promise<void> {
    this.config = config;
    
    if (config.enabled === false) {
      this.enabled = false;
      this.logger.info('Amplitude Analytics disabled by configuration');
      return;
    }

    const amplitudeConfig = config as AmplitudeConfig;

    if (!amplitudeConfig.apiKey) {
      throw new Error('Amplitude API key is required');
    }

    try {
      // Load Amplitude SDK
      await this.loadAmplitudeSDK();

      // Initialize Amplitude
      if (window.amplitude) {
        this.amplitude = window.amplitude;

        // Set server URL if provided
        if (amplitudeConfig.serverUrl) {
          this.amplitude.setServerUrl(amplitudeConfig.serverUrl);
        }

        // Initialize with options
        const options: any = {};
        
        if (amplitudeConfig.trackingOptions) {
          Object.assign(options, amplitudeConfig.trackingOptions);
        }

        if (amplitudeConfig.defaultTracking) {
          options.defaultTracking = amplitudeConfig.defaultTracking;
        }

        this.amplitude.init(
          amplitudeConfig.apiKey,
          amplitudeConfig.trackingOptions?.userId || undefined,
          options
        );

        this.ready = true;
        this.logger.info('Amplitude Analytics initialized successfully');
      } else {
        throw new Error('Failed to load Amplitude SDK');
      }
    } catch (error) {
      this.logger.error('Failed to initialize Amplitude Analytics', error);
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    this.ready = false;
    this.amplitude = undefined;
    this.logger.info('Amplitude Analytics shut down');
  }

  async updateConsent(consent: ConsentSettings): Promise<void> {
    if (!this.amplitude) return;

    if (consent.analytics === false) {
      this.amplitude.setOptOut(true);
      this.logger.info('Amplitude Analytics collection disabled');
    } else if (consent.analytics === true) {
      this.amplitude.setOptOut(false);
      this.logger.info('Amplitude Analytics collection enabled');
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
    if (this.amplitude) {
      this.amplitude.setOptOut(!enabled);
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  setDebugMode(enabled: boolean): void {
    // Amplitude doesn't have a specific debug mode
    // Debug logging is handled at initialization
    if (enabled) {
      this.logger.debug('Debug mode enabled');
    }
  }

  async reset(): Promise<void> {
    if (!this.isReady()) return;

    try {
      this.userId = undefined;
      this.amplitude!.reset();
      this.logger.info('Amplitude Analytics reset');
    } catch (error) {
      this.logger.error('Failed to reset Amplitude Analytics', error);
    }
  }

  async track(eventName: string, properties?: Record<string, any>): Promise<void> {
    await this.trackEvent(eventName, properties);
  }

  async trackEvent(eventName: string, properties?: Record<string, any>): Promise<void> {
    if (!this.isReady()) {
      this.logger.warn('Amplitude Analytics not ready, event not tracked:', eventName);
      return;
    }

    try {
      const sanitizedName = this.sanitizeEventName(eventName);
      const sanitizedProperties = properties ? this.sanitizeProperties(properties) : undefined;

      this.amplitude!.track(sanitizedName, sanitizedProperties);
      this.logger.debug('Event tracked:', sanitizedName, sanitizedProperties);
    } catch (error) {
      this.logger.error('Failed to track event', error);
      throw error;
    }
  }

  async identifyUser(userId: string, traits?: Record<string, any>): Promise<void> {
    if (!this.isReady()) {
      this.logger.warn('Amplitude Analytics not ready, user not identified');
      return;
    }

    try {
      this.userId = userId;
      this.amplitude!.setUserId(userId);

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
      this.logger.warn('Amplitude Analytics not ready, user properties not set');
      return;
    }

    try {
      const identify = new this.amplitude!.Identify();
      
      Object.entries(properties).forEach(([key, value]) => {
        const sanitizedKey = this.sanitizePropertyKey(key);
        const sanitizedValue = this.sanitizePropertyValue(value);
        
        if (sanitizedValue !== undefined) {
          identify.set(sanitizedKey, sanitizedValue);
        }
      });

      this.amplitude!.identify(identify);
      this.logger.debug('User properties set:', properties);
    } catch (error) {
      this.logger.error('Failed to set user properties', error);
      throw error;
    }
  }

  async logRevenue(data: RevenueData): Promise<void> {
    if (!this.isReady()) {
      this.logger.warn('Amplitude Analytics not ready, revenue not logged');
      return;
    }

    try {
      const revenueObj = new this.amplitude!.Revenue()
        .setPrice(data.amount)
        .setQuantity(data.quantity || 1);

      if (data.currency) {
        revenueObj.setRevenue(data.amount * (data.quantity || 1));
      }

      if (data.productId) {
        revenueObj.setProductId(data.productId);
      }

      if (data.productName) {
        revenueObj.setEventProperties({ productName: data.productName });
      }

      this.amplitude!.revenue(revenueObj);
      this.logger.debug('Revenue logged:', data);
    } catch (error) {
      this.logger.error('Failed to log revenue', error);
      throw error;
    }
  }

  async logScreenView(screenName: string, properties?: Record<string, any>): Promise<void> {
    const eventProperties = {
      screen_name: screenName,
      ...properties
    };

    await this.trackEvent('Screen View', eventProperties);
  }


  private async loadAmplitudeSDK(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.amplitude) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.amplitude.com/libs/analytics-browser-2.3.8-min.js.gz';
      script.async = true;
      
      script.onload = () => {
        // Initialize amplitude global
        if ((window as any).amplitudeAnalytics) {
          window.amplitude = (window as any).amplitudeAnalytics;
          resolve();
        } else {
          reject(new Error('Amplitude SDK loaded but not available'));
        }
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load Amplitude SDK'));
      };

      document.head.appendChild(script);
    });
  }


  private sanitizeEventName(name: string): string {
    // Amplitude has a 1024 character limit for event names
    return name.substring(0, 1024);
  }

  private sanitizePropertyKey(key: string): string {
    // Amplitude has a 1024 character limit for property keys
    return key.substring(0, 1024);
  }

  private sanitizePropertyValue(value: any): any {
    if (value === null || value === undefined) {
      return undefined;
    }

    if (typeof value === 'string') {
      // Amplitude has a 1024 character limit for string values
      return value.substring(0, 1024);
    }

    if (Array.isArray(value)) {
      // Amplitude supports arrays
      return value.map(item => this.sanitizePropertyValue(item));
    }

    if (typeof value === 'object') {
      // Amplitude supports nested objects
      const sanitized: Record<string, any> = {};
      Object.entries(value).forEach(([k, v]) => {
        const sanitizedValue = this.sanitizePropertyValue(v);
        if (sanitizedValue !== undefined) {
          sanitized[this.sanitizePropertyKey(k)] = sanitizedValue;
        }
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