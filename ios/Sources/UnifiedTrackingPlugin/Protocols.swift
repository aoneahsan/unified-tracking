import Foundation

protocol AnalyticsProvider {
    var name: String { get }
    var isEnabled: Bool { get }
    var isInitialized: Bool { get }
    
    func trackEvent(_ event: String, properties: [String: Any])
    func identifyUser(_ userId: String, traits: [String: Any])
    func setUserProperties(_ properties: [String: Any])
    func logRevenue(amount: Double, currency: String, productId: String?, quantity: Int, properties: [String: Any])
    func logScreenView(_ screenName: String, properties: [String: Any])
    func setConsent(_ granted: Bool)
    func reset()
    func setDebugMode(_ enabled: Bool)
}

protocol ErrorTrackingProvider {
    var name: String { get }
    var isEnabled: Bool { get }
    var isInitialized: Bool { get }
    
    func logError(_ error: Error, context: [String: Any])
    func setUserContext(_ userId: String, properties: [String: Any])
    func setConsent(_ granted: Bool)
    func reset()
    func setDebugMode(_ enabled: Bool)
}