# unified-tracking Package

**Package Name**: `unified-tracking`
**Version**: `3.3.0`
**NPM**: `https://www.npmjs.com/package/unified-tracking`
**Last Updated**: `2026-06-24`

Unified analytics and error tracking infrastructure for React, web, and Capacitor apps with provider-based integrations, consent controls, React hooks, and cross-platform delivery targets.

## Production Finalization / Gap Pass (2026-06-24)

- **Gap audit result:** the package is feature-complete at the web/JS delivery layer — full core engine (16 providers, consent gate, privacy minimization, event queue), React hooks, and the Capacitor bridge, with **zero code stubs/TODOs**. The only honest deferral is the native iOS/Android SDK bridges (on-branch, unverified — a TRUE toolchain/device blocker).
- **Built this pass:** the missing **public documentation website** — separate PUBLIC repo `unified-tracking-docs` (Docusaurus 3, modeled on `native-update-docs`): documents every real API read from `src/`, full SEO floor (AI-bot robots allowlist, sitemap, llms.txt, JSON-LD SoftwareSourceCode/SoftwareApplication), dual-hosting (Firebase + GitHub Pages) config.
- **Trackers:** `docs/project-finalization/00-tracker.json` (gapInventory + phases). Owner-only work in **`docs/MANUAL-TASKS.md`** (native build-verify, npm publish, docs deploy + DNS, search-engine submission).
- **Verify gates (green 2026-06-24):** `yarn type-check`, `yarn build`, `yarn eslint` all exit 0. `yarn prettier --check` still fails only on `.java` native files (pre-existing parser gap).

## Gitignore Hygiene (IRON-SOLID)

`.gitignore` stays current with the project structure — ignore only recoverable artifacts (build/`dist`/`www`/`node_modules`/logs/caches/IDE), never lose source. Custom rules always present: `*.ignore.*`, `project-record-ignore/`. This is a **PRIVATE** repo -> `.env`/secrets/keystores ARE tracked in git.
Full rule + private/public protocol: `~/.claude/rules/project-config.md`.
Gitignore Last Verified: 2026-06-24

## Task Speed Over Docs (IRON-SOLID — BEHAVIORAL)

Finish the real task fast + correctly FIRST; docs/trackers/sync are a footnote (≤~20% of effort) — never let recording outpace the fix. HARD STOP when doc work outpaces the change → ship, then ONE line if anything. No new summary/status/completion files unless asked; edit/delete over add; delete stale docs. Full rule: `~/.claude/CLAUDE.md`. (Est. 2026-06-19)

## Package Manager Hierarchy: nvm → npm (global) → yarn (local) (IRON-SOLID)

Three tiers, each tool ONLY for its tier — for the best, most reproducible dev results:

- **`nvm`** → install/update Node.js (which bundles `npm`): `nvm install --lts`. Use nvm to get/update `npm` itself.
- **`npm`** → ALL global packages: `npm install -g yarn` (install yarn globally if missing) + `npm install -g <pkg>` (every other global CLI).
- **`yarn`** → ALL local project work: `yarn`, `yarn add <pkg>`, `yarn add -D <pkg>` inside the project.

❌ NEVER use `npm`/`pnpm` for LOCAL installs. NEVER use `pnpm` at all. ✅ Only `yarn.lock` in the project — delete `package-lock.json` and `pnpm-lock.yaml`.

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

- Use `yarn` for all LOCAL work (never `npm`/`pnpm` locally; `npm` is only for global installs per the Package Manager Hierarchy above). Only `yarn.lock` — no `package-lock.json`/`pnpm-lock.yaml`.
- Keep docs aligned with actual package version and verified repo state.
- Do not describe this package as uninitialized or in planning; it is implemented and published.
- Document known build or test issues honestly until fixed.
- When providers, exports, or operational status change, update `Readme.md`, this file, and the portfolio file in the same pass.
- Build: **tsc** (NodeNext module resolution; the orphan Rollup step + deps were removed in 3.2.0). Lint: **ESLint + Prettier**.

## Portfolio Info File — Weekly Update Rule

