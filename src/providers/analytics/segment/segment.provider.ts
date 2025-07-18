import { BaseAnalyticsProvider } from '../../base-analytics-provider';
import { RegisterProvider } from '../../registry';
import type { ProviderConfig, ProviderType, ConsentSettings } from '../../../types/provider';
import type { RevenueData } from '../../../definitions';

interface SegmentConfig extends ProviderConfig {
  writeKey: string;
  apiHost?: string;
  flushAt?: number;
  flushInterval?: number;
  enabledIntegrations?: Record<string, boolean>;
  defaultIntegrations?: boolean;
  anonymousId?: string;
  timeout?: number;
  retryCount?: number;
}

interface SegmentSDK {
  load: (writeKey: string, options?: any) => void;
  identify: (userId?: string, traits?: any, options?: any, callback?: () => void) => void;
  track: (event: string, properties?: any, options?: any, callback?: () => void) => void;
  page: (name?: string, properties?: any, options?: any, callback?: () => void) => void;
  screen: (name?: string, properties?: any, options?: any, callback?: () => void) => void;
  group: (groupId: string, traits?: any, options?: any, callback?: () => void) => void;
  alias: (userId: string, previousId?: string, options?: any, callback?: () => void) => void;
  reset: () => void;
  ready: (callback: () => void) => void;
  user: () => any;
  anonymousId: () => string;
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string, callback?: (...args: any[]) => void) => void;
  flush: (callback?: () => void) => void;
  setAnonymousId: (anonymousId: string) => void;
}

declare global {
  interface Window {
    analytics?: SegmentSDK;
  }
}

@RegisterProvider({
  id: 'segment',
  name: 'Segment Analytics',
  type: 'analytics' as ProviderType,
  version: '1.0.0',
  supportedPlatforms: ['web'],
  configSchema: {
    writeKey: { type: 'string', required: true },
    apiHost: { type: 'string' },
    flushAt: { type: 'number', default: 20 },
    flushInterval: { type: 'number', default: 10000 },
    defaultIntegrations: { type: 'boolean', default: true },
    timeout: { type: 'number', default: 300 },
    retryCount: { type: 'number', default: 3 },
  },
})
export class SegmentAnalyticsProvider extends BaseAnalyticsProvider {
  readonly id = 'segment';
  readonly name = 'Segment Analytics';
  readonly version = '1.0.0';

  private analytics?: SegmentSDK;
  private segmentConfig: SegmentConfig | null = null;
  private scriptLoaded = false;
  private isReady = false;

  protected async doInitialize(config: SegmentConfig): Promise<void> {
    if (!config.writeKey) {
      throw new Error('Segment writeKey is required');
    }

    this.segmentConfig = config;

    // Load Segment SDK
    await this.loadSegmentSDK();

    if (!window.analytics) {
      throw new Error('Failed to load Segment SDK');
    }

    this.analytics = window.analytics;

    // Configure Segment
    const segmentOptions: any = {
      apiHost: config.apiHost,
      flushAt: config.flushAt ?? 20,
      flushInterval: config.flushInterval ?? 10000,
      defaultIntegrations: config.defaultIntegrations ?? true,
      timeout: config.timeout ?? 300,
      retryCount: config.retryCount ?? 3,
    };

    if (config.enabledIntegrations) {
      segmentOptions.integrations = config.enabledIntegrations;
    }

    if (config.anonymousId) {
      segmentOptions.anonymousId = config.anonymousId;
    }

    // Initialize Segment
    this.analytics.load(config.writeKey, segmentOptions);

    // Wait for Segment to be ready
    await new Promise<void>((resolve) => {
      this.analytics!.ready(() => {
        this.isReady = true;
        resolve();
      });
    });

    this.logger.info('Segment Analytics initialized successfully', {
      writeKey: config.writeKey,
      apiHost: config.apiHost,
    });
  }

  private async loadSegmentSDK(): Promise<void> {
    if (this.scriptLoaded || window.analytics) {
      return;
    }

    return new Promise((resolve, reject) => {
      // Segment snippet
      (() => {
        const analytics = (window.analytics = window.analytics || []);
        if (!analytics.initialize) {
          if (analytics.invoked) {
            window.console && console.error && console.error('Segment snippet included twice.');
            return;
          }
          analytics.invoked = true;
          analytics.methods = [
            'trackSubmit',
            'trackClick',
            'trackLink',
            'trackForm',
            'pageview',
            'identify',
            'reset',
            'group',
            'track',
            'ready',
            'alias',
            'debug',
            'page',
            'once',
            'off',
            'on',
            'addSourceMiddleware',
            'addIntegrationMiddleware',
            'setAnonymousId',
            'addDestinationMiddleware',
            'flush',
          ];
          analytics.factory = function (method: string) {
            return function (this: any) {
              const args = Array.prototype.slice.call(arguments);
              args.unshift(method);
              analytics.push(args);
              return analytics;
            };
          };
          for (let i = 0; i < analytics.methods.length; i++) {
            const method = analytics.methods[i];
            analytics[method] = analytics.factory(method);
          }
          analytics.load = function (writeKey: string, options?: any) {
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.async = true;
            script.src = 'https://cdn.segment.com/analytics.js/v1/' + writeKey + '/analytics.min.js';
            
            script.onload = () => {
              this.scriptLoaded = true;
              resolve();
            };
            
            script.onerror = () => {
              reject(new Error('Failed to load Segment SDK'));
            };

            const first = document.getElementsByTagName('script')[0];
            first.parentNode!.insertBefore(script, first);
            analytics._writeKey = writeKey;
            analytics._options = options;
          };
          analytics.SNIPPET_VERSION = '4.15.3';
        }
        resolve();
      })();
    });
  }

