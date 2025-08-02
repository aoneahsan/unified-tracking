import { getUnifiedTracking } from './core/unified-tracking-core';
import type { UnifiedTrackingPlugin } from './definitions';

// Export the core instance as default
export const UnifiedTracking = getUnifiedTracking();

// Export all types and definitions
export * from './definitions';
export type { UnifiedTrackingPlugin };

// Note: React integration is available via 'unified-tracking/react'
// This avoids circular dependencies

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

// Export types
export type { ProviderType, ProviderConfig, ProviderState } from './types/provider';

// Export core class for advanced usage
export { UnifiedTrackingCore } from './core/unified-tracking-core';
