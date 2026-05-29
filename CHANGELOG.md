# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### 🚧 Native iOS/Android SDK bridges (in progress — NOT yet published)

Native vendor-SDK delivery is being implemented behind the Capacitor plugin (`registerCapacitorPlugin()`), batch by batch. **Batch 1** wires the native `ProviderManager` fan-out plus **Firebase Analytics** and **Sentry** on both iOS (FirebaseAnalytics / sentry-cocoa) and Android (Firebase BoM + `io.sentry:sentry-android`). This native code is **written but not build-verified** in the dev environment (no Xcode/Gradle) — every touched native file carries `// NOTE(unverified)` markers. It ships only after a successful native build; until then `npm latest` stays at `3.3.0` and tracking runs via the web layer (including inside the Capacitor WebView). Firebase Crashlytics native remains a stub (the `@capacitor-firebase/crashlytics` wrapper is intentionally avoided). See `docs/features/polish-audit-release/round04-native-overview.md`.

## [3.3.0] - 2026-05-27

Completes the documented polish backlog deferred from 3.2.0. No breaking public API changes (all additive).

### ✨ Added

- **`flush()`** — flush buffered events across every provider that supports it (e.g. Segment, Sentry). Available on the main `UnifiedTracking` API, the `useUnifiedTracking()` hook, and the Capacitor adapter.
- **Typed event listeners** — `addListener()` callbacks now receive a typed `TrackingEventPayload` instead of `unknown`.

### 🔧 Changed / improved

- **Firebase & Amplitude providers now extend `BaseAnalyticsProvider`** (the template-method base used by every other analytics provider), so they now honor `setSuperProperties()`, support timed events (`startTimedEvent`/`endTimedEvent`), and share consistent lifecycle/ready handling — previously they bypassed the base and silently ignored those features.
- **Clear non-browser error** — initializing a provider in a server/Node (non-DOM) environment now fails with an explicit "requires a browser environment" message (surfaced in `InitializeResult.warnings`) instead of an opaque `document is not defined` ReferenceError.
- **Stronger public types** — remaining `any` in the public provider base classes/interfaces tightened to `unknown` / `Record<string, unknown>`.
- **`unified-tracking-setup` CLI** now generates the correct object-shaped config (`analytics: { providers: [...], google: {...} }`, `settings: { defaultConsent }`) and accurate example code using the real `useUnifiedTracking`/`useTrackEvent` hooks (no non-existent Provider/HOC).

### 🗑️ Deprecated

- `getProviderManager()` — returns a separate, unused manager instance that does not reflect the active providers; it will be removed in the next major. Use the `UnifiedTracking` API.

### ⏭️ Still deferred (documented, unchanged)

- Native iOS/Android SDK bridges remain scaffolding (not wired). Implementing + verifying them requires a native toolchain (Xcode/Gradle), real vendor SDK dependencies, and device/simulator builds — a separate effort. Tracking continues to run via the web layer (including inside the Capacitor WebView).

## [3.2.0] - 2026-05-26

A second, independent deep-audit pass found and fixed defects the same-day 3.1.0 audit missed — including two that affected whether the package works at all. No breaking public API changes (config-key changes are additive aliases).

### 🐛 Critical fixes

- **Importable in Node ESM.** The published ESM emitted extensionless relative imports under `"type": "module"`, so `import 'unified-tracking'` threw `ERR_MODULE_NOT_FOUND` in Node/SSR/edge. Switched to `NodeNext` module resolution with `.js` import specifiers.
- **Providers actually register.** Provider loading used a runtime-variable dynamic `import()` that bundlers can't analyze and Node ESM can't resolve, so providers could silently fail to register and `track()`/`logError()` would drop events. Replaced with a static import map (also closes an arbitrary-name import vector).

### 🔒 Security & Privacy

- **Secrets never logged.** `Logger.redact()` is now applied inside every log sink, so provider tokens/DSNs/write-keys are masked even when `info`/debug logging is enabled (8 providers previously printed them in cleartext).
- **Deep privacy stripping.** `privacy.excludedProperties` now strips matching keys at any nesting depth and returns a deep copy (was top-level only).
- **GA Consent Mode** defaults now derive from your consent state (denied when `analytics` consent is `false`) instead of always granting analytics storage.

### ✨ Features & correctness

- **Pre-init event buffering.** Events fired before `initialize()` resolves are buffered and replayed in order once providers are ready (the `EventQueue` was previously inert).
- **Breadcrumbs reach the SDK.** `addBreadcrumb()` now forwards to the provider (Sentry/Bugsnag/Rollbar/DataDog/LogRocket) instead of only buffering locally.
- **`shutdown()`** added for full teardown (unregister providers + clear listeners) vs `reset()` which only clears user state.
- **Config keys corrected** in the public types to match what providers read — Matomo `trackerUrl` (+ `siteId: string | number`), PostHog `apiHost`, Segment `enabledIntegrations`, LogRocket `appId`. The previous keys (`url`, `host`, `integrations`, `appID`) are still accepted as runtime aliases, so existing configs keep working.
- **Amplitude** loader now detects the correct `window.amplitude` global (it previously always failed to initialize).
- **`useUnifiedTracking()`** returns a stable reference (was a new object each render, causing effect churn).
- **Capacitor adapter** now shares the core singleton (was a separate instance) and no longer leaks a duplicate event listener.
- Unified the two divergent `ConsentSettings` types into one shape.

### 📝 Documentation

