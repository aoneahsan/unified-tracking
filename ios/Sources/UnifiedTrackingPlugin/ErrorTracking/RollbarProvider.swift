import Foundation
import RollbarNotifier

/// Rollbar (rollbar-ios / RollbarNotifier) bridge for the unified-tracking plugin.
///
/// Reads `accessToken` (required) and optional `environment` from the provider
/// config and initializes the Rollbar SDK. If no access token is supplied the
/// SDK is not started and the provider stays uninitialized.
///
/// NOTE: Rollbar does NOT expose a first-class consent toggle. When consent is
/// revoked we gate `logError` at the provider level (`consentGranted`). The
/// native SDK keeps running but no events leave this provider while consent is
/// denied — documented limitation.
class RollbarProvider: ErrorTrackingProvider {
    let name = "rollbar"
    private(set) var isEnabled: Bool
    private(set) var isInitialized: Bool

    private let config: [String: Any]
    private var debugMode = false
    /// Tracks the consent state. Rollbar has no opt-out toggle, so this provider
    /// gates `logError` itself when consent is revoked.
    private var consentGranted = true

    init(config: [String: Any]) {
        self.config = config
        self.isEnabled = config["enabled"] as? Bool ?? true
        self.isInitialized = false

        guard let accessToken = config["accessToken"] as? String, !accessToken.isEmpty else {
            // No access token -> cannot start Rollbar. Leave uninitialized.
            print("[RollbarProvider] No accessToken provided; Rollbar not started.")
            return
        }

        let environment = config["environment"] as? String ?? "production"

        // NOTE(unverified): build with Xcode — confirm
        // `RollbarConfig.mutableConfig(withAccessToken:environment:)` factory exists
        // (older versions used `RollbarConfiguration` and a different naming scheme)
        // and that `Rollbar.initWithConfiguration(_:)` class method exists in
        // rollbar-ios ~3.2.0. Some 3.x versions use
        // `Rollbar.initWithAccessToken(_:configuration:)` instead.
        let rollbarConfig = RollbarConfig.mutableConfig(withAccessToken: accessToken,
                                                         environment: environment)
        Rollbar.initWithConfiguration(rollbarConfig)

        self.isInitialized = true
    }

    func logError(_ error: Error, context: [String: Any]) {
        guard isEnabled && isInitialized && consentGranted else { return }
        // NOTE(unverified): build with Xcode — confirm
        // `Rollbar.errorError(_:data:context:)` class method exists in rollbar-ios ~3.2.0.
        // Some 3.x versions expose `Rollbar.error(_:data:context:)` or expect the
        // shared notifier via `Rollbar.currentNotifier()` instead.
        Rollbar.errorError(error, data: context, context: "logError")
    }

    func setUserContext(_ userId: String, properties: [String: Any]) {
        guard isEnabled && isInitialized else { return }
        // NOTE(unverified): build with Xcode — confirm
        // `Rollbar.currentConfiguration()` returns a mutable config and that
        // `setPersonId(_:username:email:)` is the current signature in rollbar-ios ~3.2.0.
        // Some 3.x versions expose `currentConfiguration().person = RollbarPerson(...)`.
        let username = properties["username"] as? String
        let email = properties["email"] as? String
        Rollbar.currentConfiguration().setPersonId(userId, username: username, email: email)
    }

    func setConsent(_ granted: Bool) {
        consentGranted = granted
        // NOTE: Rollbar has no built-in opt-out toggle. We gate `logError` at the
        // provider level via `consentGranted`. No SDK call is required here.
    }

    func reset() {
        guard isInitialized else { return }
        // Clear the person attribution on the running Rollbar configuration.
        // NOTE(unverified): build with Xcode — confirm passing `nil` person identity
        // is accepted by `setPersonId(_:username:email:)` in rollbar-ios ~3.2.0.
        // If the SDK rejects nil, an alternative is
        // `Rollbar.currentConfiguration().person = nil`.
        Rollbar.currentConfiguration().setPersonId(nil, username: nil, email: nil)
    }

    func setDebugMode(_ enabled: Bool) {
        // Rollbar's verbose logging is configured at SDK start time via the
        // RollbarConfig object. We retain the flag here for parity; flipping it
        // at runtime is not exposed as a first-class API on the shared notifier.
        debugMode = enabled
    }
}
