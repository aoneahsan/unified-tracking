package com.aoneahsan.unifiedtracking;

import android.content.Context;
import android.os.Bundle;
import android.util.Log;
import com.aoneahsan.unifiedtracking.providers.ProviderManager;
import com.aoneahsan.unifiedtracking.providers.analytics.*;
import com.aoneahsan.unifiedtracking.providers.errortracking.*;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

@CapacitorPlugin(name = "UnifiedTracking")
public class UnifiedTrackingPlugin extends Plugin {

    private static final String TAG = "UnifiedTracking";
    private ProviderManager providerManager;
    private boolean initialized = false;

    @Override
    public void load() {
        super.load();
        providerManager = new ProviderManager(getContext());
    }

    @PluginMethod
    public void initialize(PluginCall call) {
        try {
            // JS UnifiedTrackingConfig shape (top-level call options):
            //   { analytics: { providers: [ids], <id>: { ...providerConfig } },
            //     errorTracking: { providers: [ids], <id>: { ... } },
            //     settings: { debug?, defaultConsent? },
            //     autoDetect? }
            // The presence of a provider id in the `providers` array means "enabled";
            // there is no per-provider `enabled` flag in the JS schema.
            JSObject analytics = call.getObject("analytics");
            if (analytics != null) {
                initializeAnalyticsProviders(analytics);
            }
            JSObject errorTracking = call.getObject("errorTracking");
            if (errorTracking != null) {
                initializeErrorTrackingProviders(errorTracking);
            }
            JSObject settings = call.getObject("settings");
            if (settings != null) {
                Boolean debug = settings.getBoolean("debug", Boolean.FALSE);
                if (Boolean.TRUE.equals(debug)) providerManager.setDebugMode(true);
                JSObject defaultConsent = settings.getJSObject("defaultConsent");
                if (defaultConsent != null) {
                    boolean a = defaultConsent.getBoolean("analytics", true);
                    boolean e = defaultConsent.getBoolean("errorTracking", true);
                    boolean p = defaultConsent.getBoolean("personalization", true);
                    providerManager.setConsent(a, e, p);
                }
            }

            initialized = true;

            JSObject result = new JSObject();
            result.put("success", true);
            result.put("activeProviders", providerManager.getActiveProviders());

            call.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Failed to initialize", e);
            call.reject("Failed to initialize: " + e.getMessage());
        }
    }

    @PluginMethod
    public void track(PluginCall call) {
        if (!ensureInitialized(call)) return;

        String event = call.getString("event");
        if (event == null) {
            call.reject("Event name is required");
            return;
        }

        JSObject properties = call.getObject("properties", new JSObject());

        try {
            Map<String, Object> props = jsObjectToMap(properties);
            providerManager.trackEvent(event, props);
            call.resolve();
        } catch (Exception e) {
            Log.e(TAG, "Failed to track event", e);
            call.reject("Failed to track event: " + e.getMessage());
        }
    }

    @PluginMethod
    public void identify(PluginCall call) {
        if (!ensureInitialized(call)) return;

        String userId = call.getString("userId");
        if (userId == null) {
            call.reject("User ID is required");
            return;
        }

        JSObject traits = call.getObject("traits", new JSObject());

        try {
            Map<String, Object> userTraits = jsObjectToMap(traits);
            providerManager.identifyUser(userId, userTraits);
            call.resolve();
        } catch (Exception e) {
            Log.e(TAG, "Failed to identify user", e);
            call.reject("Failed to identify user: " + e.getMessage());
        }
    }

    @PluginMethod
    public void setUserProperties(PluginCall call) {
        if (!ensureInitialized(call)) return;

        JSObject properties = call.getObject("properties");
        if (properties == null) {
            call.reject("Properties are required");
            return;
        }

        try {
            Map<String, Object> props = jsObjectToMap(properties);
            providerManager.setUserProperties(props);
            call.resolve();
        } catch (Exception e) {
            Log.e(TAG, "Failed to set user properties", e);
            call.reject("Failed to set user properties: " + e.getMessage());
        }
    }

