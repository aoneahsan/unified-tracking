import { Logger } from '../utils/logger';
import type { BaseProvider } from './base';
import type { ProviderConfig, ProviderType, ConsentSettings } from '../types/provider';

/**
 * Abstract base class for all provider implementations
 */
export abstract class BaseProviderImpl implements BaseProvider {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly type: ProviderType;
  abstract readonly version: string;

  protected config: ProviderConfig = {};
  protected logger: Logger;
  protected initialized = false;
  protected enabled = true;
  protected debugMode = false;
  protected ready = false;

  constructor() {
    this.logger = Logger.getInstance();
  }

  async initialize(config: ProviderConfig): Promise<void> {
    if (this.initialized) {
      this.logger.warn(`Provider ${this.name} already initialized`);
      return;
    }

    this.logger.info(`Initializing provider ${this.name}`);
    this.config = { ...config };
    this.enabled = config.enabled !== false;
    this.debugMode = config.debug || false;

    try {
      await this.doInitialize(config);
      this.initialized = true;
      this.ready = true;
      this.logger.info(`Provider ${this.name} initialized successfully`);
    } catch (error) {
      this.logger.error(`Failed to initialize provider ${this.name}`, error);
      throw error;
    }
  }

  /**
   * Provider-specific initialization logic
   */
  protected abstract doInitialize(config: ProviderConfig): Promise<void>;

  async shutdown(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    this.logger.info(`Shutting down provider ${this.name}`);
    
    try {
      await this.doShutdown();
      this.initialized = false;
      this.ready = false;
      this.logger.info(`Provider ${this.name} shutdown successfully`);
    } catch (error) {
      this.logger.error(`Error shutting down provider ${this.name}`, error);
      throw error;
    }
  }

  /**
   * Provider-specific shutdown logic
   */
  protected abstract doShutdown(): Promise<void>;

  async updateConsent(consent: ConsentSettings): Promise<void> {
    this.logger.debug(`Updating consent for provider ${this.name}`, consent);
    
    // Check if provider should be disabled based on consent
    if (this.type === 'analytics' && consent.analytics === false) {
      await this.disable();
    } else if (this.type === 'error-tracking' && consent.errorTracking === false) {
      await this.disable();
    } else if (this.enabled === false) {
      // Re-enable if consent allows
      if (
        (this.type === 'analytics' && consent.analytics !== false) ||
        (this.type === 'error-tracking' && consent.errorTracking !== false)
      ) {
        await this.enable();
      }
    }

    // Call provider-specific consent handling
    await this.doUpdateConsent(consent);
  }

  /**
   * Provider-specific consent handling
   */
  protected abstract doUpdateConsent(consent: ConsentSettings): Promise<void>;

  isReady(): boolean {
    return this.ready && this.initialized && this.enabled;
  }

  getConfig(): ProviderConfig {
    return { ...this.config };
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.logger.info(`Provider ${this.name} ${enabled ? 'enabled' : 'disabled'}`);
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
    this.logger.info(`Provider ${this.name} debug mode ${enabled ? 'enabled' : 'disabled'}`);
    this.doSetDebugMode(enabled);
  }

  /**
   * Provider-specific debug mode handling
   */
  protected doSetDebugMode(enabled: boolean): void {
    // Override in subclasses if needed
  }

  async reset(): Promise<void> {
    this.logger.info(`Resetting provider ${this.name}`);
    await this.doReset();
  }

  /**
   * Provider-specific reset logic
   */
  protected abstract doReset(): Promise<void>;

  async pause(): Promise<void> {
    if (!this.enabled) {
      return;
    }

    this.logger.info(`Pausing provider ${this.name}`);
    this.enabled = false;
    await this.doPause?.();
  }

  /**
   * Provider-specific pause logic (optional)
   */
  protected doPause?(): Promise<void>;

  async resume(): Promise<void> {
    if (this.enabled) {
      return;
    }

    this.logger.info(`Resuming provider ${this.name}`);
    this.enabled = true;
    await this.doResume?.();
  }

  /**
   * Provider-specific resume logic (optional)
   */
  protected doResume?(): Promise<void>;

  protected async enable(): Promise<void> {
    this.enabled = true;
    await this.doEnable?.();
  }

  protected async disable(): Promise<void> {
    this.enabled = false;
    await this.doDisable?.();
  }

  /**
   * Provider-specific enable logic (optional)
   */
  protected doEnable?(): Promise<void>;

  /**
   * Provider-specific disable logic (optional)
   */
  protected doDisable?(): Promise<void>;

  /**
   * Check if provider is initialized and enabled
   */
  protected checkReady(): void {
    if (!this.initialized) {
      throw new Error(`Provider ${this.name} not initialized`);
    }
    if (!this.enabled) {
      throw new Error(`Provider ${this.name} is disabled`);
    }
  }

  /**
   * Log debug message if debug mode is enabled
   */
  protected debug(message: string, data?: any): void {
    if (this.debugMode) {
      this.logger.debug(`[${this.name}] ${message}`, data);
    }
  }
}