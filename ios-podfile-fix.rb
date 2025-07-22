# This post_install script resolves static framework conflicts
# Add this to your app's Podfile after the target block:
#
# post_install do |installer|
#   load File.join(File.dirname(`node_modules/.bin/cap`.strip), '../@unified-tracking/capacitor-plugin/ios-podfile-fix.rb')
#   unified_tracking_post_install(installer)
# end

def unified_tracking_post_install(installer)
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      # Ensure proper linking for static frameworks
      config.build_settings['BUILD_LIBRARY_FOR_DISTRIBUTION'] = 'YES'
      
      # Handle specific static framework conflicts
      if ['AppCenter', 'GoogleAnalytics', 'Raygun4iOS'].include?(target.name)
        config.build_settings['ONLY_ACTIVE_ARCH'] = 'NO'
        config.build_settings['EXCLUDED_ARCHS[sdk=iphonesimulator*]'] = 'arm64'
      end
      
      # Fix for transitive dependencies
      if target.name == 'Pods-App'
        config.build_settings['EXCLUDED_ARCHS[sdk=iphonesimulator*]'] = 'arm64'
        config.build_settings['ENABLE_BITCODE'] = 'NO'
      end
    end
  end
  
  # Deduplicate framework references
  installer.aggregate_targets.each do |target|
    target.xcconfigs.each do |config_name, config_file|
      frameworks = config_file.frameworks
      frameworks.uniq!
      config_file.frameworks = frameworks
    end
  end
end