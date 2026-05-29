import Foundation
import AmplitudeSwift

/// Amplitude (Amplitude-iOS / amplitude-swift) bridge for the unified-tracking plugin.
///
/// Reads `apiKey` (required) and optional `serverUrl` from the provider config and
/// initializes an Amplitude instance. If no API key is supplied the SDK is not
/// started and the provider stays uninitialized.
///
/// NOTE(unverified): build with Xcode — confirm the module import name. The newer
/// Swift-native SDK ships as `AmplitudeSwift` while the legacy Objective-C SDK
/// ships as `Amplitude` (`import Amplitude`). The `Package.swift` references the
/// `Amplitude-iOS` package which historically vended the ObjC SDK, but the
/// product name in current versions is typically `AmplitudeSwift`. Verify which
/// product the resolved package version exposes and adjust the import + API.
class AmplitudeProvider: AnalyticsProvider {
    let name = "amplitude"
    private(set) var isEnabled: Bool
    private(set) var isInitialized: Bool

    private let config: [String: Any]
    private var debugMode = false
    /// Tracks the consent state for parity. Amplitude exposes `setOptOut(...)`.
    private var consentGranted = true
    /// The Amplitude instance returned by `Amplitude(configuration:)`.
    private var instance: Amplitude?

    init(config: [String: Any]) {
        self.config = config
        self.isEnabled = config["enabled"] as? Bool ?? true
        self.isInitialized = false

        guard let apiKey = config["apiKey"] as? String, !apiKey.isEmpty else {
            // No API key -> cannot start Amplitude. Leave uninitialized.
            print("[AmplitudeProvider] No apiKey provided; Amplitude not started.")
            return
        }

        // NOTE(unverified): build with Xcode — confirm `Configuration(apiKey:serverUrl:)`
        // initializer and the `Amplitude(configuration:)` initializer signatures in
        // amplitude-swift / AmplitudeSwift ~1.x. The legacy ObjC SDK uses
        // `Amplitude.instance().initializeApiKey(apiKey)` instead — adjust if the
        // resolved package exposes the legacy API.
        let configuration: Configuration
        if let serverUrl = config["serverUrl"] as? String, !serverUrl.isEmpty {
            configuration = Configuration(apiKey: apiKey, serverUrl: serverUrl)
        } else {
            configuration = Configuration(apiKey: apiKey)
        }
        self.instance = Amplitude(configuration: configuration)

        self.isInitialized = true
    }

    func trackEvent(_ event: String, properties: [String: Any]) {
        guard isEnabled && isInitialized && consentGranted, let instance = instance else { return }
        // NOTE(unverified): build with Xcode — confirm `track(eventType:eventProperties:)`
        // argument labels in AmplitudeSwift ~1.x. Legacy ObjC SDK uses
        // `logEvent(_:withEventProperties:)` instead.
        instance.track(eventType: event, eventProperties: properties)
    }

    func identifyUser(_ userId: String, traits: [String: Any]) {
        guard isEnabled && isInitialized && consentGranted, let instance = instance else { return }
        // NOTE(unverified): build with Xcode — confirm `setUserId(userId:)` argument label
        // (some SDK versions expose `setUserId(_:)` without a label).
        instance.setUserId(userId: userId)
        if !traits.isEmpty {
            // NOTE(unverified): build with Xcode — confirm `Identify()` initializer and
            // `set(property:value:)` chainable signature in AmplitudeSwift ~1.x.
            let identify = Identify()
            for (key, value) in traits {
                identify.set(property: key, value: value)
            }
            instance.identify(identify: identify)
        }
    }

    func setUserProperties(_ properties: [String: Any]) {
        guard isEnabled && isInitialized && consentGranted, let instance = instance else { return }
        let identify = Identify()
        for (key, value) in properties {
            identify.set(property: key, value: value)
        }
        instance.identify(identify: identify)
    }

    func logRevenue(amount: Double, currency: String, productId: String?, quantity: Int, properties: [String: Any]) {
        guard isEnabled && isInitialized && consentGranted, let instance = instance else { return }
        // NOTE(unverified): build with Xcode — confirm `Revenue()` initializer and the
        // chainable `setProductId(_:)` / `setQuantity(_:)` / `setPrice(_:)` setters in
        // AmplitudeSwift ~1.x. Some SDK versions expose these as plain property setters
        // (e.g. `revenue.productId = ...`) instead of chainable methods.
        let revenue = Revenue()
        if let productId = productId {
            revenue.setProductId(productId)
        }
        revenue.setQuantity(quantity)
        revenue.setPrice(amount)
        // Currency + extra properties are not first-class on the Revenue model in
        // every SDK version. We attach them via `eventProperties` when supported.
        // NOTE(unverified): build with Xcode — some versions expose
        // `revenue.eventProperties = ...` or `revenue.setEventProperties(_:)`.
        var extras: [String: Any] = ["currency": currency]
        for (key, value) in properties {
            extras[key] = value
        }
        revenue.setEventProperties(extras)
        instance.revenue(revenue: revenue)
    }

    func logScreenView(_ screenName: String, properties: [String: Any]) {
        guard isEnabled && isInitialized && consentGranted, let instance = instance else { return }

        var params: [String: Any] = [
            // Amplitude's canonical screen-view property names.
            "[Amplitude] Screen Name": screenName
        ]
        for (key, value) in properties {
            params[key] = value
        }

        // Amplitude's canonical screen-view event name.
        instance.track(eventType: "[Amplitude] Screen Viewed", eventProperties: params)
    }

    func setConsent(_ granted: Bool) {
        consentGranted = granted
        guard let instance = instance else { return }
        // NOTE(unverified): build with Xcode — confirm `setOptOut(_:)` exists as an
        // instance method in AmplitudeSwift ~1.x. The legacy ObjC SDK exposes
        // `Amplitude.instance().optOut = true` instead.
        instance.setOptOut(optOut: !granted)
    }

    func reset() {
        guard let instance = instance else { return }
        // NOTE(unverified): build with Xcode — confirm `reset()` is an instance method
        // on `Amplitude` in AmplitudeSwift ~1.x. Legacy ObjC SDK exposes `regenerateDeviceId()`.
        instance.reset()
    }

    func setDebugMode(_ enabled: Bool) {
        // Amplitude's log level is configured at SDK init time via the `Configuration`
        // object's `logLevel` property. We retain the flag here for parity; flipping
        // it at runtime is not exposed as a first-class API in all SDK versions.
        debugMode = enabled
    }
}
