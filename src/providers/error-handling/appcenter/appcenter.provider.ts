import { BaseErrorTrackingProvider } from '../../base-error-tracking-provider';
import { RegisterProvider } from '../../registry';
import type { ProviderConfig, ProviderType, ConsentSettings } from '../../../types/provider';
import type { ErrorContext } from '../../../definitions';

interface AppCenterConfig extends ProviderConfig {
  appSecret: string;
  enableCrashes?: boolean;
  enableAnalytics?: boolean;
  logLevel?: 'verbose' | 'debug' | 'info' | 'warning' | 'error' | 'assert' | 'none';
  userId?: string;
  countryCode?: string;
  distributionGroupId?: string;
  crashesListener?: {
    shouldProcess?: (report: any) => boolean;
    shouldAwaitUserConfirmation?: (report: any) => boolean;
    getErrorAttachments?: (report: any) => any[];
  };
  customProperties?: Record<string, string | number | boolean>;
  enabledForDebuggableBuild?: boolean;
  enableManualSessionTracker?: boolean;
  enableAutomaticSessionTracker?: boolean;
  sessionTimeout?: number;
  enableDistribute?: boolean;
  enablePush?: boolean;
}

// AppCenterUser interface not used but reserved for future use
// interface AppCenterUser {
//   userId?: string;
//   countryCode?: string;
//   distributionGroupId?: string;
// }

interface AppCenterCrashReport {
  id: string;
  threadName?: string;
  exception?: Error;
  errorAttachments?: any[];
  properties?: Record<string, string>;
}

interface AppCenterErrorAttachment {
  textAttachment?: string;
  binaryAttachment?: Uint8Array;
  fileName?: string;
  contentType?: string;
}

interface AppCenterSDK {
  start: (appSecret: string, services: any[]) => void;
  setLogLevel: (logLevel: string) => void;
  isEnabled: () => Promise<boolean>;
  setEnabled: (enabled: boolean) => Promise<void>;
  getInstallId: () => Promise<string>;
  setUserId: (userId: string) => void;
  setCountryCode: (countryCode: string) => void;
  Crashes: {
    setEnabled: (enabled: boolean) => Promise<void>;
    isEnabled: () => Promise<boolean>;
    generateTestCrash: () => void;
    hasReceivedMemoryWarningInLastSession: () => Promise<boolean>;
    hasCrashedInLastSession: () => Promise<boolean>;
    lastSessionCrashReport: () => Promise<AppCenterCrashReport | null>;
    trackError: (error: Error, properties?: Record<string, string>, attachments?: AppCenterErrorAttachment[]) => void;
    setListener: (listener: any) => void;
    notifyUserConfirmation: (userConfirmation: number) => void;
  };
  Analytics: {
    setEnabled: (enabled: boolean) => Promise<void>;
    isEnabled: () => Promise<boolean>;
    trackEvent: (name: string, properties?: Record<string, string>) => void;
    pause: () => void;
    resume: () => void;
    enableManualSessionTracker: () => void;
    startSession: () => void;
    endSession: () => void;
    setTransmissionInterval: (seconds: number) => void;
  };
  Push: {
    setEnabled: (enabled: boolean) => Promise<void>;
    isEnabled: () => Promise<boolean>;
    setListener: (listener: any) => void;
  };
  Distribute: {
    setEnabled: (enabled: boolean) => Promise<void>;
    isEnabled: () => Promise<boolean>;
    notifyUpdateAction: (action: number) => void;
    disableAutomaticCheckForUpdate: () => void;
    checkForUpdate: () => void;
    setListener: (listener: any) => void;
  };
}

declare global {
  interface Window {
    AppCenter?: AppCenterSDK;
    MSAppCenter?: AppCenterSDK;
  }
}

