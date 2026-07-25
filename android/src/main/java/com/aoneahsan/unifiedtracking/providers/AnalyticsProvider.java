package com.aoneahsan.unifiedtracking.providers;

import java.util.Map;

public interface AnalyticsProvider {
    String getName();
    boolean isEnabled();
    boolean isInitialized();
    void trackEvent(String event, Map<String, Object> properties);
    void identifyUser(String userId, Map<String, Object> traits);
    void setUserProperties(Map<String, Object> properties);
    void logRevenue(double amount, String currency, String productId, int quantity, Map<String, Object> properties);
    void logScreenView(String screenName, Map<String, Object> properties);
    void setConsent(boolean granted);
    void reset();
    void setDebugMode(boolean enabled);
}
