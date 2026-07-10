# ios/ - iOS Native Platform

**Last Updated**: `2026-05-27`

## Overview

Native iOS implementation of the unified-tracking Capacitor plugin using Swift.

## Build & Verify

```bash
yarn verify:ios   # cd ios && pod install && xcodebuild
```

## Structure

```
ios/
  Sources/           # Swift source code
  Tests/             # iOS unit tests
```

## Related Root Files

- `Package.swift` — Swift Package Manager definition
- `UnifiedTracking.podspec` — CocoaPods podspec
- `ios-podfile-fix.rb` — Utility script for iOS pod issues

## Rules

- NEVER break cross-platform compatibility with web/Android
- Keep native API surface aligned with `definitions.ts` interface
- Supports both CocoaPods and Swift Package Manager distribution
- Test with `xcodebuild` before any release
- Requires Xcode and CocoaPods installed

## When to Modify

- Adding a new tracking method to the core API → add native bridge method
- Updating Capacitor version → update podspec dependencies
- Adding platform-specific features → implement behind capability check

## CLAUDE.md + AGENTS.md Sync Rule

Rules in this file MUST stay in sync with `ios/AGENTS.md`. Update both when changing either.


## Sub-agents & Skills — Main-Context-First (IRON-SOLID)
Default/built-in sub-agents (`general-purpose`, `Explore`, `Plan`, `claude`, `fork`, …) do NOT have
access to `/skills`, so delegating to them silently SKIPS the skills RULE #0 requires. Do all
skill-relevant work in the **MAIN context**; use a sub-agent ONLY when a **custom** agent exists in
`.claude/agents/` for that job; a default `Explore`/`Plan` agent is allowed ONLY for read-only,
no-skill search/exploration. When a relevant skill is missing, **install/enable it** rather than
proceeding skill-less. (Owner directive 2026-07-11; full text in `~/.claude/CLAUDE.md`.)
