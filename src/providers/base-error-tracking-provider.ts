import { BaseProviderImpl } from './base-provider-impl';
import type { ErrorTrackingProvider } from './base';
import type { ErrorContext } from '../definitions';
import type { ProviderType } from '../types/provider';

interface Breadcrumb {
  message: string;
  category?: string;
  timestamp: number;
  data?: Record<string, any>;
}

/**
 * Abstract base class for error tracking provider implementations
 */
export abstract class BaseErrorTrackingProvider extends BaseProviderImpl implements ErrorTrackingProvider {
  readonly type: ProviderType = 'error-tracking';

  protected userContext: Record<string, any> = {};
  protected extraContext: Record<string, any> = {};
  protected tags: Record<string, string> = {};
  protected breadcrumbs: Breadcrumb[] = [];
  protected maxBreadcrumbs = 100;

  async logError(error: Error | string, context?: ErrorContext): Promise<void> {
    this.checkReady();

    const errorObject = typeof error === 'string' ? new Error(error) : error;
    const enrichedContext = this.enrichContext(context);

    this.debug('Logging error', { error: errorObject, context: enrichedContext });

    try {
      await this.doLogError(errorObject, enrichedContext);
    } catch (logError) {
      this.logger.error('Failed to log error', logError);
      throw logError;
    }
  }

  /**
   * Provider-specific error logging logic
   */
  protected abstract doLogError(error: Error, context: ErrorContext): Promise<void>;

  async logMessage(message: string, level: 'debug' | 'info' | 'warning' = 'info'): Promise<void> {
    this.checkReady();

    this.debug(`Logging message [${level}]: ${message}`);

    try {
      await this.doLogMessage(message, level);
    } catch (error) {
      this.logger.error('Failed to log message', error);
      throw error;
    }
  }

  /**
   * Provider-specific message logging logic
   * Override if provider supports this feature
   */
  protected async doLogMessage(message: string, level: 'debug' | 'info' | 'warning'): Promise<void> {
    // Default implementation: log as breadcrumb
    this.addBreadcrumb(message, 'log', { level });
  }

  addBreadcrumb(message: string, category?: string, data?: Record<string, any>): void {
    const breadcrumb: Breadcrumb = {
      message,
      category,
      timestamp: Date.now(),
      data,
    };

    this.breadcrumbs.push(breadcrumb);

    // Maintain max breadcrumbs limit
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs.shift();
    }

    this.debug('Added breadcrumb', breadcrumb);
  }

  setUserContext(user: { id?: string; email?: string; username?: string; [key: string]: any }): void {
    this.debug('Setting user context', user);
    this.userContext = { ...user };
    this.doSetUserContext(user);
  }

  /**
   * Provider-specific user context logic
   */
  protected abstract doSetUserContext(user: Record<string, any>): void;

  setExtraContext(key: string, value: any): void {
    this.debug(`Setting extra context: ${key}`, value);
    this.extraContext[key] = value;
    this.doSetExtraContext(key, value);
  }

  /**
   * Provider-specific extra context logic
   */
  protected abstract doSetExtraContext(key: string, value: any): void;

  setTags(tags: Record<string, string>): void {
    this.debug('Setting tags', tags);
    this.tags = { ...this.tags, ...tags };
    this.doSetTags(this.tags);
  }

  /**
   * Provider-specific tags logic
   */
  protected abstract doSetTags(tags: Record<string, string>): void;

  async captureException(exception: Error, context?: ErrorContext): Promise<void> {
    this.checkReady();

    const enrichedContext = this.enrichContext(context);
    (enrichedContext as any).isException = true;

    this.debug('Capturing exception', { exception, context: enrichedContext });

    try {
      await this.doCaptureException(exception, enrichedContext);
    } catch (error) {
      this.logger.error('Failed to capture exception', error);
      throw error;
    }
  }

  /**
   * Provider-specific exception capture logic
   */
  protected abstract doCaptureException(exception: Error, context: ErrorContext): Promise<void>;

  startTransaction(name: string, operation?: string): any {
    this.debug(`Starting transaction: ${name}`, { operation });
    return this.doStartTransaction?.(name, operation);
  }

  /**
   * Provider-specific transaction start logic
   * Override if provider supports this feature
   */
  protected doStartTransaction?(name: string, operation?: string): any;

  finishTransaction(transaction: any): void {
    this.debug('Finishing transaction', transaction);
    this.doFinishTransaction?.(transaction);
  }

  /**
   * Provider-specific transaction finish logic
   * Override if provider supports this feature
   */
  protected doFinishTransaction?(transaction: any): void;

  protected async doReset(): Promise<void> {
    this.userContext = {};
    this.extraContext = {};
    this.tags = {};
    this.breadcrumbs = [];
    await this.doProviderReset();
  }

  /**
   * Provider-specific reset logic
   */
  protected abstract doProviderReset(): Promise<void>;

  /**
   * Enrich error context with global context data
   */
  protected enrichContext(context?: ErrorContext): ErrorContext {
    // Merge breadcrumbs from context and provider
    const allBreadcrumbs = [...this.breadcrumbs, ...(context?.breadcrumbs || [])];

    return {
      ...context,
      user: { ...this.userContext, ...context?.user },
      extra: { ...this.extraContext, ...context?.extra },
      tags: { ...this.tags, ...context?.tags },
      breadcrumbs: allBreadcrumbs,
      timestamp: context?.timestamp || new Date().toISOString(),
      platform: context?.platform || this.getPlatform(),
    };
  }

  /**
   * Get current platform
   */
  protected getPlatform(): string {
    if (typeof window !== 'undefined') {
      return 'web';
    } else if (typeof global !== 'undefined' && global.process) {
      return 'node';
    }
    return 'unknown';
  }

  /**
   * Format error for logging
   */
  protected formatError(error: Error): Record<string, any> {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...this.extractErrorProperties(error),
    };
  }

  /**
   * Extract additional properties from error object
   */
  protected extractErrorProperties(error: Error): Record<string, any> {
    const properties: Record<string, any> = {};

    // Extract non-standard properties
    for (const key in error) {
      if (key !== 'name' && key !== 'message' && key !== 'stack') {
        try {
          properties[key] = (error as any)[key];
        } catch {
          // Ignore properties that can't be accessed
        }
      }
    }

    return properties;
  }
}
