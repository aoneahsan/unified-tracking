import { BaseErrorTrackingProvider } from '../../base-error-tracking-provider';
import { RegisterProvider } from '../../registry';
import type { ProviderConfig, ProviderType, ConsentSettings } from '../../../types/provider';
import type { ErrorContext } from '../../../definitions';

interface RollbarConfig extends ProviderConfig {
  accessToken: string;
  environment?: string;
  codeVersion?: string;
  platform?: string;
  endpoint?: string;
  maxItems?: number;
  itemsPerMinute?: number;
  captureUncaught?: boolean;
  captureUnhandledRejections?: boolean;
  autoInstrument?: {
    network?: boolean;
    log?: boolean;
    dom?: boolean;
    navigation?: boolean;
    connectivity?: boolean;
  };
  payload?: {
    environment?: string;
    client?: {
      javascript?: {
        source_map_enabled?: boolean;
        guess_uncaught_frames?: boolean;
      };
    };
    server?: {
      host?: string;
      root?: string;
      branch?: string;
    };
    person?: {
      id?: string;
      username?: string;
      email?: string;
    };
  };
  transform?: (payload: any) => any;
  onSendCallback?: (isUncaught: boolean, args: any[]) => void;
  scrubFields?: string[];
  scrubHeaders?: string[];
  checkIgnore?: (isUncaught: boolean, args: any[], payload: any) => boolean;
  logLevel?: 'critical' | 'error' | 'warning' | 'info' | 'debug';
  reportLevel?: 'critical' | 'error' | 'warning' | 'info' | 'debug';
  uncaughtErrorLevel?: 'critical' | 'error' | 'warning' | 'info' | 'debug';
  hostWhiteList?: string[];
  hostBlackList?: string[];
  ignoredMessages?: string[];
  verbose?: boolean;
  enabled?: boolean;
  telemetry?: boolean;
  maxTelemetryEvents?: number;
  telemetryTypes?: string[];
  autoCollectErrors?: boolean;
  wrapGlobalEventHandlers?: boolean;
  captureIp?: boolean | 'anonymize';
  captureEmail?: boolean;
  captureUsername?: boolean;
}

interface RollbarSDK {
  init: (config: any) => void;
  configure: (config: any) => void;
  critical: (message: string | Error, extra?: any, callback?: (err: any, data: any) => void) => void;
  error: (message: string | Error, extra?: any, callback?: (err: any, data: any) => void) => void;
  warning: (message: string | Error, extra?: any, callback?: (err: any, data: any) => void) => void;
  info: (message: string | Error, extra?: any, callback?: (err: any, data: any) => void) => void;
  debug: (message: string | Error, extra?: any, callback?: (err: any, data: any) => void) => void;
  log: (message: string | Error, extra?: any, callback?: (err: any, data: any) => void) => void;
  scope: (options: any) => RollbarSDK;
  addTransform: (transform: (payload: any) => any) => void;
  addCheckIgnore: (checkIgnore: (isUncaught: boolean, args: any[], payload: any) => boolean) => void;
  person: (person: any) => void;
  telemetry: {
    captureEvent: (type: string, metadata?: any, level?: string) => void;
    captureLog: (message: string, level?: string, extra?: any) => void;
    captureNetwork: (metadata: any, level?: string) => void;
    captureDom: (element: Element, event: string, metadata?: any, level?: string) => void;
    captureNavigation: (from: string, to: string, metadata?: any, level?: string) => void;
    captureConnectivity: (metadata: any, level?: string) => void;
  };
  wrap: (func: Function, context?: any) => Function;
  loadFull: () => void;
  captureEvent: (type: string, metadata: any, level?: string) => void;
  lambdaHandler: (handler: Function) => Function;
  isIgnored: (payload: any) => boolean;
  buildPayload: (data: any) => any;
  sendPayload: (payload: any, callback?: (err: any, response: any) => void) => void;
  wait: (callback: (err: any) => void) => void;
  captureUncaughtExceptions: (enabled?: boolean) => void;
  captureUnhandledRejections: (enabled?: boolean) => void;
  global: (options: any) => RollbarSDK;
}

