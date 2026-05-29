import Foundation
import Segment

/// Segment (analytics-ios v4 / analytics-swift v1) bridge for the unified-tracking plugin.
///
/// Reads `writeKey` (required) from the provider config and initializes the
/// Segment SDK. If no write key is supplied the SDK is not started and the
/// provider stays uninitialized.
///
/// NOTE(unverified): build with Xcode — confirm which Segment SDK is resolved.
/// `analytics-ios` v4 is the Objective-C SDK (uses `Analytics.setup(with:)`,
/// `Analytics.shared()`, `track:properties:` etc.) and `analytics-swift` v1+ is
/// the Swift rewrite (uses `Analytics(configuration:)`, `analytics.track(...)`).
/// The `Package.swift` declares `analytics-ios ~4.1.8` which is the ObjC SDK —
/// the API below assumes that. If the resolved package is `analytics-swift`,
/// switch to `Analytics(configuration: Configuration(writeKey:))`.
class SegmentProvider: AnalyticsProvider {
    let name = "segment"
    private(set) var isEnabled: Bool
    private(set) var isInitialized: Bool

    private let config: [String: Any]
    private var debugMode = false
    /// Tracks the consent state for parity. Segment exposes `enable()` / `disable()`.
    private var consentGranted = true
    /// The Segment `Analytics` instance. ObjC SDK exposes a shared singleton via
    /// `Analytics.shared()`; we hold a reference for explicit calls and so the
    /// provider stays uninitialized if setup fails.
    private var analytics: Analytics?

    init(config: [String: Any]) {
        self.config = config
        self.isEnabled = config["enabled"] as? Bool ?? true
        self.isInitialized = false

        guard let writeKey = config["writeKey"] as? String, !writeKey.isEmpty else {
            // No write key -> cannot start Segment. Leave uninitialized.
            print("[SegmentProvider] No writeKey provided; Segment not started.")
            return
        }

        // NOTE(unverified): build with Xcode — confirm `AnalyticsConfiguration(writeKey:)`
        // initializer and `Analytics.setup(with:)` / `Analytics.shared()` exist on
        // analytics-ios ~4.1.8. The Swift SDK uses
        // `Analytics(configuration: Configuration(writeKey:))` instead.
        let configuration = AnalyticsConfiguration(writeKey: writeKey)
        // Optional tuning hooks exposed on AnalyticsConfiguration.
        if let trackApplicationLifecycle = config["trackApplicationLifecycleEvents"] as? Bool {
            configuration.trackApplicationLifecycleEvents = trackApplicationLifecycle
        }
        if let recordScreenViews = config["recordScreenViews"] as? Bool {
            configuration.recordScreenViews = recordScreenViews
        }
        Analytics.setup(with: configuration)
        self.analytics = Analytics.shared()

        self.isInitialized = true
    }

    func trackEvent(_ event: String, properties: [String: Any]) {
        guard isEnabled && isInitialized && consentGranted, let analytics = analytics else { return }
        // NOTE(unverified): build with Xcode — confirm `track(_:properties:)` argument
        // labels in analytics-ios ~4.1.8 (ObjC bridges as `track:properties:`).
        analytics.track(event, properties: properties)
    }

    func identifyUser(_ userId: String, traits: [String: Any]) {
        guard isEnabled && isInitialized && consentGranted, let analytics = analytics else { return }
        // NOTE(unverified): build with Xcode — confirm `identify(_:traits:)` argument
        // labels in analytics-ios ~4.1.8.
        analytics.identify(userId, traits: traits)
    }

    func setUserProperties(_ properties: [String: Any]) {
        guard isEnabled && isInitialized && consentGranted, let analytics = analytics else { return }
        // Segment retains the previously-identified userId when `identify` is called
        // with `nil`; passing only traits updates the user's traits without changing
        // identity. The exact nil-handling shape depends on SDK version.
        // NOTE(unverified): build with Xcode — confirm `identify(_:traits:)` accepts
        // `nil` userId in analytics-ios ~4.1.8.
        analytics.identify(nil, traits: properties)
    }

    func logScreenView(_ screenName: String, properties: [String: Any]) {
        guard isEnabled && isInitialized && consentGranted, let analytics = analytics else { return }
        // NOTE(unverified): build with Xcode — confirm `screen(_:properties:)` argument
        // labels in analytics-ios ~4.1.8.
        analytics.screen(screenName, properties: properties)
    }

    func logRevenue(amount: Double, currency: String, productId: String?, quantity: Int, properties: [String: Any]) {
        guard isEnabled && isInitialized && consentGranted, let analytics = analytics else { return }

        var props: [String: Any] = [
            // Segment's ecommerce spec uses `revenue` as the canonical monetary key.
            "revenue": amount,
            "currency": currency,
            "quantity": quantity
        ]
        if let productId = productId {
            props["productId"] = productId
        }
        // Caller-supplied properties take precedence over the derived defaults.
        for (key, value) in properties {
            props[key] = value
        }

        // Segment ecommerce spec event name.
        analytics.track("Order Completed", properties: props)
    }

    func setConsent(_ granted: Bool) {
        consentGranted = granted
        guard let analytics = analytics else { return }
        // NOTE(unverified): build with Xcode — confirm `enable()` / `disable()` instance
        // methods exist on analytics-ios ~4.1.8. These stop/start event delivery on
        // the underlying queue.
        if granted {
            analytics.enable()
        } else {
            analytics.disable()
        }
    }

    func reset() {
        guard let analytics = analytics else { return }
        // NOTE(unverified): build with Xcode — confirm `reset()` clears anonymousId +
        // identifyUser/traits in analytics-ios ~4.1.8.
        analytics.reset()
    }

    func setDebugMode(_ enabled: Bool) {
        // Segment's debug logging is enabled via `Analytics.debug(true)` (a class
        // method) in analytics-ios. We retain the flag here for parity and call the
        // class method when possible.
        debugMode = enabled
        // NOTE(unverified): build with Xcode — confirm `Analytics.debug(_:)` class
        // method exists in analytics-ios ~4.1.8.
        Analytics.debug(enabled)
    }
}
