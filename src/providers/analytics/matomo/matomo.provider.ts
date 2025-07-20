import { BaseAnalyticsProvider } from '../../base-analytics-provider';
import { RegisterProvider } from '../../registry';
import type { ProviderConfig, ProviderType, ConsentSettings } from '../../../types/provider';
import type { RevenueData } from '../../../definitions';

interface MatomoConfig extends ProviderConfig {
  siteId: number;
  trackerUrl: string;
  enableLinkTracking?: boolean;
  enableHeartBeatTimer?: boolean;
  enableJSErrorTracking?: boolean;
  enablePerformanceTracking?: boolean;
  enableCrossDomainLinking?: boolean;
  cookieDomain?: string;
  cookiePath?: string;
  cookieSecure?: boolean;
  cookieSameSite?: 'None' | 'Lax' | 'Strict';
  respectDoNotTrack?: boolean;
  globalProperties?: Record<string, any>;
  customDimensions?: Record<number, string>;
}

interface MatomoTracker {
  trackPageView: (customTitle?: string) => void;
  trackEvent: (category: string, action: string, name?: string, value?: number) => void;
  trackGoal: (goalId: number, customRevenue?: number) => void;
  trackEcommerce: (orderId: string, grandTotal: number, subTotal?: number, tax?: number, shipping?: number, discount?: number) => void;
  addEcommerceItem: (sku: string, name?: string, category?: string, price?: number, quantity?: number) => void;
  trackEcommerceOrder: (orderId: string, grandTotal: number, subTotal?: number, tax?: number, shipping?: number, discount?: number) => void;
  trackEcommerceCartUpdate: (grandTotal: number) => void;
  setUserId: (userId: string) => void;
  setCustomVariable: (index: number, name: string, value: string, scope?: 'visit' | 'page') => void;
  setCustomDimension: (dimensionId: number, value: string) => void;
  deleteCustomDimension: (dimensionId: number) => void;
  setDocumentTitle: (title: string) => void;
  setReferrerUrl: (url: string) => void;
  setCustomUrl: (url: string) => void;
  enableLinkTracking: (enable?: boolean) => void;
  enableHeartBeatTimer: (activeTimeInSeconds?: number) => void;
  enableJSErrorTracking: () => void;
  enablePerformanceTracking: () => void;
  enableCrossDomainLinking: () => void;
  disableCookies: () => void;
  deleteCookies: () => void;
  setCookieDomain: (domain: string) => void;
  setCookiePath: (path: string) => void;
  setSecureCookie: (secure: boolean) => void;
  setCookieSameSite: (sameSite: 'None' | 'Lax' | 'Strict') => void;
  setDoNotTrack: (enable: boolean) => void;
  optUserOut: () => void;
  forgetUserOptOut: () => void;
  isUserOptedOut: () => boolean;
  setConsentGiven: () => void;
  setConsentRemoved: () => void;
  requireConsent: () => void;
  setRequestMethod: (method: 'GET' | 'POST') => void;
  ping: () => void;
  getUserId: () => string;
  getVisitorId: () => string;
  getVisitorInfo: () => any[];
  getAttributionInfo: () => any[];
  push: (args: any[]) => void;
}

interface MatomoSDK {
  getTracker: (trackerUrl: string, siteId: number) => MatomoTracker;
  addTracker: (trackerUrl: string, siteId: number) => MatomoTracker;
  removeAllAsyncTrackersExcept: (excludeTracker: MatomoTracker) => void;
  getAsyncTrackers: () => MatomoTracker[];
}

declare global {
  interface Window {
    Matomo?: MatomoSDK;
    _paq?: any[];
  }
}

