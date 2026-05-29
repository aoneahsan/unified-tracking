package com.aoneahsan.unifiedtracking.providers.errortracking;

import android.content.Context;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.aoneahsan.unifiedtracking.providers.ErrorTrackingProvider;
import com.bugsnag.android.Bugsnag;
import com.bugsnag.android.Configuration;

import java.util.Map;

/**
 * Bugsnag error-tracking provider for Android.
 *
 * Uses {@code com.bugsnag.android.Bugsnag} (the Bugsnag Android SDK, artifact
 * {@code com.bugsnag:bugsnag-android}). The SDK is initialized with a
 * {@code Configuration} object via {@code Bugsnag.start(context, cfg)}.
 *
 * NOTE(unverified): built against Bugsnag Android SDK 6.x API. Confirm exact
 * signatures (Configuration constructor, setReleaseStage, Bugsnag.notify with
 * OnErrorCallback lambda, Bugsnag.setUser, Bugsnag.pauseSession) in Android
 * Studio against the resolved SDK version.
 */
public class BugsnagProvider implements ErrorTrackingProvider {
    private static final String TAG = "Bugsnag";
    private final Context context;
    private final JSObject config;
    private boolean enabled;
    private boolean initialized;
    private boolean debugMode = false;
    // Track previous consent state so we know when to pause an active session.
    private boolean previousConsent = true;

    public BugsnagProvider(Context context, JSObject config) {
        this.context = context;
        this.config = config;
        this.enabled = config.getBoolean("enabled", true);
        this.previousConsent = this.enabled;
        this.initialized = false;

        try {
            String apiKey = config.getString("apiKey");
            if (apiKey == null || apiKey.trim().isEmpty()) {
                Log.e(TAG, "Bugsnag apiKey is missing; provider will be inert.");
                return;
            }

            // NOTE(unverified): Configuration(String) is the documented constructor in
            // Bugsnag Android 6.x. Older SDKs used Configuration.load(context). Confirm
            // against the resolved SDK.
            Configuration cfg = new Configuration(apiKey);

            String releaseStage = config.getString("releaseStage", null);
            if (releaseStage != null && !releaseStage.trim().isEmpty()) {
                cfg.setReleaseStage(releaseStage);
            }

            String appVersion = config.getString("appVersion", null);
            if (appVersion != null && !appVersion.trim().isEmpty()) {
                // NOTE(unverified): Configuration.setAppVersion(String) is present in
                // Bugsnag Android 6.x. Confirm against the resolved SDK.
                cfg.setAppVersion(appVersion);
            }

            Bugsnag.start(context, cfg);
            this.initialized = true;

            if (debugMode) {
                Log.d(TAG, "Bugsnag initialized (releaseStage=" + releaseStage + ")");
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to initialize Bugsnag", e);
            this.initialized = false;
        }
    }

    @Override
    public String getName() {
        return "bugsnag";
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
            // NOTE(unverified): Bugsnag.notify(Throwable, OnErrorCallback) is the
            // documented Java overload in SDK 6.x. The lambda receives an Event and
            // returns boolean (true to send, false to drop). We attach the context
            // map as metadata under the "context" section.
            if (errorContext != null && !errorContext.isEmpty()) {
                final Map<String, Object> finalContext = errorContext;
                Bugsnag.notify(error, event -> {
                    try {
                        for (Map.Entry<String, Object> entry : finalContext.entrySet()) {
                            if (entry.getKey() == null || entry.getValue() == null) continue;
                            // NOTE(unverified): Event.addMetadata(section, key, value)
                            // is the documented metadata API in SDK 6.x. Confirm
                            // against the resolved SDK; some older builds used
                            // addToTab(...).
                            event.addMetadata("context", entry.getKey(), entry.getValue());
                        }
                    } catch (Throwable ignored) {
                        // Best-effort metadata attachment; never block delivery on it.
                    }
                    return true;
                });
            } else {
                Bugsnag.notify(error);
            }

            if (debugMode) {
                Log.d(TAG, "Notified Bugsnag: " + error.getMessage());
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to notify Bugsnag", e);
        }
    }

    @Override
    public void setUserContext(String userId, Map<String, Object> properties) {
        if (!enabled || !initialized) return;

        try {
            String email = null;
            String name = null;
            if (properties != null) {
                Object e = properties.get("email");
                if (e != null) email = String.valueOf(e);
                Object n = properties.get("name");
                if (n != null) name = String.valueOf(n);
            }

            // NOTE(unverified): Bugsnag.setUser(String id, String email, String name)
            // is the documented signature in SDK 6.x. Confirm against the resolved SDK.
            Bugsnag.setUser(userId, email, name);

            if (debugMode) {
                Log.d(TAG, "Set Bugsnag user: " + userId);
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to set user context", e);
        }
    }

    @Override
    public void setConsent(boolean granted) {
        if (!initialized) return;

        try {
            // Bugsnag does not expose a runtime opt-out; we gate dispatch locally
            // via the `enabled` flag (logError/setUserContext early-return when false).
            // When transitioning from granted -> revoked, pause the active session so
            // the SDK stops auto-reporting session counts.
            if (previousConsent && !granted) {
                try {
                    // NOTE(unverified): Bugsnag.pauseSession() is the documented runtime
                    // session toggle in SDK 6.x; resumeSession() resumes it. Some older
                    // SDKs only expose autoTrackSessions in Configuration.
                    Bugsnag.pauseSession();
                } catch (Throwable ignored) {
                    // Optional best-effort; consent gate still works via the flag below.
                }
            } else if (!previousConsent && granted) {
                try {
                    Bugsnag.resumeSession();
                } catch (Throwable ignored) {
                    // Optional best-effort.
                }
            }

            this.previousConsent = granted;
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
            // NOTE(unverified): Bugsnag.setUser(null, null, null) clears the user
            // record in SDK 6.x. Confirm the SDK accepts null for all three args.
            Bugsnag.setUser(null, null, null);

            if (debugMode) {
                Log.d(TAG, "Reset Bugsnag user context");
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to reset", e);
        }
    }

    @Override
    public void setDebugMode(boolean enabled) {
        this.debugMode = enabled;
        if (enabled) {
            Log.d(TAG, "Debug mode enabled for Bugsnag provider");
        }
    }
}
