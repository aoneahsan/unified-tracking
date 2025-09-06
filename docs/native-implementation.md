# Native Implementation Guide

## Overview

The Unified Tracking plugin provides native implementations for both Android and iOS platforms, enabling seamless integration with platform-specific analytics and error tracking SDKs.

## Android Implementation

### Structure

```
android/
├── build.gradle                 # Main build configuration
├── variables.gradle            # Version variables
├── proguard-rules.pro         # ProGuard rules for release builds
├── src/main/
│   ├── AndroidManifest.xml    # Permissions and configuration
│   └── java/com/aoneahsan/unifiedtracking/
│       ├── UnifiedTrackingPlugin.java    # Main plugin class
│       └── providers/
│           ├── ProviderManager.java      # Provider orchestration
│           ├── AnalyticsProvider.java    # Analytics interface
│           ├── ErrorTrackingProvider.java # Error tracking interface
│           ├── analytics/                # Analytics implementations
│           │   ├── FirebaseAnalyticsProvider.java
│           │   ├── GoogleAnalyticsProvider.java
│           │   ├── MixpanelProvider.java
│           │   ├── AmplitudeProvider.java
│           │   └── SegmentProvider.java
│           └── errortracking/           # Error tracking implementations
│               ├── SentryProvider.java
│               ├── BugsnagProvider.java
│               ├── CrashlyticsProvider.java
│               └── RollbarProvider.java
```

### Dependencies

The Android implementation includes the following SDK dependencies:

- Firebase Analytics: `com.google.firebase:firebase-analytics:21.5.0`
- Firebase Crashlytics: `com.google.firebase:firebase-crashlytics:18.6.0`
- Sentry: `io.sentry:sentry-android:7.3.0`
- Amplitude: `com.amplitude:android-sdk:2.39.8`
- Mixpanel: `com.mixpanel.android:mixpanel-android:7.3.0`
- Segment: `com.segment.analytics.android:analytics:4.10.4`
- Bugsnag: `com.bugsnag:bugsnag-android:5.28.3`
- Rollbar: `com.rollbar:rollbar-java:1.7.0`

### Configuration

Add to your app's `android/app/build.gradle`:

```gradle
dependencies {
    implementation project(':capacitor-unified-tracking')
}
```

### Permissions

The plugin automatically includes necessary permissions in its manifest:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

### ProGuard Rules

ProGuard rules are automatically included to ensure proper functionality in release builds.

## iOS Implementation

### Structure

```
ios/
├── Sources/UnifiedTrackingPlugin/
│   ├── UnifiedTrackingPlugin.swift    # Main plugin class
│   ├── UnifiedTracking.swift          # Core implementation
│   ├── ProviderManager.swift          # Provider orchestration
│   ├── Protocols.swift                # Provider protocols
│   ├── Analytics/                     # Analytics implementations
│   │   ├── FirebaseAnalyticsProvider.swift
│   │   ├── GoogleAnalyticsProvider.swift
│   │   ├── MixpanelProvider.swift
│   │   ├── AmplitudeProvider.swift
│   │   └── SegmentProvider.swift
│   └── ErrorTracking/                 # Error tracking implementations
│       ├── SentryProvider.swift
│       ├── BugsnagProvider.swift
│       ├── CrashlyticsProvider.swift
│       └── RollbarProvider.swift
└── Tests/UnifiedTrackingTests/        # Unit tests
```

### Swift Package Manager

The iOS implementation uses Swift Package Manager for dependency management. Dependencies are defined in `Package.swift`.

### CocoaPods Integration

For projects using CocoaPods, add to your `Podfile`:

```ruby
pod 'UnifiedTracking', :path => '../node_modules/unified-tracking'
```

### Configuration

In your iOS app's `AppDelegate.swift`:

```swift
import UnifiedTracking

// Initialize in application:didFinishLaunchingWithOptions:
UnifiedTracking.shared.initialize(config: trackingConfig)
```

## Provider Implementation Details

### Analytics Providers

Each analytics provider implements the `AnalyticsProvider` protocol/interface:

- `trackEvent(event: String, properties: [String: Any])`
- `identifyUser(userId: String, traits: [String: Any])`
- `setUserProperties(properties: [String: Any])`
- `logRevenue(amount: Double, currency: String, ...)`
- `logScreenView(screenName: String, properties: [String: Any])`
- `setConsent(granted: Bool)`
- `reset()`
- `setDebugMode(enabled: Bool)`

### Error Tracking Providers