@RegisterProvider({
  id: 'appcenter',
  name: 'Microsoft App Center',
  type: 'error-tracking' as ProviderType,
  version: '1.0.0',
  supportedPlatforms: ['web', 'ios', 'android'],
  configSchema: {
    appSecret: { type: 'string', required: true },
    enableCrashes: { type: 'boolean', default: true },
    enableAnalytics: { type: 'boolean', default: true },
    logLevel: { type: 'string', default: 'warning' },
    enabledForDebuggableBuild: { type: 'boolean', default: true },
    enableManualSessionTracker: { type: 'boolean', default: false },
    enableAutomaticSessionTracker: { type: 'boolean', default: true },
    sessionTimeout: { type: 'number', default: 1800 },
    enableDistribute: { type: 'boolean', default: false },
    enablePush: { type: 'boolean', default: false },
  },
})
export class AppCenterProvider extends BaseErrorTrackingProvider {
  readonly id = 'appcenter';
  readonly name = 'Microsoft App Center';
  readonly version = '1.0.0';

  private appCenter?: AppCenterSDK;
  // @ts-ignore - Reserved for future use
  private _appCenterConfig: AppCenterConfig | null = null;
  private scriptLoaded = false;

  /**
   * Check if provider is initialized
   */
  get isInitialized(): boolean {
    return this.initialized;
  }

  protected async doInitialize(config: AppCenterConfig): Promise<void> {
    if (!config.appSecret) {
      throw new Error('App Center app secret is required');
    }

    this._appCenterConfig = config;

    // Load App Center SDK
    await this.loadAppCenterSDK();

    if (!window.AppCenter) {
      throw new Error('Failed to load App Center SDK');
    }

    this.appCenter = window.AppCenter;

    // Set log level
    if (config.logLevel) {
      this.appCenter.setLogLevel(config.logLevel);
    }

    // Determine which services to start
    const services: any[] = [];
    
    if (config.enableCrashes !== false) {
      services.push(this.appCenter.Crashes);
    }
    
    if (config.enableAnalytics !== false) {
      services.push(this.appCenter.Analytics);
    }
    
    if (config.enableDistribute) {
      services.push(this.appCenter.Distribute);
    }
    
    if (config.enablePush) {
      services.push(this.appCenter.Push);
    }

    // Start App Center
    this.appCenter.start(config.appSecret, services);

    // Set user ID if provided
    if (config.userId) {
      this.appCenter.setUserId(config.userId);
    }

    // Set country code if provided
    if (config.countryCode) {
      this.appCenter.setCountryCode(config.countryCode);
    }

    // Configure Analytics if enabled
    if (config.enableAnalytics !== false && this.appCenter.Analytics) {
      if (config.enableManualSessionTracker) {
        this.appCenter.Analytics.enableManualSessionTracker();
      }
      
      if (config.sessionTimeout) {
        this.appCenter.Analytics.setTransmissionInterval(config.sessionTimeout);
      }
    }

    // Configure Crashes if enabled
    if (config.enableCrashes !== false && this.appCenter.Crashes && config.crashesListener) {
      this.appCenter.Crashes.setListener(config.crashesListener);
    }

    this.logger.info('App Center initialized successfully', {
      appSecret: config.appSecret,
      enableCrashes: config.enableCrashes,
      enableAnalytics: config.enableAnalytics,
      logLevel: config.logLevel,
    });
  }

