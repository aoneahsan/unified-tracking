package com.aoneahsan.unifiedtracking.providers.errortracking;

import android.content.Context;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.aoneahsan.unifiedtracking.providers.ErrorTrackingProvider;

import java.util.Map;

public class CrashlyticsProvider implements ErrorTrackingProvider {
    private static final String TAG = "Crashlytics";
    private Context context;
    private JSObject config;
    private boolean enabled;
    private boolean initialized;
    private boolean debugMode = false;

    public CrashlyticsProvider(Context context, JSObject config) {
        this.context = context;
        this.config = config;
        this.enabled = config.getBoolean("enabled", true);
        this.initialized = true;
        
        if (debugMode) {
            Log.d(TAG, "Firebase Crashlytics provider initialized (stub)");
        }
    }

    @Override
    public String getName() {
        return "firebase-crashlytics";
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
        if (!enabled || !initialized) return;
        
        if (debugMode) {
            Log.d(TAG, "logError called with error: " + error.getMessage() + ", context: " + context);
        }
    }

    @Override
    public void setUserContext(String userId, Map<String, Object> properties) {
        if (!enabled || !initialized) return;
        
        if (debugMode) {
            Log.d(TAG, "setUserContext called with userId: " + userId + ", properties: " + properties);
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
            Log.d(TAG, "Debug mode enabled for Firebase Crashlytics provider");
        }
    }
}