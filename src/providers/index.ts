export * from './base.js';
export * from './base-provider-impl.js';
export * from './base-analytics-provider.js';
export * from './base-error-tracking-provider.js';
export * from './provider-manager.js';
export * from './registry.js';
export { PROVIDER_LOADERS, KNOWN_PROVIDER_IDS } from './provider-loaders.js';
export type { ProviderModuleLoader } from './provider-loaders.js';

import { ProviderRegistry } from './registry.js';
import { PROVIDER_LOADERS } from './provider-loaders.js';
import { Logger } from '../utils/logger.js';

const logger = Logger.getInstance();

/**
 * Eagerly import every provider module so each one self-registers with the
 * {@link ProviderRegistry}. This is OPTIONAL — `ProviderManager` already lazily loads only
 * the providers a consumer configures (the preferred path, which preserves per-provider
 * tree-shaking). Call this only if you explicitly want every provider registered up front.
 */
export async function loadProviders(): Promise<void> {
  const registry = ProviderRegistry.getInstance();
  await Promise.all(
    Object.entries(PROVIDER_LOADERS).map(async ([id, load]) => {
      try {
        await load();
      } catch {
        // Provider module could not be loaded (e.g. its optional vendor SDK is absent).
        logger.debug(`Provider ${id} not available`);
      }
    }),
  );
  logger.info(`Loaded ${registry.getAll().length} providers`);
}

/**
 * Get the provider registry instance
 */
export function getProviderRegistry(): ProviderRegistry {
  return ProviderRegistry.getInstance();
}