- Canonical portfolio info file: `/home/ahsan/Documents/ahsan-notebook/static/assets/personal/projects-info-as-portfolio-item/packages/UNIFIED-TRACKING_portfolio-info_<YYYY-MM-DD>.md`
- Update at least once per week (and on any material change). Keep the last-updated date in the filename.
- Keep a max-10-entry update history inside the file. On each refresh: prepend today's row, delete the previous dated file, write the new one.
- Tracker: `/home/ahsan/Documents/01-code/docs/tracking/portfolio-info-files-update-tracker.json`
- Last applied: 2026-06-05
- Note: a now-stale in-repo copy (`UNIFIED-TRACKING_portfolio-info_2026-05-27.md`) predates the move to the canonical ahsan-notebook location; the ahsan-notebook file is authoritative.

## Package Upgrades: Use `npm-check-updates`

For dependency upgrades use `npx -y npm-check-updates -u && yarn install` (latest STABLE), NOT `yarn upgrade --latest`. Full rule in global `~/.claude/CLAUDE.md`. Last applied: 2026-06-05

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

## Source maps — disabled by default — RULE
Never generate source maps for this project unless the owner (aoneahsan) explicitly requests them.
Production / build / published output must ship WITHOUT source maps — no `.map` files and no
`//# sourceMappingURL` in shipped assets.

- **Vite**: `build.sourcemap: false` in `vite.config.*`.
- **Rollup**: `output.sourcemap: false` on every output.
- **Webpack**: production `devtool: false` (dev-only inline maps for local debugging are allowed).
- **tsup**: `sourcemap: false`.
- **tsconfig** (library / `tsc` builds): `"sourceMap": false`, `"inlineSourceMap": false`, `"declarationMap": false`.

Dev-only inline source maps for local debugging are fine; never emit source maps in production / published
output. Do NOT re-enable production source maps or delete these settings. Only the owner, by an explicit
request, may turn production source maps on (e.g. a one-off Sentry upload).


## Sub-agents & Skills — Main-Context-First (IRON-SOLID)
Default/built-in sub-agents (`general-purpose`, `Explore`, `Plan`, `claude`, `fork`, …) do NOT have
access to `/skills`, so delegating to them silently SKIPS the skills RULE #0 requires. Do all
skill-relevant work in the **MAIN context**; use a sub-agent ONLY when a **custom** agent exists in
`.claude/agents/` for that job; a default `Explore`/`Plan` agent is allowed ONLY for read-only,
no-skill search/exploration. When a relevant skill is missing, **install/enable it** rather than
proceeding skill-less. (Owner directive 2026-07-11; full text in `~/.claude/CLAUDE.md`.)

<!-- RULE:main-context-model-workflow v2026-07-16 -->
## Main-Context + Skills + Model Workflow (IRON-SOLID — CRITICAL)
1. **NO default/built-in sub-agents** (`general-purpose`, `Explore`, `Plan`, `claude`, `fork`, …) for ANY work in
   this project — they cannot invoke /skills, which RULE #0 makes mandatory. Do ALL work (planning, implementation,
   review, exploration) in the MAIN context. A sub-agent is allowed ONLY when a CUSTOM agent exists in
   `.claude/agents/` for that exact job.
2. **Skills always:** before any task, scan the available-skills list and invoke EVERY relevant skill; if a needed
   skill is missing, download/enable/install it (or use the nearest installed equivalent and say so) — never
   proceed skill-less.
3. **Model workflow:** PLAN and REVIEW on **Fable 5**; EXECUTE the approved plan on **Opus 4.8**. Plans in
   `~/.claude/plans/`; multi-phase features keep a resumable tracker (`docs/features/<slug>/00-tracker.json`),
   resumed rather than re-planned from zero.

Global records (rules, policy, audit reports) live in the `ahsan-notebook` repo at
`static/assets/claude-code/`; the `~/.claude/…` paths are symlinks into it. Full text: `~/.claude/CLAUDE.md`.
(Owner directives 2026-07-11 / 2026-07-14; fleet-rolled 2026-07-16.)