    @PluginMethod
    public void logError(PluginCall call) {
        if (!ensureInitialized(call)) return;

        String error = call.getString("error");
        if (error == null) {
            call.reject("Error message is required");
            return;
        }

        JSObject context = call.getObject("context", new JSObject());

        try {
            Map<String, Object> errorContext = jsObjectToMap(context);
            Exception exception = new Exception(error);
            providerManager.logError(exception, errorContext);
            call.resolve();
        } catch (Exception e) {
            Log.e(TAG, "Failed to log error", e);
            call.reject("Failed to log error: " + e.getMessage());
        }
    }

    @PluginMethod
    public void logRevenue(PluginCall call) {
        if (!ensureInitialized(call)) return;

        Double amount = call.getDouble("amount");
        if (amount == null) {
            call.reject("Amount is required");
            return;
        }

        String currency = call.getString("currency", "USD");
        String productId = call.getString("productId");
        Integer quantity = call.getInt("quantity", 1);
        JSObject properties = call.getObject("properties", new JSObject());

        try {
            Map<String, Object> props = jsObjectToMap(properties);
            providerManager.logRevenue(amount, currency, productId, quantity, props);
            call.resolve();
        } catch (Exception e) {
            Log.e(TAG, "Failed to log revenue", e);
            call.reject("Failed to log revenue: " + e.getMessage());
        }
    }

    @PluginMethod
    public void logScreenView(PluginCall call) {
        if (!ensureInitialized(call)) return;

        String screenName = call.getString("screenName");
        if (screenName == null) {
            call.reject("Screen name is required");
            return;
        }

        JSObject properties = call.getObject("properties", new JSObject());

        try {
            Map<String, Object> props = jsObjectToMap(properties);
            providerManager.logScreenView(screenName, props);
            call.resolve();
        } catch (Exception e) {
            Log.e(TAG, "Failed to log screen view", e);
            call.reject("Failed to log screen view: " + e.getMessage());
        }
    }

    @PluginMethod
    public void setConsent(PluginCall call) {
        JSObject consent = call.getObject("consent");
        if (consent == null) {
            call.reject("Consent settings are required");
            return;
        }

        try {
            boolean analytics = consent.getBoolean("analytics", true);
            boolean errorTracking = consent.getBoolean("errorTracking", true);
            boolean personalization = consent.getBoolean("personalization", true);

            providerManager.setConsent(analytics, errorTracking, personalization);
            call.resolve();
        } catch (Exception e) {
            Log.e(TAG, "Failed to set consent", e);
            call.reject("Failed to set consent: " + e.getMessage());
        }
    }

    @PluginMethod
    public void reset(PluginCall call) {
        try {
            providerManager.reset();
            call.resolve();
        } catch (Exception e) {
            Log.e(TAG, "Failed to reset", e);
            call.reject("Failed to reset: " + e.getMessage());
        }
    }

    @PluginMethod
    public void getActiveProviders(PluginCall call) {
        try {
            JSObject result = providerManager.getActiveProviders();
            call.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Failed to get active providers", e);
            call.reject("Failed to get active providers: " + e.getMessage());
        }
    }

    @PluginMethod
    public void enableDebugMode(PluginCall call) {
        Boolean enabled = call.getBoolean("enabled", false);

        try {
            providerManager.setDebugMode(enabled);
            call.resolve();
        } catch (Exception e) {
            Log.e(TAG, "Failed to set debug mode", e);
            call.reject("Failed to set debug mode: " + e.getMessage());
        }
    }

