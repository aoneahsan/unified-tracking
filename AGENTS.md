# AGENTS.md - Unified Tracking

> AI Agent Instructions for Unified Tracking Plugin Development

**Last Updated**: `2026-08-06`

## Production Finalization / Gap Pass (2026-06-24)

- **Gap audit:** feature-complete at the web/JS layer (16 providers, full core engine, React hooks, Capacitor bridge) — **zero code stubs/TODOs**. Only honest deferral: native iOS/Android SDK bridges (on-branch, unverified — TRUE toolchain/device blocker).
- **Built this pass:** the missing **public docs website** — separate PUBLIC repo `unified-tracking-docs` (Docusaurus 3, modeled on `native-update-docs`): every real API documented from `src/`, full SEO floor (AI-bot robots allowlist, sitemap, llms.txt, JSON-LD), dual-hosting (Firebase + GitHub Pages) config.
- **Trackers:** `docs/project-finalization/00-tracker.json`. Owner-only work in **`docs/MANUAL-TASKS.md`** (native build-verify, npm publish, docs deploy + DNS, search-engine submission).
- **Verify gates (green 2026-06-24):** `yarn type-check`, `yarn build`, `yarn eslint` exit 0; `yarn prettier --check` fails only on `.java` native files (pre-existing parser gap).

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

<!-- RULE:main-context-model-workflow v2026-07-16 -->
