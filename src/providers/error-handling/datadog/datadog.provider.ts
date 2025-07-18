import { BaseErrorTrackingProvider } from '../../base-error-tracking-provider';
import { RegisterProvider } from '../../registry';
import type { ProviderConfig, ProviderType, ConsentSettings } from '../../../types/provider';
import type { ErrorContext } from '../../../definitions';

interface DataDogConfig extends ProviderConfig {
  clientToken: string;
  applicationId: string;
  site?: string;
  service?: string;
  env?: string;
  version?: string;
  sessionSampleRate?: number;
  sessionReplaySampleRate?: number;
  trackUserInteractions?: boolean;
  trackResources?: boolean;
  trackLongTasks?: boolean;
  defaultPrivacyLevel?: 'allow' | 'mask' | 'mask-user-input';
  beforeSend?: (event: any) => boolean | void;
  silentMultipleInit?: boolean;
  trackingConsent?: 'granted' | 'not-granted';
  compressIntakeRequests?: boolean;
  proxy?: string;
  telemetrySampleRate?: number;
  allowedTracingUrls?: Array<string | RegExp>;
  excludedActivityUrls?: Array<string | RegExp>;
  workerUrl?: string;
  proxyUrl?: string;
}

interface DataDogSDK {
  init: (config: any) => void;
  addError: (error: Error | string, context?: any) => void;
  addAction: (name: string, context?: any) => void;
  addTiming: (name: string, time?: number) => void;
  setUser: (user: any) => void;
  setUserProperty: (key: string, value: any) => void;
  removeUserProperty: (key: string) => void;
  clearUser: () => void;
  setGlobalContextProperty: (key: string, value: any) => void;
  removeGlobalContextProperty: (key: string) => void;
  getGlobalContext: () => any;
  setGlobalContext: (context: any) => void;
  addLoggerGlobalContext: (key: string, value: any) => void;
  removeLoggerGlobalContext: (key: string) => void;
  setLoggerGlobalContext: (context: any) => void;
  logger: {
    debug: (message: string, messageContext?: any) => void;
    info: (message: string, messageContext?: any) => void;
    warn: (message: string, messageContext?: any) => void;
    error: (message: string, messageContext?: any) => void;
  };
  startView: (name: string, viewContext?: any) => void;
  stopView: (name: string, viewContext?: any) => void;
  startSessionReplayRecording: () => void;
  stopSessionReplayRecording: () => void;
  getSessionReplayLink: () => string | undefined;
  setTrackingConsent: (consent: 'granted' | 'not-granted') => void;
}

declare global {
  interface Window {
    DD_RUM?: DataDogSDK;
  }
}

@RegisterProvider({
  id: 'datadog',
  name: 'DataDog RUM',
  type: 'error-tracking' as ProviderType,
  version: '1.0.0',
  supportedPlatforms: ['web'],
  configSchema: {
    clientToken: { type: 'string', required: true },
    applicationId: { type: 'string', required: true },
    site: { type: 'string', default: 'datadoghq.com' },
    service: { type: 'string' },
    env: { type: 'string' },
    version: { type: 'string' },
    sessionSampleRate: { type: 'number', default: 100 },
    sessionReplaySampleRate: { type: 'number', default: 20 },
    trackUserInteractions: { type: 'boolean', default: true },
    trackResources: { type: 'boolean', default: true },
    trackLongTasks: { type: 'boolean', default: true },
    defaultPrivacyLevel: { type: 'string', default: 'mask-user-input' },
  },
})
export class DataDogErrorTrackingProvider extends BaseErrorTrackingProvider {
  readonly id = 'datadog';
  readonly name = 'DataDog RUM';
  readonly version = '1.0.0';

  private dataDog?: DataDogSDK;
  private dataDogConfig: DataDogConfig | null = null;
  private scriptLoaded = false;

  protected async doInitialize(config: DataDogConfig): Promise<void> {
    if (!config.clientToken || !config.applicationId) {
      throw new Error('DataDog client token and application ID are required');
    }

    this.dataDogConfig = config;

    // Load DataDog SDK
    await this.loadDataDogSDK();

    if (!window.DD_RUM) {
      throw new Error('Failed to load DataDog RUM SDK');
    }

    this.dataDog = window.DD_RUM;

    // Configure DataDog RUM
    const dataDogOptions: any = {
      clientToken: config.clientToken,
      applicationId: config.applicationId,
      site: config.site || 'datadoghq.com',
      service: config.service,
      env: config.env,
      version: config.version,
      sessionSampleRate: config.sessionSampleRate || 100,
      sessionReplaySampleRate: config.sessionReplaySampleRate || 20,
      trackUserInteractions: config.trackUserInteractions !== false,
      trackResources: config.trackResources !== false,
      trackLongTasks: config.trackLongTasks !== false,
      defaultPrivacyLevel: config.defaultPrivacyLevel || 'mask-user-input',
      beforeSend: config.beforeSend,
      silentMultipleInit: config.silentMultipleInit,
      trackingConsent: config.trackingConsent || 'granted',
      compressIntakeRequests: config.compressIntakeRequests,
      proxy: config.proxy,
      telemetrySampleRate: config.telemetrySampleRate,
      allowedTracingUrls: config.allowedTracingUrls,
      excludedActivityUrls: config.excludedActivityUrls,
      workerUrl: config.workerUrl,
      proxyUrl: config.proxyUrl,
    };

    // Initialize DataDog RUM
    this.dataDog.init(dataDogOptions);

    this.logger.info('DataDog RUM initialized successfully', {
      clientToken: config.clientToken,
      applicationId: config.applicationId,
      site: config.site,
    });
  }

