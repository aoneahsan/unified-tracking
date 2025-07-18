// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "UnifiedTracking",
    platforms: [
        .iOS(.v13)
    ],
    products: [
        .library(
            name: "UnifiedTracking",
            targets: ["UnifiedTracking"]
        )
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", branch: "main"),
        .package(url: "https://github.com/firebase/firebase-ios-sdk.git", from: "10.0.0"),
        .package(url: "https://github.com/amplitude/Amplitude-iOS.git", from: "8.0.0"),
        .package(url: "https://github.com/mixpanel/mixpanel-swift.git", from: "4.0.0"),
        .package(url: "https://github.com/segmentio/analytics-ios.git", from: "4.0.0"),
        .package(url: "https://github.com/PostHog/posthog-ios.git", from: "2.0.0"),
        .package(url: "https://github.com/heaply/heap-swift-core-sdk.git", from: "1.0.0"),
        .package(url: "https://github.com/matomo-org/matomo-sdk-ios.git", from: "7.0.0"),
        .package(url: "https://github.com/getsentry/sentry-cocoa.git", from: "8.0.0"),
        .package(url: "https://github.com/bugsnag/bugsnag-cocoa.git", from: "6.0.0"),
        .package(url: "https://github.com/rollbar/rollbar-ios.git", from: "2.0.0"),
        .package(url: "https://github.com/DataDog/dd-sdk-ios.git", from: "2.0.0"),
        .package(url: "https://github.com/LogRocket/logrocket-ios.git", from: "1.0.0"),
        .package(url: "https://github.com/MindscapeHQ/raygun4ios.git", from: "1.0.0"),
        .package(url: "https://github.com/microsoft/appcenter-sdk-apple.git", from: "5.0.0")
    ],
    targets: [
        .target(
            name: "UnifiedTracking",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "FirebaseAnalytics", package: "firebase-ios-sdk"),
                .product(name: "FirebaseCrashlytics", package: "firebase-ios-sdk"),
                .product(name: "Amplitude", package: "Amplitude-iOS"),
                .product(name: "Mixpanel", package: "mixpanel-swift"),
                .product(name: "Segment", package: "analytics-ios"),
                .product(name: "PostHog", package: "posthog-ios"),
                .product(name: "HeapSwiftCore", package: "heap-swift-core-sdk"),
                .product(name: "MatomoTracker", package: "matomo-sdk-ios"),
                .product(name: "Sentry", package: "sentry-cocoa"),
                .product(name: "Bugsnag", package: "bugsnag-cocoa"),
                .product(name: "Rollbar", package: "rollbar-ios"),
                .product(name: "DatadogCore", package: "dd-sdk-ios"),
                .product(name: "DatadogRUM", package: "dd-sdk-ios"),
                .product(name: "LogRocket", package: "logrocket-ios"),
                .product(name: "RaygunProvider", package: "raygun4ios"),
                .product(name: "AppCenter", package: "appcenter-sdk-apple")
            ],
            path: "ios/Sources/UnifiedTrackingPlugin"
        ),
        .testTarget(
            name: "UnifiedTrackingTests",
            dependencies: [
                "UnifiedTracking"
            ],
            path: "ios/Tests/UnifiedTrackingPluginTests"
        )
    ]
)