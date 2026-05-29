# Round 04 — Native iOS/Android SDK Bridges (IN PROGRESS, UNVERIFIED)

**Started:** 2026-05-27
**Trigger:** User chose "implement native bridges now anyway" (the one item deferred through Rounds 01–03).
**Status:** In progress, **multi-session**, and **NOT build-verified in this environment** (no Xcode/CocoaPods/SPM, no Android SDK/Gradle, no devices/simulators). All native code written this round is to-be-built-and-verified by the user. It is committed on the branch but **NOT published to npm** until verified — npm `latest` stays at `3.3.0` (which contains the prior native stubs).

> ⚠️ **Honesty contract.** Every native source file touched this round carries `// NOTE(unverified): build with <Xcode|Android Studio> — confirm <API>` markers wherever an exact SDK signature wasn't certain. Do not assume any of this compiles until built.

## Architecture (how native delivery works)

`unified-tracking` is web-first. Two delivery paths exist:

1. **Web / JS core** (`getUnifiedTracking()` → `UnifiedTrackingCore`) — used by the main `UnifiedTracking` export and the React hooks. Runs in the browser **and inside the Capacitor WebView**, loading vendor web SDKs. This is what works today (3.3.0).
2. **Native Capacitor plugin** (`@CapacitorPlugin` classes in `ios/` + `android/`, reachable via `registerCapacitorPlugin()`) — routes calls to the native vendor SDKs on device. This is what Round 04 implements.

The native plugin entry (`UnifiedTrackingPlugin.swift` / `.java`) is already fully wired (all `@objc`/`@PluginMethod` methods → a `ProviderManager` → provider classes). Round 04 fills in the **`ProviderManager` fan-out + each provider's real SDK calls**.

### Known reconciliation item (config shape)

The native plugin currently parses `config.providers.analytics.<provider>.{ enabled, ... }`, but the JS `UnifiedTrackingConfig` is `{ analytics: { providers: [...], <provider>: {...} }, errorTracking: {...} }`. Before native is usable end-to-end, either (a) the JS Capacitor adapter must transform the config into the shape the native plugin expects, or (b) the native plugin must parse the real JS shape. **Tracked as a Round-04 task.** (Batch 1 focuses on the provider SDK calls; the config bridge is a follow-up task before any native release.)

## Provider roadmap (native)

Native scaffolding exists for **9 of the 16** providers (5 analytics + 4 error) on each platform. Plan:

| Batch  | Providers                                                    | Native SDK (iOS / Android)                                                                                                                                                     | Status                    |
| ------ | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------- | ------- |
| **B1** | Firebase Analytics                                           | FirebaseAnalytics (firebase-ios-sdk / firebase-analytics)                                                                                                                      | **this session**          |
| **B1** | Sentry                                                       | sentry-cocoa / sentry-android                                                                                                                                                  | **this session**          |
| B2     | Mixpanel                                                     | mixpanel-swift / mixpanel-android                                                                                                                                              | pending                   |
| B2     | Amplitude                                                    | Amplitude-iOS / Amplitude-Android                                                                                                                                              | pending                   |
| B2     | Segment                                                      | analytics-ios                                                                                                                                                                  | swift / analytics-android | pending |
| B3     | Bugsnag                                                      | bugsnag-cocoa / bugsnag-android                                                                                                                                                | pending                   |
| B3     | Rollbar                                                      | rollbar-ios / rollbar-android                                                                                                                                                  | pending                   |
| —      | Google Analytics                                             | **No standalone native GA4 SDK** — GA4 on device IS Firebase Analytics. Document `googleAnalytics` native as an alias of Firebase, or web-only.                                | decision                  |
| —      | Firebase Crashlytics                                         | The `@capacitor-firebase/crashlytics` wrapper is **BANNED** (workspace rule). Keep native Crashlytics a documented stub; recommend Sentry.                                     | stub (intentional)        |
| —      | PostHog, Heap, Matomo, DataDog, LogRocket, Raygun, AppCenter | **Not scaffolded natively** (only the 9 above have native stub classes). Future: add native classes only where a maintained native SDK exists; otherwise document as web-only. | future                    |

## Build / verify steps (the user runs these — I cannot here)

**iOS:**

```bash
cd ios && pod install            # or SPM resolve in Xcode
xcodebuild -scheme UnifiedTracking -destination 'generic/platform=iOS'   # or open the consumer app in Xcode
```

Host app must include `GoogleService-Info.plist` (Firebase) + the relevant DSNs/keys passed via plugin config.

**Android:**

```bash
cd android && ./gradlew clean build
```

Host app must include `google-services.json` + the Google Services Gradle plugin (Firebase).

**End-to-end:** build a Capacitor example app, `registerCapacitorPlugin()`, call `initialize()` + `track()` on a device, confirm events arrive in each vendor dashboard.

## Constraints honored

- **Banned packages:** no `@capacitor-firebase/crashlytics` / `@capacitor-firebase/performance`. Crashlytics native stays a stub.
- **Zero-cost:** all native SDKs are free-tier client SDKs.
- **No hardcoded secrets:** DSNs/keys come from the runtime plugin config, never hardcoded.
- **Don't ship unverified to npm:** native changes stay on-branch until built+verified; `3.3.0` remains the published version.

## Resume contract

Single resume point: `00-tracker.json` (Round 04 = phase12+). On resume: read the tracker, find the first pending native batch, continue. Do NOT publish a native-containing version to npm until the user confirms a successful native build.
