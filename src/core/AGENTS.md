# src/core/ - Core Engine Agent Instructions

**Last Updated**: `2026-04-03`

## Overview

`UnifiedTrackingCore` is the main engine implementing `UnifiedTrackingPlugin`. Orchestrates all tracking through the provider system.

## Architecture

```
UnifiedTrackingCore
  ├── ProviderManager   → manages providers
  ├── ConfigManager     → singleton config
  ├── EventQueue        → buffers pre-init events
  └── Logger            → unified logging
```

## Key Behaviors

- `initialize(config)` → loads config, inits ProviderManager, flushes queue
- `track()`, `logError()` → delegate to ProviderManager
- `updateConsent()` → toggles providers based on consent
- `addListener()` → subscribe to tracking/provider events
- All public methods guard on `initialized` state

## Rules

- UnifiedTrackingCore is the ONLY public entry point for main import
- All state via singletons (ConfigManager, Logger, EventQueue)
- Never add provider logic here — goes through ProviderManager
- Keep focused on orchestration and public API

## CLAUDE.md + AGENTS.md Sync Rule

Rules in this file MUST stay in sync with `src/core/CLAUDE.md`. Update both when changing either.
