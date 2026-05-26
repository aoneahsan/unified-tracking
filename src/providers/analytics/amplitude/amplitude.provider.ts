import { BaseAnalyticsProvider } from '../../base-analytics-provider.js';
import { RegisterProvider } from '../../registry.js';
import type { ProviderConfig, ProviderType, ConsentSettings } from '../../../types/provider.js';
import type { RevenueData } from '../../../definitions.js';

interface AmplitudeConfig extends ProviderConfig {
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
export class AmplitudeAnalyticsProvider extends BaseAnalyticsProvider {
  readonly id = 'amplitude';
  readonly name = 'Amplitude Analytics';
  readonly version = '1.0.0';

  private amplitude?: AmplitudeInstance;

  protected async doInitialize(config: ProviderConfig): Promise<void> {
    // Preserve original behavior: when disabled by configuration, skip SDK setup entirely.
    if (!this.enabled) {
      this.logger.info('Amplitude Analytics disabled by configuration');
      return;
    }

    const amplitudeConfig = config as AmplitudeConfig;

    if (!amplitudeConfig.apiKey) {
      throw new Error('Amplitude API key is required');
    }

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

      this.amplitude.init(amplitudeConfig.apiKey, amplitudeConfig.trackingOptions?.userId || undefined, options);

      this.logger.info('Amplitude Analytics initialized successfully');
    } else {
      throw new Error('Failed to load Amplitude SDK');
    }
  }

  protected async doShutdown(): Promise<void> {
    this.amplitude = undefined;
    this.logger.info('Amplitude Analytics shut down');
  }

  protected async doUpdateConsent(consent: ConsentSettings): Promise<void> {
    if (!this.amplitude) return;

    if (consent.analytics === false) {
      this.amplitude.setOptOut(true);
      this.logger.info('Amplitude Analytics collection disabled');
    } else if (consent.analytics === true) {
      this.amplitude.setOptOut(false);
      this.logger.info('Amplitude Analytics collection enabled');
    }
  }

  protected doSetDebugMode(enabled: boolean): void {
    // Amplitude doesn't have a specific debug mode.
    // Debug logging is handled at initialization.
    if (enabled) {
      this.logger.debug('Debug mode enabled');
    }
  }

  protected async doProviderReset(): Promise<void> {
    if (!this.amplitude) return;

    this.amplitude.reset();
    this.logger.info('Amplitude Analytics reset');
  }

  protected async doTrack(eventName: string, properties: Record<string, any>): Promise<void> {
    if (!this.amplitude) {
      throw new Error('Amplitude not initialized');
    }

    const sanitizedName = this.sanitizeEventName(eventName);
    // Preserve original behavior: pass `undefined` (not an empty object) to the SDK when there
    // are no properties. The base merges super-properties into a `{}` for empty calls, so check size.
    const sanitizedProperties =
      properties && Object.keys(properties).length > 0 ? this.sanitizeProperties(properties) : undefined;

    this.amplitude.track(sanitizedName, sanitizedProperties);
    this.logger.debug('Event tracked:', sanitizedName, sanitizedProperties);
  }

  protected async doIdentifyUser(userId: string, traits: Record<string, any>): Promise<void> {
    if (!this.amplitude) {
      throw new Error('Amplitude not initialized');
    }

    this.amplitude.setUserId(userId);

    if (Object.keys(traits).length > 0) {
      await this.doSetUserProperties(traits);
    }

    this.logger.debug('User identified:', userId);
  }

  protected async doSetUserProperties(properties: Record<string, any>): Promise<void> {
    if (!this.amplitude) {
      throw new Error('Amplitude not initialized');
    }

    const identify = new this.amplitude.Identify();

    Object.entries(properties).forEach(([key, value]) => {
      const sanitizedKey = this.sanitizePropertyKey(key);
      const sanitizedValue = this.sanitizePropertyValue(value);

      if (sanitizedValue !== undefined) {
        identify.set(sanitizedKey, sanitizedValue);
      }
    });

    this.amplitude.identify(identify);
    this.logger.debug('User properties set:', properties);
  }

  protected async doLogRevenue(data: RevenueData): Promise<void> {
    if (!this.amplitude) {
      throw new Error('Amplitude not initialized');
    }

    const revenueObj = new this.amplitude.Revenue().setPrice(data.amount).setQuantity(data.quantity || 1);

    if (data.currency) {
      revenueObj.setRevenue(data.amount * (data.quantity || 1));
    }

    if (data.productId) {
      revenueObj.setProductId(data.productId);
    }

    if (data.productName) {
      revenueObj.setEventProperties({ productName: data.productName });
    }

    this.amplitude.revenue(revenueObj);
    this.logger.debug('Revenue logged:', data);
  }

  protected async doLogScreenView(screenName: string, properties: Record<string, any>): Promise<void> {
    const eventProperties = {
      screen_name: screenName,
      ...properties,
    };

    await this.doTrack('Screen View', eventProperties);
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
        // The Amplitude Browser SDK 2.x UMD bundle attaches to window.amplitude
        // (not window.amplitudeAnalytics, which previously always failed here).
        if (window.amplitude) {
          resolve();
        } else {
          reject(new Error('Amplitude SDK loaded but window.amplitude is not available'));
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
      return value.map((item) => this.sanitizePropertyValue(item));
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
