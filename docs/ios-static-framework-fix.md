# iOS Static Framework Conflicts Resolution

## Issue

When using unified-tracking in a Capacitor app, you may encounter CocoaPods errors about transitive dependencies that include statically linked binaries. This happens because some analytics providers (AppCenter, GoogleAnalytics, Raygun4iOS) distribute their SDKs as static frameworks.

## Solution

### Option 1: Modify your app's Podfile (Recommended)

Add this to your app's `ios/App/Podfile` after the target block:

```ruby
post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      # Fix for static framework conflicts
      config.build_settings['BUILD_LIBRARY_FOR_DISTRIBUTION'] = 'YES'
      config.build_settings['EXCLUDED_ARCHS[sdk=iphonesimulator*]'] = 'arm64'

      # Disable bitcode (not supported by all analytics SDKs)
      config.build_settings['ENABLE_BITCODE'] = 'NO'
    end
  end

  # Fix duplicate symbols
  installer.aggregate_targets.each do |target|
    target.xcconfigs.each do |config_name, config_file|
      frameworks = config_file.frameworks
      frameworks.uniq!
      config_file.frameworks = frameworks
    end
  end
end
```

### Option 2: Use the provided post-install script

1. Copy the `ios-podfile-fix.rb` from the plugin to your app
2. Add this to your Podfile:

```ruby
post_install do |installer|
  load './ios-podfile-fix.rb'
  unified_tracking_post_install(installer)
end
```

### Option 3: Selective provider installation

If you don't need all providers, you can create a custom podspec that only includes the providers you need:

1. Create `UnifiedTrackingCustom.podspec` in your app's ios folder
2. Only include the dependencies you need
3. Reference it in your Podfile:

```ruby
pod 'UnifiedTrackingCustom', :path => './UnifiedTrackingCustom.podspec'
```

## After applying the fix:

1. Clean your build:

   ```bash
   cd ios/App
   rm -rf Pods Podfile.lock
   pod cache clean --all
   ```

2. Reinstall pods:

   ```bash
   pod install --repo-update
   ```

3. Run Capacitor sync:
   ```bash
   npx cap sync ios
   ```

## Additional Notes

- The `EXCLUDED_ARCHS[sdk=iphonesimulator*]` setting excludes arm64 architecture for simulator builds, which is necessary for M1/M2 Macs
- `BUILD_LIBRARY_FOR_DISTRIBUTION` enables module stability
- Disabling bitcode is required as not all analytics SDKs support it
