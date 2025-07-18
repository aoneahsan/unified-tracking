import { BaseErrorTrackingProvider } from '../../base-error-tracking-provider';
import { RegisterProvider } from '../../registry';
import type { ProviderConfig, ProviderType, ConsentSettings } from '../../../types/provider';
import type { ErrorContext } from '../../../definitions';

interface BugsnagConfig extends ProviderConfig {
  apiKey: string;
  appVersion?: string;
  appType?: string;
  releaseStage?: string;
  enabledReleaseStages?: string[];
  endpoint?: string;
  sessionEndpoint?: string;
  autoDetectErrors?: boolean;
  autoTrackSessions?: boolean;
  enabledErrorTypes?: {
    unhandledExceptions?: boolean;
    unhandledRejections?: boolean;
  };
  onError?: (event: any) => boolean | void;
  onSession?: (session: any) => boolean | void;
  onBreadcrumb?: (breadcrumb: any) => boolean | void;
  user?: {
    id?: string;
    email?: string;
    name?: string;
  };
  context?: string;
  metaData?: Record<string, any>;
  maxBreadcrumbs?: number;
  enabledBreadcrumbTypes?: string[];
  collectUserIp?: boolean;
  trackInlineScript?: boolean;
  generateAnonymousId?: boolean;
  redactedKeys?: string[];
  beforeSend?: (event: any) => boolean | void;
  logger?: any;
  networkBreadcrumbsEnabled?: boolean;
  interactionBreadcrumbsEnabled?: boolean;
  consoleBreadcrumbsEnabled?: boolean;
  navigationBreadcrumbsEnabled?: boolean;
}

interface BugsnagSDK {
  start: (config?: any) => void;
  notify: (error: Error | string, onError?: (event: any) => boolean | void) => void;
  leaveBreadcrumb: (name: string, metaData?: any, type?: string) => void;
  setUser: (id?: string, email?: string, name?: string) => void;
  setContext: (context: string) => void;
  addMetadata: (section: string, key: string, value: any) => void;
  clearMetadata: (section: string, key?: string) => void;
  getMetadata: (section: string, key?: string) => any;
  addFeatureFlag: (name: string, variant?: string) => void;
  addFeatureFlags: (featureFlags: Array<{ name: string; variant?: string }>) => void;
  clearFeatureFlag: (name: string) => void;
  clearFeatureFlags: () => void;
  getContext: () => string;
  getUser: () => any;
  startSession: () => void;
  pauseSession: () => void;
  resumeSession: () => void;
  isStarted: () => boolean;
  getPlugin: (name: string) => any;
  addOnError: (callback: (event: any) => boolean | void) => void;
  removeOnError: (callback: (event: any) => boolean | void) => void;
  addOnSession: (callback: (session: any) => boolean | void) => void;
  removeOnSession: (callback: (session: any) => boolean | void) => void;
  addOnBreadcrumb: (callback: (breadcrumb: any) => boolean | void) => void;
  removeOnBreadcrumb: (callback: (breadcrumb: any) => boolean | void) => void;
  refresh: () => void;
}

declare global {
  interface Window {
    Bugsnag?: BugsnagSDK;
  }
}

@RegisterProvider({
  id: 'bugsnag',
  name: 'Bugsnag Error Tracking',
  type: 'error-tracking' as ProviderType,
  version: '1.0.0',
  supportedPlatforms: ['web'],
  configSchema: {
    apiKey: { type: 'string', required: true },
    appVersion: { type: 'string' },
    appType: { type: 'string' },
    releaseStage: { type: 'string', default: 'production' },
    enabledReleaseStages: { type: 'array', default: ['production'] },
    autoDetectErrors: { type: 'boolean', default: true },
    autoTrackSessions: { type: 'boolean', default: true },
    maxBreadcrumbs: { type: 'number', default: 25 },
    collectUserIp: { type: 'boolean', default: true },
    trackInlineScript: { type: 'boolean', default: true },
    generateAnonymousId: { type: 'boolean', default: true },
  },
})
export class BugsnagErrorTrackingProvider extends BaseErrorTrackingProvider {
  readonly id = 'bugsnag';
  readonly name = 'Bugsnag Error Tracking';
  readonly version = '1.0.0';

  private bugsnag?: BugsnagSDK;
  private bugsnagConfig: BugsnagConfig | null = null;
  private scriptLoaded = false;

