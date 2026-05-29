import Foundation
import Capacitor

@objc(UnifiedTrackingPlugin)
public class UnifiedTrackingPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "UnifiedTrackingPlugin"
    public let jsName = "UnifiedTracking"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "initialize", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "track", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "identify", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setUserProperties", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "logError", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "logRevenue", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "logScreenView", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setConsent", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "reset", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getActiveProviders", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "enableDebugMode", returnType: CAPPluginReturnPromise)
    ]
    
    private let implementation = UnifiedTracking()
    private var providerManager: ProviderManager?
    private var initialized = false
    
    override public func load() {
        super.load()
        providerManager = ProviderManager()
    }
    
    @objc func initialize(_ call: CAPPluginCall) {
        guard let providerManager = providerManager else {
            call.reject("Provider manager not initialized")
            return
        }

        // JS UnifiedTrackingConfig shape (top-level call options):
        //   { analytics: { providers: [ids], <id>: { ... } },
        //     errorTracking: { providers: [ids], <id>: { ... } },
        //     settings: { debug?, defaultConsent? }, autoDetect? }
        // Presence of an id in the `providers` array means "enabled" — there is no
        // per-provider `enabled` flag in the JS schema.
        if let analytics = call.getObject("analytics") {
            initializeAnalyticsProviders(analytics, manager: providerManager)
        }
        if let errorTracking = call.getObject("errorTracking") {
            initializeErrorTrackingProviders(errorTracking, manager: providerManager)
        }
        if let settings = call.getObject("settings") {
            if (settings["debug"] as? Bool) == true {
                providerManager.setDebugMode(true)
            }
            if let defaultConsent = settings["defaultConsent"] as? [String: Any] {
                let a = (defaultConsent["analytics"] as? Bool) ?? true
                let e = (defaultConsent["errorTracking"] as? Bool) ?? true
                let p = (defaultConsent["personalization"] as? Bool) ?? true
                providerManager.setConsent(analytics: a, errorTracking: e, personalization: p)
            }
        }

        initialized = true

        let activeProviders = providerManager.getActiveProviders()
        call.resolve([
            "success": true,
            "activeProviders": activeProviders
        ])
    }
    
    @objc func track(_ call: CAPPluginCall) {
        guard ensureInitialized(call) else { return }
        
        guard let event = call.getString("event") else {
            call.reject("Event name is required")
            return
        }
        
        let properties = call.getObject("properties") ?? [:]
        
        providerManager?.trackEvent(event, properties: properties)
        call.resolve()
    }
    
    @objc func identify(_ call: CAPPluginCall) {
        guard ensureInitialized(call) else { return }
        
        guard let userId = call.getString("userId") else {
            call.reject("User ID is required")
            return
        }
        
        let traits = call.getObject("traits") ?? [:]
        
        providerManager?.identifyUser(userId, traits: traits)
        call.resolve()
    }
    
    @objc func setUserProperties(_ call: CAPPluginCall) {
        guard ensureInitialized(call) else { return }
        
        guard let properties = call.getObject("properties") else {
            call.reject("Properties are required")
            return
        }
        
        providerManager?.setUserProperties(properties)
        call.resolve()
    }
    
    @objc func logError(_ call: CAPPluginCall) {
        guard ensureInitialized(call) else { return }
        
        guard let errorMessage = call.getString("error") else {
            call.reject("Error message is required")
            return
        }
        
        let context = call.getObject("context") ?? [:]
        let error = NSError(domain: "UnifiedTracking", code: 0, userInfo: ["message": errorMessage])
        
        providerManager?.logError(error, context: context)
        call.resolve()
    }
    
    @objc func logRevenue(_ call: CAPPluginCall) {
        guard ensureInitialized(call) else { return }
        
        guard let amount = call.getDouble("amount") else {
            call.reject("Amount is required")
            return
        }
        
        let currency = call.getString("currency") ?? "USD"
        let productId = call.getString("productId")
        let quantity = call.getInt("quantity") ?? 1
        let properties = call.getObject("properties") ?? [:]
        
        providerManager?.logRevenue(amount: amount, currency: currency, 
                                   productId: productId, quantity: quantity, 
                                   properties: properties)
        call.resolve()
    }
    
    @objc func logScreenView(_ call: CAPPluginCall) {
        guard ensureInitialized(call) else { return }
        
        guard let screenName = call.getString("screenName") else {
            call.reject("Screen name is required")
            return
        }
        
        let properties = call.getObject("properties") ?? [:]
        
        providerManager?.logScreenView(screenName, properties: properties)
        call.resolve()
    }
    
    @objc func setConsent(_ call: CAPPluginCall) {
        guard let consent = call.getObject("consent") else {
            call.reject("Consent settings are required")
            return
        }
        
        let analytics = consent["analytics"] as? Bool ?? true
        let errorTracking = consent["errorTracking"] as? Bool ?? true
        let personalization = consent["personalization"] as? Bool ?? true
        
        providerManager?.setConsent(analytics: analytics, errorTracking: errorTracking, 
                                   personalization: personalization)
        call.resolve()
    }
    
    @objc func reset(_ call: CAPPluginCall) {
        providerManager?.reset()
        call.resolve()
    }
    
    @objc func getActiveProviders(_ call: CAPPluginCall) {
        let activeProviders = providerManager?.getActiveProviders() ?? [:]
        call.resolve(activeProviders)
    }
    
    @objc func enableDebugMode(_ call: CAPPluginCall) {
        let enabled = call.getBool("enabled") ?? false
        providerManager?.setDebugMode(enabled)
        call.resolve()
    }
    
    private func ensureInitialized(_ call: CAPPluginCall) -> Bool {
        if !initialized {
            call.reject("UnifiedTracking not initialized. Call initialize() first.")
            return false
        }
        return true
    }
    
    private func initializeAnalyticsProviders(_ analytics: [String: Any], manager: ProviderManager) {
        guard let providerIds = analytics["providers"] as? [String] else { return }
        for id in providerIds {
            let providerConfig = (analytics[id] as? [String: Any]) ?? [:]
            switch id {
            case "google":
                // JS provider id "google" = GA4. On native, GA4 IS Firebase Analytics —
                // route through FirebaseAnalyticsProvider (host app supplies GoogleService-Info.plist).
                manager.addAnalyticsProvider(FirebaseAnalyticsProvider(config: providerConfig))
            case "firebase":
                manager.addAnalyticsProvider(FirebaseAnalyticsProvider(config: providerConfig))
            case "mixpanel":
                manager.addAnalyticsProvider(MixpanelProvider(config: providerConfig))
            case "amplitude":
                manager.addAnalyticsProvider(AmplitudeProvider(config: providerConfig))
            case "segment":
                manager.addAnalyticsProvider(SegmentProvider(config: providerConfig))
            default:
                // posthog/heap/matomo are not natively scaffolded — web-only via the JS core.
                print("Analytics provider '\(id)' has no native implementation (web-only); skipped on native.")
            }
        }
    }

    private func initializeErrorTrackingProviders(_ errorTracking: [String: Any], manager: ProviderManager) {
        guard let providerIds = errorTracking["providers"] as? [String] else { return }
        for id in providerIds {
            let providerConfig = (errorTracking[id] as? [String: Any]) ?? [:]
            switch id {
            case "sentry":
                manager.addErrorTrackingProvider(SentryProvider(config: providerConfig))
            case "bugsnag":
                manager.addErrorTrackingProvider(BugsnagProvider(config: providerConfig))
            case "crashlytics":
                // Intentional stub on native — see round04-native-overview.md (the
                // @capacitor-firebase/crashlytics wrapper is BANNED). Use Sentry.
                manager.addErrorTrackingProvider(CrashlyticsProvider(config: providerConfig))
            case "rollbar":
                manager.addErrorTrackingProvider(RollbarProvider(config: providerConfig))
            default:
                // datadog/logrocket/raygun/appcenter — not natively scaffolded.
                print("Error provider '\(id)' has no native implementation (web-only); skipped on native.")
            }
        }
    }
}