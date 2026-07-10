# src/core/ - Core Engine Agent Instructions

**Last Updated**: `2026-05-26`

## Overview

`UnifiedTrackingCore` is the main engine implementing `UnifiedTrackingPlugin`. Orchestrates all tracking through the provider system.

## Architecture

```
UnifiedTrackingCore
  ├── ProviderManager   → manages providers; consent gate + privacy stripping at dispatch
  ├── ConfigManager     → singleton config + consent state
  ├── EventQueue        → standalone buffering utility (exported; NOT auto-started by core)
  └── Logger            → centralized logging (default level: warn)
```

## Key Behaviors

- `initialize(config)` → loads config, inits ProviderManager; collects failed providers into `InitializeResult.warnings`
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


## Sub-agents & Skills — Main-Context-First (IRON-SOLID)
Default/built-in sub-agents (`general-purpose`, `Explore`, `Plan`, `claude`, `fork`, …) do NOT have
access to `/skills`, so delegating to them silently SKIPS the skills RULE #0 requires. Do all
skill-relevant work in the **MAIN context**; use a sub-agent ONLY when a **custom** agent exists in
`.claude/agents/` for that job; a default `Explore`/`Plan` agent is allowed ONLY for read-only,
no-skill search/exploration. When a relevant skill is missing, **install/enable it** rather than
proceeding skill-less. (Owner directive 2026-07-11; full text in `~/.claude/CLAUDE.md`.)
