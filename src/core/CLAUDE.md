# src/core/ - Core Engine

**Last Updated**: `2026-05-26`

## Overview

`UnifiedTrackingCore` is the main engine class implementing the `UnifiedTrackingPlugin` interface. It orchestrates all tracking operations through the provider system.

## Architecture

```
UnifiedTrackingCore (unified-tracking-core.ts)
  ├── ProviderManager   → manages providers; consent gate + privacy stripping at dispatch
  ├── ConfigManager     → singleton config + consent state
  ├── EventQueue        → standalone buffering utility (exported; NOT auto-started by core)
  └── Logger            → centralized logging (default level: warn)
```

## Key Behaviors

- **Initialization**: `initialize(config)` loads config and initializes ProviderManager; provider load/init failures are collected into `InitializeResult.warnings` (not thrown)
- **Event routing**: `track()`, `logError()`, etc. delegate to ProviderManager which fans out to all active providers of the correct type
- **Consent**: `updateConsent()` toggles provider activation based on user consent settings
- **Event listeners**: Supports `addListener()` / `removeAllListeners()` for tracking events and provider status changes
- **Guard checks**: All public methods check `initialized` state before proceeding

## Event Types

- `TrackingEvent` — standard event with name + properties
- `ProviderEvent` — error or status change from a provider

## Rules

- UnifiedTrackingCore is the ONLY public entry point for the main `unified-tracking` import
- All state management flows through singletons (ConfigManager, Logger, EventQueue)
- Never add direct provider logic here — all provider work goes through ProviderManager
- Keep this class focused on orchestration and public API surface

## CLAUDE.md + AGENTS.md Sync Rule

Rules in this file MUST stay in sync with `src/core/AGENTS.md`. Update both when changing either.