  protected async doInitialize(config: BugsnagConfig): Promise<void> {
    if (!config.apiKey) {
      throw new Error('Bugsnag API key is required');
    }

    this.bugsnagConfig = config;

    // Load Bugsnag SDK
    await this.loadBugsnagSDK();

    if (!window.Bugsnag) {
      throw new Error('Failed to load Bugsnag SDK');
    }

    this.bugsnag = window.Bugsnag;

    // Configure Bugsnag
    const bugsnagOptions: any = {
      apiKey: config.apiKey,
      appVersion: config.appVersion,
      appType: config.appType,
      releaseStage: config.releaseStage || 'production',
      enabledReleaseStages: config.enabledReleaseStages || ['production'],
      endpoint: config.endpoint,
      sessionEndpoint: config.sessionEndpoint,
      autoDetectErrors: config.autoDetectErrors !== false,
      autoTrackSessions: config.autoTrackSessions !== false,
      enabledErrorTypes: config.enabledErrorTypes || {
        unhandledExceptions: true,
        unhandledRejections: true,
      },
      onError: config.onError,
      onSession: config.onSession,
      onBreadcrumb: config.onBreadcrumb,
      user: config.user,
      context: config.context,
      metaData: config.metaData,
      maxBreadcrumbs: config.maxBreadcrumbs || 25,
      enabledBreadcrumbTypes: config.enabledBreadcrumbTypes,
      collectUserIp: config.collectUserIp !== false,
      trackInlineScript: config.trackInlineScript !== false,
      generateAnonymousId: config.generateAnonymousId !== false,
      redactedKeys: config.redactedKeys,
      beforeSend: config.beforeSend,
      logger: config.logger,
      networkBreadcrumbsEnabled: config.networkBreadcrumbsEnabled,
      interactionBreadcrumbsEnabled: config.interactionBreadcrumbsEnabled,
      consoleBreadcrumbsEnabled: config.consoleBreadcrumbsEnabled,
      navigationBreadcrumbsEnabled: config.navigationBreadcrumbsEnabled,
    };

    // Initialize Bugsnag
    this.bugsnag.start(bugsnagOptions);

    this.logger.info('Bugsnag initialized successfully', {
      apiKey: config.apiKey,
      releaseStage: config.releaseStage,
      appVersion: config.appVersion,
    });
  }

