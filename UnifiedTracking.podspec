Pod::Spec.new do |s|
  s.name             = 'UnifiedTracking'
  s.version          = '0.0.1'
  s.summary          = 'Unified analytics and error tracking plugin for Capacitor'
  s.license          = 'MIT'
  s.homepage         = 'https://github.com/aoneahsan/unified-tracking'
  s.author           = { 'Unified Tracking' => 'support@unified-tracking.dev' }
  s.source           = { :git => 'https://github.com/aoneahsan/unified-tracking.git', :tag => s.version.to_s }
  s.source_files     = 'ios/Sources/UnifiedTrackingPlugin/**/*.{swift,h,m,c,cc,mm,cpp}'
  s.ios.deployment_target = '13.0'
  s.swift_version = '5.1'
  s.dependency 'Capacitor'
  
  # Analytics dependencies
  s.dependency 'Firebase/Analytics'
  s.dependency 'Firebase/Crashlytics'
  s.dependency 'GoogleAnalytics'
  s.dependency 'Amplitude'
  s.dependency 'Mixpanel-swift'
  s.dependency 'Analytics' # Segment Analytics
  s.dependency 'PostHog'
  s.dependency 'Heap', '~> 9.1'
  s.dependency 'MatomoTracker', '~> 7.0'
  
  # Error tracking dependencies
  s.dependency 'Sentry', '~> 8.0'
  s.dependency 'Bugsnag'
  s.dependency 'Rollbar'
  s.dependency 'DatadogCore'
  s.dependency 'DatadogRUM'
  s.dependency 'Raygun4iOS'
  s.dependency 'AppCenter'
  
  # Configure static framework linking
  s.static_framework = true
  
  s.xcconfig = {
    'LIBRARY_SEARCH_PATHS' => '$(TOOLCHAIN_DIR)/usr/lib/swift/$(PLATFORM_NAME)',
    'OTHER_LDFLAGS' => '-lswiftCore -lswiftFoundation',
    'SWIFT_VERSION' => '5.1',
    'IPHONEOS_DEPLOYMENT_TARGET' => '13.0',
    'EXCLUDED_ARCHS[sdk=iphonesimulator*]' => 'arm64'
  }
end