import { Logger } from '../utils/logger';
import { ConfigManager } from '../utils/config-manager';
import { EventQueue } from '../utils/event-queue';
import type { Provider, ProviderType, ProviderState, ProviderConfig, ConsentSettings } from '../types/provider';
import type { AnalyticsProvider } from './base';
import type { ErrorTrackingProvider } from './base';
import type { UnifiedTrackingConfig, ErrorContext, RevenueData } from '../definitions';

export interface ProviderInstance {
  provider: Provider;
  state: ProviderState;
  config: ProviderConfig;
}

export class ProviderManager {
  private providers: Map<string, ProviderInstance> = new Map();
  private logger: Logger;
  private configManager: ConfigManager;
  private eventQueue: EventQueue;
  private initialized = false;

  constructor() {
    this.logger = Logger.getInstance();
    this.configManager = ConfigManager.getInstance();
    this.eventQueue = EventQueue.getInstance();
  }

  async initialize(config?: UnifiedTrackingConfig): Promise<void> {
    if (config) {
      await this.configManager.loadConfig(config);
    }

    if (this.initialized) {
      this.logger.warn('ProviderManager already initialized');
      return;
    }

    this.logger.info('Initializing ProviderManager');

    try {
      const config = this.configManager.getConfig();

      // Initialize analytics providers
      if (config.analytics?.providers) {
        await this.initializeProviders(config.analytics.providers, 'analytics', config.analytics);
      }

      // Initialize error tracking providers
      if (config.errorTracking?.providers) {
        await this.initializeProviders(config.errorTracking.providers, 'error-tracking', config.errorTracking);
      }

      this.initialized = true;
      this.logger.info('ProviderManager initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize ProviderManager', error);
      throw error;
    }
  }

  private async initializeProviders(providerNames: string[], type: ProviderType, config: any): Promise<void> {
    for (const name of providerNames) {
      try {
        const provider = await this.loadProvider(name, type);
        if (provider) {
          await this.registerProvider(name, provider, config[name] || {});
        }
      } catch (error) {
        this.logger.error(`Failed to initialize provider ${name}`, error);
        // Continue with other providers
      }
    }
  }

  private async loadProvider(name: string, type: ProviderType): Promise<Provider | null> {
    try {
      // First check if provider is already registered
      const { ProviderRegistry } = await import('./registry');
      const registry = ProviderRegistry.getInstance();

      if (registry.has(name)) {
        return registry.createProvider(name);
      }

      // Try dynamic import if not in registry
      const modulePath =
        type === 'analytics' ? `./analytics/${name}/${name}.provider` : `./error-handling/${name}/${name}.provider`;

      await import(modulePath);

      // Check registry again after import
      if (registry.has(name)) {
        return registry.createProvider(name);
      }

      throw new Error(`Provider ${name} not found after import`);
    } catch (error) {
      this.logger.error(`Failed to load provider ${name}`, error);
      return null;
    }
  }

  async registerProvider(id: string, provider: Provider, config: ProviderConfig): Promise<void> {
    if (this.providers.has(id)) {
      this.logger.warn(`Provider ${id} already registered`);
      return;
    }

    try {
      // Initialize the provider
      await provider.initialize(config);

      const instance: ProviderInstance = {
        provider,
        state: 'active',
        config,
      };

      this.providers.set(id, instance);
      this.logger.info(`Provider ${id} registered successfully`);

      // Process queued events for this provider
      await this.processQueuedEvents(id, provider);
    } catch (error) {
      this.logger.error(`Failed to register provider ${id}`, error);
      throw error;
    }
  }

  private async processQueuedEvents(providerId: string, provider: Provider): Promise<void> {
    const events = this.eventQueue.getEventsForProvider(providerId);

    for (const event of events) {
      try {
        if (provider.type === 'analytics' && 'track' in provider) {
          const eventData = event.data as { eventName: string; properties?: Record<string, any> };
          await (provider as AnalyticsProvider).track(eventData.eventName, eventData.properties);
        } else if (provider.type === 'error-tracking' && 'logError' in provider) {
          const errorData = event.data as { error: Error | string; context?: ErrorContext };
          await (provider as ErrorTrackingProvider).logError(errorData.error, errorData.context);
        }
      } catch (error) {
        this.logger.error(`Failed to process queued event for ${providerId}`, error);
      }
    }
  }

  async unregisterProvider(id: string): Promise<void> {
    const instance = this.providers.get(id);
    if (!instance) {
      this.logger.warn(`Provider ${id} not found`);
      return;
    }

    try {
      await instance.provider.shutdown();
      this.providers.delete(id);
      this.logger.info(`Provider ${id} unregistered successfully`);
    } catch (error) {
      this.logger.error(`Failed to unregister provider ${id}`, error);
      throw error;
    }
  }

  getProvider(id: string): Provider | undefined {
    return this.providers.get(id)?.provider;
  }

  getActiveProviders(type?: ProviderType): Provider[] {
    const activeProviders: Provider[] = [];

    for (const instance of this.providers.values()) {
      if (instance.state === 'active') {
        if (!type || instance.provider.type === type) {
          activeProviders.push(instance.provider);
        }
      }
    }

    return activeProviders;
  }

