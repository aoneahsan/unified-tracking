/* eslint-disable no-console -- This module is the single centralized logging
   source for the package; it is the only place direct console.* is allowed.
   It intentionally does NOT patch the host app's global console (a library must
   not mutate its consumer's environment). */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

const LEVELS: LogLevel[] = ['debug', 'info', 'warn', 'error', 'silent'];

/** Keys whose values are masked by {@link Logger.redact} before logging. */
const SENSITIVE_KEY = /(api[-_]?key|token|secret|dsn|password|auth|credential)/i;

export class Logger {
  private static instance: Logger;
  private prefix: string;
  private debugMode = false;
  // Default to 'warn' in dev AND prod — only warnings + errors are visible
  // unless the consumer opts into more via setLogLevel()/enableDebugMode().
  private logLevel: LogLevel = 'warn';

  constructor(prefix: string = 'UnifiedTracking') {
    this.prefix = `[${prefix}]`;
  }

  static getInstance(prefix?: string): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(prefix);
    }
    return Logger.instance;
  }

  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
    this.logLevel = enabled ? 'debug' : 'warn';
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  getLogLevel(): LogLevel {
    return this.logLevel;
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.log(`${this.prefix} ${message}`, ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.info(`${this.prefix} ${message}`, ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn(`${this.prefix} ${message}`, ...args);
    }
  }

  error(message: string, ...args: unknown[]): void {
    if (this.shouldLog('error')) {
      console.error(`${this.prefix} ${message}`, ...args);
    }
  }

  /**
   * Returns a shallow copy of an object with the values of sensitive keys
   * (apiKey, token, secret, dsn, password, auth, credential) replaced by
   * '[REDACTED]'. Use before logging anything derived from user config so
   * credentials never reach the console. Non-objects are returned unchanged.
   */
  static redact<T>(value: T): T {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return value;
    }
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (SENSITIVE_KEY.test(key)) {
        out[key] = '[REDACTED]';
      } else if (val && typeof val === 'object' && !Array.isArray(val)) {
        out[key] = Logger.redact(val);
      } else {
        out[key] = val;
      }
    }
    return out as T;
  }

  private shouldLog(level: Exclude<LogLevel, 'silent'>): boolean {
    if (this.debugMode) {
      return true;
    }
    return LEVELS.indexOf(level) >= LEVELS.indexOf(this.logLevel);
  }
}