declare global {
  interface Window {
    Rollbar?: RollbarSDK;
  }
}

@RegisterProvider({
  id: 'rollbar',
  name: 'Rollbar Error Tracking',
  type: 'error-tracking' as ProviderType,
  version: '1.0.0',
  supportedPlatforms: ['web'],
  configSchema: {
    accessToken: { type: 'string', required: true },
    environment: { type: 'string', default: 'production' },
    codeVersion: { type: 'string' },
    platform: { type: 'string', default: 'browser' },
    maxItems: { type: 'number', default: 0 },
    itemsPerMinute: { type: 'number', default: 60 },
    captureUncaught: { type: 'boolean', default: true },
    captureUnhandledRejections: { type: 'boolean', default: true },
    logLevel: { type: 'string', default: 'warning' },
    reportLevel: { type: 'string', default: 'debug' },
    uncaughtErrorLevel: { type: 'string', default: 'error' },
    verbose: { type: 'boolean', default: false },
    enabled: { type: 'boolean', default: true },
    telemetry: { type: 'boolean', default: true },
    maxTelemetryEvents: { type: 'number', default: 100 },
    captureIp: { type: 'boolean', default: true },
    captureEmail: { type: 'boolean', default: true },
    captureUsername: { type: 'boolean', default: true },
  },
})
export class RollbarErrorTrackingProvider extends BaseErrorTrackingProvider {
  readonly id = 'rollbar';
  readonly name = 'Rollbar Error Tracking';
  readonly version = '1.0.0';

  private rollbar?: RollbarSDK;
  private rollbarConfig: RollbarConfig | null = null;
  private scriptLoaded = false;

  protected async doInitialize(config: RollbarConfig): Promise<void> {
    if (!config.accessToken) {
      throw new Error('Rollbar access token is required');
    }

    this.rollbarConfig = config;

    // Load Rollbar SDK
    await this.loadRollbarSDK();

    if (!window.Rollbar) {
      throw new Error('Failed to load Rollbar SDK');
    }

    this.rollbar = window.Rollbar;

    // Configure Rollbar
    const rollbarOptions: any = {
      accessToken: config.accessToken,
      environment: config.environment || 'production',
      codeVersion: config.codeVersion,
      platform: config.platform || 'browser',
      endpoint: config.endpoint,
      maxItems: config.maxItems || 0,
      itemsPerMinute: config.itemsPerMinute || 60,
      captureUncaught: config.captureUncaught !== false,
      captureUnhandledRejections: config.captureUnhandledRejections !== false,
      autoInstrument: config.autoInstrument || {
        network: true,
        log: true,
        dom: true,
        navigation: true,
        connectivity: true,
      },
      payload: config.payload || {},
      transform: config.transform,
      onSendCallback: config.onSendCallback,
      scrubFields: config.scrubFields,
      scrubHeaders: config.scrubHeaders,
      checkIgnore: config.checkIgnore,
      logLevel: config.logLevel || 'warning',
      reportLevel: config.reportLevel || 'debug',
      uncaughtErrorLevel: config.uncaughtErrorLevel || 'error',
      hostWhiteList: config.hostWhiteList,
      hostBlackList: config.hostBlackList,
      ignoredMessages: config.ignoredMessages,
      verbose: config.verbose === true,
      enabled: config.enabled !== false,
      telemetry: config.telemetry !== false,
      maxTelemetryEvents: config.maxTelemetryEvents || 100,
      telemetryTypes: config.telemetryTypes,
      autoCollectErrors: config.autoCollectErrors !== false,
      wrapGlobalEventHandlers: config.wrapGlobalEventHandlers !== false,
      captureIp: config.captureIp !== false,
      captureEmail: config.captureEmail !== false,
      captureUsername: config.captureUsername !== false,
    };

    // Initialize Rollbar
    this.rollbar.init(rollbarOptions);

    this.logger.info('Rollbar initialized successfully', {
      accessToken: config.accessToken,
      environment: config.environment,
      codeVersion: config.codeVersion,
    });
  }

