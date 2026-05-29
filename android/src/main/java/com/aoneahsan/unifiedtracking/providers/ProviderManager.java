package com.aoneahsan.unifiedtracking.providers;

import android.content.Context;
import android.util.Log;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class ProviderManager {
    private static final String TAG = "ProviderManager";
    private final Context context;
    private final List<AnalyticsProvider> analyticsProviders;
    private final List<ErrorTrackingProvider> errorTrackingProviders;
    private boolean debugMode = false;

    public ProviderManager(Context context) {
        this.context = context;
        this.analyticsProviders = new ArrayList<>();
        this.errorTrackingProviders = new ArrayList<>();
    }

    public void addAnalyticsProvider(AnalyticsProvider provider) {
        if (provider == null) {
            return;
        }
        analyticsProviders.add(provider);
        if (debugMode) {
            Log.d(TAG, "Added analytics provider: " + provider.getName());
        }
    }

    public void addErrorTrackingProvider(ErrorTrackingProvider provider) {
        if (provider == null) {
            return;
        }
        errorTrackingProviders.add(provider);
        if (debugMode) {
            Log.d(TAG, "Added error tracking provider: " + provider.getName());
        }
    }

    public void trackEvent(String event, Map<String, Object> properties) {
        for (AnalyticsProvider provider : analyticsProviders) {
            try {
                provider.trackEvent(event, properties);
            } catch (Exception e) {
                Log.e(TAG, "Failed to track event with " + provider.getName(), e);
            }
        }
    }

    public void identifyUser(String userId, Map<String, Object> traits) {
        for (AnalyticsProvider provider : analyticsProviders) {
            try {
                provider.identifyUser(userId, traits);
            } catch (Exception e) {
                Log.e(TAG, "Failed to identify user with " + provider.getName(), e);
            }
        }
    }

    public void setUserProperties(Map<String, Object> properties) {
        for (AnalyticsProvider provider : analyticsProviders) {
            try {
                provider.setUserProperties(properties);
            } catch (Exception e) {
                Log.e(TAG, "Failed to set user properties with " + provider.getName(), e);
            }
        }
    }

    public void logError(Exception error, Map<String, Object> context) {
        for (ErrorTrackingProvider provider : errorTrackingProviders) {
            try {
                provider.logError(error, context);
            } catch (Exception e) {
                Log.e(TAG, "Failed to log error with " + provider.getName(), e);
            }
        }
    }

    public void setUserContext(String userId, Map<String, Object> properties) {
        for (ErrorTrackingProvider provider : errorTrackingProviders) {
            try {
                provider.setUserContext(userId, properties);
            } catch (Exception e) {
                Log.e(TAG, "Failed to set user context with " + provider.getName(), e);
            }
        }
    }

    public void logRevenue(double amount, String currency, String productId, int quantity, Map<String, Object> properties) {
        for (AnalyticsProvider provider : analyticsProviders) {
            try {
                provider.logRevenue(amount, currency, productId, quantity, properties);
            } catch (Exception e) {
                Log.e(TAG, "Failed to log revenue with " + provider.getName(), e);
            }
        }
    }

    public void logScreenView(String screenName, Map<String, Object> properties) {
        for (AnalyticsProvider provider : analyticsProviders) {
            try {
                provider.logScreenView(screenName, properties);
            } catch (Exception e) {
                Log.e(TAG, "Failed to log screen view with " + provider.getName(), e);
            }
        }
    }

    public void setConsent(boolean analytics, boolean errorTracking, boolean personalization) {
        for (AnalyticsProvider provider : analyticsProviders) {
            try {
                provider.setConsent(analytics);
            } catch (Exception e) {
                Log.e(TAG, "Failed to set consent for " + provider.getName(), e);
            }
        }
        
        for (ErrorTrackingProvider provider : errorTrackingProviders) {
            try {
                provider.setConsent(errorTracking);
            } catch (Exception e) {
                Log.e(TAG, "Failed to set consent for " + provider.getName(), e);
            }
        }
    }

    public void reset() {
        for (AnalyticsProvider provider : analyticsProviders) {
            try {
                provider.reset();
            } catch (Exception e) {
                Log.e(TAG, "Failed to reset " + provider.getName(), e);
            }
        }
        
        for (ErrorTrackingProvider provider : errorTrackingProviders) {
            try {
                provider.reset();
            } catch (Exception e) {
                Log.e(TAG, "Failed to reset " + provider.getName(), e);
            }
        }
    }

    /**
     * Returns the names of providers that are both enabled and initialized,
     * grouped by category: { analytics: [names], errorTracking: [names] }.
     */
    public JSObject getActiveProviders() {
        JSObject result = new JSObject();

        JSArray analyticsArray = new JSArray();
        for (AnalyticsProvider provider : analyticsProviders) {
            if (provider != null && provider.isEnabled() && provider.isInitialized()) {
                analyticsArray.put(provider.getName());
            }
        }

        JSArray errorTrackingArray = new JSArray();
        for (ErrorTrackingProvider provider : errorTrackingProviders) {
            if (provider != null && provider.isEnabled() && provider.isInitialized()) {
                errorTrackingArray.put(provider.getName());
            }
        }

        result.put("analytics", analyticsArray);
        result.put("errorTracking", errorTrackingArray);

        return result;
    }

    public void setDebugMode(boolean enabled) {
        this.debugMode = enabled;
        
        for (AnalyticsProvider provider : analyticsProviders) {
            try {
                provider.setDebugMode(enabled);
            } catch (Exception e) {
                Log.e(TAG, "Failed to set debug mode for " + provider.getName(), e);
            }
        }
        
        for (ErrorTrackingProvider provider : errorTrackingProviders) {
            try {
                provider.setDebugMode(enabled);
            } catch (Exception e) {
                Log.e(TAG, "Failed to set debug mode for " + provider.getName(), e);
            }
        }
    }
}