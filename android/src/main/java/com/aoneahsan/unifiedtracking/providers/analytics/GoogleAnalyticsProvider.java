package com.aoneahsan.unifiedtracking.providers.analytics;

import android.content.Context;
import android.util.Log;
import com.aoneahsan.unifiedtracking.providers.AnalyticsProvider;
import com.getcapacitor.JSObject;
import java.util.Map;

public class GoogleAnalyticsProvider implements AnalyticsProvider {

    private static final String TAG = "GoogleAnalytics";
    private Context context;
    private JSObject config;
    private boolean enabled;
    private boolean initialized;
    private boolean debugMode = false;

    public GoogleAnalyticsProvider(Context context, JSObject config) {
        this.context = context;
        this.config = config;
        this.enabled = config.getBoolean("enabled", true);
        this.initialized = true;

        if (debugMode) {
            Log.d(TAG, "Google Analytics provider initialized (stub)");
        }
    }

    @Override
    public String getName() {
        return "google-analytics";
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }

    @Override
    public boolean isInitialized() {
        return initialized;
    }

    @Override
    public void trackEvent(String event, Map<String, Object> properties) {
        if (!enabled || !initialized) return;

        if (debugMode) {
            Log.d(TAG, "trackEvent called with event: " + event + ", properties: " + properties);
        }
    }

    @Override
    public void identifyUser(String userId, Map<String, Object> traits) {
        if (!enabled || !initialized) return;

        if (debugMode) {
            Log.d(TAG, "identifyUser called with userId: " + userId + ", traits: " + traits);
        }
    }

    @Override
    public void setUserProperties(Map<String, Object> properties) {
        if (!enabled || !initialized) return;

        if (debugMode) {
            Log.d(TAG, "setUserProperties called with properties: " + properties);
        }
    }

    @Override
    public void logRevenue(double amount, String currency, String productId, int quantity, Map<String, Object> properties) {
        if (!enabled || !initialized) return;

        if (debugMode) {
            Log.d(
                TAG,
                "logRevenue called with amount: " +
                    amount +
                    ", currency: " +
                    currency +
                    ", productId: " +
                    productId +
                    ", quantity: " +
                    quantity +
                    ", properties: " +
                    properties
            );
        }
    }

    @Override
    public void logScreenView(String screenName, Map<String, Object> properties) {
        if (!enabled || !initialized) return;

        if (debugMode) {
            Log.d(TAG, "logScreenView called with screenName: " + screenName + ", properties: " + properties);
        }
    }

    @Override
    public void setConsent(boolean granted) {
        if (!initialized) return;

        this.enabled = granted;
        if (debugMode) {
            Log.d(TAG, "setConsent called with granted: " + granted);
        }
    }

    @Override
    public void reset() {
        if (!initialized) return;

        if (debugMode) {
            Log.d(TAG, "reset called");
        }
    }

    @Override
    public void setDebugMode(boolean enabled) {
        this.debugMode = enabled;
        if (enabled) {
            Log.d(TAG, "Debug mode enabled for Google Analytics provider");
        }
    }
}