@RegisterProvider({
  id: 'matomo',
  name: 'Matomo Analytics',
  type: 'analytics' as ProviderType,
  version: '1.0.0',
  supportedPlatforms: ['web'],
  configSchema: {
    siteId: { type: 'number', required: true },
    trackerUrl: { type: 'string', required: true },
    enableLinkTracking: { type: 'boolean', default: true },
    enableHeartBeatTimer: { type: 'boolean', default: true },
    enableJSErrorTracking: { type: 'boolean', default: true },
    enablePerformanceTracking: { type: 'boolean', default: false },
    enableCrossDomainLinking: { type: 'boolean', default: false },
    cookieSecure: { type: 'boolean', default: true },
    cookieSameSite: { type: 'string', default: 'Lax' },
    respectDoNotTrack: { type: 'boolean', default: true },
  },
})
export class MatomoAnalyticsProvider extends BaseAnalyticsProvider {
  readonly id = 'matomo';
  readonly name = 'Matomo Analytics';
  readonly version = '1.0.0';

  private tracker?: MatomoTracker;
  private matomoConfig: MatomoConfig | null = null;
  private scriptLoaded = false;

  protected async doInitialize(config: MatomoConfig): Promise<void> {
    if (!config.siteId || !config.trackerUrl) {
      throw new Error('Matomo siteId and trackerUrl are required');
    }

    this.matomoConfig = {
      enableLinkTracking: true,
      enableHeartBeatTimer: true,
      enableJSErrorTracking: true,
      enablePerformanceTracking: false,
      enableCrossDomainLinking: false,
      cookieSecure: true,
      cookieSameSite: 'Lax',
      respectDoNotTrack: true,
      ...config,
    };

    // Initialize _paq array for tracking queue
    window._paq = window._paq || [];

    // Load Matomo SDK
    await this.loadMatomoSDK();

    if (!window.Matomo) {
      throw new Error('Failed to load Matomo SDK');
    }

    // Get tracker instance
    this.tracker = window.Matomo.getTracker(this.matomoConfig.trackerUrl, this.matomoConfig.siteId);

    // Configure tracker
    this.configureTracker();

    // Set global properties if provided
    if (this.matomoConfig.globalProperties) {
      Object.entries(this.matomoConfig.globalProperties).forEach(([key, value]) => {
        window._paq?.push(['setCustomVariable', 1, key, value, 'visit']);
      });
    }

    // Set custom dimensions if provided
    if (this.matomoConfig.customDimensions) {
      Object.entries(this.matomoConfig.customDimensions).forEach(([dimensionId, value]) => {
        this.tracker?.setCustomDimension(parseInt(dimensionId), value);
      });
    }

    this.logger.info('Matomo Analytics initialized successfully', {
      siteId: this.matomoConfig.siteId,
      trackerUrl: this.matomoConfig.trackerUrl,
    });
  }

