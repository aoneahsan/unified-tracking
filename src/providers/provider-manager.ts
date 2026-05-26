import { Logger } from '../utils/logger.js';
import { ConfigManager } from '../utils/config-manager.js';
import { EventQueue } from '../utils/event-queue.js';
import { ProviderRegistry } from './registry.js';
import { PROVIDER_LOADERS } from './provider-loaders.js';
import type { Provider, ProviderType, ProviderState, ProviderConfig, ConsentSettings } from '../types/provider.js';
import type { AnalyticsProvider } from './base.js';
import type { ErrorTrackingProvider } from './base.js';
import type { UnifiedTrackingConfig, ErrorContext, RevenueData } from '../definitions.js';

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
  private initWarnings: string[] = [];

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
    this.initWarnings = [];

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

  /** Warnings collected during initialize() — providers that failed to load or init. */
  getInitWarnings(): string[] {
    return [...this.initWarnings];
  }

  private async initializeProviders(providerNames: string[], type: ProviderType, config: any): Promise<void> {
    for (const name of providerNames) {
      try {
        const provider = await this.loadProvider(name, type);
        if (provider) {
          await this.registerProvider(name, provider, config[name] || {});
        } else {
          this.initWarnings.push(`Provider "${name}" could not be loaded and was skipped.`);
        }
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        this.initWarnings.push(`Provider "${name}" failed to initialize: ${reason}`);
        this.logger.error(`Failed to initialize provider ${name}`, error);
        // Continue with other providers (fail-open)
      }
    }
  }

  private async loadProvider(name: string, type: ProviderType): Promise<Provider | null> {
    const resolution = this.resolveProviderModule(name, type);
    try {
      const registry = ProviderRegistry.getInstance();

      // Provider modules self-register with the registry (via the @RegisterProvider
      // decorator) as a side effect of being imported. Import through the static loader
      // map so the specifier is statically analyzable by bundlers and resolvable by Node
      // ESM — a runtime-built variable specifier is neither, and also lets an arbitrary
      // (non-allowlisted) name trigger an unintended module import.
      if (!registry.has(resolution.registryId)) {
        const loadModule = PROVIDER_LOADERS[resolution.registryId];
        if (!loadModule) {
          this.logger.warn(
            `Unknown provider "${name}" (id "${resolution.registryId}") is not registered and was skipped.`,
          );
          return null;
        }
        await loadModule();
      }

      if (registry.has(resolution.registryId)) {
        return registry.createProvider(resolution.registryId);
      }

      throw new Error(`Provider ${name} not found in registry after import`);
    } catch (error) {
      this.logger.error(`Failed to load provider ${name}`, error);
      return null;
    }
  }

  private resolveProviderModule(
    name: string,
    type: ProviderType,
  ): { folder: string; file: string; registryId: string } {
    if (type === 'analytics') {
      if (name === 'google') {
        return {
          folder: 'google-analytics',
          file: 'google-analytics',
          registryId: 'google-analytics',
        };
      }
    }

    if (type === 'error-tracking') {
      if (name === 'crashlytics') {
        return {
          folder: 'firebase-crashlytics',
          file: 'firebase-crashlytics',
          registryId: 'firebase-crashlytics',
        };
      }
    }

    return {
      folder: name,
      file: name,
      registryId: name,
    };
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
        if (provider.type === 'analytics' && 'trackEvent' in provider) {
          const eventData = event.data as { eventName: string; properties?: Record<string, any> };
          await (provider as AnalyticsProvider).trackEvent(eventData.eventName, eventData.properties);
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

        // Update provider state based on consent — scoped to the matching
        // provider type so toggling one category never resurrects a provider
        // that was disabled for a different category (or a different reason).
        const type = instance.provider.type;
        let consented: boolean | undefined;
        if (type === 'analytics') {
          consented = consent.analytics;
        } else if (type === 'error-tracking') {
          consented = consent.errorTracking;
        }

        if (consented === false) {
          instance.state = 'disabled';
        } else if (consented === true && instance.state === 'disabled') {
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

  /** False when the consumer has explicitly denied consent for this provider type. */
  private hasConsent(type: ProviderType): boolean {
    const consent = this.configManager.getConsent();
    if (type === 'analytics') {
      return consent.analytics !== false;
    }
    if (type === 'error-tracking') {
      return consent.errorTracking !== false;
    }
    return true;
  }

  /**
   * Removes any keys listed in settings.privacy.excludedProperties from an
   * event payload before it is dispatched to providers (data minimization).
   * Returns the input unchanged when there is nothing to strip.
   */
  private applyPrivacy<T extends Record<string, any> | undefined>(properties: T): T {
    const excluded = this.configManager.getConfig().settings?.privacy?.excludedProperties;
    if (!properties || !excluded || excluded.length === 0) {
      return properties;
    }
    const excludedSet = new Set(excluded);
    // Recurse into nested objects/arrays so an excluded key is stripped at any depth
    // (a shallow top-level delete left e.g. { user: { email } } exposed). Returns a
    // deep copy so the caller's nested objects are never mutated. Depth-capped.
    const strip = (value: unknown, depth: number): unknown => {
      if (!value || typeof value !== 'object' || depth > 6) {
        return value;
      }
      if (Array.isArray(value)) {
        return value.map((item) => strip(item, depth + 1));
      }
      const out: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
        if (excludedSet.has(key)) {
          continue;
        }
        out[key] = strip(val, depth + 1);
      }
      return out;
    };
    return strip(properties, 0) as T;
  }

  async trackEvent(eventName: string, properties?: Record<string, any>): Promise<void> {
    if (!this.hasConsent('analytics')) {
      return;
    }
    const sanitized = this.applyPrivacy(properties);
    const analyticsProviders = this.getActiveProviders('analytics') as AnalyticsProvider[];

    const promises = analyticsProviders.map((provider) =>
      provider.trackEvent(eventName, sanitized).catch((error) => {
        this.logger.error(`Failed to track event with provider ${provider.id}`, error);
      }),
    );

    await Promise.all(promises);
  }

  async identifyUser(userId: string, traits?: Record<string, any>): Promise<void> {
    if (!this.hasConsent('analytics')) {
      return;
    }
    const sanitized = this.applyPrivacy(traits);
    const analyticsProviders = this.getActiveProviders('analytics') as AnalyticsProvider[];

    const promises = analyticsProviders.map((provider) =>
      provider.identifyUser(userId, sanitized).catch((error) => {
        this.logger.error(`Failed to identify user with provider ${provider.id}`, error);
      }),
    );

    await Promise.all(promises);
  }

  async setUserProperties(properties: Record<string, any>): Promise<void> {
    if (!this.hasConsent('analytics')) {
      return;
    }
    const sanitized = this.applyPrivacy(properties);
    const analyticsProviders = this.getActiveProviders('analytics') as AnalyticsProvider[];

    const promises = analyticsProviders.map((provider) =>
      provider.setUserProperties(sanitized).catch((error) => {
        this.logger.error(`Failed to set user properties with provider ${provider.id}`, error);
      }),
    );

    await Promise.all(promises);
  }

  async logError(error: Error | string, context?: ErrorContext): Promise<void> {
    if (!this.hasConsent('error-tracking')) {
      return;
    }
    const sanitized = context?.extra ? { ...context, extra: this.applyPrivacy(context.extra) } : context;
    const errorProviders = this.getActiveProviders('error-tracking') as ErrorTrackingProvider[];

    const promises = errorProviders.map((provider) =>
      provider.logError(error, sanitized).catch((err) => {
        this.logger.error(`Failed to log error with provider ${provider.id}`, err);
      }),
    );

    await Promise.all(promises);
  }

  async logRevenue(revenue: RevenueData): Promise<void> {
    if (!this.hasConsent('analytics')) {
      return;
    }
    const sanitized = revenue.properties ? { ...revenue, properties: this.applyPrivacy(revenue.properties) } : revenue;
    const analyticsProviders = this.getActiveProviders('analytics') as AnalyticsProvider[];

    const promises = analyticsProviders.map((provider) =>
      provider.logRevenue(sanitized).catch((error) => {
        this.logger.error(`Failed to log revenue with provider ${provider.id}`, error);
      }),
    );

    await Promise.all(promises);
  }

  async logScreenView(screenName: string, properties?: Record<string, any>): Promise<void> {
    if (!this.hasConsent('analytics')) {
      return;
    }
    const sanitized = this.applyPrivacy(properties);
    const analyticsProviders = this.getActiveProviders('analytics') as AnalyticsProvider[];

    const promises = analyticsProviders.map((provider) =>
      provider.logScreenView(screenName, sanitized).catch((error) => {
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
        if (instance.provider.reset) {
          await instance.provider.reset();
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
        if (instance.provider.setDebugMode) {
          instance.provider.setDebugMode(enabled);
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
