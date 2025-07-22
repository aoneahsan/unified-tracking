export * from './base';
export * from './base-provider-impl';
export * from './base-analytics-provider';
export * from './base-error-tracking-provider';
export * from './provider-manager';
export * from './registry';

import { ProviderRegistry } from './registry';
import { Logger } from '../utils/logger';

const logger = Logger.getInstance();

/**
 * Load all available providers
 */
export async function loadProviders(): Promise<void> {
  const registry = ProviderRegistry.getInstance();

  try {
    // Analytics providers
    await loadAnalyticsProviders();

    // Error tracking providers
    await loadErrorTrackingProviders();

    logger.info(`Loaded ${registry.getAll().length} providers`);
  } catch (error) {
    logger.error('Failed to load providers', error);
  }
}

async function loadAnalyticsProviders(): Promise<void> {
  const providers = [
    { folder: 'google-analytics', file: 'google-analytics' },
    { folder: 'firebase', file: 'firebase' },
    { folder: 'amplitude', file: 'amplitude' },
    { folder: 'mixpanel', file: 'mixpanel' },
    { folder: 'segment', file: 'segment' },
    { folder: 'posthog', file: 'posthog' },
    { folder: 'heap', file: 'heap' },
    { folder: 'matomo', file: 'matomo' },
  ];

  for (const provider of providers) {
    try {
      await import(`./analytics/${provider.folder}/${provider.file}.provider`);
    } catch (error) {
      // Provider not implemented yet or not available
      logger.debug(`Analytics provider ${provider.folder} not available`);
    }
  }
}

async function loadErrorTrackingProviders(): Promise<void> {
  const providers = [
    { folder: 'sentry', file: 'sentry' },
    { folder: 'firebase-crashlytics', file: 'firebase-crashlytics' },
    { folder: 'datadog', file: 'datadog' },
    { folder: 'bugsnag', file: 'bugsnag' },
    { folder: 'rollbar', file: 'rollbar' },
    { folder: 'logrocket', file: 'logrocket' },
    { folder: 'raygun', file: 'raygun' },
    { folder: 'appcenter', file: 'appcenter' },
  ];

  for (const provider of providers) {
    try {
      await import(`./error-handling/${provider.folder}/${provider.file}.provider`);
    } catch (error) {
      // Provider not implemented yet or not available
      logger.debug(`Error tracking provider ${provider.folder} not available`);
    }
  }
}

/**
 * Get the provider registry instance
 */
export function getProviderRegistry(): ProviderRegistry {
  return ProviderRegistry.getInstance();
}
