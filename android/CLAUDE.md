# android/ - Android Native Platform

**Last Updated**: `2026-05-27`

## Overview

Native Android implementation of the unified-tracking Capacitor plugin using Kotlin/Java.

## Build & Verify

```bash
yarn verify:android   # cd android && ./gradlew clean build test
```

## Structure

```
android/
  src/main/           # Kotlin/Java source code
  build.gradle        # Gradle build configuration
  variables.gradle    # Gradle variables (minSdk, compileSdk, etc.)
  proguard-rules.pro  # ProGuard obfuscation rules
  consumer-rules.pro  # Consumer proguard rules
```

## Rules

- NEVER break cross-platform compatibility with web/iOS
- Keep native API surface aligned with `definitions.ts` interface
- Update `variables.gradle` when changing SDK versions
- Test with `./gradlew clean build test` before any release
- ProGuard rules must preserve plugin entry points

## When to Modify

- Adding a new tracking method to the core API → add native bridge method
- Updating Capacitor version → update `build.gradle` dependencies
- Adding platform-specific features → implement behind capability check

## CLAUDE.md + AGENTS.md Sync Rule

Rules in this file MUST stay in sync with `android/AGENTS.md`. Update both when changing either.


## Sub-agents & Skills — Main-Context-First (IRON-SOLID)
Default/built-in sub-agents (`general-purpose`, `Explore`, `Plan`, `claude`, `fork`, …) do NOT have
access to `/skills`, so delegating to them silently SKIPS the skills RULE #0 requires. Do all
skill-relevant work in the **MAIN context**; use a sub-agent ONLY when a **custom** agent exists in
`.claude/agents/` for that job; a default `Explore`/`Plan` agent is allowed ONLY for read-only,
no-skill search/exploration. When a relevant skill is missing, **install/enable it** rather than
proceeding skill-less. (Owner directive 2026-07-11; full text in `~/.claude/CLAUDE.md`.)