  async setProviderState(id: string, state: ProviderState): Promise<void> {
    const instance = this.providers.get(id);
    if (!instance) {
      throw new Error(`Provider ${id} not found`);
    }

    instance.state = state;

    if (state === 'paused') {
      await instance.provider.pause?.();
    } else if (state === 'active') {
      await instance.provider.resume?.();
    }

    this.logger.info(`Provider ${id} state changed to ${state}`);
  }

  async updateConsent(consent: ConsentSettings): Promise<void> {
    for (const [id, instance] of this.providers) {
      try {
        await instance.provider.updateConsent(consent);

        // Update provider state based on consent
        if (consent.analytics === false && instance.provider.type === 'analytics') {
          instance.state = 'disabled';
        } else if (consent.errorTracking === false && instance.provider.type === 'error-tracking') {
          instance.state = 'disabled';
        } else if (instance.state === 'disabled') {
          instance.state = 'active';
        }
      } catch (error) {
        this.logger.error(`Failed to update consent for provider ${id}`, error);
      }
    }
  }

  async shutdown(): Promise<void> {
    this.logger.info('Shutting down ProviderManager');

    const shutdownPromises: Promise<void>[] = [];

    for (const [id, instance] of this.providers) {
      shutdownPromises.push(
        instance.provider.shutdown().catch((error) => {
          this.logger.error(`Failed to shutdown provider ${id}`, error);
        }),
      );
    }

    await Promise.all(shutdownPromises);
    this.providers.clear();
    this.initialized = false;

    this.logger.info('ProviderManager shutdown complete');
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getProviderStates(): Record<string, ProviderState> {
    const states: Record<string, ProviderState> = {};

    for (const [id, instance] of this.providers) {
      states[id] = instance.state;
    }

    return states;
  }

  async trackEvent(eventName: string, properties?: Record<string, any>): Promise<void> {
    const analyticsProviders = this.getActiveProviders('analytics') as AnalyticsProvider[];

    const promises = analyticsProviders.map((provider) =>
      provider.trackEvent(eventName, properties).catch((error) => {
        this.logger.error(`Failed to track event with provider ${provider.id}`, error);
      }),
    );

    await Promise.all(promises);
  }

  async identifyUser(userId: string, traits?: Record<string, any>): Promise<void> {
    const analyticsProviders = this.getActiveProviders('analytics') as AnalyticsProvider[];

    const promises = analyticsProviders.map((provider) =>
      provider.identifyUser(userId, traits).catch((error) => {
        this.logger.error(`Failed to identify user with provider ${provider.id}`, error);
      }),
    );

    await Promise.all(promises);
  }

  async setUserProperties(properties: Record<string, any>): Promise<void> {
    const analyticsProviders = this.getActiveProviders('analytics') as AnalyticsProvider[];

    const promises = analyticsProviders.map((provider) =>
      provider.setUserProperties(properties).catch((error) => {
        this.logger.error(`Failed to set user properties with provider ${provider.id}`, error);
      }),
    );

    await Promise.all(promises);
  }

  async logError(error: Error | string, context?: ErrorContext): Promise<void> {
    const errorProviders = this.getActiveProviders('error-tracking') as ErrorTrackingProvider[];

    const promises = errorProviders.map((provider) =>
      provider.logError(error, context).catch((err) => {
        this.logger.error(`Failed to log error with provider ${provider.id}`, err);
      }),
    );

    await Promise.all(promises);
  }

  async logRevenue(revenue: RevenueData): Promise<void> {
    const analyticsProviders = this.getActiveProviders('analytics') as AnalyticsProvider[];

    const promises = analyticsProviders.map((provider) =>
      provider.logRevenue(revenue).catch((error) => {
        this.logger.error(`Failed to log revenue with provider ${provider.id}`, error);
      }),
    );

    await Promise.all(promises);
  }

  async logScreenView(screenName: string, properties?: Record<string, any>): Promise<void> {
    const analyticsProviders = this.getActiveProviders('analytics') as AnalyticsProvider[];

    const promises = analyticsProviders.map((provider) =>
      provider.logScreenView(screenName, properties).catch((error) => {
        this.logger.error(`Failed to log screen view with provider ${provider.id}`, error);
      }),
    );

    await Promise.all(promises);
  }

  async handleConsentChange(consent: ConsentSettings): Promise<void> {
    await this.updateConsent(consent);
  }

  async reset(): Promise<void> {
    for (const [id, instance] of this.providers) {
      try {
        if ('reset' in instance.provider) {
          await (instance.provider as any).reset();
        }
      } catch (error) {
        this.logger.error(`Failed to reset provider ${id}`, error);
      }
    }
  }

  setDebugMode(enabled: boolean): void {
    this.logger.setDebugMode(enabled);

    for (const [id, instance] of this.providers) {
      try {
        if ('setDebugMode' in instance.provider) {
          (instance.provider as any).setDebugMode(enabled);
        }
      } catch (error) {
        this.logger.error(`Failed to set debug mode for provider ${id}`, error);
      }
    }
  }
}

// Singleton instance
let instance: ProviderManager | null = null;

export function getProviderManager(): ProviderManager {
  if (!instance) {
    instance = new ProviderManager();
  }
  return instance;
}
