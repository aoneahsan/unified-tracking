/* eslint-disable no-console -- This module is the single centralized logging
   source for the package; it is the only place direct console.* is allowed.
   It intentionally does NOT patch the host app's global console (a library must
   not mutate its consumer's environment). */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

const LEVELS: LogLevel[] = ['debug', 'info', 'warn', 'error', 'silent'];

/** Keys whose values are masked by {@link Logger.redact} before logging. */
const SENSITIVE_KEY =
  /(api[-_]?key|write[-_]?key|access[-_]?key|client[-_]?key|private[-_]?key|secret|token|dsn|password|passwd|pwd|auth|credential)/i;

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
      console.log(`${this.prefix} ${message}`, ...args.map((a) => Logger.redact(a)));
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.info(`${this.prefix} ${message}`, ...args.map((a) => Logger.redact(a)));
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn(`${this.prefix} ${message}`, ...args.map((a) => Logger.redact(a)));
    }
  }

  error(message: string, ...args: unknown[]): void {
    if (this.shouldLog('error')) {
      console.error(`${this.prefix} ${message}`, ...args.map((a) => Logger.redact(a)));
    }
  }

  /**
   * Returns a copy of an object with the values of sensitive keys (apiKey,
   * writeKey, accessToken, token, secret, dsn, password, auth, credential, …)
   * replaced by '[REDACTED]'. This is applied automatically to every argument
   * of debug/info/warn/error (see the sink methods above), so provider config
   * — tokens, DSNs, write keys — never reaches the console even when a consumer
   * raises the log level or enables debug mode.
   *
   * Primitives, arrays, and Error instances are returned unchanged (Errors keep
   * their message/stack for logging); recursion is capped to avoid runaway
   * traversal of deep or circular objects.
   */
  static redact<T>(value: T, depth = 0): T {
    if (!value || typeof value !== 'object' || Array.isArray(value) || value instanceof Error || depth > 6) {
      return value;
    }
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (SENSITIVE_KEY.test(key)) {
        out[key] = '[REDACTED]';
      } else if (val && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Error)) {
        out[key] = Logger.redact(val, depth + 1);
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
