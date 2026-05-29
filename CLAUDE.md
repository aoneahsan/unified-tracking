# unified-tracking Package

**Package Name**: `unified-tracking`
**Version**: `3.3.0`
**NPM**: `https://www.npmjs.com/package/unified-tracking`
**Last Updated**: `2026-05-29`

Unified analytics and error tracking infrastructure for React, web, and Capacitor apps with provider-based integrations, consent controls, React hooks, and cross-platform delivery targets.

## Current Verified State

- Reviewed on: `2026-05-27` (Round 03 — completed the Round-02 deferral backlog)
- Install: `yarn install` passed (all dependencies at latest stable)
- Typecheck: `yarn type-check` passed (TypeScript 6, NodeNext module resolution)
- Build: `yarn build` passed cleanly
- Tests: `yarn test` passed (`246` passed, `2` skipped)
- Lint: `yarn lint` passed (eslint `0`/`0` + prettier clean)
- Node ESM import smoke check: passed (`import('dist/esm/src/index.js')` resolves)
- Round 03 (3.3.0) completed the deferred polish: unified `flush()`, typed event listeners, Firebase/Amplitude now extend `BaseAnalyticsProvider` (M7), single SSR guard, public-surface `any`→`unknown` (L11), `getProviderManager` deprecated, and the `bin/setup.js` config-shape rework. Round 02 (3.2.0) fixed 2 CRITICAL + 8 HIGH + 11 MEDIUM (see `docs/features/polish-audit-release/round02-findings.md`).
- STILL DEFERRED (separate effort): native iOS/Android SDK bridges — require a native toolchain (Xcode/Gradle) + real vendor SDK deps + device/simulator build verification not available in this environment. Tracking runs via the web layer (incl. the Capacitor WebView).

## CLAUDE.md + AGENTS.md Sync Rule (IRON-SOLID)

**Every important rule MUST exist in BOTH `CLAUDE.md` AND `AGENTS.md` at each level.**

- When adding or updating a rule in one file, ALWAYS update the other
- This applies to root and ALL nested files in every folder
- Never add a rule to just `CLAUDE.md` or just `AGENTS.md` — always both
- Create reasonable nested `CLAUDE.md` and `AGENTS.md` files in all important folders where rules will improve development results

## CLAUDE.md + AGENTS.md Update Frequency (IRON-SOLID)

**ALL `CLAUDE.md` and `AGENTS.md` files MUST be reviewed and updated at least once every 3 days.**

- On every session start, check `Last Updated` dates across all project files
- If any file is >3 days stale, update it BEFORE proceeding with other work
- Stale instruction files directly degrade development quality
- Every file must have a `Last Updated` date field

## Claude Code Agents (MANDATORY - IRON-SOLID)

**For EVERY prompt and task, Claude Code MUST use agents (Task tool) to deliver the best possible experience.**

- Use **Explore agent** for codebase search, file discovery, understanding architecture
- Use **Plan agent** for implementation planning, architecture decisions
- Use **general-purpose agent** for complex multi-step tasks, parallel processing
- Launch multiple agents in parallel when tasks are independent
- Use Explore agent before making changes to unfamiliar code
- Use Plan agent before implementing non-trivial features

## Implemented Feature Areas

| Area                     | Scope                                                                                                                                             |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unified core API         | Event tracking, user identification, revenue logging, screen tracking, consent handling, provider orchestration                                   |
| Analytics providers      | Google Analytics, Mixpanel, Segment, PostHog, Amplitude, Firebase, Heap, Matomo                                                                   |
| Error tracking providers | Sentry, Bugsnag, Rollbar, LogRocket, Raygun, DataDog RUM, AppCenter, Firebase Crashlytics                                                         |
| React integration        | Provider-free hooks (`useUnifiedTracking`, `useTrackEvent`) from `unified-tracking/react`                                                         |
| Platform support         | Web/JS layer (browsers + Capacitor WebView). Native iOS/Android SDK bridges are scaffolded but not yet implemented — see "Native Providers" below |
| Tooling                  | Setup CLI, generated distribution exports, package-level build/test/typecheck workflows                                                           |

## Privacy & Compliance

- Consent gate at dispatch — analytics/error events are dropped when the matching consent category is denied (`setConsent` / `settings.defaultConsent`). `marketing`/`personalization` default to `false` (opt-in) as of 3.1.0.
- Data minimization — `settings.privacy.excludedProperties` keys are stripped from every event/trait/context before providers receive them (enforced as of 3.1.0; previously declared but inert).
- Secrets are redacted from logs; provider keys/DSNs never reach the console. Default log level is `warn`.

