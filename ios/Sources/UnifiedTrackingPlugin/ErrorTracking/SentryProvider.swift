import Foundation
import Sentry

/// Sentry (sentry-cocoa) bridge for the unified-tracking plugin.
///
/// Reads `dsn`, `environment`, and `release` from the provider config and starts
/// the Sentry SDK. If no DSN is supplied the SDK is not started and the provider
/// stays uninitialized (so ProviderManager will skip it).
class SentryProvider: ErrorTrackingProvider {
    let name = "sentry"
    private(set) var isEnabled: Bool
    private(set) var isInitialized: Bool

    private let config: [String: Any]
    private var debugMode = false
    /// Tracks the consent state. Sentry has no fine-grained per-event consent gate,
    /// so we close the SDK when consent is revoked (see `setConsent`).
    private var consentGranted = true

    init(config: [String: Any]) {
        self.config = config
        self.isEnabled = config["enabled"] as? Bool ?? true
        self.isInitialized = false

        guard let dsn = config["dsn"] as? String, !dsn.isEmpty else {
            // No DSN -> cannot start Sentry. Leave uninitialized.
            print("[SentryProvider] No DSN provided; Sentry not started.")
            return
        }

        let environment = config["environment"] as? String
        let release = config["release"] as? String

        // NOTE(unverified): build with Xcode — confirm the `SentrySDK.start { options in ... }`
        // closure-config API and the `options.dsn` / `options.environment` /
        // `options.releaseName` / `options.debug` property names in sentry-cocoa ~8.42.
        SentrySDK.start { options in
            options.dsn = dsn
            if let environment = environment {
                options.environment = environment
            }
            if let release = release {
                options.releaseName = release
            }
            options.debug = false
        }

        self.isInitialized = true
    }

    func logError(_ error: Error, context: [String: Any]) {
        guard isEnabled && isInitialized && consentGranted else { return }
        // NOTE(unverified): build with Xcode — confirm `SentrySDK.capture(error:block:)`
        // with a `Scope` closure and `scope.setExtra(value:key:)` argument labels in
        // sentry-cocoa ~8.42.
        SentrySDK.capture(error: error) { scope in
            for (key, value) in context {
                scope.setExtra(value: value, key: key)
            }
        }
    }

    func setUserContext(_ userId: String, properties: [String: Any]) {
        guard isEnabled && isInitialized else { return }
        // NOTE(unverified): build with Xcode — confirm `Sentry.User(userId:)` initializer
        // and the `.data` property name in sentry-cocoa ~8.42 (the SDK's user model is
        // `Sentry.User`, qualified here to avoid any name collision).
        let user = Sentry.User(userId: userId)
        if !properties.isEmpty {
            user.data = properties
        }
        SentrySDK.setUser(user)
    }

    func setConsent(_ granted: Bool) {
        consentGranted = granted
        // NOTE: sentry-cocoa has no per-event opt-out switch. When consent is revoked
        // we close the SDK (stops all delivery). It cannot be re-opened without
        // re-running `init`/`SentrySDK.start`, so re-granting consent at runtime would
        // require re-initializing the provider — a documented limitation.
        if !granted {
            SentrySDK.close()
        }
    }

    func reset() {
        SentrySDK.setUser(nil)
    }

    func setDebugMode(_ enabled: Bool) {
        // Sentry debug logging is fixed at SDK start (`options.debug`). We retain the
        // flag here for parity; flipping it at runtime is not supported by the SDK.
        debugMode = enabled
    }
}
