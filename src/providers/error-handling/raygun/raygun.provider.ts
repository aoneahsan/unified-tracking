import { BaseErrorTrackingProvider } from '../../base-error-tracking-provider';
import { RegisterProvider } from '../../registry';
import type { ProviderConfig, ProviderType, ConsentSettings } from '../../../types/provider';
import type { ErrorContext } from '../../../definitions';

interface RaygunConfig extends ProviderConfig {
  apiKey: string;
  version?: string;
  enablePulse?: boolean;
  enableCrashReporting?: boolean;
  allowInsecureSubmissions?: boolean;
  disableErrorTracking?: boolean;
  disablePulse?: boolean;
  ignoreAjaxAbort?: boolean;
  ignoreAjaxError?: boolean;
  disableAnonymousUserTracking?: boolean;
  excludedHostnames?: string[];
  excludedUserAgents?: string[];
  filterSensitiveData?: string[];
  whitelistedCrossOriginDomains?: string[];
  setCookieAsSecure?: boolean;
  captureMissingRequests?: boolean;
  captureUnhandledRejections?: boolean;
  wrapAsynchronousCallbacks?: boolean;
  debugMode?: boolean;
  maxErrorReportsStoredLocally?: number;
  maxVirtualPageDuration?: number;
  customData?: Record<string, any>;
  tags?: string[];
  user?: {
    identifier?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    isAnonymous?: boolean;
  };
}

interface RaygunUser {
  identifier?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  isAnonymous?: boolean;
}

interface RaygunSDK {
  init: (apiKey: string, options?: any, customData?: any) => void;
  send: (exception: Error, customData?: any, tags?: string[]) => void;
  recordBreadcrumb: (message: string, metadata?: any) => void;
  setUser: (user: RaygunUser) => void;
  setVersion: (version: string) => void;
  withCustomData: (customData: any) => void;
  withTags: (tags: string[]) => void;
  resetAnonymousUser: () => void;
  setFilterScope: (scope: any) => void;
  onBeforeSend: (handler: (payload: any) => any) => void;
  onAfterSend: (handler: (response: any) => void) => void;
  saveIfOffline: (url: string, data: any) => boolean;
  filterSensitiveData: (keys: string[]) => void;
  whitelistCrossOriginDomains: (domains: string[]) => void;
  Pulse: {
    setUser: (user: RaygunUser) => void;
    trackEvent: (type: string, options?: any) => void;
  };
  Crash: {
    init: (options?: any) => void;
    setUser: (user: RaygunUser) => void;
    recordBreadcrumb: (message: string, metadata?: any) => void;
    send: (exception: Error, customData?: any, tags?: string[]) => void;
  };
}

declare global {
  interface Window {
    rg4js?: RaygunSDK;
    Raygun?: RaygunSDK;
  }
}

@RegisterProvider({
  id: 'raygun',
  name: 'Raygun Error Tracking',
  type: 'error-tracking' as ProviderType,
  version: '1.0.0',
  supportedPlatforms: ['web', 'ios', 'android'],
  configSchema: {
    apiKey: { type: 'string', required: true },
    version: { type: 'string' },
    enablePulse: { type: 'boolean', default: true },
    enableCrashReporting: { type: 'boolean', default: true },
    allowInsecureSubmissions: { type: 'boolean', default: false },
    disableErrorTracking: { type: 'boolean', default: false },
    disablePulse: { type: 'boolean', default: false },
    ignoreAjaxAbort: { type: 'boolean', default: false },
    ignoreAjaxError: { type: 'boolean', default: false },
    disableAnonymousUserTracking: { type: 'boolean', default: false },
    captureUnhandledRejections: { type: 'boolean', default: true },
    wrapAsynchronousCallbacks: { type: 'boolean', default: true },
    debugMode: { type: 'boolean', default: false },
    maxErrorReportsStoredLocally: { type: 'number', default: 100 },
  },
})
export class RaygunProvider extends BaseErrorTrackingProvider {
  readonly id = 'raygun';
  readonly name = 'Raygun Error Tracking';
  readonly version = '1.0.0';

  private raygun?: RaygunSDK;
  private raygunConfig: RaygunConfig | null = null;
  private scriptLoaded = false;

