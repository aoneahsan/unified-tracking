import { BaseProviderImpl } from './base-provider-impl';
import type { AnalyticsProvider } from './base';
import type { RevenueData } from '../definitions';
import type { ProviderType } from '../types/provider';

/**
 * Abstract base class for analytics provider implementations
 */
export abstract class BaseAnalyticsProvider extends BaseProviderImpl implements AnalyticsProvider {
  readonly type: ProviderType = 'analytics';

  protected superProperties: Record<string, any> = {};
  protected timedEvents: Map<string, number> = new Map();

  async track(eventName: string, properties?: Record<string, any>): Promise<void> {
    this.checkReady();
    
    const mergedProperties = {
      ...this.superProperties,
      ...properties,
    };

    this.debug(`Tracking event: ${eventName}`, mergedProperties);
    
    try {
      await this.doTrack(eventName, mergedProperties);
    } catch (error) {
      this.logger.error(`Failed to track event ${eventName}`, error);
      throw error;
    }
  }

  /**
   * Provider-specific event tracking logic
   */
  protected abstract doTrack(eventName: string, properties: Record<string, any>): Promise<void>;

  async trackEvent(eventName: string, properties?: Record<string, any>): Promise<void> {
    // Alias for track method
    return this.track(eventName, properties);
  }

  async identifyUser(userId: string, traits?: Record<string, any>): Promise<void> {
    this.checkReady();
    
    this.debug(`Identifying user: ${userId}`, traits);
    
    try {
      await this.doIdentifyUser(userId, traits || {});
    } catch (error) {
      this.logger.error(`Failed to identify user ${userId}`, error);
      throw error;
    }
  }

  /**
   * Provider-specific user identification logic
   */
  protected abstract doIdentifyUser(userId: string, traits: Record<string, any>): Promise<void>;

  async setUserProperties(properties: Record<string, any>): Promise<void> {
    this.checkReady();
    
    this.debug('Setting user properties', properties);
    
    try {
      await this.doSetUserProperties(properties);
    } catch (error) {
      this.logger.error('Failed to set user properties', error);
      throw error;
    }
  }

  /**
   * Provider-specific user properties logic
   */
  protected abstract doSetUserProperties(properties: Record<string, any>): Promise<void>;

  async logScreenView(screenName: string, properties?: Record<string, any>): Promise<void> {
    this.checkReady();
    
    const screenProperties = {
      ...properties,
      screen_name: screenName,
    };
    
    this.debug(`Logging screen view: ${screenName}`, screenProperties);
    
    try {
      await this.doLogScreenView(screenName, screenProperties);
    } catch (error) {
      this.logger.error(`Failed to log screen view ${screenName}`, error);
      throw error;
    }
  }

  /**
   * Provider-specific screen view logging logic
   */
  protected abstract doLogScreenView(screenName: string, properties: Record<string, any>): Promise<void>;

  async logRevenue(data: RevenueData): Promise<void> {
    this.checkReady();
    
    this.debug('Logging revenue', data);
    
    try {
      await this.doLogRevenue(data);
    } catch (error) {
      this.logger.error('Failed to log revenue', error);
      throw error;
    }
  }

  /**
   * Provider-specific revenue logging logic
   */
  protected abstract doLogRevenue(data: RevenueData): Promise<void>;

  startTimedEvent(eventName: string): void {
    this.debug(`Starting timed event: ${eventName}`);
    this.timedEvents.set(eventName, Date.now());
  }

  async endTimedEvent(eventName: string, properties?: Record<string, any>): Promise<void> {
    const startTime = this.timedEvents.get(eventName);
    
    if (!startTime) {
      this.logger.warn(`No timed event found for: ${eventName}`);
      return;
    }

    const duration = Date.now() - startTime;
    this.timedEvents.delete(eventName);

    const timedProperties = {
      ...properties,
      duration_ms: duration,
      duration_seconds: Math.round(duration / 1000),
    };

    this.debug(`Ending timed event: ${eventName}`, timedProperties);
    
    await this.track(eventName, timedProperties);
  }

  setSuperProperties(properties: Record<string, any>): void {
    this.debug('Setting super properties', properties);
    this.superProperties = {
      ...this.superProperties,
      ...properties,
    };
  }

  async incrementUserProperty(property: string, value: number = 1): Promise<void> {
    this.checkReady();
    
    this.debug(`Incrementing user property: ${property} by ${value}`);
    
    try {
      await this.doIncrementUserProperty(property, value);
    } catch (error) {
      this.logger.error(`Failed to increment user property ${property}`, error);
      throw error;
    }
  }

  /**
   * Provider-specific user property increment logic
   * Override if provider supports this feature
   */
  protected async doIncrementUserProperty(property: string, value: number): Promise<void> {
    // Default implementation: set as regular property
    await this.setUserProperties({ [property]: value });
  }

  protected async doReset(): Promise<void> {
    this.superProperties = {};
    this.timedEvents.clear();
    await this.doProviderReset();
  }

  /**
   * Provider-specific reset logic
   */
  protected abstract doProviderReset(): Promise<void>;

  /**
   * Get common event properties
   */
  protected getCommonProperties(): Record<string, any> {
    return {
      timestamp: new Date().toISOString(),
      platform: this.getPlatform(),
      session_id: this.getSessionId?.(),
      ...this.superProperties,
    };
  }

  /**
   * Get current platform
   */
  protected getPlatform(): string {
    if (typeof window !== 'undefined') {
      return 'web';
    } else if (typeof global !== 'undefined' && global.process) {
      return 'node';
    }
    return 'unknown';
  }

  /**
   * Get session ID (override in subclasses if needed)
   */
  protected getSessionId?(): string;
}