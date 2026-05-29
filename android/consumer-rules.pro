# Unified Tracking Consumer ProGuard Rules
# These rules are applied to consuming apps when they use this plugin

# Keep all Unified Tracking classes
-keep class com.aoneahsan.unifiedtracking.** { *; }

# Keep analytics provider classes
-keep class * implements com.aoneahsan.unifiedtracking.providers.AnalyticsProvider { *; }
-keep class * implements com.aoneahsan.unifiedtracking.providers.ErrorTrackingProvider { *; }

# Firebase Analytics
-keep class com.google.firebase.analytics.** { *; }
-keep class com.google.firebase.crashlytics.** { *; }

# Amplitude
-keep class com.amplitude.** { *; }

# Mixpanel
-keep class com.mixpanel.android.** { *; }

# Segment
-keep class com.segment.analytics.** { *; }

# PostHog
-keep class com.posthog.android.** { *; }

# Heap
-keep class com.heapanalytics.android.** { *; }

# Matomo
-keep class org.matomo.sdk.** { *; }

# Sentry
-keep class io.sentry.** { *; }

# Bugsnag
-keep class com.bugsnag.android.** { *; }

# Rollbar
-keep class com.rollbar.** { *; }

# DataDog
-keep class com.datadoghq.** { *; }

# LogRocket
-keep class com.logrocket.** { *; }

# Raygun
-keep class com.raygun.** { *; }

# AppCenter
-keep class com.microsoft.appcenter.** { *; }

# Keep JSON serialization classes
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}

# Keep Capacitor plugin registration
-keep class * extends com.getcapacitor.Plugin {
    @com.getcapacitor.annotation.CapacitorPlugin <methods>;
    @com.getcapacitor.PluginMethod <methods>;
}