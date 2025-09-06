// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "UnifiedTracking",
    platforms: [
        .iOS(.v13),
        .macOS(.v11),
        .tvOS(.v13),
        .watchOS(.v6),
        .visionOS(.v1)
    ],
    products: [
        .library(
            name: "UnifiedTracking",
            targets: ["UnifiedTracking"]
        )
    ],
    dependencies: [
        // Core Capacitor dependency
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", branch: "main"),
        
        // Analytics providers (all optional)
        .package(url: "https://github.com/firebase/firebase-ios-sdk.git", from: "11.6.0"),
        .package(url: "https://github.com/amplitude/Amplitude-iOS.git", from: "8.18.1"),
        .package(url: "https://github.com/mixpanel/mixpanel-swift.git", from: "4.2.8"),
        .package(url: "https://github.com/segmentio/analytics-ios.git", from: "4.1.8"),
        .package(url: "https://github.com/PostHog/posthog-ios.git", from: "3.10.1"),
        .package(url: "https://github.com/heap/heap-ios-sdk.git", from: "9.0.0"),
        .package(url: "https://github.com/matomo-org/matomo-sdk-ios.git", from: "7.7.0"),
        
        // Error tracking providers (all optional) 
        .package(url: "https://github.com/getsentry/sentry-cocoa.git", from: "8.42.0"),
        .package(url: "https://github.com/bugsnag/bugsnag-cocoa.git", from: "6.30.2"),
        .package(url: "https://github.com/rollbar/rollbar-ios.git", from: "3.2.0"),
        .package(url: "https://github.com/DataDog/dd-sdk-ios.git", from: "2.20.0"),
        .package(url: "https://github.com/LogRocket/logrocket-ios.git", from: "1.8.0"),
        .package(url: "https://github.com/MindscapeHQ/raygun4ios.git", from: "1.5.0"),
        .package(url: "https://github.com/microsoft/appcenter-sdk-apple.git", from: "5.0.5")
    ],
    targets: [
        .target(
            name: "UnifiedTracking",
            dependencies: [
                // Core Capacitor dependency (required)
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                
                // Analytics providers (all optional, only used if available)
                .product(name: "FirebaseAnalytics", package: "firebase-ios-sdk", condition: .when(platforms: [.iOS, .macOS, .tvOS])),
                .product(name: "Amplitude", package: "Amplitude-iOS", condition: .when(platforms: [.iOS, .macOS, .tvOS])),
                .product(name: "Mixpanel", package: "mixpanel-swift", condition: .when(platforms: [.iOS, .macOS])),
                .product(name: "Segment", package: "analytics-ios", condition: .when(platforms: [.iOS, .macOS, .tvOS])),
                .product(name: "PostHog", package: "posthog-ios", condition: .when(platforms: [.iOS, .macOS])),
                .product(name: "HeapSwiftCore", package: "heap-ios-sdk", condition: .when(platforms: [.iOS])),
                .product(name: "MatomoTracker", package: "matomo-sdk-ios", condition: .when(platforms: [.iOS, .macOS, .tvOS])),
                
                // Error tracking providers (all optional)
                .product(name: "FirebaseCrashlytics", package: "firebase-ios-sdk", condition: .when(platforms: [.iOS, .macOS, .tvOS])),
                .product(name: "Sentry", package: "sentry-cocoa"),
                .product(name: "Bugsnag", package: "bugsnag-cocoa", condition: .when(platforms: [.iOS, .macOS, .tvOS])),
                .product(name: "Rollbar", package: "rollbar-ios", condition: .when(platforms: [.iOS, .macOS])),
                .product(name: "DatadogCore", package: "dd-sdk-ios", condition: .when(platforms: [.iOS, .macOS, .tvOS])),
                .product(name: "DatadogRUM", package: "dd-sdk-ios", condition: .when(platforms: [.iOS, .macOS, .tvOS])),
                .product(name: "LogRocket", package: "logrocket-ios", condition: .when(platforms: [.iOS])),
                .product(name: "RaygunProvider", package: "raygun4ios", condition: .when(platforms: [.iOS, .macOS])),
                .product(name: "AppCenter", package: "appcenter-sdk-apple", condition: .when(platforms: [.iOS, .macOS, .tvOS]))
            ],
            path: "ios/Sources/UnifiedTrackingPlugin",
            resources: [
                .copy("Resources/PrivacyInfo.xcprivacy")
            ],
            swiftSettings: [
                .define("UNIFIED_TRACKING_SPM"),
                .enableExperimentalFeature("StrictConcurrency")
            ]
        ),
        .testTarget(
            name: "UnifiedTrackingTests",
            dependencies: [
                "UnifiedTracking"
            ],
            path: "ios/Tests/UnifiedTrackingTests",
            swiftSettings: [
                .define("TESTING")
            ]
        )
    ]
)