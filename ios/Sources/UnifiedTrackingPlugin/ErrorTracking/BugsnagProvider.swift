import Foundation
import Bugsnag

/// Bugsnag (bugsnag-cocoa) bridge for the unified-tracking plugin.
///
/// Reads `apiKey` (required) and optional `releaseStage` from the provider
/// config and starts the Bugsnag SDK. If no API key is supplied the SDK is not
/// started and the provider stays uninitialized.
///
/// NOTE: Bugsnag does NOT expose a first-class consent toggle. When consent is
/// revoked we gate `logError` at the provider level (`consentGranted`) and
/// pause the current session. The native SDK keeps running but no events leave
/// this provider while consent is denied — documented limitation.
class BugsnagProvider: ErrorTrackingProvider {
    let name = "bugsnag"
    private(set) var isEnabled: Bool
    private(set) var isInitialized: Bool

    private let config: [String: Any]
    private var debugMode = false
    /// Tracks the consent state. Bugsnag has no opt-out toggle, so this provider
    /// gates `logError` itself when consent is revoked.
    private var consentGranted = true

    init(config: [String: Any]) {
        self.config = config
        self.isEnabled = config["enabled"] as? Bool ?? true
        self.isInitialized = false

        guard let apiKey = config["apiKey"] as? String, !apiKey.isEmpty else {
            // No API key -> cannot start Bugsnag. Leave uninitialized.
            print("[BugsnagProvider] No apiKey provided; Bugsnag not started.")
            return
        }

        // NOTE(unverified): build with Xcode — confirm `BugsnagConfiguration(_:)`
        // initializer takes the apiKey as the first positional argument and that
        // `releaseStage` / `appVersion` are writable properties in bugsnag-cocoa ~6.30.2.
        let configuration = BugsnagConfiguration(apiKey)
        if let releaseStage = config["releaseStage"] as? String {
            configuration.releaseStage = releaseStage
        }
        if let appVersion = config["appVersion"] as? String {
            configuration.appVersion = appVersion
        }

        // NOTE(unverified): build with Xcode — confirm `Bugsnag.start(with:)` class
        // method exists in bugsnag-cocoa ~6.30.2 (older SDKs used `Bugsnag.start()`
        // with the config supplied via `Bugsnag.startBugsnagWithApiKey(...)`).
        Bugsnag.start(with: configuration)

        self.isInitialized = true
    }

    func logError(_ error: Error, context: [String: Any]) {
        guard isEnabled && isInitialized && consentGranted else { return }
        // NOTE(unverified): build with Xcode — confirm
        // `Bugsnag.notify(_:block:)` with a `BugsnagEvent` callback returning Bool,
        // and `event.addMetadata(_:key:section:)` argument labels in bugsnag-cocoa ~6.30.2.
        Bugsnag.notify(error) { event in
            for (key, value) in context {
                event.addMetadata(value, key: key, section: "context")
            }
            return true
        }
    }

    func setUserContext(_ userId: String, properties: [String: Any]) {
        guard isEnabled && isInitialized else { return }
        // NOTE(unverified): build with Xcode — confirm
        // `Bugsnag.setUser(_:withEmail:andName:)` signature in bugsnag-cocoa ~6.30.2.
        let email = properties["email"] as? String
        let name = properties["name"] as? String
        Bugsnag.setUser(userId, withEmail: email, andName: name)
    }

    func setConsent(_ granted: Bool) {
        consentGranted = granted
        // NOTE: Bugsnag has no built-in opt-out toggle, so we pause the current
        // session when consent is revoked. Future `logError` calls are gated by
        // `consentGranted` inside this provider.
        // NOTE(unverified): build with Xcode — confirm `Bugsnag.pauseSession()` and
        // `Bugsnag.resumeSession()` class methods exist in bugsnag-cocoa ~6.30.2.
        if granted {
            Bugsnag.resumeSession()
        } else {
            Bugsnag.pauseSession()
        }
    }

    func reset() {
        // Clear the user attribution on the running Bugsnag instance.
        Bugsnag.setUser(nil, withEmail: nil, andName: nil)
    }

    func setDebugMode(_ enabled: Bool) {
        // Bugsnag's verbose logging is fixed at SDK start
        // (`BugsnagConfiguration.enabledBreadcrumbTypes`, etc.). We retain the
        // flag here for parity; flipping it at runtime is not supported by the SDK.
        debugMode = enabled
    }
}
