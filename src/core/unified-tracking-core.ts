import type {
  UnifiedTrackingPlugin,
  UnifiedTrackingConfig,
  InitializeResult,
  ErrorContext,
  RevenueData,
  ConsentSettings,
  ActiveProvidersResult,
} from '../definitions.js';
import { ProviderManager } from '../providers/provider-manager.js';
import { ConfigManager } from '../utils/config-manager.js';
import { EventQueue } from '../utils/event-queue.js';
import { Logger } from '../utils/logger.js';

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
      this.logger.debug('Initializing Unified Tracking', Logger.redact(options));

      // Load and merge configuration
      const config = await this.configManager.loadConfig(options);

      // Set global settings
      if (config.settings?.debug) {
        this.logger.setDebugMode(true);
      }

      // Initialize providers
      await this.providerManager.initialize(config);

      this.initialized = true;

      // Replay any events that were buffered before init completed (FIFO order).
      await this.replayQueuedEvents();

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

      // Surface providers that failed to load/init so partial-success is visible
      // to the caller instead of silently missing from activeProviders.
      const warnings = this.providerManager.getInitWarnings();
      if (warnings.length > 0) {
        result.warnings = warnings;
        warnings.forEach((warning) => this.logger.warn(warning));
      }

      this.logger.info('Unified Tracking initialized successfully', result);

      return result;
    } catch (error) {
      this.logger.error('Failed to initialize Unified Tracking', error);
      throw error;
    }
  }

  /**
   * Buffer an event when called before initialize() has resolved, so events fired during
   * app startup are not lost. Returns true if the event was buffered (caller returns
   * early); false once initialized so the caller dispatches normally. Buffered events are
   * replayed in FIFO order by replayQueuedEvents() once initialize() completes.
   */
  private bufferIfNotReady(
    type: 'track' | 'identify' | 'error' | 'revenue' | 'screenView' | 'userProperties',
    data: Record<string, unknown>,
  ): boolean {
    if (this.initialized) {
      return false;
    }
    this.eventQueue.add({ type, data });
    this.logger.debug(`Buffered "${type}" event until initialize() completes`);
    return true;
  }

  /** Replay (in FIFO order) any events buffered before initialize() completed. */
  private async replayQueuedEvents(): Promise<void> {
    const events = this.eventQueue.drain();
    if (events.length === 0) {
      return;
    }
    this.logger.debug(`Replaying ${events.length} buffered event(s)`);
    for (const e of events) {
      const d = e.data;
      try {
        switch (e.type) {
          case 'track':
            await this.track(d.event as string, d.properties as Record<string, unknown> | undefined);
            break;
          case 'identify':
            await this.identify(d.userId as string, d.traits as Record<string, unknown> | undefined);
            break;
          case 'screenView':
            await this.logScreenView(d.screenName as string, d.properties as Record<string, unknown> | undefined);
            break;
          case 'revenue':
            await this.logRevenue(d.revenue as RevenueData);
            break;
          case 'userProperties':
            await this.setUserProperties(d.properties as Record<string, unknown>);
            break;
          case 'error':
            await this.logError(d.error as Error | string, d.context as ErrorContext | undefined);
            break;
        }
      } catch (err) {
        this.logger.error('Failed to replay a buffered event', err);
      }
    }
  }

  async track(event: string, properties?: Record<string, unknown>): Promise<void> {
    if (typeof event !== 'string' || event.trim() === '') {
      this.logger.warn('track() called with an invalid event name; ignoring.', event);
      return;
    }

    if (this.bufferIfNotReady('track', { event, properties })) {
      return;
    }

    this.logger.debug('Tracking event', { event, properties });

    await this.providerManager.trackEvent(event, properties);

    this.notifyListeners('trackingEvent', { event, properties });
  }

  async identify(userId: string, traits?: Record<string, unknown>): Promise<void> {
    if (typeof userId !== 'string' || userId.trim() === '') {
      this.logger.warn('identify() called with an invalid userId; ignoring.');
      return;
    }

    if (this.bufferIfNotReady('identify', { userId, traits })) {
      return;
    }

    this.logger.debug('Identifying user', { userId, traits });

    await this.providerManager.identifyUser(userId, traits);
  }

  async setUserProperties(properties: Record<string, unknown>): Promise<void> {
    if (!properties || typeof properties !== 'object' || Array.isArray(properties)) {
      this.logger.warn('setUserProperties() called with a non-object; ignoring.');
      return;
    }

    if (this.bufferIfNotReady('userProperties', { properties })) {
      return;
    }

    this.logger.debug('Setting user properties', properties);

    await this.providerManager.setUserProperties(properties);
  }

  async logError(error: Error | string, context?: ErrorContext): Promise<void> {
    if (this.bufferIfNotReady('error', { error, context })) {
      return;
    }

    const errorObj = typeof error === 'string' ? new Error(error) : error;

    // Debug-level only: never print the consumer's tracked errors (or their PII
    // context) to console.error by default — that is the host app's concern.
    this.logger.debug('Logging error to providers', errorObj.message);

    await this.providerManager.logError(errorObj, context);

    this.notifyListeners('error', { error: errorObj, context });
  }

  async logRevenue(revenue: RevenueData): Promise<void> {
    if (!revenue || typeof revenue.amount !== 'number' || !Number.isFinite(revenue.amount)) {
      this.logger.warn('logRevenue() called with an invalid amount; ignoring.', revenue?.amount);
      return;
    }

    if (this.bufferIfNotReady('revenue', { revenue })) {
      return;
    }

    this.logger.debug('Logging revenue', revenue);

    await this.providerManager.logRevenue(revenue);
  }

  async logScreenView(screenName: string, properties?: Record<string, unknown>): Promise<void> {
    if (typeof screenName !== 'string' || screenName.trim() === '') {
      this.logger.warn('logScreenView() called with an invalid screenName; ignoring.');
      return;
    }

    if (this.bufferIfNotReady('screenView', { screenName, properties })) {
      return;
    }

    this.logger.debug('Logging screen view', { screenName, properties });

    await this.providerManager.logScreenView(screenName, properties);
  }

  async setConsent(consent: ConsentSettings): Promise<void> {
    if (!consent || typeof consent !== 'object' || Array.isArray(consent)) {
      this.logger.warn('setConsent() called with a non-object; ignoring.');
      return;
    }

    this.logger.debug('Setting consent', consent);

    // Intentionally NOT gated by ensureInitialized(): consent may legitimately be set
    // before initialize() (e.g. a consent banner resolves first). Dispatch methods do
    // require init; this one applies the consent to the config + any active providers.
    this.configManager.setConsent(consent);
    await this.providerManager.handleConsentChange(consent);
  }

  async reset(): Promise<void> {
    this.logger.debug('Resetting Unified Tracking');

    await this.providerManager.reset();
    this.eventQueue.clear();
  }

  /**
   * Fully tear down tracking: shuts down + unregisters every provider, clears all event
   * listeners, and returns the engine to an uninitialized state (a later initialize()
   * starts fresh). Use this on logout/app-teardown; reset() only clears user state while
   * keeping providers running.
   */
  async shutdown(): Promise<void> {
    this.logger.debug('Shutting down Unified Tracking');

    await this.providerManager.shutdown();
    this.listeners.clear();
    this.initialized = false;
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
}

// Create singleton instance
let instance: UnifiedTrackingCore | null = null;

export function getUnifiedTracking(): UnifiedTrackingCore {
  if (!instance) {
    instance = new UnifiedTrackingCore();
  }
  return instance;
}
