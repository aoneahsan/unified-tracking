import Foundation
import Mixpanel

/// Mixpanel (mixpanel-swift) bridge for the unified-tracking plugin.
///
/// Reads `token` from the provider config and initializes a `MixpanelInstance`.
/// If no token is supplied the SDK is not started and the provider stays
/// uninitialized (so ProviderManager will skip it).
///
/// NOTE: The host app does NOT need to call `Mixpanel.initialize(...)` on its
/// own — this provider handles initialization. Calling it twice with the same
/// token is safe (Mixpanel returns the existing instance).
class MixpanelProvider: AnalyticsProvider {
    let name = "mixpanel"
    private(set) var isEnabled: Bool
    private(set) var isInitialized: Bool

    private let config: [String: Any]
    private var debugMode = false
    /// Tracks the consent state for parity. Mixpanel exposes
    /// `optInTracking()` / `optOutTracking()` which we wire in `setConsent`.
    private var consentGranted = true
    /// The Mixpanel instance returned by `Mixpanel.initialize(...)`. Held weakly-
    /// typed as `MixpanelInstance?` so every method can guard on it.
    private var instance: MixpanelInstance?

    init(config: [String: Any]) {
        self.config = config
        self.isEnabled = config["enabled"] as? Bool ?? true
        self.isInitialized = false

        guard let token = config["token"] as? String, !token.isEmpty else {
            // No token -> cannot start Mixpanel. Leave uninitialized.
            print("[MixpanelProvider] No token provided; Mixpanel not started.")
            return
        }

        // NOTE(unverified): build with Xcode — confirm
        // `Mixpanel.initialize(token:trackAutomaticEvents:)` (or `Mixpanel.initialize(token:)`)
        // signature in mixpanel-swift ~4.2.8. `trackAutomaticEvents` became a required
        // parameter in recent versions; passing `false` keeps behaviour predictable.
        let trackAutomatic = config["trackAutomaticEvents"] as? Bool ?? false
        self.instance = Mixpanel.initialize(token: token, trackAutomaticEvents: trackAutomatic)

        self.isInitialized = true
    }

    func trackEvent(_ event: String, properties: [String: Any]) {
        guard isEnabled && isInitialized && consentGranted, let instance = instance else { return }
        // NOTE(unverified): build with Xcode — confirm `track(event:properties:)` accepts
        // `Properties` (= `[String: MixpanelType]`) in mixpanel-swift ~4.2.8.
        instance.track(event: event, properties: Self.sanitizeProperties(properties))
    }

    func identifyUser(_ userId: String, traits: [String: Any]) {
        guard isEnabled && isInitialized && consentGranted, let instance = instance else { return }
        // NOTE(unverified): build with Xcode — confirm `identify(distinctId:)` and
        // `people.set(properties:)` argument labels in mixpanel-swift ~4.2.8.
        instance.identify(distinctId: userId)
        if !traits.isEmpty {
            instance.people.set(properties: Self.sanitizeProperties(traits))
        }
    }

    func setUserProperties(_ properties: [String: Any]) {
        guard isEnabled && isInitialized && consentGranted, let instance = instance else { return }
        instance.people.set(properties: Self.sanitizeProperties(properties))
    }

    func logRevenue(amount: Double, currency: String, productId: String?, quantity: Int, properties: [String: Any]) {
        guard isEnabled && isInitialized && consentGranted, let instance = instance else { return }

        var chargeProperties: [String: MixpanelType] = [
            "currency": currency as MixpanelType,
            "quantity": quantity as MixpanelType
        ]
        if let productId = productId {
            chargeProperties["productId"] = productId as MixpanelType
        }
        // Caller-supplied properties take precedence over the derived defaults.
        for (key, value) in Self.sanitizeProperties(properties) {
            chargeProperties[key] = value
        }

        // NOTE(unverified): build with Xcode — confirm `people.trackCharge(amount:properties:)`
        // signature in mixpanel-swift ~4.2.8. The `amount` is a `Double`.
        instance.people.trackCharge(amount: amount, properties: chargeProperties)
    }

    func logScreenView(_ screenName: String, properties: [String: Any]) {
        guard isEnabled && isInitialized && consentGranted, let instance = instance else { return }

        var params: [String: MixpanelType] = [
            "screen": screenName as MixpanelType
        ]
        for (key, value) in Self.sanitizeProperties(properties) {
            params[key] = value
        }

        instance.track(event: "Screen View", properties: params)
    }

    func setConsent(_ granted: Bool) {
        consentGranted = granted
        guard let instance = instance else { return }
        // NOTE(unverified): build with Xcode — confirm `optInTracking()` /
        // `optOutTracking()` exist as instance methods in mixpanel-swift ~4.2.8.
        if granted {
            instance.optInTracking()
        } else {
            instance.optOutTracking()
        }
    }

    func reset() {
        guard let instance = instance else { return }
        instance.reset()
    }

    func setDebugMode(_ enabled: Bool) {
        // Mixpanel's logging level is configured at SDK init time (via
        // `Mixpanel.mainInstance().loggingEnabled = true` on older versions, or
        // `MixpanelInstance.loggingEnabled` on current versions). We retain the
        // flag here for parity with other providers; flipping it at runtime is
        // best-effort.
        debugMode = enabled
        // NOTE(unverified): build with Xcode — confirm `instance.loggingEnabled`
        // is still a writable property in mixpanel-swift ~4.2.8.
        instance?.loggingEnabled = enabled
    }

    // MARK: - Helpers

    /// Mixpanel's `Properties` type is `[String: MixpanelType]`. `MixpanelType` is a
    /// protocol that String, NSNumber, Bool, Int, UInt, Double, Float, [MixpanelType],
    /// [String: MixpanelType], Date, URL, NSNull all conform to. Anything else is
    /// coerced to `String(describing:)` so the SDK never receives an unsupported type.
    private static func sanitizeProperties(_ properties: [String: Any]) -> [String: MixpanelType] {
        var result: [String: MixpanelType] = [:]
        for (key, value) in properties {
            if let typed = value as? MixpanelType {
                result[key] = typed
            } else {
                // Fall back to a string description.
                result[key] = String(describing: value) as MixpanelType
            }
        }
        return result
    }
}