  private async loadAppCenterSDK(): Promise<void> {
    if (this.scriptLoaded) {
      return;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://appcenter.ms/sdk/js/latest/appcenter.min.js';
      script.async = true;
      script.crossOrigin = 'anonymous';

      script.onload = () => {
        this.scriptLoaded = true;
        resolve();
      };

      script.onerror = () => {
        reject(new Error('Failed to load App Center SDK'));
      };

      document.head.appendChild(script);
    });
  }

  protected async doShutdown(): Promise<void> {
    if (this.appCenter) {
      await this.appCenter.setEnabled(false);
    }
    this.appCenter = undefined;
    this._appCenterConfig = null;
    this.scriptLoaded = false;
  }

  protected async doUpdateConsent(consent: ConsentSettings): Promise<void> {
    if (!this.appCenter) return;

    if (consent.errorTracking === false) {
      await this.appCenter.setEnabled(false);
      if (this.appCenter.Crashes) {
        await this.appCenter.Crashes.setEnabled(false);
      }
      this.setEnabled(false);
      this.logger.info('App Center error tracking disabled by consent');
    } else if (consent.errorTracking === true) {
      await this.appCenter.setEnabled(true);
      if (this.appCenter.Crashes) {
        await this.appCenter.Crashes.setEnabled(true);
      }
      this.setEnabled(true);
      this.logger.info('App Center error tracking enabled by consent');
    }
  }

  protected async doLogError(error: Error, context: ErrorContext): Promise<void> {
    if (!this.appCenter?.Crashes) {
      throw new Error('App Center Crashes not initialized');
    }

    // Prepare properties
    const properties: Record<string, string> = {};
    
    // Add context properties
    if (context.tags && Object.keys(context.tags).length > 0) {
      Object.entries(context.tags).forEach(([key, value]) => {
        properties[key] = value;
      });
    }

    // Add extra context
    if (context.extra && Object.keys(context.extra).length > 0) {
      Object.entries(context.extra).forEach(([key, value]) => {
        properties[key] = typeof value === 'string' ? value : JSON.stringify(value);
      });
    }

    // Add user context
    if (context.user && Object.keys(context.user).length > 0) {
      Object.entries(context.user).forEach(([key, value]) => {
        properties[`user_${key}`] = String(value);
      });
    }

    // Add severity
    if (context.severity) {
      properties.severity = context.severity;
    }

    // Only add timestamp and platform if we have other properties
    if (Object.keys(properties).length > 0) {
      if (context.timestamp) {
        properties.timestamp = context.timestamp;
      }
      if (context.platform) {
        properties.platform = context.platform;
      }
    }

    // Prepare attachments
    const attachments: AppCenterErrorAttachment[] = [];

    // Add breadcrumbs as text attachment
    if (context.breadcrumbs && context.breadcrumbs.length > 0) {
      const breadcrumbsText = context.breadcrumbs
        .map(b => `[${b.timestamp ? new Date(b.timestamp).toISOString() : 'no-timestamp'}] ${b.category || 'default'}: ${b.message}`)
        .join('\n');
      
      attachments.push({
        textAttachment: breadcrumbsText,
        fileName: 'breadcrumbs.txt',
        contentType: 'text/plain',
      });
    }

    // Add context as JSON attachment
    if (Object.keys(context).length > 0) {
      attachments.push({
        textAttachment: JSON.stringify(context, null, 2),
        fileName: 'context.json',
        contentType: 'application/json',
      });
    }

    // Track error
    this.appCenter.Crashes.trackError(error, properties, attachments);
  }

  protected async doLogMessage(message: string, level: 'debug' | 'info' | 'warning'): Promise<void> {
    if (!this.appCenter?.Analytics) {
      throw new Error('App Center Analytics not initialized');
    }

    // Log message as analytics event
    this.appCenter.Analytics.trackEvent(`log_${level}`, {
      message,
      timestamp: new Date().toISOString(),
    });
  }

  protected doSetUserContext(user: Record<string, any>): void {
    if (!this.appCenter) return;

    if (user.id) {
      this.appCenter.setUserId(user.id);
    }

    if (user.countryCode) {
      this.appCenter.setCountryCode(user.countryCode);
    }
  }

  protected doSetExtraContext(_key: string, _value: any): void {
    // App Center doesn't have a direct way to set global extra context
    // This will be included in individual error reports
  }

  protected doSetTags(_tags: Record<string, string>): void {
    // App Center doesn't have a direct way to set global tags
    // These will be included in individual error reports
  }

  protected async doCaptureException(exception: Error, context: ErrorContext): Promise<void> {
    // Same as doLogError for App Center
    await this.doLogError(exception, context);
  }

  protected async doProviderReset(): Promise<void> {
    if (!this.appCenter) return;

    // Reset user ID
    this.appCenter.setUserId('');
  }

  protected doSetDebugMode(enabled: boolean): void {
    if (!this.appCenter) return;

    if (enabled) {
      this.appCenter.setLogLevel('verbose');
      this.logger.debug('App Center debug mode enabled');
    } else {
      this.appCenter.setLogLevel('warning');
    }
  }

  protected async doDisable(): Promise<void> {
    if (!this.appCenter) return;
    await this.appCenter.setEnabled(false);
  }

  protected async doEnable(): Promise<void> {
    if (!this.appCenter) return;
    await this.appCenter.setEnabled(true);
  }

  protected doAddBreadcrumb(_message: string, _category?: string, _data?: Record<string, any>): void {
    // App Center doesn't have a direct way to add breadcrumbs
    // Breadcrumbs will be included in error reports
  }

  /**
   * Check if App Center is enabled (async method specific to AppCenter)
   */
  async isAppCenterEnabled(): Promise<boolean> {
    if (!this.appCenter) return false;
    return this.appCenter.isEnabled();
  }

  /**
   * Enable or disable App Center
   */
  async setAppCenterEnabled(enabled: boolean): Promise<void> {
    if (!this.appCenter) return;
    await this.appCenter.setEnabled(enabled);
  }

  /**
   * Get App Center install ID
   */
  async getInstallId(): Promise<string> {
    if (!this.appCenter) return '';
    return this.appCenter.getInstallId();
  }

  /**
   * Set user ID
   */
  setUserId(userId: string): void {
    if (!this.appCenter) return;
    this.appCenter.setUserId(userId);
  }

  /**
   * Set country code
   */
  setCountryCode(countryCode: string): void {
    if (!this.appCenter) return;
    this.appCenter.setCountryCode(countryCode);
  }

  /**
   * Generate test crash
   */
  generateTestCrash(): void {
    if (!this.appCenter?.Crashes) return;
    this.appCenter.Crashes.generateTestCrash();
  }

  /**
   * Check if crashed in last session
   */
  async hasCrashedInLastSession(): Promise<boolean> {
    if (!this.appCenter?.Crashes) return false;
    return this.appCenter.Crashes.hasCrashedInLastSession();
  }

  /**
   * Check if received memory warning in last session
   */
  async hasReceivedMemoryWarningInLastSession(): Promise<boolean> {
    if (!this.appCenter?.Crashes) return false;
    return this.appCenter.Crashes.hasReceivedMemoryWarningInLastSession();
  }

  /**
   * Get last session crash report
   */
  async lastSessionCrashReport(): Promise<AppCenterCrashReport | null> {
    if (!this.appCenter?.Crashes) return null;
    return this.appCenter.Crashes.lastSessionCrashReport();
  }

  /**
   * Track analytics event
   */
  trackEvent(name: string, properties?: Record<string, string>): void {
    if (!this.appCenter?.Analytics) return;
    this.appCenter.Analytics.trackEvent(name, properties);
  }

  /**
   * Start manual session
   */
  startSession(): void {
    if (!this.appCenter?.Analytics) return;
    this.appCenter.Analytics.startSession();
  }

  /**
   * End manual session
   */
  endSession(): void {
    if (!this.appCenter?.Analytics) return;
    this.appCenter.Analytics.endSession();
  }

  /**
   * Pause analytics
   */
  pauseAnalytics(): void {
    if (!this.appCenter?.Analytics) return;
    this.appCenter.Analytics.pause();
  }

  /**
   * Resume analytics
   */
  resumeAnalytics(): void {
    if (!this.appCenter?.Analytics) return;
    this.appCenter.Analytics.resume();
  }

  /**
   * Check for updates (if Distribute is enabled)
   */
  checkForUpdate(): void {
    if (!this.appCenter?.Distribute) return;
    this.appCenter.Distribute.checkForUpdate();
  }

  /**
   * Disable automatic check for updates
   */
  disableAutomaticCheckForUpdate(): void {
    if (!this.appCenter?.Distribute) return;
    this.appCenter.Distribute.disableAutomaticCheckForUpdate();
  }

  /**
   * Track error (alias for logError)
   */
  async trackError(error: Error | string, context?: ErrorContext): Promise<void> {
    if (!this.initialized) {
      throw new Error('App Center Crashes not initialized');
    }
    return this.logError(error, context);
  }

  /**
   * Set user (alias for setUserContext)
   */
  async setUser(user: Record<string, any>): Promise<void> {
    this.setUserContext(user);
  }

  /**
   * Set context (generic context setter)
   */
  async setContext(key: string, value: any): Promise<void> {
    this.setExtraContext(key, value);
  }
}