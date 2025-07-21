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
  page: (category?: string, name?: string, properties?: any, options?: any, callback?: () => void) => void;
  screen: (name?: string, properties?: any, options?: any, callback?: () => void) => void;
  group: (groupId: string, traits?: any, options?: any, callback?: () => void) => void;
  alias: (userId: string, previousId?: string, options?: any, callback?: () => void) => void;
  reset: () => void;
  ready: (callback: () => void) => void;
  user: () => any;
  anonymousId: () => string;
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string, callback?: (...args: any[]) => void) => void;
  once: (event: string, callback: (...args: any[]) => void) => void;
  flush: (callback?: () => void) => void;
  setAnonymousId: (anonymousId: string) => void;
  debug: (enabled: boolean) => void;
  timeout: (ms: number) => void;
  addSourceMiddleware: (middleware: any) => void;
  addDestinationMiddleware: (integrationName: string, middleware: any) => void;
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
  // @ts-ignore - Reserved for future use
  private _segmentConfig: SegmentConfig | null = null;
  private scriptLoaded = false;
  private _isReady = false;
  private _isInitialized = false;

  protected async doInitialize(config: SegmentConfig): Promise<void> {
    if (!config.writeKey) {
      throw new Error('Segment write key is required');
    }

    this._segmentConfig = config;

    // Load Segment SDK
    await this.loadSegmentSDK();

    if (!window.analytics) {
      throw new Error('Failed to load Segment SDK');
    }

    this.analytics = window.analytics;

    // Configure Segment
    const segmentOptions: any = {
      apiHost: config.apiHost,
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
        this._isReady = true;
        this._isInitialized = true;
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
        const analytics: any = window.analytics || [];
        window.analytics = analytics as SegmentSDK;
        if (!analytics.initialize) {
          if (analytics.invoked) {
            if (window.console && console.error) {
              console.error('Segment snippet included twice.');
            }
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

            const scripts = document.getElementsByTagName('script');
            if (scripts && scripts.length > 0) {
              const first = scripts[0];
              first.parentNode!.insertBefore(script, first);
            } else {
              // Fallback for test environments
              if (document.head) {
                document.head.appendChild(script);
              } else if (document.body) {
                document.body.appendChild(script);
              }
            }
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
    this._segmentConfig = null;
    this.scriptLoaded = false;
    this._isReady = false;
    this._isInitialized = false;
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

  protected async doIdentifyUser(userId: string, traits: Record<string, any>): Promise<void> {
    if (!this.analytics || !this._isReady) {
      throw new Error('Segment not initialized');
    }

    const cleanTraits = this.sanitizeProperties(traits);

    return new Promise<void>((resolve, _reject) => {
      this.analytics!.identify(userId, cleanTraits, {}, (error?: Error) => {
        if (error) {
          _reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  protected async doSetUserProperties(properties: Record<string, any>): Promise<void> {
    if (!this.analytics || !this._isReady) {
      throw new Error('Segment not initialized');
    }

    const cleanProperties = this.sanitizeProperties(properties);

    // Segment doesn't have a separate setUserProperties method
    // We can identify with the current user ID and new traits
    return new Promise<void>((resolve, _reject) => {
      this.analytics!.identify(undefined, cleanProperties, {}, (error?: Error) => {
        if (error) {
          _reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  protected async doLogScreenView(screenName: string, properties: Record<string, any>): Promise<void> {
    if (!this.analytics || !this._isReady) {
      throw new Error('Segment not initialized');
    }

    const screenProperties = {
      name: screenName,
      ...this.sanitizeProperties(properties),
    };

    return new Promise<void>((resolve, _reject) => {
      this.analytics!.screen(screenName, screenProperties, {}, (error?: Error) => {
        if (error) {
          _reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  protected async doLogRevenue(data: RevenueData): Promise<void> {
    if (!this.analytics || !this._isReady) {
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

    if (data.transactionId) {
      revenueProperties.order_id = data.transactionId;
    }

    if (data.properties) {
      Object.assign(revenueProperties, this.sanitizeProperties(data.properties));
    }

    // Track as an Order Completed event
    await this.doTrack('Order Completed', revenueProperties);
  }

  protected async doProviderReset(): Promise<void> {
    if (!this.analytics) return;

    this.analytics.reset();
  }

  protected doSetDebugMode(enabled: boolean): void {
    if (this.analytics && 'debug' in this.analytics) {
      (this.analytics as any).debug(enabled);
    }
    if (enabled) {
      this.logger.debug('Segment debug mode enabled');
    }
  }

  /**
   * Alias a user ID
   */
  async alias(userId: string, previousId?: string, options?: Record<string, any>): Promise<void> {
    if (!this.analytics || !this._isReady) {
      throw new Error('Segment not initialized');
    }

    const cleanOptions = options || {};

    return new Promise<void>((resolve, _reject) => {
      this.analytics!.alias(userId, previousId, cleanOptions, (error?: Error) => {
        if (error) {
          _reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Associate a user with a group
   */
  async group(groupId: string, traits?: Record<string, any>, options?: Record<string, any>): Promise<void> {
    if (!this.analytics || !this._isReady) {
      throw new Error('Segment not initialized');
    }

    const cleanTraits = traits ? this.sanitizeProperties(traits) : {};
    const cleanOptions = options || {};

    return new Promise<void>((resolve, _reject) => {
      this.analytics!.group(groupId, cleanTraits, cleanOptions, (error?: Error) => {
        if (error) {
          _reject(error);
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
    if (!this.analytics || !this._isReady) {
      throw new Error('Segment not initialized');
    }

    const cleanProperties = properties ? this.sanitizeProperties(properties) : {};

    return new Promise<void>((resolve, _reject) => {
      // If name is provided, use it as the page name
      if (name) {
        this.analytics!.page(undefined, name, cleanProperties, {}, () => {
          resolve();
        });
      } else {
        // No name provided, just track a page view
        this.analytics!.page(undefined, undefined, cleanProperties, {}, () => {
          resolve();
        });
      }
    });
  }

  /**
   * Flush queued events
   */
  async flush(): Promise<void> {
    if (!this.analytics || !this._isReady) {
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
    if (!this.analytics || !this._isReady) {
      return null;
    }

    return this.analytics.user();
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

  /**
   * Check if provider is initialized
   */
  isInitialized(): boolean {
    return this._isInitialized;
  }

  /**
   * Track page view
   */
  async trackPageView(
    pageName?: string,
    properties?: Record<string, any>,
    options?: Record<string, any>,
  ): Promise<void> {
    if (!this.analytics || !this._isReady) {
      throw new Error('Segment not initialized');
    }

    const cleanProperties = properties ? this.sanitizeProperties(properties) : {};
    const cleanOptions = options || {};

    return new Promise<void>((resolve, _reject) => {
      this.analytics!.page(undefined, pageName, cleanProperties, cleanOptions, () => {
        resolve();
      });
    });
  }

  /**
   * Track page view with category
   */
  async trackPageViewWithCategory(
    category: string,
    pageName?: string,
    properties?: Record<string, any>,
    options?: Record<string, any>,
  ): Promise<void> {
    if (!this.analytics || !this._isReady) {
      throw new Error('Segment not initialized');
    }

    const cleanProperties = properties ? this.sanitizeProperties(properties) : {};
    const cleanOptions = options || {};

    return new Promise<void>((resolve, _reject) => {
      this.analytics!.page(category, pageName, cleanProperties, cleanOptions, (error?: Error) => {
        if (error) {
          _reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Identify user with options
   */
  async identify(userId?: string, traits?: Record<string, any>, options?: Record<string, any>): Promise<void> {
    if (!this.analytics || !this._isReady) {
      throw new Error('Segment not initialized');
    }

    const cleanTraits = traits ? this.sanitizeProperties(traits) : {};
    const cleanOptions = options || {};

    return new Promise<void>((resolve, _reject) => {
      this.analytics!.identify(userId, cleanTraits, cleanOptions, (error?: Error) => {
        if (error) {
          _reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Override the base track method to support options
   */
  async track(eventName: string, properties?: Record<string, any>, options?: Record<string, any>): Promise<void> {
    if (!this.analytics || !this._isReady) {
      throw new Error('Segment not initialized');
    }

    const cleanProperties = properties ? this.sanitizeProperties(properties) : {};
    const cleanOptions = options || {};

    return new Promise<void>((resolve, _reject) => {
      this.analytics!.track(eventName, cleanProperties, cleanOptions, (error?: Error) => {
        if (error) {
          _reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Get user ID
   */
  async getUserId(): Promise<string | null> {
    if (!this.analytics || !this._isReady) {
      return null;
    }

    const user = this.analytics.user();
    return user?.id ? user.id() : null;
  }

  /**
   * Get user traits
   */
  async getUserTraits(): Promise<Record<string, any> | null> {
    if (!this.analytics || !this._isReady) {
      return null;
    }

    const user = this.analytics.user();
    return user?.traits ? user.traits() : null;
  }

  /**
   * Get anonymous ID async
   */
  async getAnonymousId(): Promise<string | null> {
    if (!this.analytics || !this._isReady) {
      return null;
    }

    const user = this.analytics.user();
    return user?.anonymousId ? user.anonymousId() : null;
  }

  /**
   * Set anonymous ID async
   */
  async setAnonymousId(anonymousId: string): Promise<void> {
    if (!this.analytics || !this._isReady) {
      return;
    }

    this.analytics.setAnonymousId(anonymousId);
  }

  /**
   * Add source middleware
   */
  async addSourceMiddleware(middleware: any): Promise<void> {
    if (!this.analytics || !this._isReady) {
      throw new Error('Segment not initialized');
    }

    this.analytics.addSourceMiddleware(middleware);
  }

  /**
   * Add destination middleware
   */
  async addDestinationMiddleware(integrationName: string, middleware: any): Promise<void> {
    if (!this.analytics || !this._isReady) {
      throw new Error('Segment not initialized');
    }

    this.analytics.addDestinationMiddleware(integrationName, middleware);
  }

  /**
   * Add event listener
   */
  async on(event: string, callback: (...args: any[]) => void): Promise<void> {
    if (!this.analytics || !this._isReady) {
      throw new Error('Segment not initialized');
    }

    this.analytics.on(event, callback);
  }

  /**
   * Remove event listener
   */
  async off(event: string, callback?: (...args: any[]) => void): Promise<void> {
    if (!this.analytics || !this._isReady) {
      throw new Error('Segment not initialized');
    }

    this.analytics.off(event, callback);
  }

  /**
   * Add one-time event listener
   */
  async once(event: string, callback: (...args: any[]) => void): Promise<void> {
    if (!this.analytics || !this._isReady) {
      throw new Error('Segment not initialized');
    }

    this.analytics.once(event, callback);
  }

  /**
   * Enable debug mode
   */
  async enableDebug(): Promise<void> {
    if (!this.analytics || !this._isReady) {
      throw new Error('Segment not initialized');
    }

    this.analytics.debug(true);
    this.setDebugMode(true);
  }

  /**
   * Disable debug mode
   */
  async disableDebug(): Promise<void> {
    if (!this.analytics || !this._isReady) {
      throw new Error('Segment not initialized');
    }

    this.analytics.debug(false);
    this.setDebugMode(false);
  }

  /**
   * Set timeout
   */
  async setTimeout(timeout: number): Promise<void> {
    if (!this.analytics || !this._isReady) {
      throw new Error('Segment not initialized');
    }

    this.analytics.timeout(timeout);
  }

  /**
   * Wait for ready state
   */
  async waitForReady(callback: () => void): Promise<void> {
    if (!this.analytics) {
      throw new Error('Segment not initialized');
    }

    this.analytics.ready(callback);
  }

  /**
   * Track revenue with RevenueData
   */
  async trackRevenue(data: RevenueData): Promise<void> {
    await this.logRevenue(data);
  }

  /**
   * Override doTrack to not include callback in base class call
   */
  protected async doTrack(eventName: string, properties: Record<string, any>): Promise<void> {
    // Call the public track method with no options to handle callbacks properly
    await this.track(eventName, properties);
  }
}
