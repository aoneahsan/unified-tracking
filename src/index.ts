import { getUnifiedTracking } from './core/unified-tracking-core.js';

// Export the plugin interface for docgen
export const UnifiedTrackingPlugin = getUnifiedTracking();

// Export the core instance as UnifiedTracking
export const UnifiedTracking = UnifiedTrackingPlugin;

// Export all types and definitions
export * from './definitions.js';

// Note: React integration is available via 'unified-tracking/react'
// This avoids circular dependencies

// Export utilities for advanced usage
export { Logger } from './utils/logger.js';
export { EventQueue } from './utils/event-queue.js';
export { ConfigManager } from './utils/config-manager.js';

// Export base classes for extensibility
export { BaseProviderImpl as BaseProvider } from './providers/base-provider-impl.js';
export { BaseAnalyticsProvider } from './providers/base-analytics-provider.js';
export { BaseErrorTrackingProvider } from './providers/base-error-tracking-provider.js';

// Export provider registry for custom providers
export { ProviderRegistry } from './providers/registry.js';
export { RegisterProvider } from './decorators/register-provider.js';

// Export types
export type { ProviderType, ProviderConfig, ProviderState } from './types/provider.js';

// Export core class for advanced usage
export { UnifiedTrackingCore } from './core/unified-tracking-core.js';
