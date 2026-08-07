# unified-tracking Package

**Package Name**: `unified-tracking`
**Version**: `3.3.0`
**NPM**: `https://www.npmjs.com/package/unified-tracking`
**Last Updated**: `2026-08-06`

Unified analytics and error tracking infrastructure for React, web, and Capacitor apps with provider-based integrations, consent controls, React hooks, and cross-platform delivery targets.

## Production Finalization / Gap Pass (2026-06-24)

- **Gap audit result:** the package is feature-complete at the web/JS delivery layer — full core engine (16 providers, consent gate, privacy minimization, event queue), React hooks, and the Capacitor bridge, with **zero code stubs/TODOs**. The only honest deferral is the native iOS/Android SDK bridges (on-branch, unverified — a TRUE toolchain/device blocker).
- **Built this pass:** the missing **public documentation website** — separate PUBLIC repo `unified-tracking-docs` (Docusaurus 3, modeled on `native-update-docs`): documents every real API read from `src/`, full SEO floor (AI-bot robots allowlist, sitemap, llms.txt, JSON-LD SoftwareSourceCode/SoftwareApplication), dual-hosting (Firebase + GitHub Pages) config.
- **Trackers:** `docs/project-finalization/00-tracker.json` (gapInventory + phases). Owner-only work in **`docs/MANUAL-TASKS.md`** (native build-verify, npm publish, docs deploy + DNS, search-engine submission).
- **Verify gates (green 2026-06-24):** `yarn type-check`, `yarn build`, `yarn eslint` all exit 0. `yarn prettier --check` still fails only on `.java` native files (pre-existing parser gap).

## Global + workspace rules — pointers, never copies

Fleet law lives in ONE place and auto-loads into every session from `~/.claude/rules/`. Restating it here is
how a copy drifts and then contradicts its source — and it is charged to the context budget of every session
opened in this project. **Never paste a global rule into this file. Add the pointer.**

| Concern | Where the law lives |
|---|---|
| RULE #0 skills gate · model workflow · the sub-agent ban | `~/.claude/CLAUDE.md` · `rules/skill-bindings.md` · `rules/subagent-orchestration.md` |
| Understand before editing · where a decision gets recorded | `rules/project-understanding.md` |
| Packages: nvm → npm (global) → yarn (local) · `ncu` upgrades · version blockers | `rules/package-management.md` · `rules/package-version-known-issues.md` |
| Git: one commit per prompt · auto commit/push/deploy scope | `rules/git-workflow.md` |
| `.gitignore` · `.env` · secrets · dev ports · docs layout · sitemap + feed | `rules/project-config.md` |
| Gates · logger · clean build · **source maps off** · test policy | `rules/build-test-quality.md` |
| Dev/preview servers · run-to-verify · one project at a time | `rules/dev-workflow.md` |
| Zero-cost constraint | `rules/zero-cost.md` |
| Data-fetch budget — every list read is limited | `rules/data-fetch-budget.md` |
| UI floors · the one theme control · the platform admin panel | `rules/frontend-ui-standards.md` |
| Share contract · push (OneSignal) · SEO + AEO | `rules/share-feature.md` · `rules/push-notifications.md` · `rules/seo-aeo-ranking.md` |
| Capacitor plugins + native issues | `rules/capacitor-plugins-and-issues.md` |
| Store listings · versioning · npm publish · rejection rules | `rules/publishing-compliance.md` · `~/.claude/policy/` |
| Portfolio info + social content | `rules/portfolio-and-social.md` |
| Docs brevity + fixed paths · manual tasks · feature trackers | `rules/manual-tasks.md` · `rules/feature-trackers.md` |
| This file's own budget — ≤ 28,672 B, auto-loads every session | `rules/context-budget.md` |
| **Context Budget Last Verified** | **2026-08-06** — CLAUDE.md 21,890 B / PENDING-TASKS.md 450 B; re-check due **2026-08-16**, cadence 10d (`rules/context-budget.md`) |

**This project's own rules and implementation records** — everything that is *not* fleet law — live in
[`docs/PROJECT-RULES.md`](./docs/PROJECT-RULES.md).

**Project-specific values for those global rules:**

| Global rule | This project's value |
|---|---|
| `.gitignore` + `.env` | PRIVATE repo → `.env`/secrets ARE tracked in git; `*.ignore.*` and `project-record-ignore/` always ignored; native source tracked, build artifacts (`Pods/`, `.gradle/`, `build/`, `DerivedData/`) ignored. **Gitignore Last Verified: 2026-06-24** |
| Packages | `yarn` for ALL local work — only `yarn.lock`. `ncu` last applied 2026-06-05 (detail in "Current Verified State" below) |
| Source maps off | this package builds with **`tsc`** (NodeNext), so the enforcing flags are `tsconfig.json` → `"sourceMap": false`, `"inlineSourceMap": false`, `"declarationMap": false`. No `.map` file ships |
| Gates | `yarn type-check` · `yarn build` · `yarn eslint` (no test suite — removed 2026-06-03; do NOT re-add) |

