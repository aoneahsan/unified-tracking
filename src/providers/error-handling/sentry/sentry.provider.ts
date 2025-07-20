import { BaseErrorTrackingProvider } from '../../base-error-tracking-provider';
import { RegisterProvider } from '../../registry';
import type { ProviderConfig, ProviderType, ConsentSettings } from '../../../types/provider';
import type { ErrorContext } from '../../../definitions';

interface SentryConfig extends ProviderConfig {
  dsn: string;
  environment?: string;
  release?: string;
  serverName?: string;
  sampleRate?: number;
  tracesSampleRate?: number;
  maxBreadcrumbs?: number;
  attachStacktrace?: boolean;
  normalizeDepth?: number;
  maxValueLength?: number;
  beforeSend?: (event: any) => any;
  beforeBreadcrumb?: (breadcrumb: any) => any;
  integrations?: any[];
  transport?: any;
  sendDefaultPii?: boolean;
  allowUrls?: string[];
  denyUrls?: string[];
}

interface SentrySDK {
  init: (options: any) => void;
  captureException: (exception: any, context?: any) => string;
  captureMessage: (message: string, level?: string) => string;
  setUser: (user: any) => void;
  setContext: (key: string, context: any) => void;
  setTag: (key: string, value: string) => void;
  setTags: (tags: Record<string, string>) => void;
  addBreadcrumb: (breadcrumb: any) => void;
  configureScope: (callback: (scope: any) => void) => void;
  startTransaction: (context: any) => any;
  getCurrentHub: () => any;
  withScope: (callback: (scope: any) => void) => void;
  close: (timeout?: number) => Promise<boolean>;
  flush: (timeout?: number) => Promise<boolean>;
  Severity: {
    Debug: string;
    Info: string;
    Warning: string;
    Error: string;
    Fatal: string;
  };
}

declare global {
  interface Window {
    Sentry?: SentrySDK;
  }
}

@RegisterProvider({
  id: 'sentry',
  name: 'Sentry Error Tracking',
  type: 'error-tracking' as ProviderType,
  version: '1.0.0',
  supportedPlatforms: ['web', 'ios', 'android'],
  configSchema: {
    dsn: { type: 'string', required: true },
    environment: { type: 'string', default: 'production' },
    release: { type: 'string' },
    sampleRate: { type: 'number', default: 1.0 },
    tracesSampleRate: { type: 'number', default: 0.1 },
    maxBreadcrumbs: { type: 'number', default: 100 },
    attachStacktrace: { type: 'boolean', default: true },
  },
})
export class SentryErrorTrackingProvider extends BaseErrorTrackingProvider {
  readonly id = 'sentry';
  readonly name = 'Sentry Error Tracking';
  readonly version = '1.0.0';

  private sentry?: SentrySDK;
  // @ts-ignore - Reserved for future use
  private _sentryConfig: SentryConfig | null = null;
  private scriptLoaded = false;

  /**
   * Check if provider is initialized
   */
  get isInitialized(): boolean {
    return this.initialized;
  }

  protected async doInitialize(config: SentryConfig): Promise<void> {
    if (!config.dsn) {
      throw new Error('Sentry DSN is required');
    }

    this._sentryConfig = config;

    // Load Sentry SDK
    await this.loadSentrySDK();

    if (!window.Sentry) {
      throw new Error('Failed to load Sentry SDK');
    }

    this.sentry = window.Sentry;

    // Configure Sentry
    const sentryOptions: any = {
      dsn: config.dsn,
      environment: config.environment || 'production',
    };
    
    // Only add optional properties if they're defined
    if (config.release !== undefined) sentryOptions.release = config.release;
    if (config.serverName !== undefined) sentryOptions.serverName = config.serverName;
    if (config.sampleRate !== undefined) sentryOptions.sampleRate = config.sampleRate;
    if (config.tracesSampleRate !== undefined) sentryOptions.tracesSampleRate = config.tracesSampleRate;
    if (config.maxBreadcrumbs !== undefined) sentryOptions.maxBreadcrumbs = config.maxBreadcrumbs;
    if (config.attachStacktrace !== undefined) sentryOptions.attachStacktrace = config.attachStacktrace;
    if (config.normalizeDepth !== undefined) sentryOptions.normalizeDepth = config.normalizeDepth;
    if (config.maxValueLength !== undefined) sentryOptions.maxValueLength = config.maxValueLength;
    if (config.sendDefaultPii !== undefined) sentryOptions.sendDefaultPii = config.sendDefaultPii;
    if (config.allowUrls !== undefined) sentryOptions.allowUrls = config.allowUrls;
    if (config.denyUrls !== undefined) sentryOptions.denyUrls = config.denyUrls;
    if (config.transport !== undefined) sentryOptions.transport = config.transport;
    
    // Always set beforeSend (use provided or default)
    sentryOptions.beforeSend = config.beforeSend || ((event: any) => {
      // Default beforeSend - can filter or modify events
      return event;
    });
    
    // Always set integrations (use provided or default)
    sentryOptions.integrations = config.integrations || [];
    
    if (config.beforeBreadcrumb !== undefined) sentryOptions.beforeBreadcrumb = config.beforeBreadcrumb;

    this.sentry.init(sentryOptions);

    // Set max breadcrumbs
    this.maxBreadcrumbs = config.maxBreadcrumbs ?? 100;

    this.logger.info('Sentry initialized successfully', {
      dsn: config.dsn,
      environment: config.environment,
      release: config.release,
    });
  }

