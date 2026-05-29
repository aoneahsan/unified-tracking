package com.aoneahsan.unifiedtracking.providers.errortracking;

import android.content.Context;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.aoneahsan.unifiedtracking.providers.ErrorTrackingProvider;
import com.rollbar.android.Rollbar;

import java.util.HashMap;
import java.util.Map;

/**
 * Rollbar error-tracking provider for Android.
 *
 * Uses {@code com.rollbar.android.Rollbar} from the Rollbar Android SDK. The SDK is
 * initialized via {@code Rollbar.init(context, accessToken, environment)} and the
 * singleton is retrieved through {@code Rollbar.instance()}.
 *
 * NOTE(unverified): the build.gradle declares the dependency as
 * {@code com.rollbar:rollbar-java:$rollbarVersion} — but Rollbar publishes a
 * separate {@code com.rollbar:rollbar-android} artifact that contains the
 * {@code com.rollbar.android.Rollbar} class used here. Confirm the correct
 * artifact id in Android Studio; if the project should remain on
 * rollbar-java only, this provider will need to be rewritten to use the
 * generic {@code com.rollbar.notifier.Rollbar} class with manually configured
 * person/server/notifier sections.
 *
 * NOTE(unverified): built against Rollbar Android SDK 1.12.x API. Confirm
 * exact signatures (Rollbar.init overloads, instance().error(Throwable, Map, String),
 * instance().setPersonData(id, username, email), instance().clearPersonData())
 * against the resolved SDK version.
 */
public class RollbarProvider implements ErrorTrackingProvider {
    private static final String TAG = "Rollbar";
    private final Context context;
    private final JSObject config;
    private boolean enabled;
    private boolean initialized;
    private boolean debugMode = false;

    public RollbarProvider(Context context, JSObject config) {
        this.context = context;
        this.config = config;
        this.enabled = config.getBoolean("enabled", true);
        this.initialized = false;

        try {
            String accessToken = config.getString("accessToken");
            if (accessToken == null || accessToken.trim().isEmpty()) {
                Log.e(TAG, "Rollbar accessToken is missing; provider will be inert.");
                return;
            }

            String environment = config.getString("environment", "production");

            // NOTE(unverified): Rollbar.init(Context, String, String) is the documented
            // 3-arg initializer in Rollbar Android 1.x. There are additional overloads
            // that accept registerExceptionHandler/sendUncaught flags; confirm against
            // the resolved SDK.
            Rollbar.init(context, accessToken, environment);
            this.initialized = true;

            if (debugMode) {
                Log.d(TAG, "Rollbar initialized (environment=" + environment + ")");
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to initialize Rollbar", e);
            this.initialized = false;
        }
    }

    @Override
    public String getName() {
        return "rollbar";
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
    public void logError(Exception error, Map<String, Object> errorContext) {
        if (!enabled || !initialized || error == null) return;

        try {
            Rollbar rollbar = Rollbar.instance();
            if (rollbar == null) {
                if (debugMode) {
                    Log.w(TAG, "Rollbar.instance() returned null; skipping notify.");
                }
                return;
            }

            // Defensive copy so we never hand the SDK a null custom-data map.
            Map<String, Object> custom = errorContext != null
                ? new HashMap<>(errorContext)
                : new HashMap<>();

            // NOTE(unverified): Rollbar.error(Throwable, Map<String,Object>, String)
            // is the documented overload (throwable, custom data, description) in
            // Rollbar Android 1.x. The 2-arg error(Throwable, Map) overload also
            // exists on some builds. Confirm in Android Studio.
            rollbar.error(error, custom, null);

            if (debugMode) {
                Log.d(TAG, "Notified Rollbar: " + error.getMessage());
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to notify Rollbar", e);
        }
    }

    @Override
    public void setUserContext(String userId, Map<String, Object> properties) {
        if (!enabled || !initialized) return;

        try {
            Rollbar rollbar = Rollbar.instance();
            if (rollbar == null) return;

            String username = null;
            String email = null;
            if (properties != null) {
                Object u = properties.get("username");
                if (u != null) username = String.valueOf(u);
                Object e = properties.get("email");
                if (e != null) email = String.valueOf(e);
            }

            // NOTE(unverified): Rollbar.setPersonData(String id, String username,
            // String email) is the documented signature in Rollbar Android 1.x.
            // Confirm against the resolved SDK.
            rollbar.setPersonData(userId, username, email);

            if (debugMode) {
                Log.d(TAG, "Set Rollbar person data: " + userId);
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to set user context", e);
        }
    }

    @Override
    public void setConsent(boolean granted) {
        if (!initialized) return;

        try {
            // Rollbar Android does not expose a runtime opt-out toggle; we gate
            // dispatch locally via the `enabled` flag (logError early-returns when
            // false). The SDK itself stays initialized so consent can be re-granted
            // without re-initializing.
            this.enabled = granted;

            if (debugMode) {
                Log.d(TAG, "Set consent (local gate): " + granted);
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to set consent", e);
        }
    }

    @Override
    public void reset() {
        if (!initialized) return;

        try {
            Rollbar rollbar = Rollbar.instance();
            if (rollbar == null) return;

            // NOTE(unverified): Rollbar.clearPersonData() is the documented person-data
            // reset in Rollbar Android 1.x; some older SDKs only allow setPersonData(
            // null, null, null). Try clearPersonData first and fall back if it isn't
            // available on the resolved SDK.
            try {
                rollbar.clearPersonData();
            } catch (Throwable t) {
                try {
                    rollbar.setPersonData(null, null, null);
                } catch (Throwable ignored) {
                    // Optional best-effort reset.
                }
            }

            if (debugMode) {
                Log.d(TAG, "Reset Rollbar person data");
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to reset", e);
        }
    }

    @Override
    public void setDebugMode(boolean enabled) {
        this.debugMode = enabled;
        if (enabled) {
            Log.d(TAG, "Debug mode enabled for Rollbar provider");
        }
    }
}
