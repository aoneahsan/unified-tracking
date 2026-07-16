# AGENTS.md - Unified Tracking

> AI Agent Instructions for Unified Tracking Plugin Development

**Last Updated**: `2026-06-24`

## Production Finalization / Gap Pass (2026-06-24)

- **Gap audit:** feature-complete at the web/JS layer (16 providers, full core engine, React hooks, Capacitor bridge) — **zero code stubs/TODOs**. Only honest deferral: native iOS/Android SDK bridges (on-branch, unverified — TRUE toolchain/device blocker).
- **Built this pass:** the missing **public docs website** — separate PUBLIC repo `unified-tracking-docs` (Docusaurus 3, modeled on `native-update-docs`): every real API documented from `src/`, full SEO floor (AI-bot robots allowlist, sitemap, llms.txt, JSON-LD), dual-hosting (Firebase + GitHub Pages) config.
- **Trackers:** `docs/project-finalization/00-tracker.json`. Owner-only work in **`docs/MANUAL-TASKS.md`** (native build-verify, npm publish, docs deploy + DNS, search-engine submission).
- **Verify gates (green 2026-06-24):** `yarn type-check`, `yarn build`, `yarn eslint` exit 0; `yarn prettier --check` fails only on `.java` native files (pre-existing parser gap).

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

## Project Overview

| Property     | Value                                          |
| ------------ | ---------------------------------------------- |
| Package Name | `unified-tracking`                             |
| Version      | 3.3.0                                          |
| License      | MIT                                            |
| Repository   | Public                                         |
| NPM          | https://www.npmjs.com/package/unified-tracking |

Unified analytics and error tracking plugin for React + Capacitor apps. Tracking runs through the web/JS layer (including inside the Capacitor WebView); native iOS/Android SDK bridges are scaffolded but not yet implemented (see "Native Providers").

### Supported Services

Firebase Analytics, Google Analytics, Sentry, Amplitude, Mixpanel, Segment, PostHog, Heap, Matomo, Bugsnag, Rollbar, Datadog, LogRocket, Raygun, AppCenter

### Platforms

Web (browser) + Capacitor WebView (iOS/Android). Native-SDK delivery: planned, not yet implemented.

## CLAUDE.md + AGENTS.md Sync Rule (IRON-SOLID)

**Every important rule MUST exist in BOTH `CLAUDE.md` AND `AGENTS.md` at each level.**

- When adding or updating a rule in one file, ALWAYS update the other
- This applies to root and ALL nested files in every folder
- Never add a rule to just one file — always both

## CLAUDE.md + AGENTS.md Update Frequency (IRON-SOLID)

**ALL `CLAUDE.md` and `AGENTS.md` files MUST be reviewed and updated at least once every 3 days.**

- On every session start, check `Last Updated` dates across all project files
- If any file is >3 days stale, update it BEFORE proceeding with other work
- Every file must have a `Last Updated` date field

## Claude Code Agents (MANDATORY - IRON-SOLID)

**For EVERY prompt and task, Claude Code MUST use agents (Task tool) to deliver the best possible experience.**

- Use **Explore agent** for codebase search, file discovery, understanding architecture
- Use **Plan agent** for implementation planning, architecture decisions
- Use **general-purpose agent** for complex multi-step tasks, parallel processing
- Launch multiple agents in parallel when tasks are independent

## Agent Responsibilities

| Agent           | Role                                                                     |
| --------------- | ------------------------------------------------------------------------ |
| **Claude Code** | Primary implementation. Writes code, runs tests, publishes.              |
| **Codex**       | Reviews, provides specs. Does NOT implement unless explicitly requested. |

## Setup Instructions

### Prerequisites

- Node.js >= 24.13.0
- Yarn (only package manager — no npm/pnpm for local work)
- Xcode (iOS)
- Android Studio (Android)
- CocoaPods (iOS)

### Installation

```bash
yarn install
```

## Build & Test Commands

| Command             | Purpose                 |
| ------------------- | ----------------------- |
| `yarn build`        | Clean + tsc (NodeNext)  |
| `yarn build:docgen` | Build with API docs     |
| `yarn dev`          | Watch mode              |
| `yarn clean`        | Remove dist             |
| `yarn lint`         | ESLint + Prettier check |
| `yarn fmt`          | Auto-fix lint + format  |
| `yarn type-check`   | TypeScript check        |

### Platform Verification

```bash
yarn verify:ios      # Build iOS plugin
yarn verify:android  # Build Android plugin
yarn verify:web      # Build web bundle
yarn verify          # All platforms
```

### Publishing

```bash
yarn release      # Build + lint + publish
yarn release:dry  # Dry run
```

## Project-Specific Rules

### Critical DOs

1. Verify all platforms build before release
2. Maintain privacy compliance (GDPR, consent management)
3. Update docs when adding providers
4. Use `yarn` for all LOCAL installs (NEVER `npm`/`pnpm` locally; `npm` only for global installs per the Package Manager Hierarchy)

### Critical DON'Ts

1. NEVER break cross-platform compatibility
2. NEVER expose user data insecurely
3. NEVER break existing adapter interfaces

## Module Exports

