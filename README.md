<div align="center">

<img
  src="https://raw.githubusercontent.com/aoneahsan/unified-tracking/main/assets/logo.svg"
  alt="unified-tracking logo"
  width="120"
/>

<h1>unified-tracking</h1>

<p>
  <strong>One analytics and error-tracking API across 16 providers for web, React and Capacitor apps.</strong>
</p>

[![npm version](https://img.shields.io/npm/v/unified-tracking.svg)](https://www.npmjs.com/package/unified-tracking)
[![downloads](https://img.shields.io/npm/dm/unified-tracking.svg)](https://www.npmjs.com/package/unified-tracking)
[![license](https://img.shields.io/npm/l/unified-tracking.svg)](https://github.com/aoneahsan/unified-tracking/blob/main/LICENSE)
[![types](https://img.shields.io/npm/types/unified-tracking.svg)](https://www.npmjs.com/package/unified-tracking)
[![bundle size](https://img.shields.io/bundlephobia/minzip/unified-tracking.svg)](https://bundlephobia.com/package/unified-tracking)
[![node](https://img.shields.io/node/v/unified-tracking.svg)](https://nodejs.org)

[Docs](https://unified-tracking-docs.aoneahsan.com) · [npm](https://www.npmjs.com/package/unified-tracking) · [GitHub](https://github.com/aoneahsan/unified-tracking) · [Changelog](https://github.com/aoneahsan/unified-tracking/blob/main/CHANGELOG.md) · [AI Guide](https://github.com/aoneahsan/unified-tracking/blob/main/AI-INTEGRATION-GUIDE.md) · [Support](https://github.com/aoneahsan/unified-tracking/issues)

</div>

> [!IMPORTANT]
> Tracking runs through the **web/JS layer**, including inside the Capacitor WebView on iOS and Android.
> The `ios/` and `android/` native SDK bridges ship as scaffolding and do **not** yet forward events to
> native SDKs. If you need events delivered by the platform-native Firebase or Sentry SDK rather than by
> their browser SDK, this package does not do that yet — see [Limitations](#limitations).

`unified-tracking` gives you a single call — `track()`, `identify()`, `logError()` — that fans out to whichever
analytics and error-tracking vendors you have configured. It is for teams who run more than one vendor, or who
expect to swap one, and do not want that choice spread across their component tree. Providers are configured by
name and loaded on demand; the ones you never configure are never loaded, and a provider that fails to start is
reported and skipped rather than allowed to break your app.

|                  |                                                             |
| ---------------- | ----------------------------------------------------------- |
| **Version**      | `3.3.0`                                                     |
| **License**      | MIT                                                         |
| **Node**         | `>=24.13.0`                                                 |
| **Platforms**    | Web · React · Capacitor WebView (iOS · Android)             |
| **Install size** | ~113 kB packed · ~590 kB unpacked (includes native sources) |
| **Types**        | Bundled `.d.ts` (ESM only)                                  |
| **Status**       | Stable · actively maintained                                |

<a id="table-of-contents"></a>
## 🧭 Table of Contents&nbsp;[#](#table-of-contents)

- [💡 Why unified-tracking](#why-unified-tracking)
- [✨ Features](#features)
- [📱 Platform Support](#platform-support)
- [📋 Requirements](#requirements)
- [📦 Installation](#installation)
- [🚀 Quick Start](#quick-start)
- [🛠️ Usage](#usage)
- [⚙️ Configuration](#configuration)
- [🔧 API Reference](#api-reference)
- [🧩 Types](#types)
- [💻 Command Line](#command-line)
- [🧪 Examples](#examples)
- [🎛️ Advanced Features](#advanced-features)
- [🚑 Recovery & Troubleshooting](#recovery-troubleshooting)
- [🚧 Limitations](#limitations)
- [❓ FAQ](#faq)
- [📚 Documentation](#documentation)
- [🔄 Changelog](#changelog)
- [🗺️ Roadmap](#roadmap)
- [🤝 Contributing](#contributing)
- [🗂️ Repository](#repository)
- [💬 Support](#support)
- [📄 License](#license)
- [👤 Author](#author)
- [🔗 Links](#links)
- [🏷️ Keywords](#keywords)

<a id="why-unified-tracking"></a>
## 💡 Why unified-tracking&nbsp;[#](#why-unified-tracking)

Most apps end up with more than one tracking vendor — an analytics tool, an error reporter, and something the
growth team asked for. Each arrives with its own SDK, its own initialisation, its own event shape and its own
opinion about consent. The call sites multiply, and swapping a vendor means editing every one of them.

This package puts one interface in front of them. You configure vendors once by name; every call site uses the
same method regardless of how many vendors are behind it.

|                                   | `unified-tracking`                                    | Vendor SDKs directly      |
| --------------------------------- | ----------------------------------------------------- | ------------------------- |
| Call sites when you run 3 vendors | one call                                              | one call per vendor       |
| Swapping a vendor                 | change the config                                     | edit every call site      |
| Consent                           | one `setConsent()` gate in front of all vendors       | per-vendor, per-SDK       |
| Property redaction                | one `excludedProperties` list applied before dispatch | per-vendor, if supported  |
| Vendor-specific features          | only what the unified surface exposes                 | everything the SDK offers |
| Bundle cost                       | loader plus the providers you configure               | each SDK you install      |

**Not the right tool when** — you use exactly one vendor and intend to keep it (use that SDK directly; you will
get its full feature surface with less indirection), or you depend on vendor-specific APIs such as Mixpanel's
group analytics or Sentry's performance tracing, which this unified surface does not expose. It is also the
wrong tool for a Manifest V3 browser extension, since providers load vendor SDKs from a CDN at runtime.

<a id="features"></a>
## ✨ Features&nbsp;[#](#features)

- **One API, 16 providers** — eight analytics and eight error-tracking vendors behind the same methods.
- **No runtime npm dependencies** — the package itself ships zero runtime deps; each vendor SDK is fetched from
  its own CDN only when that provider is configured.
- **No React provider needed** — hooks read a module-level singleton, so they work in dynamically mounted
  components without wrapping your tree in a context.
- **Fail-open initialisation** — a provider with a missing key or a failed SDK load is skipped and reported in
  `InitializeResult.warnings`; it never throws into your app's startup path.
- **Events buffered before init** — calls made before `initialize()` resolves are queued and replayed in order,
  so app-start events are not lost.
- **Consent enforced at dispatch** — denied categories are dropped before any vendor is called.
- **Property redaction** — keys you list are stripped from every payload before a vendor sees them.
- **Secret-safe logging** — provider keys and DSNs are redacted from log output.
- **Typed end to end** — TypeScript definitions for the API, every provider config, and the event payloads.

<a id="platform-support"></a>
## 📱 Platform Support&nbsp;[#](#platform-support)

| Platform                  | Supported | Notes                                                                             |
| ------------------------- | --------- | --------------------------------------------------------------------------------- |
| Web (modern browsers)     | ✅        | The primary and fully implemented target.                                         |
| React 19+                 | ✅        | Optional peer; hooks via `unified-tracking/react`.                                |
| Capacitor 7.4.3+ / 8.x    | ✅        | Optional peer. Runs in the WebView through the same web layer.                    |
| iOS / Android native SDKs | 🚧        | Bridges are scaffolding only — events are **not** forwarded to native SDKs.       |
| Node / SSR                | ❌        | Providers require a DOM; initialising server-side fails with an explicit message. |
| MV3 browser extensions    | ❌        | Providers load vendor SDKs from a CDN, which MV3 forbids.                         |

<a id="requirements"></a>
## 📋 Requirements&nbsp;[#](#requirements)

| Requirement              | Version              | Why                                                                                    |
| ------------------------ | -------------------- | -------------------------------------------------------------------------------------- |
| Node                     | `>=24.13.0`          | Build and CLI toolchain. The browser runtime is unaffected.                            |
| ESM consumer             | —                    | The package is **ESM only**; there is no CommonJS build, so `require()` will not work. |
| `react`                  | `>=19.0.0`           | Optional peer — only for `unified-tracking/react`.                                     |
| `@capacitor/core`        | `^7.4.3 \|\| ^8.0.0` | Optional peer — only for `unified-tracking/capacitor`.                                 |
| A browser DOM            | —                    | Providers inject the vendor script tag; there is no server-side path.                  |
| CSP `script-src` entries | —                    | Each configured vendor's CDN origin must be allowlisted.                               |

<a id="installation"></a>
## 📦 Installation&nbsp;[#](#installation)

```bash
yarn add unified-tracking
```

React and Capacitor are **optional** peers — install them only for the entry point you use:

```bash
# only if you use unified-tracking/react
yarn add react

# only if you use unified-tracking/capacitor
yarn add @capacitor/core
```

Using it inside a Capacitor app? Sync afterwards so the native project picks the plugin up:

```bash
npx cap sync
```

Every vendor SDK is loaded from its CDN at runtime, so add the origins of the providers you configure to your
`script-src` Content-Security-Policy — for example `https://www.googletagmanager.com` for Google Analytics, or
`https://browser.sentry-cdn.com` for Sentry. Without them the browser blocks the script and the provider is
reported as failed.

<a id="quick-start"></a>
## 🚀 Quick Start&nbsp;[#](#quick-start)

```ts
import { UnifiedTracking } from 'unified-tracking';

const result = await UnifiedTracking.initialize({
  analytics: {
    providers: ['google'],
    google: { measurementId: 'G-XXXXXXXXXX' },
  },
  errorTracking: {
    providers: ['sentry'],
    sentry: { dsn: 'https://examplePublicKey@o0.ingest.sentry.io/0' },
  },
});

// Providers that could not start are reported here, not thrown.
console.log(result.activeProviders, result.warnings);

await UnifiedTracking.track('signup_completed', { plan: 'pro' });
```

<a id="usage"></a>
## 🛠️ Usage&nbsp;[#](#usage)

### Track an event

```ts
await UnifiedTracking.track('purchase_completed', { productId: '123', price: 99.99 });
```

### Identify a user

```ts
await UnifiedTracking.identify('user-123', { email: 'user@example.com', plan: 'premium' });
await UnifiedTracking.setUserProperties({ theme: 'dark' });
```

### Log an error

```ts
try {
  await checkout();
} catch (error) {
  await UnifiedTracking.logError(error, {
    severity: 'error',
    tags: { context: 'checkout' },
    user: { id: 'user-123' },
  });
}
```

### Revenue and screen views

```ts
await UnifiedTracking.logRevenue({ amount: 99.99, currency: 'USD', productId: '123' });
await UnifiedTracking.logScreenView('Checkout', { step: 2 });
```

### React

The hooks need no provider component — import and call them anywhere.

```tsx
import { useUnifiedTracking, useTrackEvent } from 'unified-tracking/react';

function BuyButton() {
  const { trackEvent, isTracking, lastError } = useTrackEvent();

  return (
    <button disabled={isTracking} onClick={() => trackEvent('purchase_clicked', { price: 99.99 })}>
      {lastError ? 'Retry' : 'Buy now'}
    </button>
  );
}

function Profile() {
  const { identify, logError } = useUnifiedTracking();
  // identify / logError / track / logRevenue / flush / … — the full API, memoised.
}
```

### Capacitor

This entry point registers the plugin with Capacitor. It shares the same singleton as the main entry, so
initialising through either one is enough.

```ts
import { registerCapacitorPlugin } from 'unified-tracking/capacitor';

const plugin = await registerCapacitorPlugin(); // null when Capacitor is unavailable
await plugin?.initialize({
  analytics: { providers: ['google'], google: { measurementId: 'G-XXXXXXXXXX' } },
});
```

### Consent

```ts
await UnifiedTracking.setConsent({ analytics: true, errorTracking: true, marketing: false });
```

`analytics` and `errorTracking` default to `true`; `marketing` and `personalization` default to `false`.
Consent may be set before `initialize()`, which is what a consent banner usually needs. Full behaviour:
[Consent and privacy](https://unified-tracking-docs.aoneahsan.com/guides/consent-and-privacy).

<a id="configuration"></a>
## ⚙️ Configuration&nbsp;[#](#configuration)

| Option                                  | Type                  | Default                                          | What it does                                                   |
| --------------------------------------- | --------------------- | ------------------------------------------------ | -------------------------------------------------------------- |
| `analytics.providers`                   | `AnalyticsProvider[]` | `[]`                                             | Which analytics vendors to load.                               |
| `errorTracking.providers`               | `ErrorProvider[]`     | `[]`                                             | Which error-tracking vendors to load.                          |
| `analytics.<id>` / `errorTracking.<id>` | provider config       | —                                                | Per-vendor settings, keyed by provider id.                     |
| `autoDetect`                            | `boolean`             | `true`                                           | Also enable vendors whose SDK is already a global on `window`. |
| `settings.debug`                        | `boolean`             | `false`                                          | Verbose logging.                                               |
| `settings.defaultConsent`               | `ConsentSettings`     | see [Consent](#usage)                            | Initial consent, applied at init.                              |
| `settings.privacy.excludedProperties`   | `string[]`            | `[]`                                             | Keys stripped from every payload before dispatch.              |
| `settings.privacy.anonymizeIp`          | `boolean`             | `true`                                           | Applied per vendor, where that vendor supports it.             |
| `settings.autoTrackScreens`             | `boolean`             | `true`                                           | Automatic screen/page-view tracking.                           |
| `settings.autoTrackErrors`              | `boolean`             | `true`                                           | Capture unhandled errors.                                      |
| `settings.batching`                     | `BatchingSettings`    | `{ enabled: true, maxSize: 20, timeout: 10000 }` | Event batching.                                                |
| `settings.sessionTimeout`               | `number`              | `1800000`                                        | Session timeout in milliseconds.                               |

Every provider id and its options:
[Configuration reference](https://unified-tracking-docs.aoneahsan.com/reference/api/configuration).

<a id="api-reference"></a>
## 🔧 API Reference&nbsp;[#](#api-reference)

| Export                                                                     | Signature                                                                             | Docs                                                                        |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `UnifiedTracking.initialize`                                               | `(options?: UnifiedTrackingConfig) => Promise<InitializeResult>`                      | [→](https://unified-tracking-docs.aoneahsan.com/reference/api/core-methods) |
| `UnifiedTracking.track`                                                    | `(event: string, properties?: Record<string, unknown>) => Promise<void>`              | [→](https://unified-tracking-docs.aoneahsan.com/reference/api/core-methods) |
| `UnifiedTracking.identify`                                                 | `(userId: string, traits?: Record<string, unknown>) => Promise<void>`                 | [→](https://unified-tracking-docs.aoneahsan.com/reference/api/core-methods) |
| `UnifiedTracking.setUserProperties`                                        | `(properties: Record<string, unknown>) => Promise<void>`                              | [→](https://unified-tracking-docs.aoneahsan.com/reference/api/core-methods) |
| `UnifiedTracking.logError`                                                 | `(error: Error \| string, context?: ErrorContext) => Promise<void>`                   | [→](https://unified-tracking-docs.aoneahsan.com/reference/api/core-methods) |
| `UnifiedTracking.logRevenue`                                               | `(revenue: RevenueData) => Promise<void>`                                             | [→](https://unified-tracking-docs.aoneahsan.com/reference/api/core-methods) |
| `UnifiedTracking.logScreenView`                                            | `(screenName: string, properties?: Record<string, unknown>) => Promise<void>`         | [→](https://unified-tracking-docs.aoneahsan.com/reference/api/core-methods) |
| `UnifiedTracking.setConsent`                                               | `(consent: ConsentSettings) => Promise<void>`                                         | [→](https://unified-tracking-docs.aoneahsan.com/guides/consent-and-privacy) |
| `UnifiedTracking.flush`                                                    | `() => Promise<void>`                                                                 | [→](https://unified-tracking-docs.aoneahsan.com/reference/api/core-methods) |
| `UnifiedTracking.reset`                                                    | `() => Promise<void>`                                                                 | [→](https://unified-tracking-docs.aoneahsan.com/reference/api/core-methods) |
| `UnifiedTracking.getActiveProviders`                                       | `() => Promise<ActiveProvidersResult>`                                                | [→](https://unified-tracking-docs.aoneahsan.com/reference/api/core-methods) |
| `UnifiedTracking.enableDebugMode`                                          | `(enabled: boolean) => Promise<void>`                                                 | [→](https://unified-tracking-docs.aoneahsan.com/reference/api/core-methods) |
| `UnifiedTracking.addListener`                                              | `(eventName, cb: (e: TrackingEventPayload) => void) => Promise<PluginListenerHandle>` | [→](https://unified-tracking-docs.aoneahsan.com/reference/api/core-methods) |
| `useUnifiedTracking`                                                       | `() => BoundTrackingApi`                                                              | [→](https://unified-tracking-docs.aoneahsan.com/reference/api/react-hooks)  |
| `useTrackEvent`                                                            | `() => { trackEvent, isTracking, lastError }`                                         | [→](https://unified-tracking-docs.aoneahsan.com/reference/api/react-hooks)  |
| `registerCapacitorPlugin`                                                  | `() => Promise<UnifiedTrackingPlugin \| null>`                                        | [→](https://unified-tracking-docs.aoneahsan.com/guides/capacitor)           |
| `BaseAnalyticsProvider` · `BaseErrorTrackingProvider` · `RegisterProvider` | see [Advanced Features](#advanced-features)                                           | [→](https://unified-tracking-docs.aoneahsan.com/guides/custom-providers)    |

<a id="types"></a>
## 🧩 Types&nbsp;[#](#types)

```ts
type AnalyticsProvider = 'google' | 'firebase' | 'amplitude' | 'mixpanel' | 'segment' | 'posthog' | 'heap' | 'matomo';

type ErrorProvider =
  | 'sentry'
  | 'crashlytics'
  | 'datadog'
  | 'bugsnag'
  | 'rollbar'
  | 'logrocket'
  | 'raygun'
  | 'appcenter';

interface UnifiedTrackingConfig {
  analytics?: AnalyticsConfig;
  errorTracking?: ErrorTrackingConfig;
  settings?: GlobalSettings;
  autoDetect?: boolean;
}

interface InitializeResult {
  success: boolean;
  activeProviders: ActiveProvidersResult;
  /** Providers that failed to load or initialise — surfaced, never thrown. */
  warnings?: string[];
}

interface ErrorContext {
  severity?: 'debug' | 'info' | 'warning' | 'error' | 'fatal';
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  user?: { id?: string; email?: string; username?: string };
  breadcrumbs?: Array<{ message: string; category?: string; timestamp?: number }>;
}

interface RevenueData {
  amount: number;
  currency?: string;
  productId?: string;
  quantity?: number;
  transactionId?: string;
}
```

Full type surface: [Types reference](https://unified-tracking-docs.aoneahsan.com/reference/api/types).

<a id="command-line"></a>
## 💻 Command Line&nbsp;[#](#command-line)

An interactive setup wizard that asks which providers you want and writes a starter config into your project.

```bash
npx unified-tracking-setup
```

| Command                  | What it does                                                                                                                             |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `unified-tracking-setup` | Prompts for analytics and error-tracking providers, their keys and consent defaults, then writes a config file and prints example usage. |

It takes no flags — every choice is a prompt, and pressing Enter skips a step. It writes files into the current
directory and offers to install the package, so run it from your project root.

<a id="examples"></a>
## 🧪 Examples&nbsp;[#](#examples)

| Goal                                 | Example                                                                                          |
| ------------------------------------ | ------------------------------------------------------------------------------------------------ |
| A running React app wired end to end | [examples/react-app](https://github.com/aoneahsan/unified-tracking/tree/main/examples/react-app) |
| Use it inside a Capacitor app        | [Capacitor guide](https://unified-tracking-docs.aoneahsan.com/guides/capacitor)                  |
| Write your own provider              | [Custom providers guide](https://unified-tracking-docs.aoneahsan.com/guides/custom-providers)    |

<a id="advanced-features"></a>
## 🎛️ Advanced Features&nbsp;[#](#advanced-features)

- **Custom providers** — extend `BaseAnalyticsProvider` or `BaseErrorTrackingProvider` and register the class
  with the `@RegisterProvider` decorator to put your own backend behind the same API.
  [Guide](https://unified-tracking-docs.aoneahsan.com/guides/custom-providers).
- **Event listeners** — `addListener('trackingEvent' | 'error' | 'providerStatusChange', cb)` receives a typed
  `TrackingEventPayload`, useful for seeing what actually dispatched.
- **Auto-detection** — with `autoDetect` left on, a vendor SDK already present as a `window` global (`gtag`,
  `mixpanel`, `Sentry`, …) is enabled without being listed.
- **Debug mode** — `enableDebugMode(true)` logs each dispatch and provider decision, with keys redacted.
- **Super properties and timed events** — available on providers built on the shared analytics base.

<a id="recovery-troubleshooting"></a>
## 🚑 Recovery & Troubleshooting&nbsp;[#](#recovery-troubleshooting)

| Symptom                                                                  | Cause                                                                   | Fix                                                                                       |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `initialize()` resolves but a provider is missing from `activeProviders` | It failed to load or start.                                             | Read `result.warnings` — it names the provider and the reason.                            |
| Nothing reaches the vendor dashboard                                     | Consent for that category is denied, so events are dropped at dispatch. | Call `setConsent({ analytics: true })`, or check `settings.defaultConsent`.               |
| The browser console shows a blocked script for a vendor CDN              | Your CSP does not allow that vendor's origin.                           | Add the origin to `script-src` — see [Installation](#installation).                       |
| `ERR_PACKAGE_PATH_NOT_EXPORTED` — `No "exports" main defined`            | You used `require()`; the package is ESM only.                          | Import it with `import`, or use a dynamic `await import()` from CommonJS.                 |
| `document is not defined`, or a warning about a browser environment      | Initialised during SSR or in Node.                                      | Initialise only in the browser, for example inside `useEffect`.                           |
| Events sent right at app start never appear                              | Normally none — they are buffered and replayed after init.              | Make sure `initialize()` is actually called; buffered events only flush once it resolves. |
| A property you expected is absent from the vendor payload                | It is listed in `settings.privacy.excludedProperties`.                  | Remove the key from that list.                                                            |

<a id="limitations"></a>
## 🚧 Limitations&nbsp;[#](#limitations)

- **Native SDK bridges are not wired.** In a Capacitor app everything runs through the web layer inside the
  WebView. The `ios/` and `android/` sources ship as the foundation for native delivery and do not forward
  events yet. Firebase Crashlytics native is a deliberate stub.
- **ESM only.** There is no CommonJS build, so `require('unified-tracking')` fails.
- **Browser-only.** Providers inject a script tag, so there is no Node or SSR path.
- **Not usable in Manifest V3 browser extensions**, which forbid loading remote code.
- **Vendor SDKs are fetched from third-party CDNs** at runtime, which means an external request and a CSP entry
  per provider. The package pins the CDN version it loads, so a vendor's newest SDK may lag.
- **The unified surface is a common denominator.** Vendor-specific features — Mixpanel group analytics, Sentry
  performance tracing, PostHog feature flags beyond configuration — are not exposed.
- **Privacy controls act before dispatch, not after.** Consent gating and `excludedProperties` decide what
  leaves your app. Once an event is dispatched, that vendor's SDK sends it to that vendor, under that vendor's
  own privacy policy and retention rules. This package does not proxy, anonymise or delete data on your behalf,
  and `settings.privacy.dataRetentionDays` is a hint passed along, not a guarantee it enforces.
- **`getProviderManager()` is deprecated** and will be removed in the next major.

<a id="faq"></a>
## ❓ FAQ&nbsp;[#](#faq)

**Do I have to install each vendor's npm package?**
No. The package has no runtime dependencies and loads each configured vendor's SDK from its CDN.

**What happens to a provider whose key I have not set?**
Its initialisation fails, it is skipped, and the reason appears in `InitializeResult.warnings`. Your other
providers keep working and your app is never blocked.

**Do I need a React context provider?**
No. The hooks read a module-level singleton, so they work in any component, including dynamically mounted ones.

**Can I use it without React or Capacitor?**
Yes. Both are optional peers; the main entry point is plain TypeScript.

**Does it work server-side?**
No — providers require a DOM. Initialising in Node fails with an explicit message rather than a confusing
`document is not defined`.

**Can I add a vendor you do not support?**
Yes, with a [custom provider](https://unified-tracking-docs.aoneahsan.com/guides/custom-providers).

<a id="documentation"></a>
## 📚 Documentation&nbsp;[#](#documentation)

| Document                                                                                                   | Read it when                                  |
| ---------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| [Introduction](https://unified-tracking-docs.aoneahsan.com/intro)                                          | deciding whether this fits your app           |
| [Installation](https://unified-tracking-docs.aoneahsan.com/getting-started/installation)                   | setting the package up                        |
| [Quick start](https://unified-tracking-docs.aoneahsan.com/getting-started/quick-start)                     | sending your first event                      |
| [Configuration](https://unified-tracking-docs.aoneahsan.com/getting-started/configuration)                 | tuning providers and global settings          |
| [React guide](https://unified-tracking-docs.aoneahsan.com/guides/react)                                    | using the hooks                               |
| [Capacitor guide](https://unified-tracking-docs.aoneahsan.com/guides/capacitor)                            | shipping inside a Capacitor app               |
| [Consent and privacy](https://unified-tracking-docs.aoneahsan.com/guides/consent-and-privacy)              | wiring a consent banner or redacting data     |
| [Custom providers](https://unified-tracking-docs.aoneahsan.com/guides/custom-providers)                    | adding a vendor yourself                      |
| [Analytics providers](https://unified-tracking-docs.aoneahsan.com/reference/providers/analytics)           | you need one analytics vendor's exact options |
| [Error-tracking providers](https://unified-tracking-docs.aoneahsan.com/reference/providers/error-tracking) | you need one error vendor's exact options     |
| [API reference](https://unified-tracking-docs.aoneahsan.com/reference/api/core-methods)                    | you need an exact signature                   |
| [Native status](https://unified-tracking-docs.aoneahsan.com/platforms/native)                              | you are evaluating native SDK delivery        |
| [AI integration guide](https://github.com/aoneahsan/unified-tracking/blob/main/AI-INTEGRATION-GUIDE.md)    | a coding agent is implementing against it     |

<a id="changelog"></a>
## 🔄 Changelog&nbsp;[#](#changelog)

Latest release: **`3.3.0`** — adds `flush()`, typed event listeners, and an explicit error when initialised
outside a browser. Full history:
[CHANGELOG.md](https://github.com/aoneahsan/unified-tracking/blob/main/CHANGELOG.md).

<a id="roadmap"></a>
## 🗺️ Roadmap&nbsp;[#](#roadmap)

- Wire the iOS and Android native SDK bridges so events reach the platform-native vendor SDKs.
- Remove the deprecated `getProviderManager()` in the next major.

<a id="contributing"></a>
## 🤝 Contributing&nbsp;[#](#contributing)

Fork and open a pull request — see
[CONTRIBUTING.md](https://github.com/aoneahsan/unified-tracking/blob/main/CONTRIBUTING.md) for setup, standards,
and how to request collaborator access. `main` is protected: every change lands through a reviewed PR.

<a id="repository"></a>
## 🗂️ Repository&nbsp;[#](#repository)

```text
src/          TypeScript source — core, providers, react/, capacitor/
dist/esm/     build output (published)
android/      native Android plugin scaffolding (not yet wired)
ios/          native iOS plugin scaffolding (not yet wired)
bin/          the unified-tracking-setup CLI
examples/     runnable example app
```

<a id="support"></a>
## 💬 Support&nbsp;[#](#support)

Questions and bugs: [open an issue](https://github.com/aoneahsan/unified-tracking/issues).

If this package saves you time, you can support its maintenance at
[aoneahsan.com/payment](https://aoneahsan.com/payment?project-id=unified-tracking&project-identifier=unified-tracking).

<a id="license"></a>
## 📄 License&nbsp;[#](#license)

MIT © Ahsan Mahmood — see [LICENSE](https://github.com/aoneahsan/unified-tracking/blob/main/LICENSE).

<a id="author"></a>
## 👤 Author&nbsp;[#](#author)

**Ahsan Mahmood** — [aoneahsan.com](https://aoneahsan.com) · [GitHub](https://github.com/aoneahsan) ·
[LinkedIn](https://linkedin.com/in/aoneahsan) · [aoneahsan@gmail.com](mailto:aoneahsan@gmail.com)

<a id="links"></a>
## 🔗 Links&nbsp;[#](#links)

|                      |                                                                                 |
| -------------------- | ------------------------------------------------------------------------------- |
| Documentation        | https://unified-tracking-docs.aoneahsan.com                                     |
| npm                  | https://www.npmjs.com/package/unified-tracking                                  |
| Repository           | https://github.com/aoneahsan/unified-tracking                                   |
| Issues               | https://github.com/aoneahsan/unified-tracking/issues                            |
| Changelog            | https://github.com/aoneahsan/unified-tracking/blob/main/CHANGELOG.md            |
| AI integration guide | https://github.com/aoneahsan/unified-tracking/blob/main/AI-INTEGRATION-GUIDE.md |
| Support the project  | https://aoneahsan.com/payment                                                   |

<a id="keywords"></a>
## 🏷️ Keywords&nbsp;[#](#keywords)

_analytics · error-tracking · capacitor · react · typescript · google-analytics · mixpanel · posthog · amplitude · sentry · consent · cross-platform_