## Native Providers (Record — updated 2026-05-29)

- Web/JS layer: delivers tracking for all 16 providers (incl. inside the Capacitor WebView). This is the shipped `3.3.0` path and remains the only path on npm.
- **Native SDK bridges: ON-BRANCH, UNVERIFIED, NOT YET PUBLISHED.** Per the user's 2026-05-27 "implement native now" decision, native vendor-SDK bridges are now in the repo behind the existing `@CapacitorPlugin` classes (reachable via `registerCapacitorPlugin()`):
  - **Batch 1** (B1, 2026-05-27): Firebase Analytics + Sentry on iOS (FirebaseAnalytics / sentry-cocoa) + Android (Firebase BoM + `io.sentry:sentry-android`) + the `ProviderManager` fan-out on both platforms.
  - **Batch 2** (B2, 2026-05-29): Mixpanel + Amplitude + Segment on iOS (mixpanel-swift / AmplitudeSwift / Segment v4 ObjC SDK) + Android (mixpanel-android / amplitude-android / analytics-android).
  - **Batch 3** (B3, 2026-05-29): Bugsnag + Rollbar on iOS (bugsnag-cocoa / RollbarNotifier) + Android (bugsnag-android / rollbar-android).
  - **JS↔native config-shape reconciliation** (2026-05-29): both `UnifiedTrackingPlugin.swift` and `UnifiedTrackingPlugin.java` now parse the real JS `UnifiedTrackingConfig` shape — `{ analytics: { providers: [ids], <id>: {...} }, errorTracking: same, settings: { debug?, defaultConsent? } }`. `"google"` provider id is routed through `FirebaseAnalyticsProvider` (GA4 IS Firebase on device). Web-only providers (PostHog/Heap/Matomo/DataDog/LogRocket/Raygun/AppCenter) log a `"no native implementation (web-only); skipped on native"` warning and defer to the JS core.
  - **All native code is written but NOT build-verified in the dev environment** (no Xcode / Android Studio / CocoaPods / Gradle here). Every touched native file carries `// NOTE(unverified)` markers (~50 markers iOS, ~50 markers Android). The user build-verifies in Xcode (`cd ios && pod install && xcodebuild` or SPM resolve) and Android Studio (`cd android && ./gradlew clean build`).
  - **Repo hygiene fix (2026-05-29):** `.gitignore` was blanket-ignoring `ios/`, `android/`, `electron/` — a Capacitor _app_ convention that's wrong for a _plugin_ repo (npm ships the native source via the `files` allowlist, but git was treating it as untracked, so the entire native scaffolding lived outside source control). Replaced with build-artifact-only ignores (`Pods/`, `.gradle/`, `build/`, `DerivedData/`, etc.). 35 pre-existing + this-round native source files are now tracked in git for the first time.
- Crashlytics native stays an intentional **stub** (the `@capacitor-firebase/crashlytics` wrapper is BANNED; use Sentry).
- Spec / honesty contract: `docs/features/polish-audit-release/round04-native-overview.md`.
- Do NOT publish a native-containing version to npm until a successful native build is confirmed; `npm latest` stays `3.3.0` until then. Do NOT claim full native-SDK delivery in store listings until verified.

## Critical Working Rules

- Use `yarn` exclusively. No `npm`, `pnpm`, or `package-lock.json`.
- Keep docs aligned with actual package version and verified repo state.
- Do not describe this package as uninitialized or in planning; it is implemented and published.
- Document known build or test issues honestly until fixed.
- When providers, exports, or operational status change, update `Readme.md`, this file, and the portfolio file in the same pass.
- Test framework: **Vitest** (NEVER Jest). Build: **tsc** (NodeNext module resolution; the orphan Rollup step + deps were removed in 3.2.0). Lint: **ESLint + Prettier**.

## Root Portfolio File Maintenance Rule

- Maintain exactly one current root portfolio info file: `UNIFIED-TRACKING_portfolio-info_YYYY-MM-DD.md`
- Refresh only after 7+ days unless major release or material capability change.
- Keep at most 10 update-history records inside the portfolio file.
- When the portfolio file changes, update `Readme.md` and this `CLAUDE.md` in the same pass.

## Nested Instruction Files

Domain-specific rules live in nested `CLAUDE.md` + `AGENTS.md` files to optimize context usage:

