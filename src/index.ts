import { registerPlugin } from '@capacitor/core';

import type { UnifiedTrackingPlugin } from './definitions';

const UnifiedTracking = registerPlugin<UnifiedTrackingPlugin>('UnifiedTracking', {
  web: () => import('./web').then((m) => new m.UnifiedTrackingWeb()),
});

export * from './definitions';
export { UnifiedTracking };
export type { UnifiedTrackingPlugin };

// Export React integration
export * from './react';

// Export utilities for advanced usage
export { Logger } from './utils/logger';
export { EventQueue } from './utils/event-queue';
export { ConfigManager } from './utils/config-manager';

// Export base classes for extensibility
export { BaseProviderImpl as BaseProvider } from './providers/base-provider-impl';
export { BaseAnalyticsProvider } from './providers/base-analytics-provider';
export { BaseErrorTrackingProvider } from './providers/base-error-tracking-provider';

// Export provider registry for custom providers
export { ProviderRegistry } from './providers/registry';
export { RegisterProvider } from './decorators/register-provider';

// Export types (exclude ConsentSettings as it's already exported from definitions)
export type { ProviderType, ProviderConfig, ProviderState } from './types/provider';
