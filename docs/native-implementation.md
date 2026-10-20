# Native Implementation Status

> **Current status:** `unified-tracking` is **web-first**. Tracking is verified through the web/JS layer in browsers and inside the Capacitor WebView. Package `3.3.2` includes Swift and Android source, but native SDK delivery is unverified and unsupported until both platform builds and device checks pass.

## What exists today

| Layer                                        | Status                                                                                                                                                                                        |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Web / JS layer (browser + Capacitor WebView) | ✅ Implemented — the supported delivery path for every provider                                                                                                                               |
| `ios/` Swift provider classes                | ⚠️ Stubs — `print(...) + // TODO`; no native analytics/error SDKs are imported or called                                                                                                      |
| `android/` Kotlin/Java provider classes      | ⚠️ Mostly stubs — only `FirebaseAnalyticsProvider` references a real SDK; the rest log and return                                                                                             |
| Capacitor plugin registration                | ⚠️ `registerCapacitorPlugin()` registers only the **web** implementation — there is no `ios`/`android` bridge, so even the partial native code is not reachable through the documented JS API |

Because the native bridges are not registered, **calling the JS API always uses the web implementation** (which is the intended, working path inside the WebView).

## What this means for you

- Using `unified-tracking` in a Capacitor app **works** — the web layer runs in the WebView and forwards to each provider's web SDK.
- You do **not** get native-SDK delivery (e.g. native crash symbolication via the iOS/Android Sentry/Crashlytics SDKs) from this package yet.
- For native crash reporting today, integrate the vendor's native SDK directly alongside this package, or use a web error provider (sentry/bugsnag/rollbar/datadog/logrocket/raygun) which works in the WebView.

## Firebase Crashlytics

Crashlytics has **no web/JS SDK** (it is iOS/Android-only), and the native bridge is not wired, so the `crashlytics` error provider cannot deliver crashes through this package on any platform yet. It fails fast with a clear message. Use a web error provider for now.

## Roadmap

Native SDK bridges (registering `ios`/`android` implementations and wiring each provider to its native SDK) are a planned, separate effort. This document will be updated when native delivery is actually implemented — per the project rule, we never document unimplemented features as available.

## See also

- [`README.md`](../README.md) — provider matrix and the web delivery model.
- [`ios-static-framework-fix.md`](./ios-static-framework-fix.md) — iOS build note for the plugin scaffolding.
