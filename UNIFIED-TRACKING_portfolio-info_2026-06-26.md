# Unified Tracking — Portfolio Info

Reference Date: 2026-06-26
Project Type: npm package — a TypeScript telemetry library (analytics + error tracking) for web, React, and Capacitor apps. Distributed surfaces: npm package today (web/JS runtime, incl. the Capacitor WebView on iOS/Android); native iOS/Android SDK bridges are written on-branch but unverified and NOT yet published.
Project Slug: unified-tracking
Primary Email Reference: aoneahsan@gmail.com
Current Version Reviewed: 3.3.0 (npm latest)
Last Portfolio Update: 2026-06-26
Next Eligible Update After: 2026-07-03

---

## Identity & Distribution (Authoritative)

| Field | Value |
| --- | --- |
| Project Slug | `unified-tracking` |
| Public Brand Name | Unified Tracking |
| Public URL (Live) | https://npmjs.com/package/unified-tracking |
| Repository | https://github.com/aoneahsan/unified-tracking (private repo; branch `main`) |
| Capacitor App ID (Android) | N/A — this is a Capacitor *plugin*, not an app (native source under `android/`) |
| Capacitor App Name | N/A (plugin) |
| iOS Bundle ID / Scheme | N/A — Swift plugin source under `ios/` (`UnifiedTracking.podspec`, `Package.swift`); not an app bundle |
| Android URL (Play Store) | N/A (library) |
| iOS URL (App Store) | N/A (library) |
| Browser Extension | N/A — and explicitly NOT Manifest-V3 compatible (providers load vendor SDKs from CDNs at runtime) |
| NPM Package | `unified-tracking` — https://npmjs.com/package/unified-tracking |
| License | MIT (LICENSE file present at repo root) |
| Author | Ahsan Mahmood — aoneahsan@gmail.com — https://aoneahsan.com |
| Payment / Support URL | https://aoneahsan.com/payment?project-id=unified-tracking&project-identifier=unified-tracking |
| GitHub Sponsors | https://github.com/sponsors/aoneahsan |
| Agent-Readable Pricing | N/A (free, MIT — no paid tiers); AI agent guide ships as `/AI-INTEGRATION-GUIDE.md` |

> **Asks for next refresh:** none — all identity fields confirmed from `package.json` and repo. Open watch item (not an identity gap): whether the native iOS/Android SDK bridges have been build-verified by the user and a native-containing version published (until then `npm latest` stays `3.3.0`).

---

## Brand Assets

### Logo (SVG — inline)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" role="img" aria-label="Unified Tracking logo" width="96" height="96">
  <defs>
    <linearGradient id="ut-grad" x1="0" y1="0" x2="96" y2="96" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#6366F1"/>
      <stop offset="1" stop-color="#0EA5E9"/>
    </linearGradient>
  </defs>
  <rect x="4" y="4" width="88" height="88" rx="22" fill="url(#ut-grad)"/>
  <!-- many provider signals converging into one unified node -->
  <circle cx="48" cy="48" r="11" fill="#FFFFFF"/>
  <circle cx="48" cy="48" r="4.5" fill="#6366F1"/>
  <g stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" opacity="0.92">
    <line x1="48" y1="14" x2="48" y2="33"/>
    <line x1="82" y1="48" x2="63" y2="48"/>
    <line x1="48" y1="82" x2="48" y2="63"/>
    <line x1="14" y1="48" x2="33" y2="48"/>
    <line x1="24" y1="24" x2="38" y2="38"/>
    <line x1="72" y1="24" x2="58" y2="38"/>
    <line x1="72" y1="72" x2="58" y2="58"/>
    <line x1="24" y1="72" x2="38" y2="58"/>
  </g>
  <g fill="#FFFFFF" opacity="0.92">
    <circle cx="48" cy="12" r="4"/>
    <circle cx="84" cy="48" r="4"/>
    <circle cx="48" cy="84" r="4"/>
    <circle cx="12" cy="48" r="4"/>
    <circle cx="22" cy="22" r="3.4"/>
    <circle cx="74" cy="22" r="3.4"/>
    <circle cx="74" cy="74" r="3.4"/>
    <circle cx="22" cy="74" r="3.4"/>
  </g>
