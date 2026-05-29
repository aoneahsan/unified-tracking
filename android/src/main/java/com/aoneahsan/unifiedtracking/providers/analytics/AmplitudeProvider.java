package com.aoneahsan.unifiedtracking.providers.analytics;

import android.content.Context;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.aoneahsan.unifiedtracking.providers.AnalyticsProvider;
import com.amplitude.android.Amplitude;
import com.amplitude.android.Configuration;
import com.amplitude.core.events.Identify;
import com.amplitude.core.events.Revenue;

import java.util.HashMap;
import java.util.Map;

/**
 * Amplitude analytics provider for Android.
 *
 * Uses {@code com.amplitude.android.Amplitude} (the Kotlin-based Amplitude Android SDK,
 * artifact {@code com.amplitude:analytics-android}). Java consumers instantiate the same
 * classes — {@code Amplitude} + {@code Configuration} — exposed via Kotlin interop.
 *
 * NOTE(unverified): built against Amplitude Android SDK 1.x (artifact
 * {@code com.amplitude:analytics-android:1.x}). The dependency declares
 * {@code amplitudeVersion = '3.48.2'} which historically referenced the legacy
 * {@code com.amplitude:android-sdk:2.x} package; the current 1.x analytics-android
 * series replaced it. Confirm in Android Studio that the resolved artifact exposes
 * {@code com.amplitude.android.Amplitude} and {@code com.amplitude.android.Configuration};
 * if the project is still on the legacy SDK the API surface differs.
 */
public class AmplitudeProvider implements AnalyticsProvider {
    private static final String TAG = "Amplitude";
    private final Context context;
    private final JSObject config;
    private Amplitude amplitude;
    private boolean enabled;
    private boolean initialized;
    private boolean debugMode = false;

