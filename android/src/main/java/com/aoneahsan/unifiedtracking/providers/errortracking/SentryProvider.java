package com.aoneahsan.unifiedtracking.providers.errortracking;

import android.content.Context;
import android.util.Log;
import com.aoneahsan.unifiedtracking.providers.ErrorTrackingProvider;
import com.getcapacitor.JSObject;
import io.sentry.Sentry;
import io.sentry.android.core.SentryAndroid;
import io.sentry.protocol.User;
import java.util.Map;

/**
 * Sentry error-tracking provider for Android.
 *
 * Uses {@code io.sentry.android.core.SentryAndroid} for SDK initialization and the
 * static {@code io.sentry.Sentry} facade for capturing exceptions, setting user
 * context, and managing scope.
 *
 * NOTE(unverified): built against the Sentry Android SDK 7.x API. Confirm exact
 * signatures (SentryAndroid.init overloads, SentryOptions setters, User fields,
 * Sentry.captureException/configureScope) in Android Studio against the resolved
 * SDK version.
 */
public class SentryProvider implements ErrorTrackingProvider {

    private static final String TAG = "Sentry";
    private final Context context;
    private final JSObject config;
    private boolean enabled;
    private boolean initialized;
    private boolean debugMode = false;

    public SentryProvider(Context context, JSObject config) {
        this.context = context;
        this.config = config;
        this.enabled = config.getBoolean("enabled", true);
        this.initialized = false;

        try {
            String dsn = config.getString("dsn");
            if (dsn == null || dsn.trim().isEmpty()) {
                Log.e(TAG, "Sentry DSN is missing; provider will be inert.");
                return;
            }

            final String environment = config.getString("environment", null);
            final String release = config.getString("release", null);
            // tracesSampleRate is a double in the JS config; fall back to 0.0 (errors only).
            final Double tracesSampleRate = config.has("tracesSampleRate") ? config.getDouble("tracesSampleRate") : null;
            final boolean debugConfig = config.getBoolean("debug", false);

            // NOTE(unverified): SentryAndroid.init(Context, OptionsConfiguration) is the
            // documented Android entry point in SDK 7.x. Confirm the lambda receives
            // SentryAndroidOptions (a subclass of SentryOptions) in Android Studio.
            SentryAndroid.init(context, (options) -> {
                options.setDsn(dsn);
                if (environment != null && !environment.trim().isEmpty()) {
                    options.setEnvironment(environment);
                }
                if (release != null && !release.trim().isEmpty()) {
                    options.setRelease(release);
                }
                if (tracesSampleRate != null) {
                    options.setTracesSampleRate(tracesSampleRate);
                }
                options.setDebug(debugConfig);
            });

            this.initialized = true;

            if (debugMode) {
                Log.d(TAG, "Sentry initialized (environment=" + environment + ")");
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to initialize Sentry", e);
            this.initialized = false;
        }
    }

    @Override
    public String getName() {
        return "sentry";
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
    public void logError(Exception error, Map<String, Object> context) {
        if (!enabled || !initialized || error == null) return;

        try {
            // Attach the context map as scope "extras" so it travels with the event,
            // then capture the throwable. configureScope mutates the current scope.
            if (context != null && !context.isEmpty()) {
                Sentry.configureScope((scope) -> {
                    for (Map.Entry<String, Object> entry : context.entrySet()) {
                        if (entry.getValue() == null) continue;
                        // NOTE(unverified): Scope.setExtra(String, Object) exists in SDK 7.x.
                        // Some keys (e.g. "level", "tags") could be promoted to first-class
                        // fields; here everything is treated uniformly as an extra.
                        scope.setExtra(entry.getKey(), String.valueOf(entry.getValue()));
                    }
                });
            }

            Sentry.captureException(error);

            if (debugMode) {
                Log.d(TAG, "Captured exception: " + error.getMessage());
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to capture exception", e);
        }
    }

    @Override
    public void setUserContext(String userId, Map<String, Object> properties) {
        if (!enabled || !initialized) return;

        try {
            User user = new User();
            user.setId(userId);

            if (properties != null) {
                Object email = properties.get("email");
                if (email != null) {
                    user.setEmail(String.valueOf(email));
                }
                Object username = properties.get("username");
                if (username != null) {
                    user.setUsername(String.valueOf(username));
                }
                // NOTE(unverified): User.setData(Map<String,String>) is the documented
                // way to attach arbitrary user attributes in SDK 7.x. Confirm the method
                // name/signature; older SDKs used setOthers(...).
                java.util.Map<String, String> extra = new java.util.HashMap<>();
                for (Map.Entry<String, Object> entry : properties.entrySet()) {
                    String key = entry.getKey();
                    if ("email".equals(key) || "username".equals(key)) continue;
                    if (entry.getValue() == null) continue;
                    extra.put(key, String.valueOf(entry.getValue()));
                }
                if (!extra.isEmpty()) {
                    user.setData(extra);
                }
            }

            Sentry.setUser(user);

            if (debugMode) {
                Log.d(TAG, "Set user context: " + userId);
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to set user context", e);
        }
    }

    @Override
    public void setConsent(boolean granted) {
        if (!initialized) return;

        // NOTE(unverified): The Sentry Android SDK has no first-class runtime consent
        // toggle equivalent to Firebase's setAnalyticsCollectionEnabled. We gate dispatch
        // locally via the `enabled` flag (logError/setUserContext early-return when false).
        // The SDK itself stays initialized; to fully stop the SDK at runtime you would need
        // Sentry.close() and re-init, which is intentionally avoided here to keep behavior simple.
        this.enabled = granted;

        if (debugMode) {
            Log.d(TAG, "Set consent (local gate): " + granted);
        }
    }

    @Override
    public void reset() {
        if (!initialized) return;

        try {
            // Clear the associated user; subsequent events are anonymous.
            Sentry.setUser(null);

            if (debugMode) {
                Log.d(TAG, "Reset user context");
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to reset", e);
        }
    }

    @Override
    public void setDebugMode(boolean enabled) {
        this.debugMode = enabled;
        if (enabled) {
            Log.d(TAG, "Debug mode enabled for Sentry provider");
        }
    }
}