Each error tracking provider implements the `ErrorTrackingProvider` protocol/interface:

- `logError(error: Error, context: [String: Any])`
- `setUserContext(userId: String, properties: [String: Any])`
- `setConsent(granted: Bool)`
- `reset()`
- `setDebugMode(enabled: Bool)`

## Native Method Mapping

| JavaScript Method      | Android Method                   | iOS Method               |
| ---------------------- | -------------------------------- | ------------------------ |
| `initialize()`         | `initialize(PluginCall)`         | `initialize(_:)`         |
| `track()`              | `track(PluginCall)`              | `track(_:)`              |
| `identify()`           | `identify(PluginCall)`           | `identify(_:)`           |
| `setUserProperties()`  | `setUserProperties(PluginCall)`  | `setUserProperties(_:)`  |
| `logError()`           | `logError(PluginCall)`           | `logError(_:)`           |
| `logRevenue()`         | `logRevenue(PluginCall)`         | `logRevenue(_:)`         |
| `logScreenView()`      | `logScreenView(PluginCall)`      | `logScreenView(_:)`      |
| `setConsent()`         | `setConsent(PluginCall)`         | `setConsent(_:)`         |
| `reset()`              | `reset(PluginCall)`              | `reset(_:)`              |
| `getActiveProviders()` | `getActiveProviders(PluginCall)` | `getActiveProviders(_:)` |
| `enableDebugMode()`    | `enableDebugMode(PluginCall)`    | `enableDebugMode(_:)`    |

## Platform-Specific Features

### Android-Specific

- Automatic activity lifecycle tracking
- Google Play Services integration
- Firebase Cloud Messaging support for push analytics
- Android App Bundle support

### iOS-Specific

- Automatic UIViewController lifecycle tracking
- App Store receipt validation for revenue tracking
- Push notification analytics
- App Tracking Transparency (ATT) compliance

## Testing

### Android Testing

Run Android unit tests:

```bash
cd android
./gradlew test
```

Run Android instrumentation tests:

```bash
cd android
./gradlew connectedAndroidTest
```

### iOS Testing

Run iOS unit tests:

```bash
cd ios
swift test
```

Or using Xcode:

```bash
cd ios
xcodebuild test -scheme UnifiedTracking -destination 'platform=iOS Simulator,name=iPhone 14'
```

## Debugging

### Android Debugging

Enable verbose logging:

```java
UnifiedTracking.enableDebugMode(true);
```

View logs:

```bash
adb logcat -s UnifiedTracking:V
```

### iOS Debugging

Enable verbose logging:

```swift
UnifiedTracking.enableDebugMode(true)
```

View logs in Xcode console or:

```bash
xcrun simctl spawn booted log stream --level debug --predicate 'subsystem == "com.aoneahsan.unifiedtracking"'
```

## Performance Considerations

### Memory Management

- Providers are initialized lazily when first used
- Event queues are limited to prevent memory overflow
- Automatic cleanup on low memory warnings

### Battery Optimization

- Batch event uploads to reduce network calls
- Respect device power saving modes
- Configurable upload intervals

### Network Optimization

- Automatic retry with exponential backoff
- Offline event storage
- Compression for large payloads

## Migration from Web-Only

If migrating from a web-only implementation:

1. Update Capacitor to latest version
2. Run `npx cap sync` to sync native projects
3. Configure native-specific provider settings
4. Test on physical devices
5. Update ProGuard/R8 rules if needed

## Troubleshooting

### Common Android Issues

**Issue**: Build fails with "Could not find com.google.firebase..."
**Solution**: Add Google Maven repository to project-level build.gradle

**Issue**: Events not tracking on release builds
**Solution**: Check ProGuard rules are properly configured

### Common iOS Issues

**Issue**: "No such module 'UnifiedTracking'"
**Solution**: Run `pod install` or update Swift Package dependencies

**Issue**: App crashes on launch
**Solution**: Ensure all required frameworks are linked

## Best Practices

1. **Initialize Early**: Initialize the plugin as early as possible in app lifecycle
2. **Handle Errors**: Always wrap tracking calls in try-catch for production
3. **Test on Devices**: Test on real devices, not just simulators
4. **Monitor Performance**: Use platform profilers to monitor impact
5. **Respect Privacy**: Always respect user consent preferences
6. **Version Management**: Keep provider SDKs updated regularly

## Support

For issues specific to native implementations:

- Android: Check logcat output and gradle build logs
- iOS: Check Xcode console and build logs
- File issues at: https://github.com/aoneahsan/unified-tracking/issues
