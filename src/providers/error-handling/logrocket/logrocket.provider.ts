import { BaseErrorTrackingProvider } from '../../base-error-tracking-provider';
import { RegisterProvider } from '../../registry';
import type { ProviderConfig, ProviderType, ConsentSettings } from '../../../types/provider';
import type { ErrorContext } from '../../../definitions';

interface LogRocketConfig extends ProviderConfig {
  appID: string;
  release?: string;
  serverURL?: string;
  shouldCaptureIP?: boolean;
  console?: {
    shouldAggregateConsoleErrors?: boolean;
    isEnabled?: {
      log?: boolean;
      info?: boolean;
      warn?: boolean;
      error?: boolean;
      debug?: boolean;
    };
  };
  network?: {
    requestSanitizer?: (request: any) => any;
    responseSanitizer?: (response: any) => any;
    isEnabled?: boolean;
  };
  dom?: {
    inputSanitizer?: boolean;
    textSanitizer?: boolean;
    isEnabled?: boolean;
  };
  parentDomain?: string;
  ingestServer?: string;
  mergeIframes?: boolean;
  shouldDebugLog?: boolean;
  shouldParseXHRBlob?: boolean;
  shouldDetectExceptions?: boolean;
  shouldCaptureCaught?: boolean;
  rootHostname?: string;
  uploadTimeInterval?: number;
  captureExceptions?: boolean;
  tryCatch?: boolean;
  shouldAugmentNPS?: boolean;
  shouldCaptureWebVitals?: boolean;
  beforeSend?: (event: any) => any;
  childDomains?: string[];
  enableStrictPrivacy?: boolean;
  redactionTags?: string[];
  privacySettings?: {
    strictPrivacy?: boolean;
    logLevel?: 'silent' | 'error' | 'warn' | 'info' | 'debug';
  };
}

interface LogRocketSDK {
  init: (appID: string, config?: any) => void;
  identify: (uid: string, traits?: any) => void;
  track: (event: string, properties?: any) => void;
  captureException: (exception: Error | string, extra?: any) => void;
  captureMessage: (message: string, level?: string, extra?: any) => void;
  addTag: (key: string, value: string) => void;
  startNewSession: () => void;
  getSessionURL: (callback: (url: string) => void) => void;
  sessionURL: string;
  version: string;
  isActive: () => boolean;
  stop: () => void;
  log: {
    info: (message: string, extra?: any) => void;
    warn: (message: string, extra?: any) => void;
    error: (message: string, extra?: any) => void;
    debug: (message: string, extra?: any) => void;
    log: (message: string, extra?: any) => void;
  };
  reduxMiddleware: (options?: any) => any;
  getReduxMiddleware: (options?: any) => any;
  reduxEnhancer: (options?: any) => any;
  getReduxEnhancer: (options?: any) => any;
  captureConsoleLog: (level: string, message: string, extra?: any) => void;
  captureNetworkRequest: (request: any) => void;
  captureNetworkResponse: (response: any) => void;
  addTags: (tags: Record<string, string>) => void;
  removeTags: (tagKeys: string[]) => void;
  clearTags: () => void;
  tagKey: (key: string) => string;
  tagValue: (value: string) => string;
}

declare global {
  interface Window {
    LogRocket?: LogRocketSDK;
  }
}

@RegisterProvider({
  id: 'logrocket',
  name: 'LogRocket Error Tracking',
  type: 'error-tracking' as ProviderType,
  version: '1.0.0',
  supportedPlatforms: ['web'],
  configSchema: {
    appID: { type: 'string', required: true },
    release: { type: 'string' },
    serverURL: { type: 'string' },
    shouldCaptureIP: { type: 'boolean', default: true },
    mergeIframes: { type: 'boolean', default: false },
    shouldDebugLog: { type: 'boolean', default: false },
    shouldParseXHRBlob: { type: 'boolean', default: true },
    shouldDetectExceptions: { type: 'boolean', default: true },
    shouldCaptureCaught: { type: 'boolean', default: true },
    uploadTimeInterval: { type: 'number', default: 30000 },
    captureExceptions: { type: 'boolean', default: true },
    tryCatch: { type: 'boolean', default: true },
    shouldAugmentNPS: { type: 'boolean', default: true },
    shouldCaptureWebVitals: { type: 'boolean', default: true },
    enableStrictPrivacy: { type: 'boolean', default: false },
  },
})
export class LogRocketErrorTrackingProvider extends BaseErrorTrackingProvider {
  readonly id = 'logrocket';
  readonly name = 'LogRocket Error Tracking';
  readonly version = '1.0.0';

  private logRocket?: LogRocketSDK;
  private logRocketConfig: LogRocketConfig | null = null;
  private scriptLoaded = false;