  private async loadBugsnagSDK(): Promise<void> {
    if (this.scriptLoaded || window.Bugsnag) {
      return;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.src = 'https://d2wy8f7a9ursnm.cloudfront.net/v7/bugsnag.min.js';

      script.onload = () => {
        this.scriptLoaded = true;
        resolve();
      };

      script.onerror = () => {
        reject(new Error('Failed to load Bugsnag SDK'));
      };

      document.head.appendChild(script);
    });
  }

  protected async doShutdown(): Promise<void> {
    this.bugsnag = undefined;
    this.bugsnagConfig = null;
    this.scriptLoaded = false;
  }

  protected async doUpdateConsent(consent: ConsentSettings): Promise<void> {
    if (!this.bugsnag) return;

    if (consent.errorTracking === false) {
      this.bugsnag.pauseSession();
      this.logger.info('Bugsnag tracking disabled by consent');
    } else if (consent.errorTracking === true) {
      this.bugsnag.resumeSession();
      this.logger.info('Bugsnag tracking enabled by consent');
    }
  }

  protected async doTrackError(error: Error | string, context?: ErrorContext): Promise<void> {
    if (!this.bugsnag) {
      throw new Error('Bugsnag not initialized');
    }

    this.bugsnag.notify(error, (event) => {
      if (context) {
        // Set user information
        if (context.user) {
          event.setUser(context.user.id, context.user.email, context.user.name);
        }

        // Set context
        if (context.tags?.context) {
          event.setContext(context.tags.context);
        }

        // Add metadata
        if (context.extra) {
          Object.entries(context.extra).forEach(([key, value]) => {
            event.addMetadata('extra', key, value);
          });
        }

        // Add tags as metadata
        if (context.tags) {
          Object.entries(context.tags).forEach(([key, value]) => {
            event.addMetadata('tags', key, value);
          });
        }

        // Set severity
        if (context.level) {
          const severityMap: Record<string, string> = {
            'debug': 'info',
            'info': 'info',
            'warning': 'warning',
            'error': 'error',
            'fatal': 'error',
          };
          event.severity = severityMap[context.level] || 'error';
        }

        // Set fingerprint as grouping hash
        if (context.fingerprint) {
          event.groupingHash = Array.isArray(context.fingerprint) 
            ? context.fingerprint.join(':') 
            : context.fingerprint;
        }
      }

      return true;
    });
  }

  protected async doSetUser(user: Record<string, any>): Promise<void> {
    if (!this.bugsnag) return;

    this.bugsnag.setUser(user.id, user.email, user.name);

    // Add additional user properties as metadata
    const additionalProps = { ...user };
    delete additionalProps.id;
    delete additionalProps.email;
    delete additionalProps.name;

    if (Object.keys(additionalProps).length > 0) {
      Object.entries(additionalProps).forEach(([key, value]) => {
        this.bugsnag!.addMetadata('user', key, value);
      });
    }
  }

  protected async doSetContext(context: Record<string, any>): Promise<void> {
    if (!this.bugsnag) return;

    Object.entries(context).forEach(([key, value]) => {
      this.bugsnag!.addMetadata('context', key, value);
    });
  }

  protected async doRemoveContext(key: string): Promise<void> {
    if (!this.bugsnag) return;

    this.bugsnag.clearMetadata('context', key);
  }

  protected async doClearContext(): Promise<void> {
    if (!this.bugsnag) return;

    this.bugsnag.clearMetadata('context');
  }

  protected async doCaptureBreadcrumb(breadcrumb: {
    message: string;
    category?: string;
    level?: string;
    data?: Record<string, any>;
  }): Promise<void> {
    if (!this.bugsnag) return;

    const metaData = {
      category: breadcrumb.category,
      level: breadcrumb.level,
      ...breadcrumb.data,
    };

    this.bugsnag.leaveBreadcrumb(breadcrumb.message, metaData, breadcrumb.category);
  }

  protected doSetDebugMode(enabled: boolean): void {
    // Bugsnag doesn't have a specific debug mode API
    // Debug information is controlled by the releaseStage configuration
    this.logger.info(`Bugsnag debug mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Set context for all future errors
   */
  setContext(context: string): void {
    if (!this.bugsnag) return;

    this.bugsnag.setContext(context);
  }

  /**
   * Get current context
   */
  getContext(): string {
    if (!this.bugsnag) return '';

    return this.bugsnag.getContext();
  }

  /**
   * Get current user
   */
  getUser(): any {
    if (!this.bugsnag) return null;

    return this.bugsnag.getUser();
  }

  /**
   * Add metadata to all future errors
   */
  addMetadata(section: string, key: string, value: any): void {
    if (!this.bugsnag) return;

    this.bugsnag.addMetadata(section, key, value);
  }

  /**
   * Clear metadata
   */
  clearMetadata(section: string, key?: string): void {
    if (!this.bugsnag) return;

    this.bugsnag.clearMetadata(section, key);
  }

  /**
   * Get metadata
   */
  getMetadata(section: string, key?: string): any {
    if (!this.bugsnag) return null;

    return this.bugsnag.getMetadata(section, key);
  }

  /**
   * Add feature flag
   */
  addFeatureFlag(name: string, variant?: string): void {
    if (!this.bugsnag) return;

    this.bugsnag.addFeatureFlag(name, variant);
  }

  /**
   * Add multiple feature flags
   */
  addFeatureFlags(featureFlags: Array<{ name: string; variant?: string }>): void {
    if (!this.bugsnag) return;

    this.bugsnag.addFeatureFlags(featureFlags);
  }

  /**
   * Clear feature flag
   */
  clearFeatureFlag(name: string): void {
    if (!this.bugsnag) return;

    this.bugsnag.clearFeatureFlag(name);
  }

  /**
   * Clear all feature flags
   */
  clearFeatureFlags(): void {
    if (!this.bugsnag) return;

    this.bugsnag.clearFeatureFlags();
  }

  /**
   * Start session
   */
  startSession(): void {
    if (!this.bugsnag) return;

    this.bugsnag.startSession();
  }

  /**
   * Pause session
   */
  pauseSession(): void {
    if (!this.bugsnag) return;

    this.bugsnag.pauseSession();
  }

  /**
   * Resume session
   */
  resumeSession(): void {
    if (!this.bugsnag) return;

    this.bugsnag.resumeSession();
  }

  /**
   * Check if Bugsnag is started
   */
  isStarted(): boolean {
    if (!this.bugsnag) return false;

    return this.bugsnag.isStarted();
  }

  /**
   * Add error callback
   */
  addOnError(callback: (event: any) => boolean | void): void {
    if (!this.bugsnag) return;

    this.bugsnag.addOnError(callback);
  }

  /**
   * Remove error callback
   */
  removeOnError(callback: (event: any) => boolean | void): void {
    if (!this.bugsnag) return;

    this.bugsnag.removeOnError(callback);
  }

  /**
   * Add session callback
   */
  addOnSession(callback: (session: any) => boolean | void): void {
    if (!this.bugsnag) return;

    this.bugsnag.addOnSession(callback);
  }

  /**
   * Remove session callback
   */
  removeOnSession(callback: (session: any) => boolean | void): void {
    if (!this.bugsnag) return;

    this.bugsnag.removeOnSession(callback);
  }

  /**
   * Add breadcrumb callback
   */
  addOnBreadcrumb(callback: (breadcrumb: any) => boolean | void): void {
    if (!this.bugsnag) return;

    this.bugsnag.addOnBreadcrumb(callback);
  }

  /**
   * Remove breadcrumb callback
   */
  removeOnBreadcrumb(callback: (breadcrumb: any) => boolean | void): void {
    if (!this.bugsnag) return;

    this.bugsnag.removeOnBreadcrumb(callback);
  }

  /**
   * Refresh Bugsnag
   */
  refresh(): void {
    if (!this.bugsnag) return;

    this.bugsnag.refresh();
  }
}