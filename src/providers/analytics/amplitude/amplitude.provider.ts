import { 
  AnalyticsProvider, 
  TrackingEvent, 
  UserProperties, 
  RevenueData,
  ConsentSettings 
} from '../../../types/provider';
import { RegisterProvider } from '../../../decorators/register-provider';
import { ProviderType } from '../../../types/common';

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
  
  private amplitude?: AmplitudeInstance;
  private config?: AmplitudeConfig;
  private isInitialized = false;
  private consentSettings: ConsentSettings = {
    analytics: true,
    errorTracking: true,
    marketing: true,
    personalization: true
  };

  async initialize(config: any): Promise<void> {
    this.config = config as AmplitudeConfig;

    if (!this.config.apiKey) {
      throw new Error('Amplitude API key is required');
    }

    // Load Amplitude SDK
    await this.loadAmplitudeSDK();

    // Initialize Amplitude
    if (window.amplitude) {
      this.amplitude = window.amplitude;

      // Set server URL if provided
      if (this.config.serverUrl) {
        this.amplitude.setServerUrl(this.config.serverUrl);
      }

      // Initialize with options
      const options: any = {};
      
      if (this.config.trackingOptions) {
        Object.assign(options, this.config.trackingOptions);
      }

      if (this.config.defaultTracking) {
        options.defaultTracking = this.config.defaultTracking;
      }

      this.amplitude.init(
        this.config.apiKey,
        this.config.trackingOptions?.userId || undefined,
        options
      );

      this.isInitialized = true;
    } else {
      throw new Error('Failed to load Amplitude SDK');
    }
  }

  async trackEvent(eventName: string, properties?: Record<string, any>): Promise<void> {
    this.ensureInitialized();
    
    if (!this.consentSettings.analytics) {
      return;
    }

    const sanitizedName = this.sanitizeEventName(eventName);
    const sanitizedProperties = properties ? this.sanitizeProperties(properties) : undefined;

    this.amplitude!.track(sanitizedName, sanitizedProperties);
  }

  async identifyUser(userId: string, properties?: UserProperties): Promise<void> {
    this.ensureInitialized();
    
    if (!this.consentSettings.analytics) {
      return;
    }

    this.amplitude!.setUserId(userId);

    if (properties) {
      const identify = new this.amplitude!.Identify();
      
      // Set user properties
      Object.entries(properties).forEach(([key, value]) => {
        const sanitizedKey = this.sanitizePropertyKey(key);
        const sanitizedValue = this.sanitizePropertyValue(value);
        
        if (sanitizedValue !== undefined) {
          identify.set(sanitizedKey, sanitizedValue);
        }
      });

      this.amplitude!.identify(identify);
    }
  }

  async setUserProperties(properties: UserProperties): Promise<void> {
    this.ensureInitialized();
    
    if (!this.consentSettings.analytics || !this.consentSettings.personalization) {
      return;
    }

    const identify = new this.amplitude!.Identify();
    
    Object.entries(properties).forEach(([key, value]) => {
      const sanitizedKey = this.sanitizePropertyKey(key);
      const sanitizedValue = this.sanitizePropertyValue(value);
      
      if (sanitizedValue !== undefined) {
        identify.set(sanitizedKey, sanitizedValue);
      }
    });

    this.amplitude!.identify(identify);
  }

  async logRevenue(revenue: RevenueData): Promise<void> {
    this.ensureInitialized();
    
    if (!this.consentSettings.analytics) {
      return;
    }

    const revenueObj = new this.amplitude!.Revenue()
      .setPrice(revenue.amount)
      .setQuantity(revenue.quantity || 1);

    if (revenue.currency) {
      revenueObj.setRevenue(revenue.amount * (revenue.quantity || 1));
    }

    if (revenue.productId) {
      revenueObj.setProductId(revenue.productId);
    }

    if (revenue.properties) {
      Object.entries(revenue.properties).forEach(([key, value]) => {
        const sanitizedKey = this.sanitizePropertyKey(key);
        const sanitizedValue = this.sanitizePropertyValue(value);
        
        if (sanitizedValue !== undefined) {
          revenueObj.setEventProperties({ [sanitizedKey]: sanitizedValue });
        }
      });
    }

    this.amplitude!.revenue(revenueObj);
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
    
    if (this.isInitialized && this.amplitude) {
      // If analytics consent is revoked, opt out
      this.amplitude.setOptOut(!settings.analytics);
    }
  }

  async reset(): Promise<void> {
    this.ensureInitialized();
    
    this.amplitude!.reset();
  }

  async setDebugMode(enabled: boolean): Promise<void> {
    // Amplitude doesn't have a specific debug mode
    // Debug logging is handled at initialization
    if (enabled) {
      console.log('[Amplitude] Debug mode enabled');
    }
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

  private ensureInitialized(): void {
    if (!this.isInitialized || !this.amplitude) {
      throw new Error('Amplitude provider not initialized');
    }
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