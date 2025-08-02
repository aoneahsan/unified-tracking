import type {
  UnifiedTrackingPlugin,
  UnifiedTrackingConfig,
  InitializeResult,
  ErrorContext,
  RevenueData,
  ConsentSettings,
  ActiveProvidersResult,
} from '../definitions';
import { ProviderManager } from '../providers/provider-manager';
import { ConfigManager } from '../utils/config-manager';
import { EventQueue } from '../utils/event-queue';
import { Logger } from '../utils/logger';

export interface TrackingEvent {
  type: 'trackingEvent';
  event: string;
  properties?: Record<string, unknown>;
  timestamp?: string;
}

export interface ProviderEvent {
  type: 'error' | 'providerStatusChange';
  provider?: string;
  status?: string;
  error?: Error;
  message?: string;
}

export type EventData =
  | TrackingEvent
  | ProviderEvent
  | {
      event: string;
      properties?: Record<string, unknown>;
    }
  | {
      error: Error;
      context?: ErrorContext;
    };

export interface EventListener {
  (event: EventData): void;
}

export interface ListenerHandle {
  remove: () => Promise<void>;
}

export class UnifiedTrackingCore implements UnifiedTrackingPlugin {
  private providerManager: ProviderManager;
  private configManager: ConfigManager;
  private eventQueue: EventQueue;
  private logger: Logger;
  private initialized = false;
  private listeners: Map<string, Set<EventListener>> = new Map();

  constructor() {
    this.logger = Logger.getInstance('UnifiedTracking');
    this.configManager = ConfigManager.getInstance();
    this.eventQueue = EventQueue.getInstance();
    this.providerManager = new ProviderManager();
  }

  async initialize(options?: UnifiedTrackingConfig): Promise<InitializeResult> {
    try {
      this.logger.debug('Initializing Unified Tracking', options);

      // Load and merge configuration
      const config = await this.configManager.loadConfig(options);

      // Set global settings
      if (config.settings?.debug) {
        this.logger.setDebugMode(true);
      }

      // Initialize providers
      await this.providerManager.initialize(config);

      // Start event queue processing
      this.eventQueue.start();

      this.initialized = true;

      const analyticsProviders = this.providerManager.getActiveProviders('analytics');
      const errorProviders = this.providerManager.getActiveProviders('error-tracking');

      const result: InitializeResult = {
        success: true,
        activeProviders: {
          analytics: analyticsProviders.map((p) => ({
            name: p.name,
            enabled: true,
            initialized: p.isReady(),
            version: p.version,
          })),
          errorTracking: errorProviders.map((p) => ({
            name: p.name,
            enabled: true,
            initialized: p.isReady(),
            version: p.version,
          })),
        },
      };

      this.logger.info('Unified Tracking initialized successfully', result);

      return result;
    } catch (error) {
      this.logger.error('Failed to initialize Unified Tracking', error);
      throw error;
    }
  }

  async track(event: string, properties?: Record<string, unknown>): Promise<void> {
    this.ensureInitialized();

    this.logger.debug('Tracking event', { event, properties });

    await this.providerManager.trackEvent(event, properties);

    this.notifyListeners('trackingEvent', { event, properties });
  }

  async identify(userId: string, traits?: Record<string, unknown>): Promise<void> {
    this.ensureInitialized();

    this.logger.debug('Identifying user', { userId, traits });

    await this.providerManager.identifyUser(userId, traits);
  }

  async setUserProperties(properties: Record<string, unknown>): Promise<void> {
    this.ensureInitialized();

    this.logger.debug('Setting user properties', properties);

    await this.providerManager.setUserProperties(properties);
  }

  async logError(error: Error | string, context?: ErrorContext): Promise<void> {
    this.ensureInitialized();

    const errorObj = typeof error === 'string' ? new Error(error) : error;

    this.logger.error('Logging error', errorObj, context);

    await this.providerManager.logError(errorObj, context);

    this.notifyListeners('error', { error: errorObj, context });
  }

  async logRevenue(revenue: RevenueData): Promise<void> {
    this.ensureInitialized();

    this.logger.debug('Logging revenue', revenue);

    await this.providerManager.logRevenue(revenue);
  }

  async logScreenView(screenName: string, properties?: Record<string, unknown>): Promise<void> {
    this.ensureInitialized();

    this.logger.debug('Logging screen view', { screenName, properties });

    await this.providerManager.logScreenView(screenName, properties);
  }

  async setConsent(consent: ConsentSettings): Promise<void> {
    this.logger.debug('Setting consent', consent);

    this.configManager.setConsent(consent);
    await this.providerManager.handleConsentChange(consent);
  }

  async reset(): Promise<void> {
    this.logger.debug('Resetting Unified Tracking');

    await this.providerManager.reset();
    this.eventQueue.clear();
  }

  async getActiveProviders(): Promise<ActiveProvidersResult> {
    const analyticsProviders = this.providerManager.getActiveProviders('analytics');
    const errorProviders = this.providerManager.getActiveProviders('error-tracking');

    return {
      analytics: analyticsProviders.map((p) => ({
        name: p.name,
        enabled: true,
        initialized: p.isReady(),
        version: p.version,
      })),
      errorTracking: errorProviders.map((p) => ({
        name: p.name,
        enabled: true,
        initialized: p.isReady(),
        version: p.version,
      })),
    };
  }

  async enableDebugMode(enabled: boolean): Promise<void> {
    this.logger.setDebugMode(enabled);
    this.providerManager.setDebugMode(enabled);
  }

  async addListener(
    eventName: 'trackingEvent' | 'error' | 'providerStatusChange',
    listenerFunc: EventListener,
  ): Promise<ListenerHandle> {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }

    const listeners = this.listeners.get(eventName)!;
    listeners.add(listenerFunc);

    return {
      remove: async () => {
        listeners.delete(listenerFunc);
      },
    };
  }

  protected notifyListeners(eventName: string, data: EventData): void {
    const listeners = this.listeners.get(eventName);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(data);
        } catch (error) {
          this.logger.error(`Error in listener for ${eventName}`, error);
        }
      });
    }
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('UnifiedTracking not initialized. Call initialize() first.');
    }
  }
}

// Create singleton instance
let instance: UnifiedTrackingCore | null = null;

export function getUnifiedTracking(): UnifiedTrackingCore {
  if (!instance) {
    instance = new UnifiedTrackingCore();
  }
  return instance;
}
