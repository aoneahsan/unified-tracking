# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