</svg>
```

> The mark expresses the core idea: many provider signals (the 8 outer nodes) converging into one unified core node — "many SDKs, one API." Original, self-contained, gradient + glyph.

### Color Palette

| Role | Token | Hex | Usage |
| --- | --- | --- | --- |
| Primary | Indigo 500 | `#6366F1` | Brand gradient start, primary accent, logo core |
| Secondary | Sky 500 | `#0EA5E9` | Brand gradient end, links, highlights |
| Ink | Slate 900 | `#0F172A` | Headings, code text |
| Body | Slate 600 | `#475569` | Body copy, muted labels |
| Surface | Slate 50 | `#F8FAFC` | Page / card background |
| Success | Emerald 500 | `#10B981` | "passing" / verified states in docs/badges |
| Warning | Amber 500 | `#F59E0B` | Honest-limit callouts (native unverified, CDN/CSP, MV3) |

> Derived brand palette (the package ships no UI/theme of its own — it's a headless library), chosen to match the indigo→sky gradient used in the README badges and logo. No dark-mode theme system; this is a code library, not an app.

---

## Update History (max 10 records)

| Date | Type | Notes |
| --- | --- | --- |
| 2026-06-26 | Links/identifiers refresh | links/identifiers/contact reconciled from master JSON |
| 2026-06-05 | Material refresh | Weekly portfolio re-run. `npx -y npm-check-updates -u` bumped 2 dev-only type deps (`@types/node` 25.9.1→25.9.2, `@types/react` 19.2.16→19.2.17); zero runtime/peer changes (package ships zero runtime deps), no held-back majors. `yarn type-check` + `yarn build` green (3 ESM entrypoints emitted: `.`, `/react`, `/capacitor`, each with `.d.ts`); `yarn eslint` clean (0 errors). **Honesty correction:** the automated test suite was removed 2026-06-03 (commit `4bddbd6`, per the global testing-removal policy), so the previously-cited "246 Vitest tests" no longer exist — verification is now typecheck + build + ESLint. (`yarn prettier --check` still fails only on the 13 `.java` native files — a pre-existing `prettier-plugin-java` parser-inference gap, not a code-quality regression.) `npm latest` stays 3.3.0; native bridges remain on-branch + unverified. |
| 2026-05-29 | Material refresh | Portfolio-refresh pass: `ncu -u` bumped 5 dev-only deps (eslint 10.4.0→10.4.1, prettier 3.8.1→3.8.3, prettier-plugin-java 2.9.5→2.9.7, rimraf 6.0.1→6.1.3, @capacitor/docgen 0.3.0→0.3.1); zero runtime/peer dep changes. type-check + build + (then-present) test suite all green. Moved canonical portfolio file to the ahsan-notebook location and added an authoritative Identity table + SVG logo + palette. Native SDK bridges (Batches 1–3, on-branch) remain unverified and unpublished. |
| 2026-05-27 | Refreshed | Completed deferred polish: Firebase/Amplitude now extend BaseAnalyticsProvider, unified flush(), typed event listeners, base-class type tightening, provider SSR guards, and a corrected setup-CLI config shape. |
| 2026-03-25 | Refreshed | Root portfolio file refreshed after provider-manager and web-entry remediation; install / type-check / build verified; default build simplified to remove the failing `docgen` step. |
| 2026-03-24 | Created | Root portfolio file created from repository state during portfolio sweep. |

---

## One-Line Summary

Unified Tracking is a zero-runtime-dependency TypeScript package that gives web, React, and Capacitor apps one consistent API for analytics, user identification, revenue and screen tracking, consent gating, and error monitoring across 16 providers.

## Elevator Pitch

Unified Tracking turns fragmented instrumentation work into a single, reusable layer. Instead of wiring analytics and error-monitoring vendors one by one across a codebase, teams adopt one package that manages provider initialization, event tracking, user identity, screen views, revenue logging, consent gating, and error capture from a consistent interface. It abstracts 8 analytics providers and 8 error-tracking providers behind one core, ships provider-free React hooks (no context wrapper, no HOC), buffers events fired before init, and runs in browsers and inside the Capacitor WebView on iOS/Android. The package ships zero runtime npm dependencies — each vendor SDK loads from its CDN only when that provider is enabled.

## What This Project Is About

Unified Tracking is a provider-based telemetry layer for the JavaScript/TypeScript ecosystem. The core engine (`unified-tracking-core.ts`) orchestrates a registry of provider adapters; analytics providers and error-tracking providers each implement a shared base class, so adding a vendor is a contained, testable unit rather than a sprawling integration. A consent gate sits on the dispatch path — events are dropped before they ever reach a provider when the matching consent category is denied — and a privacy layer strips configured `excludedProperties` from every event, trait, and context payload.

The package is delivered today by its web/JS layer, which means it works in any browser and inside the Capacitor WebView — so Capacitor apps are supported through the web runtime now. Native iOS (Swift) and Android (Java/Kotlin) SDK bridges have been authored on-branch across three batches (Firebase Analytics + Sentry; Mixpanel + Amplitude + Segment; Bugsnag + Rollbar) but are explicitly unverified (no Xcode/Gradle/devices in the build environment) and not yet published. This is strong portfolio material because it demonstrates abstraction design, cross-platform engineering, developer-experience thinking, and disciplined honesty about what ships versus what's planned.

## Vision

Provide a practical, vendor-neutral telemetry layer that lets teams instrument products faster without locking into a single analytics or error-reporting vendor — and without paying a runtime-dependency or bundle-size tax for providers they don't use.

## Mission

Simplify analytics and error-tracking implementation on the web and in Capacitor apps; reduce duplicate instrumentation work across projects; provide a scalable provider architecture for many vendors; support privacy-aware telemetry through consent gating and data-minimization controls; and improve developer experience for the React and Capacitor ecosystems with provider-free hooks and a setup CLI.

## Tech Stack

| Layer | Choice |
| --- | --- |
| Language | TypeScript 6 (NodeNext module resolution, ESM-only output) |
| Build | `tsc -p tsconfig.build.json` (no bundler — Rollup removed in 3.2.0); `rimraf` clean step |
| Runtime deps | **Zero** — vendor SDKs load from CDN at runtime per enabled provider |
| Peer deps (optional) | `@capacitor/core` `^7.4.3 \|\| ^8.0.0`, `react` `>=19.0.0` (both optional) |
| React surface | Provider-free hooks (`useUnifiedTracking`, `useTrackEvent`) via `unified-tracking/react` |
| Capacitor surface | `registerCapacitorPlugin()` via `unified-tracking/capacitor`; `@CapacitorPlugin` classes on iOS/Android |
| Native (on-branch, unverified) | iOS Swift (`Package.swift`, `UnifiedTracking.podspec`, CocoaPods/SPM) + Android Gradle (`build.gradle`, `variables.gradle`, proguard rules) |
| Verification | `tsc` type-check + `tsc` build emit + ESLint 10 (`@typescript-eslint` 8). **No automated test suite** — removed 2026-06-03 per global testing-removal policy (was Vitest previously). |
| Lint/format | ESLint 10 + `@typescript-eslint` 8 + Prettier 3 (`@ionic/prettier-config`), `prettier-plugin-java` for native; `@ionic/swiftlint-config` |
| Tooling | `unified-tracking-setup` CLI (`bin/setup.js`); `@capacitor/docgen` (out of default build path); Husky + lint-staged |
| Node engine | `>=24.13.0`; package manager `yarn@4.14.1` |
| Exports | `.` (core), `./react`, `./capacitor` — tree-shakeable, ESM, with `.d.ts` types |

## Feature Catalog

- **Unified core API:** `initialize`, `track`, `identify`, `setUserProperties`, screen/page tracking, revenue logging, `logError`, `setConsent`, `reset`, `flush`, `shutdown`, and typed event listeners — one surface across all providers.
- **8 analytics providers:** Google Analytics, Firebase, Amplitude, Mixpanel, Segment, PostHog, Heap, Matomo (under `src/providers/analytics/`).
- **8 error-tracking providers:** Sentry, Bugsnag, Rollbar, LogRocket, Raygun, DataDog (RUM), AppCenter, Firebase Crashlytics (under `src/providers/error-handling/`).
- **Provider-free React hooks:** `useUnifiedTracking`, `useTrackEvent` from `unified-tracking/react` — work in dynamically injected components, no context provider or HOC required.
- **Consent gating:** events dropped at dispatch when the matching consent category is denied; `marketing`/`personalization` default to opt-in (`false`) as of 3.1.0.
- **Data minimization:** `settings.privacy.excludedProperties` keys stripped from every event/trait/context before any provider sees them (enforced as of 3.1.0).
- **Pre-init event buffering:** an event queue captures calls fired before providers are ready and flushes them once initialized.
- **Unified `flush()`:** flushes buffered events across every provider that supports it (e.g. Segment, Sentry) — on the main API, the hook, and the Capacitor adapter.
- **Secret-safe logging:** provider keys/DSNs are redacted from logs; default log level is `warn`.
- **Setup CLI:** `npx unified-tracking-setup` scaffolds a correct object-shaped config.
- **Capacitor adapter + native scaffolding:** `registerCapacitorPlugin()`; native bridges authored on-branch (Firebase/Sentry; Mixpanel/Amplitude/Segment; Bugsnag/Rollbar) with JS↔native config-shape reconciliation — unverified, not published.

## Install & Usage Snippet

```bash
yarn add unified-tracking
# optional peers (only if you use that surface):
yarn add @capacitor/core react
```

```ts
import { UnifiedTracking } from 'unified-tracking';

await UnifiedTracking.initialize({
  analytics: { providers: ['google', 'mixpanel'], google: { measurementId: 'G-XXXX' } },
  errorTracking: { providers: ['sentry'], sentry: { dsn: 'https://...' } },
  settings: { debug: false, defaultConsent: { analytics: true, marketing: false } },
});

await UnifiedTracking.track('signup_completed', { plan: 'pro' });
await UnifiedTracking.identify('user-123', { email: 'a@b.com' });
```

```tsx
// React — no <Provider> required
import { useUnifiedTracking } from 'unified-tracking/react';

function CTA() {
  const { track } = useUnifiedTracking();
  return <button onClick={() => track('cta_clicked')}>Get started</button>;
}
```

## Hidden Facts & Unique Angles

- **Zero runtime dependencies.** The published package adds nothing to your `node_modules` runtime graph — each vendor SDK is fetched from its CDN only when that provider is enabled. This is a deliberate bundle-size and supply-chain decision (and an honest trade-off, see limits below).
- **Provider-free React integration.** Most telemetry libraries force a `<Provider>` at the app root; this one works through plain hooks anywhere, including components mounted dynamically.
- **16 providers behind one base-class hierarchy.** Firebase and Amplitude analytics providers now extend `BaseAnalyticsProvider`, so super-properties and timed events work uniformly; adding a provider is a contained unit.
- **Privacy is on the dispatch path, not bolted on.** Consent gating and property exclusion are enforced before providers receive data — not a documented-but-inert promise (they were made real in 3.1.0).
- **NodeNext ESM correctness.** 3.2.0 fixed a CRITICAL Node-ESM import defect and a silent provider-registration failure via a static import map — the kind of packaging bug that only shows up in real consumers.
- **Audit-driven hardening.** Multiple independent re-audits (3.1.0, 3.2.0 Round 02, 3.3.0 Round 03) fixed 2 CRITICAL + 8 HIGH + many MEDIUM/LOW issues and rewrote fictional docs to match real behavior.
- **Radically honest native status.** ~100 `// NOTE(unverified)` markers across iOS/Android source; `npm latest` is held at 3.3.0 until a real native build passes. No "full native SDK support" claim is made anywhere.

## Benefits for Users

- **App/product teams** instrument analytics + error monitoring in one pass instead of integrating each SDK separately — faster rollout, cleaner call sites.
- **React developers** drop in `useUnifiedTracking()` without restructuring their app around a context provider.
- **Capacitor developers** get tracking that works in the WebView today across iOS/Android from one package.
- **Privacy-conscious teams** get GDPR-style consent gating and property exclusion built into the data path.
- **Teams evaluating vendors** can swap Mixpanel for Amplitude (or Sentry for Bugsnag) by changing config, not rewriting instrumentation — reducing lock-in.

## Value & Potential

Telemetry is a near-universal product need, and most teams reinvent it per project. A vendor-neutral, zero-runtime-dependency abstraction is a reusable infrastructure asset rather than a thin wrapper: the provider model scales to new vendors, the React/Capacitor surfaces widen reach, and the planned native SDK bridges open a second delivery path (true native performance on device) without changing the public API. The honest framing — web-runtime today, native planned — and the audit trail make it credible for production adoption and as a portfolio centerpiece for platform-level engineering.

## Resume / CV Bullets

- Built and published `unified-tracking`, a zero-runtime-dependency TypeScript package unifying analytics and error monitoring for web, React, and Capacitor apps behind one API spanning 8 analytics + 8 error-tracking providers.
- Designed a provider-based architecture on shared base classes with a provider registry, consent gating, property-level privacy controls, and pre-init event buffering — making each vendor a contained, testable unit.
- Shipped provider-free React hooks (`useUnifiedTracking`, `useTrackEvent`) so apps instrument telemetry without a context provider or HOC, even in dynamically mounted components.
- Hardened the package across three independent audit rounds, fixing 2 CRITICAL (Node-ESM import + silent provider registration) plus 8 HIGH and many MEDIUM/LOW issues, and rewriting docs to match real behavior.
- Migrated the build off Rollup to a pure `tsc` pipeline emitting three tree-shakeable ESM entrypoints (`.`, `/react`, `/capacitor`) with declaration types, kept green under NodeNext module resolution via typecheck + build + ESLint gates.
- Authored on-branch native iOS (Swift) and Android (Gradle) SDK bridges for 7 vendors with JS↔native config reconciliation, and enforced a release gate (held `npm latest` at 3.3.0) until native builds are verified.
- Maintained zero runtime npm dependencies by loading vendor SDKs from CDN per enabled provider, reducing consumer bundle size and supply-chain surface.

## LinkedIn / Portfolio Paragraph

Unified Tracking is an open-source (MIT) TypeScript package I built to solve a problem almost every product team hits: telemetry sprawl. Instead of wiring Google Analytics, Mixpanel, Amplitude, Segment, PostHog, Sentry, Bugsnag and a dozen others one by one, teams add one package and get a single API for events, user identity, revenue, screen views, consent, and error monitoring across 16 providers. It ships provider-free React hooks (no context wrapper required), enforces GDPR-style consent gating and data minimization on the dispatch path, and carries zero runtime npm dependencies — each vendor SDK loads from its CDN only when enabled. It runs in browsers and inside the Capacitor WebView on iOS/Android today, with native SDK bridges authored on-branch and held back until they're build-verified. Three independent audit rounds (fixing critical Node-ESM and provider-registration defects) back the current v3.3.0 release, verified through a clean typecheck + build + ESLint gate.

## Social Content Angles (for ChatGPT content project)

- "One API, 16 telemetry providers" — the case against re-wiring analytics in every project.
- Zero runtime dependencies: how loading vendor SDKs from CDN keeps your bundle and supply chain lean (and the trade-off honestly stated).
- Provider-free React hooks — telemetry without a `<Provider>` at your app root.
- Privacy on the dispatch path: consent gating + property exclusion before any vendor sees data.
- The packaging bug that only shows up in real consumers: fixing Node-ESM imports with NodeNext + explicit `.js` extensions.
- "Held back on purpose" — why I kept `npm latest` at 3.3.0 with ~100 `NOTE(unverified)` markers on native code.
- Build-pipeline diet: dropping Rollup for a pure `tsc` ESM build with three tree-shakeable entrypoints.
- Audit-driven development: what three independent re-audits surfaced (2 CRITICAL + 8 HIGH) and how the fixes landed.
- Capacitor WebView tracking today vs. native SDK bridges tomorrow — honest cross-platform framing.
- Designing for vendor flexibility: swap Mixpanel↔Amplitude or Sentry↔Bugsnag by config, not rewrites.

## Top 20 Hashtags

#UnifiedTracking #AnalyticsInfrastructure #ErrorTracking #Observability #ReactLibrary #CapacitorPlugin #TypeScriptProject #OpenSourcePackage #CrossPlatformDevelopment #DeveloperTools #WebAnalytics #ProductEngineering #Telemetry #CrashReporting #SaaSDevelopment #BuildInPublic #FrontendArchitecture #PrivacyByDesign #NpmPackage #ReactHooks

## SEO / AEO Metadata

- Meta description (150–160 chars): Unified Tracking is a zero-dependency TypeScript package giving web, React, and Capacitor apps one API for analytics and error tracking across 16 providers.
- Primary keywords: unified analytics package, error tracking library, React analytics hooks, Capacitor analytics plugin, TypeScript telemetry, multi-provider analytics.
- Long-tail / GEO keywords (AI-search): one API for multiple analytics providers, provider-free React tracking hooks, consent-aware analytics with data minimization, zero runtime dependency analytics library, swap Mixpanel and Amplitude without rewriting instrumentation, web and Capacitor crash reporting from one package.
- Suggested og:title: Unified Tracking — one API for 16 analytics & error-tracking providers
- Suggested og:description: Zero-dependency TypeScript telemetry for web, React, and Capacitor. Provider-free hooks, consent gating, 8 analytics + 8 error providers. MIT licensed.

## Honest Status & Constraints (Mandatory)

- **Web-first delivery.** All shipped tracking runs via the web/JS layer (including inside the Capacitor WebView). Capacitor apps are supported through the web runtime today.
- **Native bridges authored but unverified and unpublished.** iOS (Swift) + Android (Gradle) provider bridges for Firebase/Sentry, Mixpanel/Amplitude/Segment, and Bugsnag/Rollbar exist on-branch with ~100 `NOTE(unverified)` markers. They have NOT been build-verified (no Xcode/Gradle/devices) and are NOT on npm. Do not claim full native-SDK delivery. `npm latest` = 3.3.0.
- **No automated test suite.** The Vitest suite was removed 2026-06-03 (global testing-removal policy); the package is now verified via `tsc` type-check + `tsc` build emit + ESLint. Earlier portfolio files cited "246 tests" — that no longer applies.
- **Runtime CDN SDK loading.** Providers load their vendor SDK from a CDN at runtime, which requires the host app to allowlist those origins in its Content-Security-Policy `script-src`. Because of remote-script loading, the package is **NOT compatible with Manifest V3 browser extensions**.
- **Firebase Crashlytics is web-unsupported** (intentional stub; the `@capacitor-firebase/crashlytics` wrapper is banned — use Sentry).
- **Downstream configuration still required.** Real provider behavior depends on valid vendor credentials/DSNs, consent configuration, and app-specific deployment. End-to-end validation in the consuming app matters beyond package-level checks.
- **No fabricated metrics.** This file states no download counts, ratings, user numbers, or "best/#1/top" claims.

## Content Prompting Notes (for future ChatGPT use)

Emphasize: one API for 16 analytics + error providers; zero runtime dependencies; provider-free React hooks; consent gating + data minimization on the dispatch path; web-runtime delivery that also covers Capacitor via the WebView; the honest web-first-today / native-planned distinction; and the audit-driven engineering story. Do NOT claim native iOS/Android SDK delivery, do NOT claim Manifest-V3 browser-extension compatibility, do NOT cite an automated test count (the suite was removed), and never invent statistics, ratings, or superlatives.

## File Usage Rule

Refresh this file only after at least 7 days have passed since the last update, unless a major release or material project change happens earlier. Keep only the 10 most recent history records in this file.

## Generic Hashtags (always include in posts)

#Aoneahsan #AhsanMahmood #Zaions #BestOpenSourceCommunityProject #TopFree #SaaSApp
