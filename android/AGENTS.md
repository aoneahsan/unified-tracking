# android/ - Android Native Agent Instructions

**Last Updated**: `2026-05-27`

## Build & Verify

```bash
yarn verify:android   # ./gradlew clean build test
```

## Structure

```
src/main/           # Kotlin/Java source
build.gradle        # Gradle config
variables.gradle    # SDK versions
proguard-rules.pro  # Obfuscation rules
```

## Rules

- NEVER break cross-platform compatibility
- Keep native API aligned with `definitions.ts`
- Test with `./gradlew clean build test` before release
- ProGuard must preserve plugin entry points

## When to Modify

- New core API method → add native bridge method
- Capacitor version update → update `build.gradle`
- Platform-specific features → behind capability check

## CLAUDE.md + AGENTS.md Sync Rule

Rules in this file MUST stay in sync with `android/CLAUDE.md`. Update both when changing either.
