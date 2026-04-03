# src/core/ - Core Engine

**Last Updated**: `2026-04-03`

## Overview

`UnifiedTrackingCore` is the main engine class implementing the `UnifiedTrackingPlugin` interface. It orchestrates all tracking operations through the provider system.

## Architecture

```
UnifiedTrackingCore (unified-tracking-core.ts)
  ├── ProviderManager   → manages all registered providers
  ├── ConfigManager     → singleton config store
  ├── EventQueue        → buffers events before providers are ready
  └── Logger            → unified logging
```

## Key Behaviors

- **Initialization**: `initialize(config)` loads config, initializes ProviderManager, flushes queued events
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