## Project rules — moved to docs/

- **CLAUDE.md + AGENTS.md Sync Rule (IRON-SOLID)** → [`docs/PROJECT-RULES.md`](./docs/PROJECT-RULES.md)
- **Portfolio Info File — Weekly Update Rule** → [`docs/PROJECT-RULES.md`](./docs/PROJECT-RULES.md)

## Current Verified State

- Reviewed on: `2026-06-05` (portfolio-refresh re-run — deps re-pinned to latest stable, gates re-run green)
- Install: `yarn install` passed (all dependencies at latest stable)
- Deps refresh (2026-06-05): `npx -y npm-check-updates -u` bumped 2 dev-only type deps (`@types/node` 25.9.1→25.9.2, `@types/react` 19.2.16→19.2.17). No runtime/peer deps changed (package ships zero runtime deps). No held-back majors. (2026-05-29 run bumped 5 dev deps: eslint, prettier, prettier-plugin-java, rimraf, @capacitor/docgen.)
- Typecheck: `yarn type-check` passed (TypeScript 6, NodeNext module resolution)
- Build: `yarn build` passed cleanly (all 3 entrypoints emitted: `.`, `/react`, `/capacitor` — ESM `.js` + `.d.ts`)
- Lint: `yarn eslint` clean (0 errors). `yarn prettier --check` fails ONLY on the 13 `.java` native files (pre-existing `prettier-plugin-java` parser-inference gap in `@ionic/prettier-config`, unrelated to this refresh) — TS/JS code style is clean.
- Tests: **automated test suite REMOVED 2026-06-03** (commit `4bddbd6` "remove cypress and all automated-testing infrastructure", per the global testing-removal policy). There is no Vitest/Jest suite to run anymore; the package is verified via typecheck + build + eslint. Do NOT re-add test packages.
- Round 03 (3.3.0) completed the deferred polish: unified `flush()`, typed event listeners, Firebase/Amplitude now extend `BaseAnalyticsProvider` (M7), single SSR guard, public-surface `any`→`unknown` (L11), `getProviderManager` deprecated, and the `bin/setup.js` config-shape rework. Round 02 (3.2.0) fixed 2 CRITICAL + 8 HIGH + 11 MEDIUM (see `docs/features/polish-audit-release/round02-findings.md`).
- STILL DEFERRED (separate effort): native iOS/Android SDK bridges — require a native toolchain (Xcode/Gradle) + real vendor SDK deps + device/simulator build verification not available in this environment. Tracking runs via the web layer (incl. the Capacitor WebView).

## CLAUDE.md + AGENTS.md Update Frequency (IRON-SOLID)

**ALL `CLAUDE.md` and `AGENTS.md` files MUST be reviewed and updated at least once every 3 days.**

- On every session start, check `Last Updated` dates across all project files
- If any file is >3 days stale, update it BEFORE proceeding with other work
- Stale instruction files directly degrade development quality
- Every file must have a `Last Updated` date field

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

- Use `yarn` for all LOCAL work (never `npm`/`pnpm` locally; `npm` is only for global installs per the Package Manager Hierarchy above). Only `yarn.lock` — no `package-lock.json`/`pnpm-lock.yaml`.
- Keep docs aligned with actual package version and verified repo state.
- Do not describe this package as uninitialized or in planning; it is implemented and published.
- Document known build or test issues honestly until fixed.
- When providers, exports, or operational status change, update `Readme.md`, this file, and the portfolio file in the same pass.
- Build: **tsc** (NodeNext module resolution; the orphan Rollup step + deps were removed in 3.2.0). Lint: **ESLint + Prettier**.

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
- Tests: automated test suite removed 2026-06-03 (global testing-removal policy) — verified via typecheck + build + eslint instead
- Features: implemented surface is substantial and reflected in docs

### Next Audit Due: 2026-06-26

<!-- project-links:start -->

## Links

- Live: https://www.npmjs.com/package/unified-tracking
- NPM: https://www.npmjs.com/package/unified-tracking

_URL source of truth: `01-code/projects/project-live-urls.json` (auto-generated — do not hand-edit between these markers)._

<!-- project-links:end -->

<!-- RULE:main-context-model-workflow v2026-07-16 -->