  protected async doInitialize(config: RaygunConfig): Promise<void> {
    if (!config.apiKey) {
      throw new Error('Raygun API key is required');
    }

    this.raygunConfig = config;

    // Load Raygun SDK
    await this.loadRaygunSDK();

    if (!window.rg4js) {
      throw new Error('Failed to load Raygun SDK');
    }

    this.raygun = window.rg4js;

    // Configure Raygun options
    const raygunOptions: any = {
      allowInsecureSubmissions: config.allowInsecureSubmissions || false,
      disableErrorTracking: config.disableErrorTracking || false,
      disablePulse: config.disablePulse || false,
      ignoreAjaxAbort: config.ignoreAjaxAbort || false,
      ignoreAjaxError: config.ignoreAjaxError || false,
      disableAnonymousUserTracking: config.disableAnonymousUserTracking || false,
      captureUnhandledRejections: config.captureUnhandledRejections !== false,
      wrapAsynchronousCallbacks: config.wrapAsynchronousCallbacks !== false,
      debugMode: config.debugMode || false,
      maxErrorReportsStoredLocally: config.maxErrorReportsStoredLocally || 100,
    };

    // Set excluded hostnames
    if (config.excludedHostnames) {
      raygunOptions.excludedHostnames = config.excludedHostnames;
    }

    // Set excluded user agents
    if (config.excludedUserAgents) {
      raygunOptions.excludedUserAgents = config.excludedUserAgents;
    }

    // Set max virtual page duration
    if (config.maxVirtualPageDuration) {
      raygunOptions.maxVirtualPageDuration = config.maxVirtualPageDuration;
    }

    // Initialize Raygun
    this.raygun.init(config.apiKey, raygunOptions, config.customData);

    // Set version if provided
    if (config.version) {
      this.raygun.setVersion(config.version);
    }

    // Set initial user if provided
    if (config.user) {
      this.raygun.setUser(config.user);
    }

    // Set initial tags if provided
    if (config.tags) {
      this.raygun.withTags(config.tags);
    }

    // Set filter scope for sensitive data
    if (config.filterSensitiveData) {
      this.raygun.filterSensitiveData(config.filterSensitiveData);
    }

    // Set whitelisted cross-origin domains
    if (config.whitelistedCrossOriginDomains) {
      this.raygun.whitelistCrossOriginDomains(config.whitelistedCrossOriginDomains);
    }

    this.logger.info('Raygun initialized successfully', {
      apiKey: config.apiKey,
      version: config.version,
      enablePulse: config.enablePulse,
      enableCrashReporting: config.enableCrashReporting,
    });
  }

  private async loadRaygunSDK(): Promise<void> {
    if (this.scriptLoaded || window.rg4js) {
      return;
    }

    return new Promise((resolve, reject) => {
      // Use the modern Raygun 4 SDK
      const script = document.createElement('script');
      script.src = 'https://cdn.raygun.io/raygun4js/raygun.min.js';
      script.async = true;
      script.crossOrigin = 'anonymous';

      script.onload = () => {
        this.scriptLoaded = true;
        resolve();
      };

      script.onerror = () => {
        reject(new Error('Failed to load Raygun SDK'));
      };

      document.head.appendChild(script);
    });
  }

  protected async doShutdown(): Promise<void> {
    this.raygun = undefined;
    this.raygunConfig = null;
    this.scriptLoaded = false;
  }

  protected async doUpdateConsent(consent: ConsentSettings): Promise<void> {
    if (consent.errorTracking === false) {
      this.setEnabled(false);
      this.logger.info('Raygun error tracking disabled by consent');
    } else if (consent.errorTracking === true) {
      this.setEnabled(true);
      this.logger.info('Raygun error tracking enabled by consent');
    }
  }

