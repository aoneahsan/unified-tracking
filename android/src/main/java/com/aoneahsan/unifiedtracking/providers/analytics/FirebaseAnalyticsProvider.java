package com.aoneahsan.unifiedtracking.providers.analytics;

import android.content.Context;
import android.os.Bundle;
import android.util.Log;
import com.aoneahsan.unifiedtracking.providers.AnalyticsProvider;
import com.getcapacitor.JSObject;
import com.google.firebase.analytics.FirebaseAnalytics;
import java.util.Map;

public class FirebaseAnalyticsProvider implements AnalyticsProvider {

    private static final String TAG = "FirebaseAnalytics";
    private FirebaseAnalytics analytics;
    private boolean enabled;
    private boolean initialized;
    private boolean debugMode = false;

    public FirebaseAnalyticsProvider(Context context, JSObject config) {
        // NOTE(unverified): FirebaseAnalytics.getInstance(context) requires the host app to
        // ship `google-services.json` and apply the `com.google.gms.google-services` Gradle
        // plugin so FirebaseApp auto-initializes. If FirebaseApp is not initialized this throws
        // and we fall back to initialized=false (provider becomes inert). Confirm in Android Studio.
        try {
            this.analytics = FirebaseAnalytics.getInstance(context);
            this.enabled = config.getBoolean("enabled", true);
            this.initialized = true;

            // Apply configuration
            if (config.has("analyticsCollectionEnabled")) {
                analytics.setAnalyticsCollectionEnabled(config.getBoolean("analyticsCollectionEnabled", true));
            }

            if (config.has("sessionTimeoutDuration")) {
                // NOTE(unverified): setSessionTimeoutDuration expects milliseconds (long). Default 1800000ms = 30min.
                analytics.setSessionTimeoutDuration(config.getInteger("sessionTimeoutDuration", 1800000));
            }

            if (debugMode) {
                Log.d(TAG, "Firebase Analytics initialized");
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to initialize Firebase Analytics", e);
            this.initialized = false;
        }
    }

    @Override
    public String getName() {
        return "firebase";
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

        try {
            Bundle bundle = mapToBundle(properties);
            analytics.logEvent(sanitizeEventName(event), bundle);

            if (debugMode) {
                Log.d(TAG, "Tracked event: " + event);
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to track event", e);
        }
    }

    @Override
    public void identifyUser(String userId, Map<String, Object> traits) {
        if (!enabled || !initialized) return;

        try {
            analytics.setUserId(userId);

            if (traits != null) {
                for (Map.Entry<String, Object> entry : traits.entrySet()) {
                    if (entry.getValue() == null) continue;
                    analytics.setUserProperty(sanitizePropertyName(entry.getKey()), sanitizeUserPropertyValue(entry.getValue()));
                }
            }

            if (debugMode) {
                Log.d(TAG, "Identified user: " + userId);
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to identify user", e);
        }
    }

    @Override
    public void setUserProperties(Map<String, Object> properties) {
        if (!enabled || !initialized || properties == null) return;

        try {
            for (Map.Entry<String, Object> entry : properties.entrySet()) {
                if (entry.getValue() == null) continue;
                analytics.setUserProperty(sanitizePropertyName(entry.getKey()), sanitizeUserPropertyValue(entry.getValue()));
            }

            if (debugMode) {
                Log.d(TAG, "Set user properties");
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to set user properties", e);
        }
    }

    @Override
    public void logRevenue(double amount, String currency, String productId, int quantity, Map<String, Object> properties) {
        if (!enabled || !initialized) return;

        try {
            Bundle bundle = new Bundle();
            bundle.putDouble(FirebaseAnalytics.Param.VALUE, amount);
            bundle.putString(FirebaseAnalytics.Param.CURRENCY, currency);

            if (productId != null) {
                bundle.putString(FirebaseAnalytics.Param.ITEM_ID, productId);
            }

            bundle.putLong(FirebaseAnalytics.Param.QUANTITY, quantity);

            if (properties != null) {
                for (Map.Entry<String, Object> entry : properties.entrySet()) {
                    addToBundle(bundle, entry.getKey(), entry.getValue());
                }
            }

            analytics.logEvent(FirebaseAnalytics.Event.PURCHASE, bundle);

            if (debugMode) {
                Log.d(TAG, "Logged revenue: " + amount + " " + currency);
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to log revenue", e);
        }
    }

    @Override
    public void logScreenView(String screenName, Map<String, Object> properties) {
        if (!enabled || !initialized) return;

        try {
            Bundle bundle = new Bundle();
            bundle.putString(FirebaseAnalytics.Param.SCREEN_NAME, screenName);
            bundle.putString(FirebaseAnalytics.Param.SCREEN_CLASS, screenName);

            if (properties != null) {
                for (Map.Entry<String, Object> entry : properties.entrySet()) {
                    addToBundle(bundle, entry.getKey(), entry.getValue());
                }
            }

            analytics.logEvent(FirebaseAnalytics.Event.SCREEN_VIEW, bundle);

            if (debugMode) {
                Log.d(TAG, "Logged screen view: " + screenName);
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to log screen view", e);
        }
    }

    @Override
    public void setConsent(boolean granted) {
        if (!initialized) return;

        try {
            analytics.setAnalyticsCollectionEnabled(granted);
            this.enabled = granted;

            if (debugMode) {
                Log.d(TAG, "Set consent: " + granted);
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to set consent", e);
        }
    }

    @Override
    public void reset() {
        if (!initialized) return;

        try {
            analytics.resetAnalyticsData();

            if (debugMode) {
                Log.d(TAG, "Reset analytics data");
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to reset", e);
        }
    }

    @Override
    public void setDebugMode(boolean enabled) {
        this.debugMode = enabled;
    }

    private Bundle mapToBundle(Map<String, Object> map) {
        Bundle bundle = new Bundle();

        if (map != null) {
            for (Map.Entry<String, Object> entry : map.entrySet()) {
                addToBundle(bundle, entry.getKey(), entry.getValue());
            }
        }

        return bundle;
    }

    private void addToBundle(Bundle bundle, String key, Object value) {
        String sanitizedKey = sanitizePropertyName(key);

        if (value instanceof String) {
            bundle.putString(sanitizedKey, (String) value);
        } else if (value instanceof Integer) {
            bundle.putInt(sanitizedKey, (Integer) value);
        } else if (value instanceof Long) {
            bundle.putLong(sanitizedKey, (Long) value);
        } else if (value instanceof Double) {
            bundle.putDouble(sanitizedKey, (Double) value);
        } else if (value instanceof Float) {
            bundle.putFloat(sanitizedKey, (Float) value);
        } else if (value instanceof Boolean) {
            bundle.putBoolean(sanitizedKey, (Boolean) value);
        } else {
            bundle.putString(sanitizedKey, String.valueOf(value));
        }
    }

    private String sanitizeEventName(String event) {
        // Firebase event names: <=40 chars, alphanumeric + underscore, must start with a letter.
        return sanitizeName(event, 40);
    }

    private String sanitizePropertyName(String property) {
        // Firebase param/user-property names: <=40 chars, alphanumeric + underscore, must start with a letter.
        return sanitizeName(property, 40);
    }

    private String sanitizeName(String raw, int maxLen) {
        if (raw == null || raw.isEmpty()) {
            return "unnamed";
        }
        String cleaned = raw.replaceAll("[^a-zA-Z0-9_]", "_");
        // Firebase requires the first character to be a letter; prefix if not.
        if (!Character.isLetter(cleaned.charAt(0))) {
            cleaned = "e_" + cleaned;
        }
        if (cleaned.length() > maxLen) {
            cleaned = cleaned.substring(0, maxLen);
        }
        return cleaned;
    }

    private String sanitizeUserPropertyValue(Object value) {
        // Firebase user property values are limited to 36 characters.
        String str = String.valueOf(value);
        if (str.length() > 36) {
            str = str.substring(0, 36);
        }
        return str;
    }
}
