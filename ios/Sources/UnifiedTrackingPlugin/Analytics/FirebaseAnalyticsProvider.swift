import Foundation
import FirebaseCore
import FirebaseAnalytics

/// Firebase Analytics bridge for the unified-tracking plugin.
///
/// NOTE: The host app MUST bundle a valid `GoogleService-Info.plist` in its
/// app target for Firebase Analytics to deliver events. This provider will call
/// `FirebaseApp.configure()` itself only if the host app has not already done so;
/// without the plist, `configure()` will fail and no events will be reported.
class FirebaseAnalyticsProvider: AnalyticsProvider {
    let name = "firebase"
    private(set) var isEnabled: Bool
    private(set) var isInitialized: Bool

    private let config: [String: Any]
    private var debugMode = false

    init(config: [String: Any]) {
        self.config = config
        self.isEnabled = config["enabled"] as? Bool ?? true
        self.isInitialized = false

        // The host app normally configures Firebase (GoogleService-Info.plist +
        // FirebaseApp.configure()). Only configure here if it hasn't been done,
        // so we never double-configure (which throws/asserts at runtime).
        if FirebaseApp.app() == nil {
            FirebaseApp.configure()
        }

        self.isInitialized = true
    }

    func trackEvent(_ event: String, properties: [String: Any]) {
        guard isEnabled && isInitialized else { return }
        // Passing an empty dictionary is valid; Firebase accepts nil or [:] parameters.
        Analytics.logEvent(event, parameters: Self.sanitizeParameters(properties))
    }

    func identifyUser(_ userId: String, traits: [String: Any]) {
        guard isEnabled && isInitialized else { return }
        // NOTE(unverified): build with Xcode — confirm `Analytics.setUserID(_:)` and
        // `Analytics.setUserProperty(_:forName:)` signatures in FirebaseAnalytics ~11.6.
        // Firebase user-property names must be <=24 chars, alphanumeric/underscore, and
        // not start with a reserved prefix; the host must supply valid keys.
        Analytics.setUserID(userId)
        for (key, value) in traits {
            // Firebase user properties are string-valued.
            Analytics.setUserProperty(String(describing: value), forName: key)
        }
    }

    func setUserProperties(_ properties: [String: Any]) {
        guard isEnabled && isInitialized else { return }
        for (key, value) in properties {
            Analytics.setUserProperty(String(describing: value), forName: key)
        }
    }

    func logRevenue(amount: Double, currency: String, productId: String?, quantity: Int, properties: [String: Any]) {
        guard isEnabled && isInitialized else { return }

        var params: [String: Any] = [
            AnalyticsParameterValue: amount,
            AnalyticsParameterCurrency: currency,
            AnalyticsParameterQuantity: quantity
        ]
        if let productId = productId {
            params[AnalyticsParameterItemID] = productId
        }
        // Caller-supplied properties take precedence over the derived defaults.
        for (key, value) in Self.sanitizeParameters(properties) {
            params[key] = value
        }

        Analytics.logEvent(AnalyticsEventPurchase, parameters: params)
    }

    func logScreenView(_ screenName: String, properties: [String: Any]) {
        guard isEnabled && isInitialized else { return }

        var params: [String: Any] = [
            AnalyticsParameterScreenName: screenName
        ]
        for (key, value) in Self.sanitizeParameters(properties) {
            params[key] = value
        }

        Analytics.logEvent(AnalyticsEventScreenView, parameters: params)
    }

    func setConsent(_ granted: Bool) {
        // Toggles whether Firebase Analytics collects and sends data at all.
        Analytics.setAnalyticsCollectionEnabled(granted)
    }

    func reset() {
        Analytics.resetAnalyticsData()
    }

    func setDebugMode(_ enabled: Bool) {
        // Firebase Analytics DebugView is enabled via the `-FIRAnalyticsDebugEnabled`
        // launch argument (or `-FIRDebugEnabled`), not a runtime API. We just retain
        // the flag here for parity.
        debugMode = enabled
    }

    // MARK: - Helpers

    /// Firebase event parameters only accept `String`, `NSNumber` (Int/Double/Bool),
    /// and `NSDate` values. Anything else is coerced to its `String(describing:)`
    /// form so the SDK never receives an unsupported type (which it rejects at
    /// runtime and drops the whole event).
    private static func sanitizeParameters(_ properties: [String: Any]) -> [String: Any] {
        var result: [String: Any] = [:]
        for (key, value) in properties {
            switch value {
            case let v as String:
                result[key] = v
            case let v as NSNumber:
                result[key] = v
            case let v as Date:
                result[key] = v
            default:
                result[key] = String(describing: value)
            }
        }
        return result
    }
}