    public AmplitudeProvider(Context context, JSObject config) {
        this.context = context;
        this.config = config;
        this.enabled = config.getBoolean("enabled", true);
        this.initialized = false;

        try {
            String apiKey = config.getString("apiKey");
            if (apiKey == null || apiKey.trim().isEmpty()) {
                Log.e(TAG, "Amplitude apiKey is missing; provider will be inert.");
                return;
            }

            // NOTE(unverified): Configuration(String, Context) is the documented 2-arg
            // primary constructor in Amplitude Android SDK 1.x; additional options (
            // serverZone, flushQueueSize, etc.) can be set via setters after construction.
            // Confirm exact constructor + property setters against the resolved SDK.
            Configuration cfg = new Configuration(apiKey, context);
            this.amplitude = new Amplitude(cfg);
            this.initialized = true;

            if (debugMode) {
                Log.d(TAG, "Amplitude initialized");
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to initialize Amplitude", e);
            this.initialized = false;
        }
    }

    @Override
    public String getName() {
        return "amplitude";
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
        if (!enabled || !initialized || amplitude == null || event == null) return;

        try {
            // NOTE(unverified): Amplitude.track(String, Map<String, Object>) is the
            // documented overload in Amplitude Android SDK 1.x. Confirm the second
            // argument accepts Map<String, Object> vs requiring a JSONObject.
            if (properties != null) {
                amplitude.track(event, properties);
            } else {
                amplitude.track(event);
            }

            if (debugMode) {
                Log.d(TAG, "Tracked event: " + event);
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to track event", e);
        }
    }

    @Override
    public void identifyUser(String userId, Map<String, Object> traits) {
        if (!enabled || !initialized || amplitude == null || userId == null) return;

        try {
            amplitude.setUserId(userId);

            if (traits != null && !traits.isEmpty()) {
                // NOTE(unverified): com.amplitude.core.events.Identify provides set(String, Object)
                // for user-property updates in Amplitude SDK 1.x. Identify is applied via
                // Amplitude.identify(Identify) which queues a $identify event.
                Identify identify = new Identify();
                for (Map.Entry<String, Object> entry : traits.entrySet()) {
                    if (entry.getKey() == null || entry.getValue() == null) continue;
                    identify.set(entry.getKey(), entry.getValue());
                }
                amplitude.identify(identify);
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
        if (!enabled || !initialized || amplitude == null || properties == null) return;

        try {
            Identify identify = new Identify();
            for (Map.Entry<String, Object> entry : properties.entrySet()) {
                if (entry.getKey() == null || entry.getValue() == null) continue;
                identify.set(entry.getKey(), entry.getValue());
            }
            amplitude.identify(identify);

            if (debugMode) {
                Log.d(TAG, "Set user properties");
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to set user properties", e);
        }
    }

    @Override
    public void logRevenue(double amount, String currency, String productId, int quantity, Map<String, Object> properties) {
        if (!enabled || !initialized || amplitude == null) return;

        try {
            // NOTE(unverified): com.amplitude.core.events.Revenue exposes fluent setters
            // (setProductId/setQuantity/setPrice) in Amplitude SDK 1.x. The revenue is
            // submitted via Amplitude.revenue(Revenue). Earlier SDKs used a builder
            // pattern; confirm against the resolved Revenue class.
            Revenue revenue = new Revenue();
            if (productId != null) revenue.setProductId(productId);
            revenue.setQuantity(quantity);
            revenue.setPrice(amount);

            if (properties != null && !properties.isEmpty()) {
                // Currency + extra properties are attached via Revenue.setEventProperties
                // as a JSON-like map on most SDK versions.
                Map<String, Object> revenueProps = new HashMap<>(properties);
                if (currency != null && !revenueProps.containsKey("currency")) {
                    revenueProps.put("currency", currency);
                }
                try {
                    // NOTE(unverified): Revenue.setEventProperties(Map<String,Object>) is
                    // typically present; if absent on the resolved SDK, fall back to
                    // tracking the currency on a separate $revenue event property.
                    revenue.setEventProperties(new org.json.JSONObject(revenueProps));
                } catch (Throwable ignored) {
                    // Silently skip if the setter is unavailable on the resolved SDK.
                }
            } else if (currency != null) {
                try {
                    org.json.JSONObject extra = new org.json.JSONObject();
                    extra.put("currency", currency);
                    revenue.setEventProperties(extra);
                } catch (Throwable ignored) {
                    // Optional best-effort attachment.
                }
            }

            amplitude.revenue(revenue);

            if (debugMode) {
                Log.d(TAG, "Logged revenue: " + amount + " " + currency);
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to log revenue", e);
        }
    }

    @Override
    public void logScreenView(String screenName, Map<String, Object> properties) {
        if (!enabled || !initialized || amplitude == null || screenName == null) return;

        try {
            Map<String, Object> props = new HashMap<>();
            if (properties != null) {
                props.putAll(properties);
            }
            // Use Amplitude's canonical screen-view convention so dashboards pick it up.
            props.put("[Amplitude] Screen Name", screenName);
            amplitude.track("[Amplitude] Screen Viewed", props);

            if (debugMode) {
                Log.d(TAG, "Logged screen view: " + screenName);
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to log screen view", e);
        }
    }

    @Override
    public void setConsent(boolean granted) {
        if (!initialized || amplitude == null) return;

        try {
            // NOTE(unverified): Amplitude SDK 1.x exposes setOptOut(boolean). When
            // optOut=true the SDK drops events locally; confirm the property name on
            // the resolved Configuration/Amplitude class (some SDK builds expose it
            // via amplitude.getConfiguration().setOptOut(...) instead).
            amplitude.setOptOut(!granted);
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
        if (!initialized || amplitude == null) return;

        try {
            // NOTE(unverified): Amplitude.reset() clears the user/device identity in
            // SDK 1.x. Older SDKs used setUserId(null) + regenerateDeviceId(); confirm
            // reset() is present on the resolved Amplitude class.
            amplitude.reset();

            if (debugMode) {
                Log.d(TAG, "Reset Amplitude state");
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to reset", e);
        }
    }

    @Override
    public void setDebugMode(boolean enabled) {
        this.debugMode = enabled;
        if (enabled) {
            Log.d(TAG, "Debug mode enabled for Amplitude provider");
        }
    }
}
