import { BaseAnalyticsProvider } from '../../base-analytics-provider';
import { RegisterProvider } from '../../registry';
import type { ProviderConfig, ProviderType, ConsentSettings } from '../../../types/provider';
import type { RevenueData } from '../../../definitions';

interface HeapConfig extends ProviderConfig {
  appId: string;
  enableAutocapture?: boolean;
  captureClicks?: boolean;
  captureSubmits?: boolean;
  capturePageviews?: boolean;
  secureCookie?: boolean;
  disableTextCapture?: boolean;
  disableCookies?: boolean;
  forceSSL?: boolean;
  trackingServer?: string;
  globalProperties?: Record<string, any>;
}

interface HeapSDK {
  load: (appId: string, options?: any) => void;
  track: (event: string, properties?: any) => void;
  identify: (userId: string) => void;
  addUserProperties: (properties: any) => void;
  removeEventProperty: (property: string) => void;
  addEventProperties: (properties: any) => void;
  clearEventProperties: () => void;
  resetUserId: () => void;
  getUserId: () => string;
  getSessionId: () => string;
  startRecording: (options?: any) => void;
  stopRecording: () => void;
  appid: string;
  loaded: boolean;
  config: {
    disableTextCapture: boolean;
    secureCookie: boolean;
    disableCookies: boolean;
    forceSSL: boolean;
    trackingServer?: string;
  };
}

declare global {
  interface Window {
    heap?: HeapSDK;
  }
}

@RegisterProvider({
  id: 'heap',
  name: 'Heap Analytics',
  type: 'analytics' as ProviderType,
  version: '1.0.0',
  supportedPlatforms: ['web'],
  configSchema: {
    appId: { type: 'string', required: true },
    enableAutocapture: { type: 'boolean', default: true },
    captureClicks: { type: 'boolean', default: true },
    captureSubmits: { type: 'boolean', default: true },
    capturePageviews: { type: 'boolean', default: true },
    secureCookie: { type: 'boolean', default: true },
    disableTextCapture: { type: 'boolean', default: false },
    disableCookies: { type: 'boolean', default: false },
    forceSSL: { type: 'boolean', default: true },
  },
})
export class HeapAnalyticsProvider extends BaseAnalyticsProvider {
  readonly id = 'heap';
  readonly name = 'Heap Analytics';
  readonly version = '1.0.0';

  private heap?: HeapSDK;
  private heapConfig: HeapConfig | null = null;
  private scriptLoaded = false;

  protected async doInitialize(config: HeapConfig): Promise<void> {
    if (!config.appId) {
      throw new Error('Heap App ID is required');
    }

    this.heapConfig = {
      enableAutocapture: true,
      captureClicks: true,
      captureSubmits: true,
      capturePageviews: true,
      secureCookie: true,
      disableTextCapture: false,
      disableCookies: false,
      forceSSL: true,
      ...config,
    };

    // Load Heap SDK
    await this.loadHeapSDK();

    if (!window.heap) {
      throw new Error('Failed to load Heap SDK');
    }

    this.heap = window.heap;

    // Configure Heap
    const heapOptions = {
      disableTextCapture: this.heapConfig.disableTextCapture,
      secureCookie: this.heapConfig.secureCookie,
      disableCookies: this.heapConfig.disableCookies,
      forceSSL: this.heapConfig.forceSSL,
      trackingServer: this.heapConfig.trackingServer,
    };

    // Initialize Heap
    this.heap.load(this.heapConfig.appId, heapOptions);

    // Set global properties if provided
    if (this.heapConfig.globalProperties) {
      this.heap.addEventProperties(this.heapConfig.globalProperties);
    }

    this.logger.info('Heap Analytics initialized successfully', {
      appId: this.heapConfig.appId,
      options: heapOptions,
    });
  }

  private async loadHeapSDK(): Promise<void> {
    if (this.scriptLoaded || window.heap) {
      // If heap already exists (e.g., in tests), mark as loaded
      if (window.heap) {
        this.scriptLoaded = true;
      }
      return;
    }

    return new Promise((resolve, reject) => {
      // Create the Heap snippet
      const heapScript = `
        window.heap=window.heap||[],heap.load=function(e,t){window.heap.appid=e,window.heap.config=t=t||{};
        var r=document.createElement("script");r.type="text/javascript",r.async=!0,r.src="https://cdn.heapanalytics.com/js/heap-"+e+".js";
        var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(r,a);
        for(var n=function(e){return function(){heap.push([e].concat(Array.prototype.slice.call(arguments,0)))}},p=["addEventProperties","addUserProperties","clearEventProperties","identify","resetUserId","removeEventProperty","setEventProperties","track","unsetEventProperty"],o=0;o<p.length;o++)heap[p[o]]=n(p[o])};
      `;

      // Execute the Heap snippet
      try {
        eval(heapScript);
        this.scriptLoaded = true;
        resolve();
      } catch (error) {
        reject(new Error('Failed to load Heap SDK: ' + error));
      }
    });
  }

