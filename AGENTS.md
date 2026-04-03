# AGENTS.md - Unified Tracking

> AI Agent Instructions for Unified Tracking Plugin Development

**Last Updated**: `2026-04-03`

## Project Overview

| Property | Value |
|----------|-------|
| Package Name | `unified-tracking` |
| Version | 3.0.2 |
| License | MIT |
| Repository | Public |
| NPM | https://www.npmjs.com/package/unified-tracking |

Unified analytics and error tracking plugin for React + Capacitor apps with native iOS and Android support.

### Supported Services

Firebase Analytics, Google Analytics, Sentry, Amplitude, Mixpanel, Segment, PostHog, Heap, Matomo, Bugsnag, Rollbar, Datadog, LogRocket, Raygun, AppCenter

### Platforms

Web (browser), iOS (native), Android (native)

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

| Agent | Role |
|-------|------|
| **Claude Code** | Primary implementation. Writes code, runs tests, publishes. |
| **Codex** | Reviews, provides specs. Does NOT implement unless explicitly requested. |

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

| Command | Purpose |
|---------|---------|
| `yarn build` | Clean + tsc + rollup |
| `yarn build:docgen` | Build with API docs |
| `yarn dev` | Watch mode |
| `yarn clean` | Remove dist |
| `yarn lint` | ESLint + Prettier check |
| `yarn fmt` | Auto-fix lint + format |
| `yarn test` | Run Vitest |
| `yarn test:watch` | Watch mode |
| `yarn test:coverage` | Coverage report |
| `yarn type-check` | TypeScript check |

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
import { useTracking } from 'unified-tracking/react';
import { CapacitorTracking } from 'unified-tracking/capacitor';
```

### CLI Tool

```bash
npx unified-tracking-setup
```

## Privacy & Compliance

- GDPR compliant with consent management built in
- Data minimization — only collect what providers are configured to track
- Consent updates toggle providers dynamically via `updateConsent()`

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

## Nested Instruction Files

Domain-specific rules live in nested `CLAUDE.md` + `AGENTS.md` files:

| Location | Scope |
|----------|-------|
| `src/` | Source conventions, imports, path aliases, TypeScript rules |
| `src/core/` | Core engine architecture, event flow, singletons |
| `src/providers/` | Provider architecture, base classes, adding/testing providers |
| `src/react/` | React hooks, context, HOC patterns |
| `docs/` | Documentation structure, update rules, API docs |
| `android/` | Android native build, Kotlin/Java patterns |
| `ios/` | iOS native build, Swift patterns, CocoaPods/SPM |
