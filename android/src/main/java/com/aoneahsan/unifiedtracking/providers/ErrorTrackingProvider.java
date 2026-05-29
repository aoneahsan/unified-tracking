package com.aoneahsan.unifiedtracking.providers;

import java.util.Map;

public interface ErrorTrackingProvider {
    String getName();
    boolean isEnabled();
    boolean isInitialized();
    void logError(Exception error, Map<String, Object> context);
    void setUserContext(String userId, Map<String, Object> properties);
    void setConsent(boolean granted);
    void reset();
    void setDebugMode(boolean enabled);
}