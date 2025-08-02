import { WebPlugin } from '@capacitor/core';
import type { PluginListenerHandle } from '@capacitor/core';
import { UnifiedTrackingCore } from '../core/unified-tracking-core';

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

import type {
  UnifiedTrackingPlugin,
  UnifiedTrackingConfig,
  ErrorContext,
  RevenueData,
  ConsentSettings,
} from '../definitions';

export class UnifiedTrackingCapacitorPlugin extends WebPlugin implements UnifiedTrackingPlugin {
  private core: UnifiedTrackingCore;

  constructor() {
    super();
    this.core = new UnifiedTrackingCore();
  }

  async initialize(options?: UnifiedTrackingConfig) {
    return this.core.initialize(options);
  }

  async track(event: string, properties?: Record<string, any>) {
    return this.core.track(event, properties);
  }

  async identify(userId: string, traits?: Record<string, any>) {
    return this.core.identify(userId, traits);
  }

  async setUserProperties(properties: Record<string, any>) {
    return this.core.setUserProperties(properties);
  }

  async logError(error: Error | string, context?: ErrorContext) {
    return this.core.logError(error, context);
  }

  async logRevenue(revenue: RevenueData) {
    return this.core.logRevenue(revenue);
  }

  async logScreenView(screenName: string, properties?: Record<string, any>) {
    return this.core.logScreenView(screenName, properties);
  }

  async setConsent(consent: ConsentSettings) {
    return this.core.setConsent(consent);
  }

  async reset() {
    return this.core.reset();
  }

  async getActiveProviders() {
    return this.core.getActiveProviders();
  }

  async enableDebugMode(enabled: boolean) {
    return this.core.enableDebugMode(enabled);
  }

  async addListener(
    eventName: 'trackingEvent' | 'error' | 'providerStatusChange',
    listenerFunc: (event: TrackingEvent | ProviderEvent) => void,
  ): Promise<PluginListenerHandle> {
    // Create a wrapper function that converts core events to our event types
    const wrappedListener = (eventData: any) => {
      let event: TrackingEvent | ProviderEvent;

      if (eventName === 'trackingEvent') {
        event = {
          type: 'trackingEvent',
          event: eventData.event,
          properties: eventData.properties,
          timestamp: eventData.timestamp,
        } as TrackingEvent;
      } else {
        event = {
          type: eventData.type || eventName,
          provider: eventData.provider,
          status: eventData.status,
          error: eventData.error,
          message: eventData.message,
        } as ProviderEvent;
      }

      listenerFunc(event);
    };

    const handle = await this.core.addListener(eventName, wrappedListener);

    // Wrap in Capacitor-compatible handle
    const capacitorHandle: PluginListenerHandle = {
      remove: async () => {
        handle.remove();
      },
    };

    // Also register with WebPlugin for compatibility
    await super.addListener(eventName, wrappedListener);

    return capacitorHandle;
  }
}

// Only import and register if Capacitor is available
export async function registerCapacitorPlugin() {
  try {
    const { registerPlugin } = await import('@capacitor/core');
    return registerPlugin<UnifiedTrackingPlugin>('UnifiedTracking', {
      web: () => new UnifiedTrackingCapacitorPlugin(),
    });
  } catch {
    // Silently return null if Capacitor is not available
    return null;
  }
}