  protected async doInitialize(config: LogRocketConfig): Promise<void> {
    if (!config.appID) {
      throw new Error('LogRocket app ID is required');
    }

    this.logRocketConfig = config;

    // Load LogRocket SDK
    await this.loadLogRocketSDK();

    if (!window.LogRocket) {
      throw new Error('Failed to load LogRocket SDK');
    }

    this.logRocket = window.LogRocket;

    // Configure LogRocket
    const logRocketOptions: any = {
      release: config.release,
      serverURL: config.serverURL,
      shouldCaptureIP: config.shouldCaptureIP !== false,
      console: config.console || {
        shouldAggregateConsoleErrors: true,
        isEnabled: {
          log: true,
          info: true,
          warn: true,
          error: true,
          debug: true,
        },
      },
      network: config.network || {
        isEnabled: true,
      },
      dom: config.dom || {
        inputSanitizer: true,
        textSanitizer: true,
        isEnabled: true,
      },
      parentDomain: config.parentDomain,
      ingestServer: config.ingestServer,
      mergeIframes: config.mergeIframes === true,
      shouldDebugLog: config.shouldDebugLog === true,
      shouldParseXHRBlob: config.shouldParseXHRBlob !== false,
      shouldDetectExceptions: config.shouldDetectExceptions !== false,
      shouldCaptureCaught: config.shouldCaptureCaught !== false,
      rootHostname: config.rootHostname,
      uploadTimeInterval: config.uploadTimeInterval || 30000,
      captureExceptions: config.captureExceptions !== false,
      tryCatch: config.tryCatch !== false,
      shouldAugmentNPS: config.shouldAugmentNPS !== false,
      shouldCaptureWebVitals: config.shouldCaptureWebVitals !== false,
      beforeSend: config.beforeSend,
      childDomains: config.childDomains,
      enableStrictPrivacy: config.enableStrictPrivacy === true,
      redactionTags: config.redactionTags,
      privacySettings: config.privacySettings,
    };

    // Initialize LogRocket
    this.logRocket.init(config.appID, logRocketOptions);

    this.logger.info('LogRocket initialized successfully', {
      appID: config.appID,
      release: config.release,
      serverURL: config.serverURL,
    });
  }