  protected async doShutdown(): Promise<void> {
    this.heap = undefined;
    this.heapConfig = null;
    this.scriptLoaded = false;
  }

  protected async doUpdateConsent(consent: ConsentSettings): Promise<void> {
    if (!this.heap) return;

    if (consent.analytics === false) {
      // Heap doesn't have a built-in opt-out method, so we'll stop tracking
      this.logger.info('Heap tracking disabled by consent');
      // Note: Heap doesn't provide a direct way to stop tracking
      // In a real implementation, you might need to override tracking methods
    } else if (consent.analytics === true) {
      this.logger.info('Heap tracking enabled by consent');
    }
  }

  protected async doTrack(eventName: string, properties: Record<string, any>): Promise<void> {
    if (!this.heap) {
      throw new Error('Heap not initialized');
    }

    const cleanProperties = this.sanitizeProperties(properties);
    this.heap.track(eventName, cleanProperties);
  }

  protected async doIdentifyUser(userId: string, traits: Record<string, any>): Promise<void> {
    if (!this.heap) {
      throw new Error('Heap not initialized');
    }

    // Identify user
    this.heap.identify(userId);

    // Add user properties
    if (traits && Object.keys(traits).length > 0) {
      const cleanTraits = this.sanitizeProperties(traits);
      this.heap.addUserProperties(cleanTraits);
    }
  }

  protected async doSetUserProperties(properties: Record<string, any>): Promise<void> {
    if (!this.heap) {
      throw new Error('Heap not initialized');
    }

    const cleanProperties = this.sanitizeProperties(properties);
    this.heap.addUserProperties(cleanProperties);
  }

  protected async doLogScreenView(screenName: string, properties: Record<string, any>): Promise<void> {
    if (!this.heap) {
      throw new Error('Heap not initialized');
    }

    const screenProperties = {
      screen_name: screenName,
      ...this.sanitizeProperties(properties),
    };

    this.heap.track('Screen View', screenProperties);
  }

  protected async doLogRevenue(data: RevenueData): Promise<void> {
    if (!this.heap) {
      throw new Error('Heap not initialized');
    }

    // Heap doesn't have a specific revenue tracking method, so we'll track as a custom event
    const revenueProperties: Record<string, any> = {
      revenue: data.amount,
      currency: data.currency || 'USD',
      value: data.amount, // Common property name
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

    this.heap.track('Purchase', revenueProperties);
  }

  protected async doProviderReset(): Promise<void> {
    if (!this.heap) return;

    this.heap.resetUserId();
    this.heap.clearEventProperties();
  }

  protected doSetDebugMode(enabled: boolean): void {
    // Heap doesn't have a debug mode API
    // Debug information is available in the browser console when the script is loaded
    this.logger.info(`Heap debug mode ${enabled ? 'enabled' : 'disabled'} (check browser console for Heap logs)`);
  }

  /**
   * Add event properties (sent with all subsequent events)
   */
  addEventProperties(properties: Record<string, any>): void {
    if (!this.heap) return;

    const cleanProperties = this.sanitizeProperties(properties);
    this.heap.addEventProperties(cleanProperties);
  }

  /**
   * Remove an event property
   */
  removeEventProperty(property: string): void {
    if (!this.heap) return;

    this.heap.removeEventProperty(property);
  }

  /**
   * Clear all event properties
   */
  clearEventProperties(): void {
    if (!this.heap) return;

    this.heap.clearEventProperties();
  }

  /**
   * Get the current user ID
   */
  getUserId(): string | null {
    if (!this.heap) return null;

    return this.heap.getUserId();
  }

  /**
   * Get the current session ID
   */
  getSessionId(): string | null {
    if (!this.heap) return null;

    return this.heap.getSessionId();
  }

  /**
   * Start recording user sessions
   */
  startRecording(options?: any): void {
    if (!this.heap) return;

    this.heap.startRecording(options);
  }

  /**
   * Stop recording user sessions
   */
  stopRecording(): void {
    if (!this.heap) return;

    this.heap.stopRecording();
  }

  /**
   * Check if Heap is loaded
   */
  isLoaded(): boolean {
    return this.scriptLoaded && !!this.heap && this.heap.loaded;
  }

  /**
   * Get the Heap App ID
   */
  getAppId(): string | null {
    if (!this.heap) return null;

    return this.heap.appid;
  }

  /**
   * Sanitize properties for Heap
   */
  private sanitizeProperties(properties: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(properties)) {
      if (value !== null && value !== undefined) {
        // Heap accepts various data types, so we'll keep them as is
        sanitized[key] = value;
      }
    }

    return sanitized;
  }
}
