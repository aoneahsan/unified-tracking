import Foundation

/// Orchestrates the registered analytics + error-tracking providers and fans out
/// every tracking call to the matching set. All calls are defensive: a provider
/// only receives a call when it is both enabled and initialized.
///
/// Thread-safety: calls are kept synchronous and are expected to run on the main
/// thread (Capacitor dispatches plugin calls on the main queue). The underlying
/// SDKs (Firebase Analytics, Sentry) are safe to call from the main thread for
/// the operations used here.
class ProviderManager {
    private var analyticsProviders: [AnalyticsProvider] = []
    private var errorTrackingProviders: [ErrorTrackingProvider] = []
    private var debugMode = false

    // MARK: - Registration

    func addAnalyticsProvider(_ provider: AnalyticsProvider) {
        analyticsProviders.append(provider)
        // Propagate the current debug flag so providers added after enableDebugMode()
        // still honour it.
        provider.setDebugMode(debugMode)
        if debugMode {
            print("[ProviderManager] Added analytics provider: \(provider.name)")
        }
    }

    func addErrorTrackingProvider(_ provider: ErrorTrackingProvider) {
        errorTrackingProviders.append(provider)
        provider.setDebugMode(debugMode)
        if debugMode {
            print("[ProviderManager] Added error tracking provider: \(provider.name)")
        }
    }

    // MARK: - Analytics fan-out

    func trackEvent(_ event: String, properties: [String: Any]) {
        for provider in activeAnalyticsProviders {
            provider.trackEvent(event, properties: properties)
        }
    }

    /// Routes an identify call to analytics providers (`identifyUser`) AND to
    /// error-tracking providers (`setUserContext`) so error reports are attributed
    /// to the same user. The plugin only exposes `identify`, so this is the single
    /// entry point that keeps both sides in sync.
    func identifyUser(_ userId: String, traits: [String: Any]) {
        for provider in activeAnalyticsProviders {
            provider.identifyUser(userId, traits: traits)
        }
        for provider in activeErrorTrackingProviders {
            provider.setUserContext(userId, properties: traits)
        }
    }

    func setUserProperties(_ properties: [String: Any]) {
        for provider in activeAnalyticsProviders {
            provider.setUserProperties(properties)
        }
    }

    func logRevenue(amount: Double, currency: String, productId: String?, quantity: Int, properties: [String: Any]) {
        for provider in activeAnalyticsProviders {
            provider.logRevenue(amount: amount, currency: currency, productId: productId,
                                 quantity: quantity, properties: properties)
        }
    }

    func logScreenView(_ screenName: String, properties: [String: Any]) {
        for provider in activeAnalyticsProviders {
            provider.logScreenView(screenName, properties: properties)
        }
    }

    // MARK: - Error tracking fan-out

    func logError(_ error: Error, context: [String: Any]) {
        for provider in activeErrorTrackingProviders {
            provider.logError(error, context: context)
        }
    }

    // MARK: - Consent / lifecycle (apply to ALL registered providers, regardless of
    // current enabled/initialized state — consent must be able to flip a provider on
    // or off, and reset must run even when disabled).

    /// Routes analytics consent to analytics providers and error-tracking consent to
    /// error providers. `personalization` is accepted for parity with the JS API but
    /// has no distinct native channel today; analytics providers gate personalization
    /// internally via their own consent flag.
    func setConsent(analytics: Bool, errorTracking: Bool, personalization: Bool) {
        for provider in analyticsProviders {
            provider.setConsent(analytics)
        }
        for provider in errorTrackingProviders {
            provider.setConsent(errorTracking)
        }
    }

    func reset() {
        for provider in analyticsProviders {
            provider.reset()
        }
        for provider in errorTrackingProviders {
            provider.reset()
        }
    }

    func setDebugMode(_ enabled: Bool) {
        debugMode = enabled
        for provider in analyticsProviders {
            provider.setDebugMode(enabled)
        }
        for provider in errorTrackingProviders {
            provider.setDebugMode(enabled)
        }
    }

    // MARK: - Introspection

    /// Returns only the providers that are currently enabled AND initialized, as
    /// flat name arrays: `{ "analytics": [names...], "errorTracking": [names...] }`.
    func getActiveProviders() -> [String: Any] {
        return [
            "analytics": activeAnalyticsProviders.map { $0.name },
            "errorTracking": activeErrorTrackingProviders.map { $0.name }
        ]
    }

    // MARK: - Private helpers

    private var activeAnalyticsProviders: [AnalyticsProvider] {
        analyticsProviders.filter { $0.isEnabled && $0.isInitialized }
    }

    private var activeErrorTrackingProviders: [ErrorTrackingProvider] {
        errorTrackingProviders.filter { $0.isEnabled && $0.isInitialized }
    }
}
