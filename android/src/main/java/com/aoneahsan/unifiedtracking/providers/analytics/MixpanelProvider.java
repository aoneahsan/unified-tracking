package com.aoneahsan.unifiedtracking.providers.analytics;

import android.content.Context;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.aoneahsan.unifiedtracking.providers.AnalyticsProvider;
import com.mixpanel.android.mpmetrics.MixpanelAPI;

import org.json.JSONObject;

import java.util.Map;

/**
 * Mixpanel analytics provider for Android.
 *
 * Uses {@code com.mixpanel.android.mpmetrics.MixpanelAPI} as the SDK entry point.
 * The SDK is instantiated via {@code MixpanelAPI.getInstance(context, token, trackAutomaticEvents)}
 * which is the documented factory in Mixpanel Android SDK 7.x.
 *
 * NOTE(unverified): built against the Mixpanel Android SDK 7.5.x API. Confirm exact
 * signatures (MixpanelAPI.getInstance overloads, People.set/trackCharge, optInTracking/
 * optOutTracking) in Android Studio against the resolved SDK version.
 */
public class MixpanelProvider implements AnalyticsProvider {
    private static final String TAG = "Mixpanel";
    private final Context context;
    private final JSObject config;
    private MixpanelAPI mixpanel;
    private boolean enabled;
    private boolean initialized;
    private boolean debugMode = false;

    public MixpanelProvider(Context context, JSObject config) {
        this.context = context;
        this.config = config;
        this.enabled = config.getBoolean("enabled", true);
        this.initialized = false;

        try {
            String token = config.getString("token");
            if (token == null || token.trim().isEmpty()) {
                Log.e(TAG, "Mixpanel token is missing; provider will be inert.");
                return;
            }

            // NOTE(unverified): MixpanelAPI.getInstance(Context, String, boolean) is the
            // current 3-arg factory in Mixpanel Android SDK 7.x. The third arg disables
            // automatic event tracking so only events from this provider are reported.
            this.mixpanel = MixpanelAPI.getInstance(context, token, false);
            if (this.mixpanel == null) {
                Log.e(TAG, "MixpanelAPI.getInstance returned null; provider will be inert.");
                return;
            }
            this.initialized = true;

            if (debugMode) {
                Log.d(TAG, "Mixpanel initialized");
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to initialize Mixpanel", e);
            this.initialized = false;
        }
    }

    @Override
    public String getName() {
        return "mixpanel";
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
        if (!enabled || !initialized || mixpanel == null || event == null) return;

        try {
            JSONObject props = mapToJson(properties);
            mixpanel.track(event, props);

            if (debugMode) {
                Log.d(TAG, "Tracked event: " + event);
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to track event", e);
        }
    }

    @Override
    public void identifyUser(String userId, Map<String, Object> traits) {
        if (!enabled || !initialized || mixpanel == null || userId == null) return;

        try {
            // NOTE(unverified): MixpanelAPI.identify(String) replaced the legacy
            // identify(String, boolean) overload in Mixpanel Android SDK 6.x+. Confirm
            // the no-second-arg form is correct in the resolved SDK.
            mixpanel.identify(userId);

            if (traits != null && !traits.isEmpty()) {
                JSONObject traitsJson = mapToJson(traits);
                mixpanel.getPeople().set(traitsJson);
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
        if (!enabled || !initialized || mixpanel == null || properties == null) return;

        try {
            JSONObject props = mapToJson(properties);
            mixpanel.getPeople().set(props);

            if (debugMode) {
                Log.d(TAG, "Set user properties");
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to set user properties", e);
        }
    }

    @Override
    public void logRevenue(double amount, String currency, String productId, int quantity, Map<String, Object> properties) {
        if (!enabled || !initialized || mixpanel == null) return;

        try {
            JSONObject revenueProps = new JSONObject();
            if (currency != null) revenueProps.put("currency", currency);
            if (productId != null) revenueProps.put("productId", productId);
            revenueProps.put("quantity", quantity);

            if (properties != null) {
                for (Map.Entry<String, Object> entry : properties.entrySet()) {
                    if (entry.getValue() == null) continue;
                    revenueProps.put(entry.getKey(), entry.getValue());
                }
            }

            // NOTE(unverified): People.trackCharge(double, JSONObject) is the documented
            // revenue API in Mixpanel Android SDK 7.x. Older SDKs used trackCharge with
            // a Map; confirm in Android Studio.
            mixpanel.getPeople().trackCharge(amount, revenueProps);

            if (debugMode) {
                Log.d(TAG, "Logged revenue: " + amount + " " + currency);
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to log revenue", e);
        }
    }

    @Override
    public void logScreenView(String screenName, Map<String, Object> properties) {
        if (!enabled || !initialized || mixpanel == null || screenName == null) return;

        try {
            JSONObject props = mapToJson(properties);
            props.put("screen", screenName);
            mixpanel.track("Screen View", props);

            if (debugMode) {
                Log.d(TAG, "Logged screen view: " + screenName);
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to log screen view", e);
        }
    }

    @Override
    public void setConsent(boolean granted) {
        if (!initialized || mixpanel == null) return;

        try {
            if (granted) {
                // NOTE(unverified): optInTracking() / optOutTracking() are the documented
                // consent toggles in Mixpanel Android SDK 7.x. optInTracking has overloads
                // that take a distinct id + properties; the no-arg form is the simplest.
                mixpanel.optInTracking();
            } else {
                mixpanel.optOutTracking();
            }
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
        if (!initialized || mixpanel == null) return;

        try {
            mixpanel.reset();

            if (debugMode) {
                Log.d(TAG, "Reset Mixpanel state");
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to reset", e);
        }
    }

    @Override
    public void setDebugMode(boolean enabled) {
        this.debugMode = enabled;
        if (enabled) {
            Log.d(TAG, "Debug mode enabled for Mixpanel provider");
        }
    }

    private JSONObject mapToJson(Map<String, Object> map) {
        JSONObject json = new JSONObject();
        if (map == null) return json;

        for (Map.Entry<String, Object> entry : map.entrySet()) {
            if (entry.getKey() == null || entry.getValue() == null) continue;
            try {
                json.put(entry.getKey(), entry.getValue());
            } catch (Exception e) {
                // Fall back to string representation if JSONObject.put rejects the value.
                try {
                    json.put(entry.getKey(), String.valueOf(entry.getValue()));
                } catch (Exception ignored) {
                    // Skip unserializable entries.
                }
            }
        }
        return json;
    }
}