  private async loadDataDogSDK(): Promise<void> {
    if (this.scriptLoaded || window.DD_RUM) {
      return;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.src = 'https://www.datadoghq-browser-agent.com/datadog-rum-v4.js';

      script.onload = () => {
        this.scriptLoaded = true;
        resolve();
      };

      script.onerror = () => {
        reject(new Error('Failed to load DataDog RUM SDK'));
      };

      document.head.appendChild(script);
    });
  }

  protected async doShutdown(): Promise<void> {
    this.dataDog = undefined;
    this.dataDogConfig = null;
    this.scriptLoaded = false;
  }

  protected async doUpdateConsent(consent: ConsentSettings): Promise<void> {
    if (!this.dataDog) return;

    const trackingConsent = consent.errorTracking ? 'granted' : 'not-granted';
    this.dataDog.setTrackingConsent(trackingConsent);

    this.logger.info(`DataDog tracking consent updated: ${trackingConsent}`);
  }

  protected async doTrackError(error: Error | string, context?: ErrorContext): Promise<void> {
    if (!this.dataDog) {
      throw new Error('DataDog RUM not initialized');
    }

    const errorContext: any = {};

    if (context) {
      if (context.user) {
        errorContext.user = context.user;
      }

      if (context.tags) {
        errorContext.tags = context.tags;
      }

      if (context.extra) {
        errorContext.extra = context.extra;
      }

      if (context.level) {
        errorContext.level = context.level;
      }

      if (context.fingerprint) {
        errorContext.fingerprint = context.fingerprint;
      }
    }

    this.dataDog.addError(error, errorContext);
  }

  protected async doSetUser(user: Record<string, any>): Promise<void> {
    if (!this.dataDog) return;

    const userContext: any = {};

    if (user.id) {
      userContext.id = user.id;
    }

    if (user.email) {
      userContext.email = user.email;
    }

    if (user.name) {
      userContext.name = user.name;
    }

    if (user.username) {
      userContext.username = user.username;
    }

    // Add custom properties
    Object.keys(user).forEach(key => {
      if (!['id', 'email', 'name', 'username'].includes(key)) {
        userContext[key] = user[key];
      }
    });

    this.dataDog.setUser(userContext);
  }

  protected async doSetContext(context: Record<string, any>): Promise<void> {
    if (!this.dataDog) return;

    Object.entries(context).forEach(([key, value]) => {
      this.dataDog!.setGlobalContextProperty(key, value);
    });
  }

  protected async doRemoveContext(key: string): Promise<void> {
    if (!this.dataDog) return;

    this.dataDog.removeGlobalContextProperty(key);
  }

  protected async doClearContext(): Promise<void> {
    if (!this.dataDog) return;

    this.dataDog.setGlobalContext({});
  }

  protected async doCaptureBreadcrumb(breadcrumb: {
    message: string;
    category?: string;
    level?: string;
    data?: Record<string, any>;
  }): Promise<void> {
    if (!this.dataDog) return;

    // DataDog uses actions for breadcrumbs
    const actionContext: any = {
      message: breadcrumb.message,
      category: breadcrumb.category,
      level: breadcrumb.level,
    };

    if (breadcrumb.data) {
      Object.assign(actionContext, breadcrumb.data);
    }

    this.dataDog.addAction(breadcrumb.message, actionContext);
  }

  protected doSetDebugMode(enabled: boolean): void {
    // DataDog doesn't have a specific debug mode API
    // Debug information is controlled by the console and network tabs
    this.logger.info(`DataDog debug mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Add a custom timing
   */
  addTiming(name: string, time?: number): void {
    if (!this.dataDog) return;

    this.dataDog.addTiming(name, time);
  }

  /**
   * Start a view
   */
  startView(name: string, viewContext?: Record<string, any>): void {
    if (!this.dataDog) return;

    this.dataDog.startView(name, viewContext);
  }

  /**
   * Stop a view
   */
  stopView(name: string, viewContext?: Record<string, any>): void {
    if (!this.dataDog) return;

    this.dataDog.stopView(name, viewContext);
  }

  /**
   * Start session replay recording
   */
  startSessionReplayRecording(): void {
    if (!this.dataDog) return;

    this.dataDog.startSessionReplayRecording();
  }

  /**
   * Stop session replay recording
   */
  stopSessionReplayRecording(): void {
    if (!this.dataDog) return;

    this.dataDog.stopSessionReplayRecording();
  }

  /**
   * Get session replay link
   */
  getSessionReplayLink(): string | undefined {
    if (!this.dataDog) return undefined;

    return this.dataDog.getSessionReplayLink();
  }

  /**
   * Set user property
   */
  setUserProperty(key: string, value: any): void {
    if (!this.dataDog) return;

    this.dataDog.setUserProperty(key, value);
  }

  /**
   * Remove user property
   */
  removeUserProperty(key: string): void {
    if (!this.dataDog) return;

    this.dataDog.removeUserProperty(key);
  }

  /**
   * Clear user
   */
  clearUser(): void {
    if (!this.dataDog) return;

    this.dataDog.clearUser();
  }

  /**
   * Get global context
   */
  getGlobalContext(): any {
    if (!this.dataDog) return {};

    return this.dataDog.getGlobalContext();
  }

  /**
   * Log a message
   */
  logMessage(level: 'debug' | 'info' | 'warn' | 'error', message: string, context?: Record<string, any>): void {
    if (!this.dataDog) return;

    this.dataDog.logger[level](message, context);
  }
}