  protected async doShutdown(): Promise<void> {
    this.analytics = undefined;
    this.segmentConfig = null;
    this.scriptLoaded = false;
    this.isReady = false;
  }

  protected async doUpdateConsent(consent: ConsentSettings): Promise<void> {
    // Segment handles consent through integrations
    // We can disable specific integrations based on consent
    if (this.analytics && consent.analytics === false) {
      // Disable all integrations
      this.setEnabled(false);
      this.logger.info('Segment tracking disabled by consent');
    } else if (this.analytics && consent.analytics === true) {
      this.setEnabled(true);
      this.logger.info('Segment tracking enabled by consent');
    }
  }

  protected async doTrack(eventName: string, properties: Record<string, any>): Promise<void> {
    if (!this.analytics || !this.isReady) {
      throw new Error('Segment not initialized');
    }

    const cleanProperties = this.sanitizeProperties(properties);

    return new Promise<void>((resolve, reject) => {
      this.analytics!.track(eventName, cleanProperties, {}, (error?: Error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  protected async doIdentifyUser(userId: string, traits: Record<string, any>): Promise<void> {
    if (!this.analytics || !this.isReady) {
      throw new Error('Segment not initialized');
    }

    const cleanTraits = this.sanitizeProperties(traits);

    return new Promise<void>((resolve, reject) => {
      this.analytics!.identify(userId, cleanTraits, {}, (error?: Error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  protected async doSetUserProperties(properties: Record<string, any>): Promise<void> {
    if (!this.analytics || !this.isReady) {
      throw new Error('Segment not initialized');
    }

    const cleanProperties = this.sanitizeProperties(properties);

    // Segment doesn't have a separate setUserProperties method
    // We can identify with the current user ID and new traits
    return new Promise<void>((resolve, reject) => {
      this.analytics!.identify(undefined, cleanProperties, {}, (error?: Error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  protected async doLogScreenView(screenName: string, properties: Record<string, any>): Promise<void> {
    if (!this.analytics || !this.isReady) {
      throw new Error('Segment not initialized');
    }

    const screenProperties = {
      name: screenName,
      ...this.sanitizeProperties(properties),
    };

    return new Promise<void>((resolve, reject) => {
      this.analytics!.screen(screenName, screenProperties, {}, (error?: Error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  protected async doLogRevenue(data: RevenueData): Promise<void> {
    if (!this.analytics || !this.isReady) {
      throw new Error('Segment not initialized');
    }

    // Segment uses track events for revenue with specific properties
    const revenueProperties: Record<string, any> = {
      revenue: data.amount,
      currency: data.currency || 'USD',
      value: data.amount, // Some integrations use 'value' instead of 'revenue'
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

    // Track as a purchase event
    await this.doTrack('Purchase', revenueProperties);
  }

  protected async doProviderReset(): Promise<void> {
    if (!this.analytics) return;

    this.analytics.reset();
  }

  protected doSetDebugMode(enabled: boolean): void {
    if (this.analytics) {
      // Segment doesn't have a debug mode, but we can enable logging
      if (enabled) {
        this.logger.debug('Segment debug mode enabled');
      }
    }
  }

  /**
   * Alias a user ID
   */
  async alias(userId: string, previousId?: string): Promise<void> {
    if (!this.analytics || !this.isReady) {
      throw new Error('Segment not initialized');
    }

    return new Promise<void>((resolve, reject) => {
      this.analytics!.alias(userId, previousId, {}, (error?: Error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Associate a user with a group
   */
  async group(groupId: string, traits?: Record<string, any>): Promise<void> {
    if (!this.analytics || !this.isReady) {
      throw new Error('Segment not initialized');
    }

    const cleanTraits = traits ? this.sanitizeProperties(traits) : {};

    return new Promise<void>((resolve, reject) => {
      this.analytics!.group(groupId, cleanTraits, {}, (error?: Error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Track a page view
   */
  async page(name?: string, properties?: Record<string, any>): Promise<void> {
    if (!this.analytics || !this.isReady) {
      throw new Error('Segment not initialized');
    }

    const cleanProperties = properties ? this.sanitizeProperties(properties) : {};

    return new Promise<void>((resolve, reject) => {
      this.analytics!.page(name, cleanProperties, {}, (error?: Error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Flush queued events
   */
  async flush(): Promise<void> {
    if (!this.analytics || !this.isReady) {
      throw new Error('Segment not initialized');
    }

    return new Promise<void>((resolve) => {
      this.analytics!.flush(() => {
        resolve();
      });
    });
  }

  /**
   * Get the current user
   */
  getUser(): any {
    if (!this.analytics || !this.isReady) {
      return null;
    }

    return this.analytics.user();
  }

  /**
   * Get the anonymous ID
   */
  getAnonymousId(): string | null {
    if (!this.analytics || !this.isReady) {
      return null;
    }

    return this.analytics.anonymousId();
  }

  /**
   * Set the anonymous ID
   */
  setAnonymousId(anonymousId: string): void {
    if (!this.analytics || !this.isReady) {
      return;
    }

    this.analytics.setAnonymousId(anonymousId);
  }

  /**
   * Sanitize properties for Segment
   */
  private sanitizeProperties(properties: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(properties)) {
      if (value !== null && value !== undefined) {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }
}