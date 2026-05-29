package com.aoneahsan.unifiedtracking.providers.analytics;

import android.app.Application;
import android.content.Context;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.aoneahsan.unifiedtracking.providers.AnalyticsProvider;
import com.segment.analytics.Analytics;
import com.segment.analytics.Properties;
import com.segment.analytics.Traits;

import java.util.Map;

/**
 * Segment analytics provider for Android.
 *
 * Uses {@code com.segment.analytics.Analytics} from the Segment Analytics-Android SDK
 * (artifact {@code com.segment.analytics.android:analytics}). The SDK is built once
 * via {@code Analytics.Builder(Context, writeKey).build()} and then promoted to the
 * singleton instance via {@code Analytics.setSingletonInstance(...)} so consumer code
 * elsewhere in the app can call {@code Analytics.with(context)}.
 *
 * NOTE(unverified): built against Segment Analytics-Android SDK 4.10.x API. Confirm
 * exact signatures (Builder accepts Context or Application; Properties.putValue vs
 * putAll; Traits.putAll; Analytics.with(context).optOut(boolean); analytics.reset())
 * in Android Studio against the resolved SDK version.
 */
public class SegmentProvider implements AnalyticsProvider {
    private static final String TAG = "Segment";
    private final Context context;
    private final JSObject config;
    private Analytics analytics;
    private boolean enabled;
    private boolean initialized;
    private boolean debugMode = false;

    public SegmentProvider(Context context, JSObject config) {
        this.context = context;
        this.config = config;
        this.enabled = config.getBoolean("enabled", true);
        this.initialized = false;

        try {
            String writeKey = config.getString("writeKey");
            if (writeKey == null || writeKey.trim().isEmpty()) {
                Log.e(TAG, "Segment writeKey is missing; provider will be inert.");
                return;
            }

            // NOTE(unverified): Segment Analytics-Android Builder requires an Application
            // context. We attempt to upcast the provided Context; if it isn't an
            // Application, fall back to context.getApplicationContext() to satisfy the
            // builder's expectation. Confirm Builder signature in Android Studio.
            Application app;
            Context appCtx = context.getApplicationContext();
            if (appCtx instanceof Application) {
                app = (Application) appCtx;
            } else {
                // The Capacitor activity's context should always wrap an Application;
                // if not, the builder may throw — log and bail out cleanly.
                Log.e(TAG, "Segment requires an Application context; provider will be inert.");
                return;
            }

            this.analytics = new Analytics.Builder(app, writeKey).build();
            Analytics.setSingletonInstance(this.analytics);
            this.initialized = true;

            if (debugMode) {
                Log.d(TAG, "Segment initialized");
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to initialize Segment", e);
            this.initialized = false;
        }
    }

    @Override
    public String getName() {
        return "segment";
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
        if (!enabled || !initialized || analytics == null || event == null) return;

        try {
            Properties props = buildProperties(properties);
            analytics.track(event, props);

            if (debugMode) {
                Log.d(TAG, "Tracked event: " + event);
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to track event", e);
        }
    }

    @Override
    public void identifyUser(String userId, Map<String, Object> traits) {
        if (!enabled || !initialized || analytics == null || userId == null) return;

        try {
            Traits t = buildTraits(traits);
            // NOTE(unverified): Analytics.identify(String, Traits, Options) is the
            // 3-arg overload in Segment Analytics-Android 4.x. Passing null Options
            // applies the default integration set. Confirm the overload exists in
            // the resolved SDK.
            analytics.identify(userId, t, null);

            if (debugMode) {
                Log.d(TAG, "Identified user: " + userId);
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to identify user", e);
        }
    }

    @Override
    public void setUserProperties(Map<String, Object> properties) {
        if (!enabled || !initialized || analytics == null || properties == null) return;

        try {
            Traits t = buildTraits(properties);
            // Segment retains the previously-set userId when identify is called with
            // only traits, so we don't pass userId here. NOTE(unverified): Confirm the
            // 1-arg identify(Traits) overload exists in the resolved SDK; otherwise
            // fall back to identify(currentUserId, traits, null).
            analytics.identify(t);

            if (debugMode) {
                Log.d(TAG, "Set user properties");
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to set user properties", e);
        }
    }

    @Override
    public void logRevenue(double amount, String currency, String productId, int quantity, Map<String, Object> properties) {
        if (!enabled || !initialized || analytics == null) return;

        try {
            // Segment's standard "Order Completed" semantic event. NOTE(unverified):
            // Properties.putValue(String, Object) exists in v4.x; alternative APIs
            // include putRevenue/putCurrency/putValue. We use putValue uniformly so
            // the call works against any 4.x release.
            Properties props = new Properties();
            props.putValue("revenue", amount);
            if (currency != null) props.putValue("currency", currency);
            if (productId != null) props.putValue("productId", productId);
            props.putValue("quantity", quantity);

            if (properties != null) {
                for (Map.Entry<String, Object> entry : properties.entrySet()) {
                    if (entry.getKey() == null || entry.getValue() == null) continue;
                    props.putValue(entry.getKey(), entry.getValue());
                }
            }

            analytics.track("Order Completed", props);

            if (debugMode) {
                Log.d(TAG, "Logged revenue: " + amount + " " + currency);
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to log revenue", e);
        }
    }

    @Override
    public void logScreenView(String screenName, Map<String, Object> properties) {
        if (!enabled || !initialized || analytics == null || screenName == null) return;

        try {
            Properties props = buildProperties(properties);
            analytics.screen(screenName, props);

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
            // NOTE(unverified): Analytics.with(context).optOut(boolean) toggles event
            // dispatch in Segment Analytics-Android v4.x. The local instance also
            // exposes optOut(...) on some SDK builds; we use the static accessor to
            // match the documented usage.
            Analytics.with(context).optOut(!granted);
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
        if (!initialized || analytics == null) return;

        try {
            analytics.reset();

            if (debugMode) {
                Log.d(TAG, "Reset Segment state");
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to reset", e);
        }
    }

    @Override
    public void setDebugMode(boolean enabled) {
        this.debugMode = enabled;
        if (enabled) {
            Log.d(TAG, "Debug mode enabled for Segment provider");
        }
    }

    private Properties buildProperties(Map<String, Object> map) {
        Properties props = new Properties();
        if (map == null) return props;
        for (Map.Entry<String, Object> entry : map.entrySet()) {
            if (entry.getKey() == null || entry.getValue() == null) continue;
            props.putValue(entry.getKey(), entry.getValue());
        }
        return props;
    }

    private Traits buildTraits(Map<String, Object> map) {
        Traits traits = new Traits();
        if (map == null) return traits;
        for (Map.Entry<String, Object> entry : map.entrySet()) {
            if (entry.getKey() == null || entry.getValue() == null) continue;
            traits.putValue(entry.getKey(), entry.getValue());
        }
        return traits;
    }
}
