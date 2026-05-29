# AGENTS.md - Unified Tracking

> AI Agent Instructions for Unified Tracking Plugin Development

**Last Updated**: `2026-05-29`

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

| Command              | Purpose                 |
| -------------------- | ----------------------- |
| `yarn build`         | Clean + tsc (NodeNext)  |
| `yarn build:docgen`  | Build with API docs     |
| `yarn dev`           | Watch mode              |
| `yarn clean`         | Remove dist             |
| `yarn lint`          | ESLint + Prettier check |
| `yarn fmt`           | Auto-fix lint + format  |
| `yarn test`          | Run Vitest              |
| `yarn test:watch`    | Watch mode              |
| `yarn test:coverage` | Coverage report         |
| `yarn type-check`    | TypeScript check        |

### Platform Verification

```bash
yarn verify:ios      # Build iOS plugin
yarn verify:android  # Build Android plugin
yarn verify:web      # Build web bundle
yarn verify          # All platforms
```

### Publishing

```bash
yarn release      # Build + test + lint + publish
yarn release:dry  # Dry run
```

## Project-Specific Rules

### Critical DOs

1. Test all platforms before release
2. Maintain privacy compliance (GDPR, consent management)
3. Update docs when adding providers
4. Use Vitest for testing (NEVER Jest)
5. Use yarn exclusively (NEVER npm/pnpm)

### Critical DON'Ts

1. NEVER break cross-platform compatibility
2. NEVER expose user data insecurely
3. NEVER break existing adapter interfaces
4. NEVER use Jest — Vitest only

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
yarn test         # Must pass
yarn lint         # Must pass
yarn type-check   # Must pass
yarn verify       # All platforms must build
```

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
- Last applied: 2026-05-29
- Note: an in-repo copy (`UNIFIED-TRACKING_portfolio-info_2026-05-27.md`) is now stale; the ahsan-notebook file is authoritative.

## Package Upgrades: Use `npm-check-updates`

For dependency upgrades use `npx -y npm-check-updates -u && yarn install` (latest STABLE), NOT `yarn upgrade --latest`. Full rule in global `~/.claude/CLAUDE.md`. Last applied: 2026-05-29

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