  private async loadMatomoSDK(): Promise<void> {
    if (this.scriptLoaded || window.Matomo) {
      return;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.async = true;
      script.src = `${this.matomoConfig!.trackerUrl}/matomo.js`;
      
      script.onload = () => {
        this.scriptLoaded = true;
        resolve();
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load Matomo SDK'));
      };

      document.head.appendChild(script);
    });
  }

  private configureTracker(): void {
    if (!this.tracker || !this.matomoConfig) return;

    // Configure tracking features
    if (this.matomoConfig.enableLinkTracking) {
      this.tracker.enableLinkTracking(true);
    }

    if (this.matomoConfig.enableHeartBeatTimer) {
      this.tracker.enableHeartBeatTimer(15); // 15 seconds
    }

    if (this.matomoConfig.enableJSErrorTracking) {
      this.tracker.enableJSErrorTracking();
    }

    if (this.matomoConfig.enablePerformanceTracking) {
      this.tracker.enablePerformanceTracking();
    }

    if (this.matomoConfig.enableCrossDomainLinking) {
      this.tracker.enableCrossDomainLinking();
    }

    // Configure cookies
    if (this.matomoConfig.cookieDomain) {
      this.tracker.setCookieDomain(this.matomoConfig.cookieDomain);
    }

    if (this.matomoConfig.cookiePath) {
      this.tracker.setCookiePath(this.matomoConfig.cookiePath);
    }

    if (this.matomoConfig.cookieSecure) {
      this.tracker.setSecureCookie(true);
    }

    if (this.matomoConfig.cookieSameSite) {
      this.tracker.setCookieSameSite(this.matomoConfig.cookieSameSite);
    }

    // Configure privacy settings
    if (this.matomoConfig.respectDoNotTrack) {
      this.tracker.setDoNotTrack(true);
    }
  }

  protected async doShutdown(): Promise<void> {
    this.tracker = undefined;
    this.matomoConfig = null;
    this.scriptLoaded = false;
  }

  protected async doUpdateConsent(consent: ConsentSettings): Promise<void> {
    if (!this.tracker) return;

    if (consent.analytics === false) {
      this.tracker.requireConsent();
      this.tracker.setConsentRemoved();
      this.logger.info('Matomo tracking disabled by consent');
    } else if (consent.analytics === true) {
      this.tracker.setConsentGiven();
      this.logger.info('Matomo tracking enabled by consent');
    }
  }

  protected async doTrack(eventName: string, properties: Record<string, any>): Promise<void> {
    if (!this.tracker) {
      throw new Error('Matomo not initialized');
    }

    const cleanProperties = this.sanitizeProperties(properties);
    
    // Convert to Matomo event format: category, action, name, value
    const category = cleanProperties.category || 'General';
    const action = eventName;
    const name = cleanProperties.name || cleanProperties.label;
    const value = cleanProperties.value || cleanProperties.revenue;

    this.tracker.trackEvent(category, action, name, value);
  }

  protected async doIdentifyUser(userId: string, traits: Record<string, any>): Promise<void> {
    if (!this.tracker) {
      throw new Error('Matomo not initialized');
    }

    // Set user ID
    this.tracker.setUserId(userId);

    // Set user traits as custom variables
    if (traits && Object.keys(traits).length > 0) {
      const cleanTraits = this.sanitizeProperties(traits);
      let variableIndex = 1;
      
      Object.entries(cleanTraits).forEach(([key, value]) => {
        if (variableIndex <= 5) { // Matomo supports up to 5 custom variables
          this.tracker!.setCustomVariable(variableIndex, key, String(value), 'visit');
          variableIndex++;
        }
      });
    }
  }

  protected async doSetUserProperties(properties: Record<string, any>): Promise<void> {
    if (!this.tracker) {
      throw new Error('Matomo not initialized');
    }

    const cleanProperties = this.sanitizeProperties(properties);
    let variableIndex = 1;
    
    Object.entries(cleanProperties).forEach(([key, value]) => {
      if (variableIndex <= 5) { // Matomo supports up to 5 custom variables
        this.tracker!.setCustomVariable(variableIndex, key, String(value), 'visit');
        variableIndex++;
      }
    });
  }

  protected async doLogScreenView(screenName: string, properties: Record<string, any>): Promise<void> {
    if (!this.tracker) {
      throw new Error('Matomo not initialized');
    }

    // Set custom URL for screen view
    this.tracker.setCustomUrl(`/screen/${screenName}`);
    
    // Set document title
    this.tracker.setDocumentTitle(screenName);

    // Add screen properties as custom variables
    if (properties && Object.keys(properties).length > 0) {
      const cleanProperties = this.sanitizeProperties(properties);
      let variableIndex = 1;
      
      Object.entries(cleanProperties).forEach(([key, value]) => {
        if (variableIndex <= 5) {
          this.tracker!.setCustomVariable(variableIndex, key, String(value), 'page');
          variableIndex++;
        }
      });
    }

    // Track page view
    this.tracker.trackPageView(screenName);
  }

  protected async doLogRevenue(data: RevenueData): Promise<void> {
    if (!this.tracker) {
      throw new Error('Matomo not initialized');
    }

    // Add ecommerce items if provided
    if (data.items && data.items.length > 0) {
      data.items.forEach(item => {
        this.tracker!.addEcommerceItem(
          item.itemId || '',
          item.itemName || '',
          item.itemCategory || '',
          item.price || 0,
          item.quantity || 1
        );
      });
    }

    // Track ecommerce order
    const orderId = data.transactionId || `order_${Date.now()}`;
    const grandTotal = data.amount;
    const subTotal = data.items?.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
    const tax = 0; // Not available in RevenueData
    const shipping = 0; // Not available in RevenueData
    const discount = 0; // Not available in RevenueData

    this.tracker.trackEcommerceOrder(orderId, grandTotal, subTotal, tax, shipping, discount);
  }

  protected async doProviderReset(): Promise<void> {
    if (!this.tracker) return;

    // Clear custom variables
    for (let i = 1; i <= 5; i++) {
      this.tracker.setCustomVariable(i, '', '', 'visit');
    }

    // Clear custom dimensions
    if (this.matomoConfig?.customDimensions) {
      Object.keys(this.matomoConfig.customDimensions).forEach(dimensionId => {
        this.tracker!.deleteCustomDimension(parseInt(dimensionId));
      });
    }

    // Reset user ID
    this.tracker.setUserId('');
  }

  protected doSetDebugMode(enabled: boolean): void {
    // Matomo doesn't have a specific debug mode API
    // Debug information is available in the browser console
    this.logger.info(`Matomo debug mode ${enabled ? 'enabled' : 'disabled'} (check browser console for Matomo logs)`);
  }

  /**
   * Set custom dimension value
   */
  setCustomDimension(dimensionId: number, value: string): void {
    if (!this.tracker) return;

    this.tracker.setCustomDimension(dimensionId, value);
  }

  /**
   * Delete custom dimension
   */
  deleteCustomDimension(dimensionId: number): void {
    if (!this.tracker) return;

    this.tracker.deleteCustomDimension(dimensionId);
  }

  /**
   * Set custom variable (legacy method)
   */
  setCustomVariable(index: number, name: string, value: string, scope: 'visit' | 'page' = 'visit'): void {
    if (!this.tracker) return;

    this.tracker.setCustomVariable(index, name, value, scope);
  }

  /**
   * Track a goal conversion
   */
  trackGoal(goalId: number, customRevenue?: number): void {
    if (!this.tracker) return;

    this.tracker.trackGoal(goalId, customRevenue);
  }

  /**
   * Track ecommerce cart update
   */
  trackEcommerceCartUpdate(grandTotal: number): void {
    if (!this.tracker) return;

    this.tracker.trackEcommerceCartUpdate(grandTotal);
  }

  /**
   * Get current user ID
   */
  getUserId(): string | null {
    if (!this.tracker) return null;

    return this.tracker.getUserId();
  }

  /**
   * Get visitor ID
   */
  getVisitorId(): string | null {
    if (!this.tracker) return null;

    return this.tracker.getVisitorId();
  }

  /**
   * Get visitor information
   */
  getVisitorInfo(): any[] | null {
    if (!this.tracker) return null;

    return this.tracker.getVisitorInfo();
  }

  /**
   * Get attribution information
   */
  getAttributionInfo(): any[] | null {
    if (!this.tracker) return null;

    return this.tracker.getAttributionInfo();
  }

  /**
   * Check if user has opted out
   */
  isUserOptedOut(): boolean {
    if (!this.tracker) return false;

    return this.tracker.isUserOptedOut();
  }

  /**
   * Opt user out of tracking
   */
  optUserOut(): void {
    if (!this.tracker) return;

    this.tracker.optUserOut();
  }

  /**
   * Forget user opt out
   */
  forgetUserOptOut(): void {
    if (!this.tracker) return;

    this.tracker.forgetUserOptOut();
  }

  /**
   * Send ping request
   */
  ping(): void {
    if (!this.tracker) return;

    this.tracker.ping();
  }

  /**
   * Check if Matomo is loaded
   */
  isLoaded(): boolean {
    return this.scriptLoaded && !!window.Matomo && !!this.tracker;
  }

  /**
   * Get site ID
   */
  getSiteId(): number | null {
    return this.matomoConfig?.siteId || null;
  }

  /**
   * Get tracker URL
   */
  getTrackerUrl(): string | null {
    return this.matomoConfig?.trackerUrl || null;
  }

  /**
   * Sanitize properties for Matomo
   */
  private sanitizeProperties(properties: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(properties)) {
      if (value !== null && value !== undefined) {
        // Convert to string or number as Matomo expects
        if (typeof value === 'object') {
          sanitized[key] = JSON.stringify(value);
        } else {
          sanitized[key] = value;
        }
      }
    }

    return sanitized;
  }
}