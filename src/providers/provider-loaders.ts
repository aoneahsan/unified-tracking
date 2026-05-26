/**
 * Static provider import map.
 *
 * Provider modules register themselves with the {@link ProviderRegistry} (via the
 * `@RegisterProvider` decorator) as a side effect of being imported, so the module must be
 * imported before the registry can construct the provider.
 *
 * These are written as **literal** dynamic-import specifiers — one arrow per provider —
 * rather than a single `import(variablePath)`. A literal specifier is statically
 * analyzable, so bundlers (Vite / Rollup / webpack) can code-split each provider into its
 * own lazily-loaded chunk and tree-shake the ones a consumer never configures, and Node's
 * native ESM resolver can resolve it. A runtime-built variable specifier satisfies neither
 * (Node ESM throws `ERR_MODULE_NOT_FOUND`; bundlers can't see the dependency), which
 * previously meant providers could silently fail to load and every event was dropped.
 *
 * Keyed by the provider's registry id (see `resolveProviderModule`): note `google` maps to
 * `google-analytics` and `crashlytics` maps to `firebase-crashlytics`.
 */
export type ProviderModuleLoader = () => Promise<unknown>;

export const PROVIDER_LOADERS: Readonly<Record<string, ProviderModuleLoader>> = {
  // Analytics
  'google-analytics': () => import('./analytics/google-analytics/google-analytics.provider.js'),
  firebase: () => import('./analytics/firebase/firebase.provider.js'),
  amplitude: () => import('./analytics/amplitude/amplitude.provider.js'),
  mixpanel: () => import('./analytics/mixpanel/mixpanel.provider.js'),
  segment: () => import('./analytics/segment/segment.provider.js'),
  posthog: () => import('./analytics/posthog/posthog.provider.js'),
  heap: () => import('./analytics/heap/heap.provider.js'),
  matomo: () => import('./analytics/matomo/matomo.provider.js'),
  // Error tracking
  sentry: () => import('./error-handling/sentry/sentry.provider.js'),
  'firebase-crashlytics': () => import('./error-handling/firebase-crashlytics/firebase-crashlytics.provider.js'),
  datadog: () => import('./error-handling/datadog/datadog.provider.js'),
  bugsnag: () => import('./error-handling/bugsnag/bugsnag.provider.js'),
  rollbar: () => import('./error-handling/rollbar/rollbar.provider.js'),
  logrocket: () => import('./error-handling/logrocket/logrocket.provider.js'),
  raygun: () => import('./error-handling/raygun/raygun.provider.js'),
  appcenter: () => import('./error-handling/appcenter/appcenter.provider.js'),
};

/** All known provider registry ids (analytics + error tracking). */
export const KNOWN_PROVIDER_IDS: readonly string[] = Object.freeze(Object.keys(PROVIDER_LOADERS));
