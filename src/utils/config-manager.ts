import type { UnifiedTrackingConfig, ConsentSettings } from '../definitions';

export class ConfigManager {
  private static instance: ConfigManager;
  private config: UnifiedTrackingConfig = {};
  private consent: ConsentSettings = {
    analytics: true,
    errorTracking: true,
    marketing: true,
    personalization: true,
  };

  private constructor() {}

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  async loadConfig(userConfig?: UnifiedTrackingConfig): Promise<UnifiedTrackingConfig> {
    // Start with default config
    const defaultConfig = this.getDefaultConfig();
    
    // Merge with user config
    this.config = this.deepMerge(defaultConfig, userConfig || {});
    
    // Auto-detect providers if enabled
    if (this.config.autoDetect !== false) {
      await this.autoDetectProviders();
    }
    
    // Apply consent settings
    if (this.config.settings?.defaultConsent) {
      this.consent = { ...this.consent, ...this.config.settings.defaultConsent };
    }
    
    return this.config;
  }

  getConfig(): UnifiedTrackingConfig {
    return this.config;
  }

  getConsent(): ConsentSettings {
    return this.consent;
  }

  setConsent(consent: ConsentSettings): void {
    this.consent = { ...this.consent, ...consent };
  }

  private getDefaultConfig(): UnifiedTrackingConfig {
    return {
      analytics: {
        providers: [],
      },
      errorTracking: {
        providers: [],
      },
      settings: {
        debug: false,
        sessionTimeout: 30 * 60 * 1000, // 30 minutes
        autoTrackScreens: true,
        autoTrackErrors: true,
        batching: {
          enabled: true,
          maxSize: 20,
          timeout: 10000,
        },
        privacy: {
          anonymizeIp: true,
          dataRetentionDays: 90,
        },
      },
      autoDetect: true,
    };
  }

  private async autoDetectProviders(): Promise<void> {
    // Check for installed packages
    const detectedProviders = {
      analytics: [] as string[],
      errorTracking: [] as string[],
    };

    // Check window object for global SDKs
    if (typeof window !== 'undefined') {
      // Google Analytics
      if ('gtag' in window || 'ga' in window) {
        detectedProviders.analytics.push('google');
      }

      // Firebase
      if ('firebase' in window) {
        detectedProviders.analytics.push('firebase');
        detectedProviders.errorTracking.push('crashlytics');
      }

      // Amplitude
      if ('amplitude' in window) {
        detectedProviders.analytics.push('amplitude');
      }

      // Mixpanel
      if ('mixpanel' in window) {
        detectedProviders.analytics.push('mixpanel');
      }

      // Segment
      if ('analytics' in window) {
        detectedProviders.analytics.push('segment');
      }

      // Sentry
      if ('Sentry' in window) {
        detectedProviders.analytics.push('sentry');
        detectedProviders.errorTracking.push('sentry');
      }

      // PostHog
      if ('posthog' in window) {
        detectedProviders.analytics.push('posthog');
      }

      // Heap
      if ('heap' in window) {
        detectedProviders.analytics.push('heap');
      }

      // Bugsnag
      if ('Bugsnag' in window) {
        detectedProviders.errorTracking.push('bugsnag');
      }

      // Rollbar
      if ('Rollbar' in window) {
        detectedProviders.errorTracking.push('rollbar');
      }

      // LogRocket
      if ('LogRocket' in window) {
        detectedProviders.errorTracking.push('logrocket');
      }

      // Raygun
      if ('Raygun' in window) {
        detectedProviders.errorTracking.push('raygun');
      }
    }

    // Merge detected providers with configured ones
    if (detectedProviders.analytics.length > 0) {
      this.config.analytics = this.config.analytics || {};
      this.config.analytics.providers = [
        ...(this.config.analytics.providers || []),
        ...detectedProviders.analytics.filter(
          p => !this.config.analytics?.providers?.includes(p as any)
        ),
      ] as any;
    }

    if (detectedProviders.errorTracking.length > 0) {
      this.config.errorTracking = this.config.errorTracking || {};
      this.config.errorTracking.providers = [
        ...(this.config.errorTracking.providers || []),
        ...detectedProviders.errorTracking.filter(
          p => !this.config.errorTracking?.providers?.includes(p as any)
        ),
      ] as any;
    }
  }

  private deepMerge(target: any, source: any): any {
    const output = { ...target };
    
    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach(key => {
        if (this.isObject(source[key])) {
          if (!(key in target)) {
            output[key] = source[key];
          } else {
            output[key] = this.deepMerge(target[key], source[key]);
          }
        } else {
          output[key] = source[key];
        }
      });
    }
    
    return output;
  }

  private isObject(item: any): boolean {
    return item && typeof item === 'object' && !Array.isArray(item);
  }
}