    private void initializeAnalyticsProviders(JSObject analytics) throws JSONException {
        JSONArray providers = analytics.optJSONArray("providers");
        if (providers == null) return;
        for (int i = 0; i < providers.length(); i++) {
            String id = providers.optString(i, null);
            if (id == null || id.isEmpty()) continue;
            JSObject perProviderConfig = analytics.getJSObject(id);
            if (perProviderConfig == null) perProviderConfig = new JSObject();
            switch (id) {
                case "google":
                    // JS provider id "google" maps to GA4. On native, GA4 IS Firebase Analytics —
                    // so we route "google" through FirebaseAnalyticsProvider (Firebase must be
                    // configured by the host app via google-services.json).
                    providerManager.addAnalyticsProvider(new FirebaseAnalyticsProvider(getContext(), perProviderConfig));
                    break;
                case "firebase":
                    providerManager.addAnalyticsProvider(new FirebaseAnalyticsProvider(getContext(), perProviderConfig));
                    break;
                case "mixpanel":
                    providerManager.addAnalyticsProvider(new MixpanelProvider(getContext(), perProviderConfig));
                    break;
                case "amplitude":
                    providerManager.addAnalyticsProvider(new AmplitudeProvider(getContext(), perProviderConfig));
                    break;
                case "segment":
                    providerManager.addAnalyticsProvider(new SegmentProvider(getContext(), perProviderConfig));
                    break;
                default:
                    // posthog/heap/matomo are not natively scaffolded — web-only via the JS core.
                    Log.w(TAG, "Analytics provider '" + id + "' has no native implementation (web-only); skipped on native.");
            }
        }
    }

    private void initializeErrorTrackingProviders(JSObject errorTracking) throws JSONException {
        JSONArray providers = errorTracking.optJSONArray("providers");
        if (providers == null) return;
        for (int i = 0; i < providers.length(); i++) {
            String id = providers.optString(i, null);
            if (id == null || id.isEmpty()) continue;
            JSObject perProviderConfig = errorTracking.getJSObject(id);
            if (perProviderConfig == null) perProviderConfig = new JSObject();
            switch (id) {
                case "sentry":
                    providerManager.addErrorTrackingProvider(new SentryProvider(getContext(), perProviderConfig));
                    break;
                case "bugsnag":
                    providerManager.addErrorTrackingProvider(new BugsnagProvider(getContext(), perProviderConfig));
                    break;
                case "crashlytics":
                    // Intentional stub on native — see round04-native-overview.md (the
                    // @capacitor-firebase/crashlytics wrapper is BANNED). Use Sentry.
                    providerManager.addErrorTrackingProvider(new CrashlyticsProvider(getContext(), perProviderConfig));
                    break;
                case "rollbar":
                    providerManager.addErrorTrackingProvider(new RollbarProvider(getContext(), perProviderConfig));
                    break;
                default:
                    // datadog/logrocket/raygun/appcenter — not natively scaffolded.
                    Log.w(TAG, "Error provider '" + id + "' has no native implementation (web-only); skipped on native.");
            }
        }
    }

    private boolean ensureInitialized(PluginCall call) {
        if (!initialized) {
            call.reject("UnifiedTracking not initialized. Call initialize() first.");
            return false;
        }
        return true;
    }

    private Map<String, Object> jsObjectToMap(JSObject object) throws JSONException {
        Map<String, Object> map = new HashMap<>();
        Iterator<String> keys = object.keys();

        while (keys.hasNext()) {
            String key = keys.next();
            Object value = object.get(key);

            if (value instanceof JSONObject) {
                map.put(key, jsObjectToMap(new JSObject((JSONObject) value)));
            } else if (value instanceof JSONArray) {
                map.put(key, jsonArrayToList((JSONArray) value));
            } else {
                map.put(key, value);
            }
        }

        return map;
    }

    private Object[] jsonArrayToList(JSONArray array) throws JSONException {
        Object[] list = new Object[array.length()];

        for (int i = 0; i < array.length(); i++) {
            Object value = array.get(i);

            if (value instanceof JSONObject) {
                list[i] = jsObjectToMap(new JSObject((JSONObject) value));
            } else if (value instanceof JSONArray) {
                list[i] = jsonArrayToList((JSONArray) value);
            } else {
                list[i] = value;
            }
        }

        return list;
    }
}