  private async loadLogRocketSDK(): Promise<void> {
    if (this.scriptLoaded || window.LogRocket) {
      return;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.src = 'https://cdn.lr-ingest.io/LogRocket.min.js';

      script.onload = () => {
        this.scriptLoaded = true;
        resolve();
      };

      script.onerror = () => {
        reject(new Error('Failed to load LogRocket SDK'));
      };

      document.head.appendChild(script);
    });
  }

  protected async doShutdown(): Promise<void> {
    if (this.logRocket) {
      this.logRocket.stop();
    }
    this.logRocket = undefined;
    this.logRocketConfig = null;
    this.scriptLoaded = false;
  }

  protected async doUpdateConsent(consent: ConsentSettings): Promise<void> {
    if (!this.logRocket) return;

    if (consent.errorTracking === false) {
      this.logRocket.stop();
      this.logger.info('LogRocket tracking disabled by consent');
    } else if (consent.errorTracking === true) {
      // LogRocket doesn't have a resume method, so we might need to reinitialize
      if (this.logRocketConfig) {
        await this.doInitialize(this.logRocketConfig);
      }
      this.logger.info('LogRocket tracking enabled by consent');
    }
  }

  protected async doTrackError(error: Error | string, context?: ErrorContext): Promise<void> {
    if (!this.logRocket) {
      throw new Error('LogRocket not initialized');
    }

    const extra: any = {};

    if (context) {
      // Add user information
      if (context.user) {
        extra.user = context.user;
      }

      // Add tags
      if (context.tags) {
        Object.entries(context.tags).forEach(([key, value]) => {
          this.logRocket!.addTag(key, String(value));
        });
      }

      // Add extra data
      if (context.extra) {
        Object.assign(extra, context.extra);
      }

      // Add fingerprint
      if (context.fingerprint) {
        extra.fingerprint = Array.isArray(context.fingerprint) 
          ? context.fingerprint.join(':') 
          : context.fingerprint;
      }
    }

    // LogRocket has different methods for different error types
    if (error instanceof Error) {
      this.logRocket.captureException(error, extra);
    } else {
      // For string errors, use captureMessage
      const level = this.mapSeverityToLogRocketLevel(context?.level || 'error');
      this.logRocket.captureMessage(error, level, extra);
    }
  }

  private mapSeverityToLogRocketLevel(severity: string): string {
    const severityMap: Record<string, string> = {
      'fatal': 'error',
      'error': 'error',
      'warning': 'warn',
      'info': 'info',
      'debug': 'debug',
    };

    return severityMap[severity] || 'error';
  }

  protected async doSetUser(user: Record<string, any>): Promise<void> {
    if (!this.logRocket) return;

    const traits: any = {};

    // LogRocket expects specific user properties
    if (user.name) {
      traits.name = user.name;
    }

    if (user.email) {
      traits.email = user.email;
    }

    // Add additional user properties
    Object.keys(user).forEach(key => {
      if (!['id', 'name', 'email'].includes(key)) {
        traits[key] = user[key];
      }
    });

    this.logRocket.identify(user.id || 'anonymous', traits);
  }

  protected async doSetContext(context: Record<string, any>): Promise<void> {
    if (!this.logRocket) return;

    // LogRocket uses tags for context
    Object.entries(context).forEach(([key, value]) => {
      this.logRocket!.addTag(key, String(value));
    });
  }

  protected async doRemoveContext(key: string): Promise<void> {
    if (!this.logRocket) return;

    this.logRocket.removeTags([key]);
  }

  protected async doClearContext(): Promise<void> {
    if (!this.logRocket) return;

    this.logRocket.clearTags();
  }

  protected async doCaptureBreadcrumb(breadcrumb: {
    message: string;
    category?: string;
    level?: string;
    data?: Record<string, any>;
  }): Promise<void> {
    if (!this.logRocket) return;

    // LogRocket automatically captures breadcrumbs, but we can use the log API
    const level = this.mapSeverityToLogRocketLevel(breadcrumb.level || 'info');
    const extra = {
      category: breadcrumb.category,
      ...breadcrumb.data,
    };

    switch (level) {
      case 'error':
        this.logRocket.log.error(breadcrumb.message, extra);
        break;
      case 'warn':
        this.logRocket.log.warn(breadcrumb.message, extra);
        break;
      case 'info':
        this.logRocket.log.info(breadcrumb.message, extra);
        break;
      case 'debug':
        this.logRocket.log.debug(breadcrumb.message, extra);
        break;
      default:
        this.logRocket.log.log(breadcrumb.message, extra);
    }
  }

  protected doSetDebugMode(enabled: boolean): void {
    if (!this.logRocket) return;

    // LogRocket doesn't have a direct debug mode API
    // Debug logging is controlled by the shouldDebugLog configuration
    this.logger.info(`LogRocket debug mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Track a custom event
   */
  trackEvent(event: string, properties?: Record<string, any>): void {
    if (!this.logRocket) return;

    this.logRocket.track(event, properties);
  }

  /**
   * Add a single tag
   */
  addTag(key: string, value: string): void {
    if (!this.logRocket) return;

    this.logRocket.addTag(key, value);
  }

  /**
   * Add multiple tags
   */
  addTags(tags: Record<string, string>): void {
    if (!this.logRocket) return;

    this.logRocket.addTags(tags);
  }

  /**
   * Remove tags
   */
  removeTags(tagKeys: string[]): void {
    if (!this.logRocket) return;

    this.logRocket.removeTags(tagKeys);
  }

  /**
   * Clear all tags
   */
  clearTags(): void {
    if (!this.logRocket) return;

    this.logRocket.clearTags();
  }

  /**
   * Start a new session
   */
  startNewSession(): void {
    if (!this.logRocket) return;

    this.logRocket.startNewSession();
  }

  /**
   * Get the current session URL
   */
  getSessionURL(callback: (url: string) => void): void {
    if (!this.logRocket) return;

    this.logRocket.getSessionURL(callback);
  }

  /**
   * Get the current session URL synchronously
   */
  getSessionURLSync(): string {
    if (!this.logRocket) return '';

    return this.logRocket.sessionURL;
  }

  /**
   * Check if LogRocket is active
   */
  isActive(): boolean {
    if (!this.logRocket) return false;

    return this.logRocket.isActive();
  }

  /**
   * Get LogRocket version
   */
  getVersion(): string {
    if (!this.logRocket) return '';

    return this.logRocket.version;
  }

  /**
   * Get Redux middleware
   */
  getReduxMiddleware(options?: any): any {
    if (!this.logRocket) return null;

    return this.logRocket.getReduxMiddleware(options);
  }

  /**
   * Get Redux enhancer
   */
  getReduxEnhancer(options?: any): any {
    if (!this.logRocket) return null;

    return this.logRocket.getReduxEnhancer(options);
  }

  /**
   * Capture console log
   */
  captureConsoleLog(level: string, message: string, extra?: any): void {
    if (!this.logRocket) return;

    this.logRocket.captureConsoleLog(level, message, extra);
  }

  /**
   * Capture network request
   */
  captureNetworkRequest(request: any): void {
    if (!this.logRocket) return;

    this.logRocket.captureNetworkRequest(request);
  }

  /**
   * Capture network response
   */
  captureNetworkResponse(response: any): void {
    if (!this.logRocket) return;

    this.logRocket.captureNetworkResponse(response);
  }

  /**
   * Log info message
   */
  logInfo(message: string, extra?: any): void {
    if (!this.logRocket) return;

    this.logRocket.log.info(message, extra);
  }

  /**
   * Log warning message
   */
  logWarn(message: string, extra?: any): void {
    if (!this.logRocket) return;

    this.logRocket.log.warn(message, extra);
  }

  /**
   * Log error message
   */
  logError(message: string, extra?: any): void {
    if (!this.logRocket) return;

    this.logRocket.log.error(message, extra);
  }

  /**
   * Log debug message
   */
  logDebug(message: string, extra?: any): void {
    if (!this.logRocket) return;

    this.logRocket.log.debug(message, extra);
  }

  /**
   * Log general message
   */
  logMessage(message: string, extra?: any): void {
    if (!this.logRocket) return;

    this.logRocket.log.log(message, extra);
  }
}