  private async loadRollbarSDK(): Promise<void> {
    if (this.scriptLoaded || window.Rollbar) {
      return;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.src = 'https://cdn.rollbar.com/rollbarjs/refs/tags/v2.25.2/rollbar.min.js';

      script.onload = () => {
        this.scriptLoaded = true;
        resolve();
      };

      script.onerror = () => {
        reject(new Error('Failed to load Rollbar SDK'));
      };

      document.head.appendChild(script);
    });
  }

  protected async doShutdown(): Promise<void> {
    if (this.rollbar) {
      this.rollbar.configure({ enabled: false });
    }
    this.rollbar = undefined;
    this.rollbarConfig = null;
    this.scriptLoaded = false;
  }

  protected async doUpdateConsent(consent: ConsentSettings): Promise<void> {
    if (!this.rollbar) return;

    const enabled = consent.errorTracking === true;
    this.rollbar.configure({ enabled });

    this.logger.info(`Rollbar tracking ${enabled ? 'enabled' : 'disabled'} by consent`);
  }

  protected async doTrackError(error: Error | string, context?: ErrorContext): Promise<void> {
    if (!this.rollbar) {
      throw new Error('Rollbar not initialized');
    }

    const extra: any = {};

    if (context) {
      // Add user information
      if (context.user) {
        extra.person = {
          id: context.user.id,
          email: context.user.email,
          username: context.user.name,
        };
      }

      // Add tags
      if (context.tags) {
        extra.tags = context.tags;
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

    // Choose the appropriate log level
    const level = this.mapSeverityToRollbarLevel(context?.level || 'error');
    
    switch (level) {
      case 'critical':
        this.rollbar.critical(error, extra);
        break;
      case 'error':
        this.rollbar.error(error, extra);
        break;
      case 'warning':
        this.rollbar.warning(error, extra);
        break;
      case 'info':
        this.rollbar.info(error, extra);
        break;
      case 'debug':
        this.rollbar.debug(error, extra);
        break;
      default:
        this.rollbar.error(error, extra);
    }
  }

  private mapSeverityToRollbarLevel(severity: string): string {
    const severityMap: Record<string, string> = {
      'fatal': 'critical',
      'error': 'error',
      'warning': 'warning',
      'info': 'info',
      'debug': 'debug',
    };

    return severityMap[severity] || 'error';
  }

  protected async doSetUser(user: Record<string, any>): Promise<void> {
    if (!this.rollbar) return;

    const person = {
      id: user.id,
      email: user.email,
      username: user.name || user.username,
    };

    // Add additional user properties
    Object.keys(user).forEach(key => {
      if (!['id', 'email', 'name', 'username'].includes(key)) {
        person[key] = user[key];
      }
    });

    this.rollbar.person(person);
  }

  protected async doSetContext(context: Record<string, any>): Promise<void> {
    if (!this.rollbar) return;

    // Rollbar doesn't have a direct context API, so we'll use the global configuration
    this.rollbar.configure({
      payload: {
        context: context,
      },
    });
  }

  protected async doRemoveContext(key: string): Promise<void> {
    if (!this.rollbar) return;

    // Rollbar doesn't have a direct way to remove specific context keys
    // This is a limitation of the Rollbar API
    this.logger.warn(`Rollbar does not support removing individual context keys: ${key}`);
  }

  protected async doClearContext(): Promise<void> {
    if (!this.rollbar) return;

    this.rollbar.configure({
      payload: {
        context: {},
      },
    });
  }

  protected async doCaptureBreadcrumb(breadcrumb: {
    message: string;
    category?: string;
    level?: string;
    data?: Record<string, any>;
  }): Promise<void> {
    if (!this.rollbar) return;

    // Rollbar uses telemetry for breadcrumbs
    const metadata = {
      message: breadcrumb.message,
      category: breadcrumb.category,
      ...breadcrumb.data,
    };

    const level = breadcrumb.level || 'info';
    
    this.rollbar.telemetry.captureEvent('manual', metadata, level);
  }

  protected doSetDebugMode(enabled: boolean): void {
    if (!this.rollbar) return;

    this.rollbar.configure({
      verbose: enabled,
      logLevel: enabled ? 'debug' : 'warning',
    });
  }

  /**
   * Configure Rollbar with new options
   */
  configure(config: Partial<RollbarConfig>): void {
    if (!this.rollbar) return;

    this.rollbar.configure(config);
  }

  /**
   * Create a new Rollbar instance with scoped configuration
   */
  scope(options: any): RollbarSDK | null {
    if (!this.rollbar) return null;

    return this.rollbar.scope(options);
  }

  /**
   * Add a transform function
   */
  addTransform(transform: (payload: any) => any): void {
    if (!this.rollbar) return;

    this.rollbar.addTransform(transform);
  }

  /**
   * Add a check ignore function
   */
  addCheckIgnore(checkIgnore: (isUncaught: boolean, args: any[], payload: any) => boolean): void {
    if (!this.rollbar) return;

    this.rollbar.addCheckIgnore(checkIgnore);
  }

  /**
   * Wrap a function to capture errors
   */
  wrap(func: Function, context?: any): Function | null {
    if (!this.rollbar) return null;

    return this.rollbar.wrap(func, context);
  }

  /**
   * Load the full Rollbar SDK
   */
  loadFull(): void {
    if (!this.rollbar) return;

    this.rollbar.loadFull();
  }

  /**
   * Capture a custom event
   */
  captureEvent(type: string, metadata: any, level?: string): void {
    if (!this.rollbar) return;

    this.rollbar.captureEvent(type, metadata, level);
  }

  /**
   * Capture telemetry log
   */
  captureTelemetryLog(message: string, level?: string, extra?: any): void {
    if (!this.rollbar) return;

    this.rollbar.telemetry.captureLog(message, level, extra);
  }

  /**
   * Capture telemetry network event
   */
  captureTelemetryNetwork(metadata: any, level?: string): void {
    if (!this.rollbar) return;

    this.rollbar.telemetry.captureNetwork(metadata, level);
  }

  /**
   * Capture telemetry DOM event
   */
  captureTelemetryDom(element: Element, event: string, metadata?: any, level?: string): void {
    if (!this.rollbar) return;

    this.rollbar.telemetry.captureDom(element, event, metadata, level);
  }

  /**
   * Capture telemetry navigation event
   */
  captureTelemetryNavigation(from: string, to: string, metadata?: any, level?: string): void {
    if (!this.rollbar) return;

    this.rollbar.telemetry.captureNavigation(from, to, metadata, level);
  }

  /**
   * Capture telemetry connectivity event
   */
  captureTelemetryConnectivity(metadata: any, level?: string): void {
    if (!this.rollbar) return;

    this.rollbar.telemetry.captureConnectivity(metadata, level);
  }

  /**
   * Check if an error would be ignored
   */
  isIgnored(payload: any): boolean {
    if (!this.rollbar) return false;

    return this.rollbar.isIgnored(payload);
  }

  /**
   * Build a payload
   */
  buildPayload(data: any): any {
    if (!this.rollbar) return null;

    return this.rollbar.buildPayload(data);
  }

  /**
   * Send a payload
   */
  sendPayload(payload: any, callback?: (err: any, response: any) => void): void {
    if (!this.rollbar) return;

    this.rollbar.sendPayload(payload, callback);
  }

  /**
   * Wait for all items to be sent
   */
  wait(callback: (err: any) => void): void {
    if (!this.rollbar) return;

    this.rollbar.wait(callback);
  }

  /**
   * Enable/disable uncaught exception capturing
   */
  captureUncaughtExceptions(enabled: boolean = true): void {
    if (!this.rollbar) return;

    this.rollbar.captureUncaughtExceptions(enabled);
  }

  /**
   * Enable/disable unhandled rejection capturing
   */
  captureUnhandledRejections(enabled: boolean = true): void {
    if (!this.rollbar) return;

    this.rollbar.captureUnhandledRejections(enabled);
  }

  /**
   * Get global Rollbar instance
   */
  global(options: any): RollbarSDK | null {
    if (!this.rollbar) return null;

    return this.rollbar.global(options);
  }
}