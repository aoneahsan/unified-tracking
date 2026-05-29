# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.

# Firebase
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }

# Sentry
-keepattributes LineNumberTable,SourceFile
-dontwarn io.sentry.android.core.SentryAndroidOptions
-keep class io.sentry.** { *; }

# Amplitude
-keep class com.amplitude.** { *; }

# Mixpanel
-dontwarn com.mixpanel.**
-keep class com.mixpanel.** { *; }

# Segment
-keep class com.segment.** { *; }

# Bugsnag
-keep class com.bugsnag.** { *; }
-keepattributes SourceFile,LineNumberTable

# Rollbar
-keep class com.rollbar.** { *; }

# Plugin classes
-keep class com.aoneahsan.unifiedtracking.** { *; }