| Location         | Scope                                                                              |
| ---------------- | ---------------------------------------------------------------------------------- |
| `src/`           | Source conventions, imports, path aliases, TypeScript rules                        |
| `src/core/`      | Core engine architecture, event flow, singletons                                   |
| `src/providers/` | Provider architecture, base classes, adding/testing providers                      |
| `src/react/`     | Provider-free React hooks (`useUnifiedTracking`, `useTrackEvent`) — no context/HOC |
| `docs/`          | Documentation structure, update rules, API docs                                    |
| `android/`       | Android native build, Kotlin/Java patterns                                         |
| `ios/`           | iOS native build, Swift patterns, CocoaPods/SPM                                    |

## Documentation Surface

- Core README: `/Readme.md`
- API and setup docs: `/docs`
- AI agent usage guide: `/AI-INTEGRATION-GUIDE.md`
- Release/readiness notes: `/IMPLEMENTATION_COMPLETE.md`, `/VALIDATION_COMPLETE.md`, `/RELEASE_READY.md`

## Package Update History

| Date       | Version | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ---------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-05-27 | 3.3.0   | Round 03 — completed the Round-02 deferral backlog (all additive): unified `flush()`, typed event listeners (`TrackingEventPayload`), Firebase/Amplitude now extend `BaseAnalyticsProvider` (M7 — gain super-properties + timed events), single SSR/non-browser guard, public-surface `any`→`unknown` (L11), `getProviderManager` deprecated, and `bin/setup.js` regenerates the correct object-shaped config. Native SDK bridges still deferred. No breaking API changes.                                            |
| 2026-05-26 | 3.2.0   | Round 02 fresh independent re-audit: fixed 2 CRITICAL (Node-ESM unimportable → NodeNext + .js; providers could silently fail to register → static import map), HIGH secret-logging (redact in sink), config-key mismatches (aliases + types), breadcrumbs reach SDK, crashlytics honest error, EventQueue wired up (pre-init buffering), unified ConsentSettings, GA consent default, anonymizeIp honored, single core singleton, stable hooks, shutdown(); rewrote 3 fictional /docs files. No breaking API changes. |
| 2026-05-26 | 3.1.0   | Polish + hardening: deps → latest stable (TS6/ESLint10/jsdom29), full audit, enforced privacy controls + consent gate, script-src validation, removed eval + dead code (web.ts + React island), public types tightened, 0 lint warnings                                                                                                                                                                                                                                                                               |
| 2026-03-25 | 3.0.2   | Fixed provider-manager/web/google-analytics test failures, removed fragile docgen from default build                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 2026-03-24 | 3.0.2   | Refreshed docs, recorded current verification status, added portfolio maintenance rule                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 2026-02-02 | unknown | Full update to latest versions, build passed, lint had known issues                                                                                                                                                                                                                                                                                                                                                                                                                                                   |

## Comprehensive Audit Record

| Date       | Audit Type                                    | Status                    | Issues Found                                          | Resolved                                                                                                                                               |
| ---------- | --------------------------------------------- | ------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2026-05-26 | Fresh independent re-audit (v3.2.0, Round 02) | Passed                    | ~30 (incl. 2 CRITICAL, 8 HIGH the 3.1.0 audit missed) | Fixed 2 CRITICAL + 8 HIGH + 11 MEDIUM + most LOW; deferred M7 + a few LOW + native bridges + bin/setup.js rework (documented). See round02-findings.md |
| 2026-05-26 | Deep audit + polish (v3.1.0)                  | Passed                    | ~25                                                   | Most fixed; Firebase base-class refactor + native SDK bridges deferred (documented)                                                                    |
| 2026-03-25 | Issue Remediation                             | Passed with minor warning | 4                                                     | 4                                                                                                                                                      |
| 2026-03-24 | Portfolio + Docs Refresh                      | Passed with issues        | 3                                                     | 0                                                                                                                                                      |
| 2026-02-02 | Package Update                                | Passed with issues        | 2                                                     | 0                                                                                                                                                      |
| 2026-01-23 | Full Audit                                    | Passed with issues        | 2                                                     | 0                                                                                                                                                      |

### Last Audit Details

- Package Manager: yarn confirmed
- Build: passes cleanly; `docgen` moved out of default build path
- TypeScript: passes
- Tests: passing
- Features: implemented surface is substantial and reflected in docs

### Next Audit Due: 2026-06-26
