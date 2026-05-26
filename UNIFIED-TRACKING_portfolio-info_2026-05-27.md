# Unified Tracking Portfolio Info

Reference Date: 2026-05-27
Project Type: Open-source unified analytics and error tracking package
Project Slug: unified-tracking
Primary Email Reference: aoneahsan@gmail.com
Current Version Reviewed: 3.3.0
Last Portfolio Update: 2026-05-27
Next Eligible Update After: 2026-06-03

npm: https://www.npmjs.com/package/unified-tracking
Author: Ahsan Mahmood (aoneahsan@gmail.com)
GitHub: github.com/aoneahsan/unified-tracking

## Update History

| Date       | Type      | Notes                                                                                                                                                                                                                               |
| ---------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-05-27 | Refreshed | Completed deferred polish: Firebase/Amplitude now extend BaseAnalyticsProvider, unified flush(), typed event listeners, base-class type tightening, provider SSR guards, and a corrected setup-CLI config shape.                    |
| 2026-03-25 | Refreshed | Root portfolio file refreshed after provider-manager and web-entry remediation, `yarn install` / `yarn type-check` / `yarn test` / `yarn build` verified, and the default build was simplified to remove the failing `docgen` step. |
| 2026-03-24 | Created   | Root portfolio file created from repository state during portfolio sweep.                                                                                                                                                           |

## One-Line Summary

Unified Tracking is a TypeScript telemetry package that gives web and Capacitor apps one API for analytics, user identification, revenue tracking, consent handling, and error monitoring across many providers.

## Elevator Pitch

Unified Tracking turns fragmented instrumentation work into a single, reusable layer. Instead of wiring analytics and error-monitoring vendors one by one across a web codebase, teams adopt one package that manages provider initialization, event tracking, user identity, screen views, revenue logging, consent gating, and error capture from a consistent API surface. It runs in browsers and inside the Capacitor WebView on iOS/Android.

## What This Project Is About

Unified Tracking is built as a provider-based telemetry layer. It abstracts 8 analytics providers and 8 error-tracking providers behind one core API, adds provider-free React hooks, and ships consent and privacy controls plus pre-init event buffering. The package is delivered by its web/JS layer, which means it works in any browser and inside the Capacitor WebView — so Capacitor apps are supported through the web runtime today, with native iOS/Android SDK bridges planned for the future.

## Providers

### Analytics (8)

- Google Analytics
- Firebase
- Amplitude
- Mixpanel
- Segment
- PostHog
- Heap
- Matomo

### Error tracking (8)

- Sentry
- Bugsnag
- Rollbar
- LogRocket
- Raygun
- DataDog
- AppCenter
- Firebase Crashlytics

## Vision

Provide a practical telemetry layer that lets teams instrument products faster without locking into a single analytics or error-reporting vendor.

## Mission

- Simplify analytics and error-tracking implementation on the web and in Capacitor apps
- Reduce duplicate instrumentation work across projects
- Provide a scalable provider architecture for many vendors
- Support privacy-aware telemetry through consent and data-minimization controls
- Improve developer experience for the React and Capacitor ecosystems

## Core Value Proposition

- One package for analytics and error tracking
- One API across web, React, and the Capacitor WebView
- Provider-based design for vendor flexibility (8 analytics + 8 error providers)
- Provider-free React hooks — no context provider or HOC required
- Consent gating and property exclusion built into the dispatch path

## Best Features

- Unified event tracking, user identification, revenue logging, and screen tracking API
- Unified error logging API across multiple crash/error vendors
- 8 analytics providers and 8 error-tracking providers behind one interface
- Provider-free React hooks: `useUnifiedTracking`, `useTrackEvent`
- Consent gate at dispatch — events are dropped when the matching consent category is denied
- Privacy controls — configured excluded properties are stripped before providers receive data
- Pre-init event buffering — events recorded before initialization are flushed once providers are ready
- Setup helper CLI for faster onboarding
- TypeScript-first developer experience with typed event listeners

## Technical Strengths

- Provider-based architecture that scales across vendors via shared base classes
- Web-runtime delivery that also covers Capacitor iOS/Android via the WebView
- React integration without forcing a rigid app structure (hooks only, no provider wrapper)
- Strong TypeScript design with tightened public types and base-class generics
- Clean separation of core tracking logic, provider implementations, and framework-specific integration
- Latest pass: Firebase and Amplitude analytics providers now extend `BaseAnalyticsProvider`, a unified `flush()` was added, event listeners are typed, base-class types were tightened, providers gained SSR guards, and the setup-CLI emits a corrected config shape

## Business and Product Strengths