  protected async doLogError(error: Error, context: ErrorContext): Promise<void> {
    if (!this.raygun) {
      throw new Error('Raygun not initialized');
    }

    // Prepare custom data
    const customData: any = {
      ...context.extra,
      timestamp: context.timestamp,
      platform: context.platform,
    };

    // Add user context
    if (context.user) {
      customData.user = context.user;
    }

    // Add breadcrumbs
    if (context.breadcrumbs) {
      context.breadcrumbs.forEach((breadcrumb) => {
        this.raygun!.recordBreadcrumb(breadcrumb.message, {
          category: breadcrumb.category,
          timestamp: breadcrumb.timestamp,
          data: breadcrumb.data,
        });
      });
    }

    // Prepare tags
    const tags: string[] = [];
    if (context.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        tags.push(`${key}:${value}`);
      });
    }

    // Add severity as tag
    if (context.severity) {
      tags.push(`severity:${context.severity}`);
    }

    // Send error to Raygun
    this.raygun.send(error, customData, tags);
  }

  protected async doLogMessage(message: string, level: 'debug' | 'info' | 'warning'): Promise<void> {
    if (!this.raygun) {
      throw new Error('Raygun not initialized');
    }

    // Log message as breadcrumb
    this.raygun.recordBreadcrumb(message, {
      level,
      timestamp: Date.now(),
      category: 'log',
    });
  }

  protected doSetUserContext(user: Record<string, any>): void {
    if (!this.raygun) return;

    const raygunUser: RaygunUser = {
      identifier: user.id || user.identifier,
      email: user.email,
      firstName: user.firstName || user.first_name,
      lastName: user.lastName || user.last_name,
      fullName: user.fullName || user.full_name || user.name,
      isAnonymous: user.isAnonymous || false,
    };

    this.raygun.setUser(raygunUser);

    // Also set user for Pulse if enabled
    if (this.raygun.Pulse) {
      this.raygun.Pulse.setUser(raygunUser);
    }
  }

  protected doSetExtraContext(key: string, value: any): void {
    if (!this.raygun) return;

    const customData: Record<string, any> = {};
    customData[key] = value;

    this.raygun.withCustomData(customData);
  }

  protected doSetTags(tags: Record<string, string>): void {
    if (!this.raygun) return;

    const tagArray: string[] = [];
    Object.entries(tags).forEach(([key, value]) => {
      tagArray.push(`${key}:${value}`);
    });

    this.raygun.withTags(tagArray);
  }

  protected async doCaptureException(exception: Error, context: ErrorContext): Promise<void> {
    // Same as doLogError for Raygun
    await this.doLogError(exception, context);
  }

  protected async doProviderReset(): Promise<void> {
    if (!this.raygun) return;

    // Reset anonymous user
    this.raygun.resetAnonymousUser();
  }

  protected doSetDebugMode(enabled: boolean): void {
    if (enabled) {
      this.logger.debug('Raygun debug mode enabled');
    }
  }

  /**
   * Set application version
   */
  setVersion(version: string): void {
    if (!this.raygun) return;

    this.raygun.setVersion(version);
  }

  /**
   * Add custom data to all future error reports
   */
  withCustomData(customData: any): void {
    if (!this.raygun) return;

    this.raygun.withCustomData(customData);
  }

  /**
   * Add tags to all future error reports
   */
  withTags(tags: string[]): void {
    if (!this.raygun) return;

    this.raygun.withTags(tags);
  }

  /**
   * Reset anonymous user
   */
  resetAnonymousUser(): void {
    if (!this.raygun) return;

    this.raygun.resetAnonymousUser();
  }

  /**
   * Set filter scope for sensitive data
   */
  setFilterScope(scope: any): void {
    if (!this.raygun) return;

    this.raygun.setFilterScope(scope);
  }

  /**
   * Set before send handler
   */
  onBeforeSend(handler: (payload: any) => any): void {
    if (!this.raygun) return;

    this.raygun.onBeforeSend(handler);
  }

  /**
   * Set after send handler
   */
  onAfterSend(handler: (response: any) => void): void {
    if (!this.raygun) return;

    this.raygun.onAfterSend(handler);
  }

  /**
   * Save error report if offline
   */
  saveIfOffline(url: string, data: any): boolean {
    if (!this.raygun) return false;

    return this.raygun.saveIfOffline(url, data);
  }

  /**
   * Filter sensitive data from error reports
   */
  filterSensitiveData(keys: string[]): void {
    if (!this.raygun) return;

    this.raygun.filterSensitiveData(keys);
  }

  /**
   * Whitelist cross-origin domains
   */
  whitelistCrossOriginDomains(domains: string[]): void {
    if (!this.raygun) return;

    this.raygun.whitelistCrossOriginDomains(domains);
  }

  /**
   * Record a breadcrumb
   */
  recordBreadcrumb(message: string, metadata?: any): void {
    if (!this.raygun) return;

    this.raygun.recordBreadcrumb(message, metadata);
  }

  /**
   * Track a custom event (if Pulse is enabled)
   */
  trackEvent(type: string, options?: any): void {
    if (!this.raygun?.Pulse) return;

    this.raygun.Pulse.trackEvent(type, options);
  }
}