- Rewrote `docs/api-reference.md`, `docs/react-integration.md`, and `docs/native-implementation.md`, which described APIs, hooks, HOCs, and native SDKs that do not exist. Documentation now matches the real two-hook / object-config API and the honest web-first / native-not-yet-wired status.
- Firebase Crashlytics is documented as web-unsupported (no web SDK; native not wired) and fails fast with a clear message.

### 🧹 Internal

- Build emits only `src/` (tests no longer ship in `dist/`); dropped the orphan Rollup bundle + its devDependencies; removed the redundant `.npmignore` (the `files` allowlist governs publishing).

### ⏭️ Known limitations (unchanged this release)

- Native iOS/Android SDK bridges remain scaffolding (not wired) — tracking runs via the web layer (including inside the Capacitor WebView).
- Providers load their vendor SDK from a CDN at runtime (not bundled); not compatible with a strict-CSP `script-src` without allowlisting, nor with Manifest-V3 browser extensions.
- The `unified-tracking-setup` CLI still emits an older config shape — follow the README / `AI-INTEGRATION-GUIDE.md` config until it is updated.

## [3.1.0] - 2026-05-26

Polish and hardening release. Every dependency updated to its latest stable version, a full security/privacy/quality audit, and the fixes below. No breaking public API changes.

### 🔒 Security & Privacy

- **Enforced `privacy.excludedProperties`** — listed keys are now stripped from event properties, identify traits, user properties, revenue properties, and error context before any provider receives them (previously declared but not applied).
- **Consent gate at dispatch** — analytics/error events are dropped when the matching consent category is denied, covering the window before `setConsent()` is called and `settings.defaultConsent`. `marketing` and `personalization` now default to `false` (opt-in).
- **No secrets in logs** — provider API keys/DSNs are redacted; the logger no longer prints the full config or the consumer's tracked errors/PII at error level. Default log level is now `warn`.
- **Script-source validation** — the Matomo `trackerUrl` is validated as an http(s) URL before it becomes a `<script>` src; Google Analytics and Segment ids/keys are URL-encoded.
- **Removed `eval()`** from the Heap loader (no longer requires `unsafe-eval` in the host CSP).
- **Prototype-pollution guard** in config deep-merge; lightweight input validation on `track` / `identify` / `logScreenView` / `logRevenue`.

### 🐛 Fixes

- Fixed a missing `experimentalDecorators` tsconfig option that broke provider tests under the updated toolchain.
- `InitializeResult.warnings` is now populated when a provider fails to load/initialize (previously silent).
- Removed `'sentry'` from the analytics provider union (no analytics/sentry provider exists; Sentry is error-tracking only).
- Fixed an `EventQueue` `setInterval` that was started on init but never stopped.

### 🧹 Internal

- Removed dead code: a duplicate `web.ts` implementation and an unreachable React hooks/HOC island (~1,300 LOC). The supported React API is `useUnifiedTracking` + `useTrackEvent` from `unified-tracking/react`.
- Stricter public TypeScript types (`Record<string, unknown>` instead of `any`).
- ESLint warnings reduced from 632 to 0; removed the `postinstall` build step that failed silently on consumer installs.

### 📦 Dependencies

- TypeScript 6, ESLint 10, jsdom 29, lint-staged 17, esbuild 0.28, `@capacitor/*` 8.3.4, `@typescript-eslint` 8.60, vitest 4.1, rollup 4.60 — all latest stable.
- `@capacitor/core` peer range widened to `^7.4.3 || ^8.0.0`.

### 📱 Native (iOS/Android)

- Tracking runs through the web/JS layer (including inside the Capacitor WebView). Native SDK bridges remain planned and not yet implemented; the `ios/` and `android/` scaffolding is the foundation for that future work.

## [2.0.0] - 2025-08-02

### 🚨 BREAKING CHANGES

#### Removed Provider Pattern

- **BREAKING**: Removed React Context/Provider requirement. The package now works without providers!
- **BREAKING**: React hooks must now be imported from `unified-tracking/react` instead of the main package
- **BREAKING**: Removed `UnifiedTrackingProvider` component - no longer needed

#### Migration Required

```typescript
// Before (v1.x)
import { UnifiedTrackingProvider, useTrackEvent } from 'unified-tracking';

<UnifiedTrackingProvider config={config}>
  <App />
</UnifiedTrackingProvider>

// After (v2.0)
import { UnifiedTracking } from 'unified-tracking';
import { useTrackEvent } from 'unified-tracking/react';

// Initialize once
UnifiedTracking.initialize(config);
// Use hooks anywhere - no provider needed!
```

### ✨ New Features

- **Zero Dependencies**: Package now has no runtime dependencies
- **Provider-less Architecture**: Works in dynamically injected components without setup
- **Multiple Entry Points**:
  - `unified-tracking` - Core functionality
  - `unified-tracking/react` - React hooks
  - `unified-tracking/capacitor` - Capacitor integration
- **Optional Dependencies**: All dependencies (React, Capacitor) are now optional
- **ESM Only**: Removed CommonJS builds for smaller bundle size

### 🐛 Bug Fixes

- Fixed circular dependency between main package and React integration
- Fixed test files being included in production build
- Removed console warnings when Capacitor is not available

### 📦 Package Changes

- Minimum Node.js version: 18.0.0
- React peer dependency: >=16.8.0 (optional)
- Capacitor peer dependency: ^7.4.2 (optional)

### 📚 Documentation

- Updated README with provider-less examples
- Added migration guide from v1.x
- Improved TypeScript documentation

## [1.5.0] - Previous Release

[Previous changelog entries...]