- Reduces time needed to instrument apps
- Helps teams avoid analytics/error-vendor lock-in
- Speeds up analytics and observability rollout in new projects
- Supports web and Capacitor product surfaces from one package
- Provides a reusable telemetry foundation for data-driven product teams

## Benefits for Users and Teams

- Faster tracking integration
- Cleaner instrumentation APIs in app code
- Easier experimentation with different providers
- Shared implementation approach across web and Capacitor apps
- Better maintainability than many ad hoc SDK integrations
- A consent-aware path to product telemetry

## Honest Status and Constraints (Mandatory)

- **Web-first delivery.** All tracking currently runs via the web/JS layer. This includes execution inside the Capacitor WebView, so Capacitor apps are supported through the web runtime.
- **Native bridges not wired.** The iOS (Swift) and Android (Kotlin) provider classes are scaffolding/stubs and are NOT yet wired to native vendor SDKs. Do not describe full native-SDK delivery as available.
- **Runtime CDN SDK loading.** Providers load their vendor SDK from a CDN at runtime. This requires the host app to allowlist the relevant origins in its Content-Security-Policy `script-src`. Because of remote-script loading, the package is NOT compatible with Manifest V3 browser extensions.
- **Firebase Crashlytics is web-unsupported.** The Firebase Crashlytics error provider does not function on the web layer.
- **Downstream configuration still required.** Real provider behavior depends on valid vendor credentials/DSNs, consent configuration, and app-specific deployment setup. End-to-end validation in the consuming app still matters beyond package-level checks.

## Resume / CV / Portfolio Use

Use this project to highlight:

- telemetry platform engineering
- analytics infrastructure
- error-monitoring integration
- cross-platform TypeScript package development
- React and Capacitor ecosystem support
- provider-based architecture design

## Strong Resume Bullet Ideas

- Built `unified-tracking`, a TypeScript package that unifies analytics and error-monitoring for web and Capacitor apps through one extensible API spanning 8 analytics and 8 error-tracking providers.
- Designed a provider-driven architecture with shared base classes, consent gating, property-level privacy controls, and pre-init event buffering.
- Shipped provider-free React hooks (`useUnifiedTracking`, `useTrackEvent`) so apps can instrument without a context provider or HOC.
- Refactored Firebase and Amplitude analytics providers onto a common base class, added a unified `flush()`, typed event listeners, and SSR guards, and tightened public and base-class types.

## Social Post Angles

- building one API for many analytics tools
- reducing observability integration complexity
- web and Capacitor tracking infrastructure
- provider-free React hooks for telemetry
- provider architecture for analytics and error tracking

## Suggested SEO Keywords

- unified analytics package
- error tracking package
- React analytics hooks
- Capacitor analytics
- cross platform telemetry package
- TypeScript tracking library
- unified error monitoring
- provider based analytics architecture
- web analytics and crash reporting
- observability package for apps

## Social Hashtags

### Generic Hashtags Provided

#Aoneahsan #AhsanMahmood #Zaions #BestOpenSourceCommunityProject #TopFree #SaaSApp

### Top 20 Project Hashtags

#UnifiedTracking #AnalyticsInfrastructure #ErrorTracking #Observability #ReactLibrary #CapacitorPlugin #TypeScriptProject #OpenSourcePackage #CrossPlatformDevelopment #DeveloperTools #WebAnalytics #ProductEngineering #Telemetry #CrashReporting #SaaSDevelopment #BuildInPublic #FrontendArchitecture #TrackingSystem #ReactDev #AppMonitoring

## Why This Project Has Strong Portfolio Value

This project shows platform-level engineering rather than one-off feature delivery. It solves a real instrumentation problem many teams face, abstracts 16 providers behind one consistent API, and demonstrates architectural thinking around extensibility, developer experience, consent/privacy, and reusable telemetry infrastructure — while being honest about what is delivered today (web runtime, including the Capacitor WebView) versus what is planned (native SDK bridges).

## Content Prompting Notes For Future ChatGPT Use

When generating content from this file, emphasize:

- one API for many analytics and error-monitoring providers
- web-runtime delivery that also covers Capacitor apps via the WebView
- provider-free React hooks and vendor flexibility
- consent gating and privacy controls
- the honest distinction: web-first today, native SDK bridges planned

Do NOT claim native iOS/Android SDK delivery, do NOT claim Manifest-V3 browser-extension compatibility, and never invent statistics, ratings, user counts, or "best/#1/top" claims.

## File Usage Rule

Refresh this file only after at least 7 days have passed since the last update, unless a major release or material project change happens earlier. Keep only the 10 most recent history records in this file.