```typescript
import { UnifiedTracking } from 'unified-tracking';
import { useUnifiedTracking, useTrackEvent } from 'unified-tracking/react';
import { registerCapacitorPlugin } from 'unified-tracking/capacitor';
```

### CLI Tool

```bash
npx unified-tracking-setup
```

## Privacy & Compliance

- Consent gate at dispatch — analytics/error events are dropped when the matching consent category is denied. `marketing`/`personalization` default to `false` (opt-in) as of 3.1.0.
- Data minimization — `settings.privacy.excludedProperties` keys are stripped from every event/trait/context before providers receive them (enforced as of 3.1.0).
- Secrets are redacted from logs; provider keys/DSNs never reach the console.

## Native Providers (Record — updated 2026-05-29)

- Web/JS layer: delivers tracking for all 16 providers (incl. inside the Capacitor WebView). This is the shipped `3.3.0` path.
- **Native SDK bridges: ON-BRANCH, UNVERIFIED, NOT YET PUBLISHED.** Per the user's 2026-05-27 "implement native now" decision, native vendor-SDK bridges are now in the repo behind `@CapacitorPlugin` (via `registerCapacitorPlugin()`):
  - **B1** (2026-05-27): Firebase Analytics + Sentry + `ProviderManager` fan-out on iOS + Android.
  - **B2** (2026-05-29): Mixpanel + Amplitude + Segment on both platforms.
  - **B3** (2026-05-29): Bugsnag + Rollbar on both platforms.
  - **JS↔native config-shape reconciliation** (2026-05-29): plugin entries now parse the real JS shape (`analytics:{providers:[ids], <id>:{...}}` etc.); `"google"` routes through Firebase on native; web-only providers log a skip warning.
  - **All unverified here** (no Xcode/Gradle/devices). Every touched native file has `// NOTE(unverified)` markers (~100 total across both platforms). User build-verifies in Xcode + Android Studio.
  - **Repo .gitignore fix (2026-05-29):** previously blanket-ignored `ios/+android/+electron/` (Capacitor-app convention, wrong for a plugin); now ignores build artifacts only. 35 native files newly tracked in git.
- Crashlytics native stays an intentional **stub** (`@capacitor-firebase/crashlytics` wrapper is BANNED; use Sentry).
- Spec: `docs/features/polish-audit-release/round04-native-overview.md`.
- Do NOT publish a native-containing version to npm until a successful native build is confirmed; `npm latest` stays `3.3.0` until then.

## Pre-Publish Testing Requirements

Before publishing, ALL must pass:

```bash
yarn build        # Must pass
yarn type-check   # Must pass
yarn eslint       # Must pass (TS/JS code style)
yarn verify       # All platforms must build
```

> **Automated test suite removed 2026-06-03** (commit `4bddbd6`, per the global testing-removal policy). No Vitest/Jest suite remains; verify via `yarn type-check` + `yarn build` + `yarn eslint`. Do NOT re-add test packages. Note: `yarn lint` runs `yarn prettier --check`, which fails on the 13 `.java` native files (pre-existing `prettier-plugin-java` parser-inference gap, not a code-quality issue) — `yarn eslint` is the meaningful TS/JS gate.

## Example App

```bash
yarn example:install  # Install example deps
yarn example:dev      # Run example app
yarn example:build    # Build example app
```

## Portfolio Info File — Weekly Update Rule

- Canonical portfolio info file: `/home/ahsan/Documents/ahsan-notebook/static/assets/personal/projects-info-as-portfolio-item/packages/UNIFIED-TRACKING_portfolio-info_<YYYY-MM-DD>.md`
- Update at least once per week (and on any material change). Keep the last-updated date in the filename.
- Keep a max-10-entry update history inside the file. On each refresh: prepend today's row, delete the previous dated file, write the new one.
- Tracker: `/home/ahsan/Documents/01-code/docs/tracking/portfolio-info-files-update-tracker.json`
- Last applied: 2026-06-05
- Note: an in-repo copy (`UNIFIED-TRACKING_portfolio-info_2026-05-27.md`) is now stale; the ahsan-notebook file is authoritative.

## Package Upgrades: Use `npm-check-updates`

For dependency upgrades use `npx -y npm-check-updates -u && yarn install` (latest STABLE), NOT `yarn upgrade --latest`. Full rule in global `~/.claude/CLAUDE.md`. Last applied: 2026-06-05

## Nested Instruction Files

Domain-specific rules live in nested `CLAUDE.md` + `AGENTS.md` files:

| Location         | Scope                                                                              |
| ---------------- | ---------------------------------------------------------------------------------- |
| `src/`           | Source conventions, imports, path aliases, TypeScript rules                        |
| `src/core/`      | Core engine architecture, event flow, singletons                                   |
| `src/providers/` | Provider architecture, base classes, adding/testing providers                      |
| `src/react/`     | Provider-free React hooks (`useUnifiedTracking`, `useTrackEvent`) — no context/HOC |
| `docs/`          | Documentation structure, update rules, API docs                                    |
| `android/`       | Android native build, Kotlin/Java patterns                                         |
| `ios/`           | iOS native build, Swift patterns, CocoaPods/SPM                                    |

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
