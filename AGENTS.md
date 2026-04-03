# AGENTS.md - Unified Tracking

> AI Agent Instructions for Unified Tracking Plugin Development

## Project Overview

Unified analytics and error tracking plugin for React + Capacitor apps with native iOS and Android support.

| Property     | Value              |
| ------------ | ------------------ |
| Package Name | `unified-tracking` |
| Version      | 3.0.2              |
| License      | MIT                |
| Repository   | Public             |

### Supported Services

Firebase Analytics, Google Analytics, Sentry, Amplitude, Mixpanel, Segment, PostHog, Heap, Matomo, Bugsnag, Rollbar, Datadog, LogRocket, Raygun, AppCenter

### Platforms

- Web (browser)
- iOS (native)
- Android (native)

## Agent Responsibilities

| Agent           | Role                                                                     |
| --------------- | ------------------------------------------------------------------------ |
| **Claude Code** | Primary implementation. Writes code, runs tests, publishes.              |
| **Codex**       | Reviews, provides specs. Does NOT implement unless explicitly requested. |

## Setup Instructions

### Prerequisites

- Node.js >= 24.13.0
- Yarn
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
| `yarn build`         | Clean + tsc + rollup    |
| `yarn build:docgen`  | Build with API docs     |
| `yarn dev`           | Watch mode              |
| `yarn clean`         | Remove dist             |
| `yarn lint`          | ESLint + Prettier check |
| `yarn fmt`           | Auto-fix lint + format  |
| `yarn test`          | Run Vitest              |
| `yarn test:watch`    | Watch mode              |
| `yarn test:coverage` | Coverage report         |
| `yarn test:ui`       | Vitest UI               |
| `yarn type-check`    | TypeScript check        |

### Platform Verification

```bash
yarn verify:ios      # Build iOS plugin
yarn verify:android  # Build Android plugin
yarn verify:web      # Build web bundle
yarn verify          # All platforms
```

### Example App

```bash
yarn example:install  # Install example deps
yarn example:dev      # Run example
yarn example:build    # Build example
```

## Code Style & Conventions

### Module Exports

```typescript
// Main
import { UnifiedTracking } from 'unified-tracking';

// React hooks
import { useTracking } from 'unified-tracking/react';

// Capacitor adapter
import { CapacitorTracking } from 'unified-tracking/capacitor';
```

### CLI Tool

```bash
npx unified-tracking-setup
```

## Project-Specific Rules

### DO NOTs

1. **NEVER** break cross-platform compatibility
2. **NEVER** expose user data insecurely
3. **NEVER** break existing adapter interfaces

### DOs

1. **DO** test all platforms before release
2. **DO** maintain privacy compliance
3. **DO** update docs when adding providers

## Native Platforms

### iOS

- Swift implementation
- Requires CocoaPods
- Build: `yarn verify:ios`

### Android

- Kotlin/Java implementation
- Gradle build
- Build: `yarn verify:android`

## Privacy & Compliance

- GDPR compliant
- Consent management
- Data minimization

## Testing Requirements

Before publishing:

```bash
yarn build        # Must pass
yarn test         # Must pass
yarn lint         # Must pass
yarn verify       # All platforms must build
```

## Publishing

```bash
yarn release      # Build + test + lint + publish
yarn release:dry  # Dry run
```