  private async loadSentrySDK(): Promise<void> {
    if (this.scriptLoaded) {
      return;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://browser.sentry-cdn.com/7.99.0/bundle.min.js';
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.integrity = 'sha384-6BHjILBN5tHdVPQF/6NE5qgVV8JDyFPHuZ6+X2dKS3bNhWmR3fMqLg/7yMKJyPNg';

      script.onload = () => {
        this.scriptLoaded = true;
        resolve();
      };

      script.onerror = () => {
        reject(new Error('Failed to load Sentry SDK'));
      };

      document.head.appendChild(script);
    });
  }

  protected async doShutdown(): Promise<void> {
    if (this.sentry) {
      await this.sentry.close(2000);
    }
    this.sentry = undefined;
    this._sentryConfig = null;
    this.scriptLoaded = false;
  }

  protected async doUpdateConsent(consent: ConsentSettings): Promise<void> {
    // Sentry doesn't have built-in consent management
    // We need to pause/resume based on consent
    if (consent.errorTracking === false) {
      this.setEnabled(false);
      this.logger.info('Sentry error tracking disabled by consent');
    } else if (consent.errorTracking === true) {
      this.setEnabled(true);
      this.logger.info('Sentry error tracking enabled by consent');
    }
  }

  protected async doLogError(error: Error, context: ErrorContext): Promise<void> {
    if (!this.sentry) {
      throw new Error('Sentry not initialized');
    }

    const sentryContext = this.convertContextToSentry(context);

    this.sentry.withScope((scope) => {
      // Set user context
      if (context.user) {
        scope.setUser(context.user);
      }

      // Set severity
      if (context.severity) {
        scope.setLevel(this.mapSeverityToSentry(context.severity));
      }

      // Set tags
      if (context.tags) {
        Object.entries(context.tags).forEach(([key, value]) => {
          scope.setTag(key, value);
        });
      }

      // Set extra context
      if (context.extra) {
        Object.entries(context.extra).forEach(([key, value]) => {
          scope.setContext(key, value);
        });
      }

      // Add severity
      if (context.severity) {
        scope.setLevel(this.mapSeverityToSentry(context.severity));
      }

      // Capture the exception
      // Only pass context if it has meaningful data
      if (Object.keys(sentryContext).length > 0) {
        this.sentry!.captureException(error, sentryContext);
      } else {
        this.sentry!.captureException(error);
      }
    });
  }

  protected async doLogMessage(message: string, level: 'debug' | 'info' | 'warning'): Promise<void> {
    if (!this.sentry) {
      throw new Error('Sentry not initialized');
    }

    const sentryLevel = this.mapSeverityToSentry(level);
    this.sentry.captureMessage(message, sentryLevel);
  }

  protected doSetUserContext(user: Record<string, any>): void {
    if (!this.sentry) return;

    this.sentry.setUser(user);
  }

  protected doSetExtraContext(key: string, value: any): void {
    if (!this.sentry) return;

    this.sentry.setContext(key, value);
  }

  protected doSetTags(tags: Record<string, string>): void {
    if (!this.sentry) return;

    this.sentry.setTags(tags);
  }

  protected async doCaptureException(exception: Error, context: ErrorContext): Promise<void> {
    // Same as doLogError for Sentry
    await this.doLogError(exception, context);
  }

  protected async doEnable(): Promise<void> {
    // Sentry doesn't have a direct enable/disable API
    // It's controlled by initialization
  }

  protected async doDisable(): Promise<void> {
    // Sentry doesn't have a direct enable/disable API
    // We can stop sending events by using beforeSend
  }

  protected doAddBreadcrumb(message: string, category?: string, data?: Record<string, any>): void {
    if (!this.sentry) return;
    
    this.sentry.addBreadcrumb({
      message,
      category: category || 'manual',
      data,
      timestamp: Date.now() / 1000,
    });
  }

  protected doStartTransaction(name: string, operation?: string): any {
    if (!this.sentry) return null;

    return this.sentry.startTransaction({
      name,
      op: operation || 'custom',
    });
  }

  protected doFinishTransaction(transaction: any): void {
    if (transaction && typeof transaction.finish === 'function') {
      transaction.finish();
    }
  }

  protected async doProviderReset(): Promise<void> {
    if (!this.sentry) return;

    this.sentry.configureScope((scope) => {
      scope.clear();
    });
  }

  protected doSetDebugMode(enabled: boolean): void {
    // Sentry debug mode is set at initialization
    // We can add more verbose logging here
    if (enabled) {
      this.logger.info('Sentry debug mode enabled');
    } else {
      this.logger.info('Sentry debug mode disabled');
    }
  }

  async flush(timeout: number = 2000): Promise<boolean> {
    if (!this.sentry) return false;

    return this.sentry.flush(timeout);
  }

  /**
   * Map severity levels to Sentry severity levels
   */
  private mapSeverityToSentry(severity: string): string {
    const severityMap: Record<string, string> = {
      debug: 'debug',
      info: 'info',
      warning: 'warning',
      error: 'error',
      fatal: 'fatal',
    };

    return severityMap[severity] || 'error';
  }

  /**
   * Convert context to Sentry format
   */
  private convertContextToSentry(_context: ErrorContext): any {
    const sentryContext: any = {};

    // Sentry context is handled within withScope

    return sentryContext;
  }

  /**
   * Add custom breadcrumb
   */
  addCustomBreadcrumb(
    message: string,
    category: string = 'custom',
    level: 'debug' | 'info' | 'warning' | 'error' = 'info',
    data?: Record<string, any>
  ): void {
    if (!this.sentry) return;

    this.sentry.addBreadcrumb({
      message,
      category,
      level,
      data,
      timestamp: Date.now() / 1000,
    });
  }

  /**
   * Set custom release
   */
  setRelease(release: string): void {
    if (!this.sentry) return;

    this.sentry.configureScope((scope) => {
      scope.setTag('release', release);
    });
  }

  /**
   * Set custom environment
   */
  setEnvironment(environment: string): void {
    if (!this.sentry) return;

    this.sentry.configureScope((scope) => {
      scope.setTag('environment', environment);
    });
  }

  /**
   * Capture a performance measurement
   */
  capturePerformance(name: string, duration: number, data?: Record<string, any>): void {
    if (!this.sentry) return;

    this.sentry.addBreadcrumb({
      message: `Performance: ${name}`,
      category: 'performance',
      level: 'info',
      data: {
        duration,
        ...data,
      },
      timestamp: Date.now() / 1000,
    });
  }

  /**
   * Track error (alias for logError)
   */
  async trackError(error: Error | string, context?: ErrorContext): Promise<void> {
    if (!this.initialized) {
      throw new Error('Sentry not initialized');
    }
    
    // Handle string errors differently
    if (typeof error === 'string') {
      this.checkReady();
      const enrichedContext = (this as any).enrichContext(context);
      
      this.sentry!.withScope((scope) => {
        // Set severity
        if (enrichedContext.severity) {
          scope.setLevel(this.mapSeverityToSentry(enrichedContext.severity));
        }
        
        // Set tags
        if (enrichedContext.tags) {
          Object.entries(enrichedContext.tags).forEach(([key, value]) => {
            scope.setTag(key, value as string);
          });
        }
        
        // Capture as message
        const level = enrichedContext.severity || 'error';
        this.sentry!.captureMessage(error, this.mapSeverityToSentry(level));
      });
      
      return;
    }
    
    return this.logError(error, context);
  }

  /**
   * Set user (alias for setUserContext)
   */
  async setUser(user: Record<string, any>): Promise<void> {
    // Transform 'name' to 'username' if present
    const sentryUser = { ...user };
    if ('name' in sentryUser && !('username' in sentryUser)) {
      sentryUser.username = sentryUser.name;
      delete sentryUser.name;
    }
    this.setUserContext(sentryUser);
  }

  /**
   * Set context (generic context setter)
   */
  async setContext(keyOrContext: string | Record<string, any>, value?: any): Promise<void> {
    if (typeof keyOrContext === 'string') {
      this.setExtraContext(keyOrContext, value);
    } else {
      // If single object parameter, set as 'custom' context
      this.setExtraContext('custom', keyOrContext);
    }
  }

  /**
   * Remove context
   */
  async removeContext(key: string): Promise<void> {
    if (!this.sentry) return;
    this.sentry.setContext(key, null);
  }

  /**
   * Clear all context
   */
  async clearContext(): Promise<void> {
    if (!this.sentry) return;
    // Clear context by setting an empty object
    this.sentry.setContext('custom', {});
  }

  /**
   * Capture breadcrumb
   */
  captureBreadcrumb(breadcrumb: any): void {
    if (!this.sentry) return;
    
    // Extract properties from breadcrumb object
    const { message, category, level, data } = breadcrumb;
    
    // Call Sentry's addBreadcrumb
    this.sentry.addBreadcrumb({
      message,
      category,
      level,
      data,
    });
  }
}