# Logger Class

Provides structured logging functionality for debugging and monitoring.

## Overview

`Logger` is a flexible logging utility that supports different log levels, custom formatting, and multiple output targets. It's used throughout the plugin for consistent debugging output.

## Class Definition

```typescript
export class Logger {
  private level: LogLevel;
  private enabled: boolean;
  private prefix: string;

  constructor(options?: LoggerOptions);

  debug(...args: any[]): void;
  info(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;

  setLevel(level: LogLevel): void;
  setEnabled(enabled: boolean): void;
  createChild(prefix: string): Logger;
}
```

## Constructor

```typescript
constructor(options?: LoggerOptions)
```

### Parameters

- `options` (optional): Logger configuration options

### LoggerOptions

```typescript
interface LoggerOptions {
  level?: LogLevel; // Minimum log level (default: 'info')
  enabled?: boolean; // Enable/disable logging (default: true)
  prefix?: string; // Log prefix (default: '[UnifiedTracking]')
  timestamps?: boolean; // Include timestamps (default: true)
  colors?: boolean; // Use colors in console (default: true)
  customHandler?: LogHandler; // Custom log handler
}
```

### LogLevel

```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error';
```

### Example

```typescript
const logger = new Logger({
  level: 'debug',
  prefix: '[MyApp]',
  timestamps: true,
});
```

## Methods

### debug()

Log debug-level messages.

```typescript
debug(...args: any[]): void
```

#### Example

```typescript
logger.debug('Initializing provider', { providerId: 'ga' });
// Output: [2024-01-15 10:30:00] [MyApp] DEBUG: Initializing provider { providerId: 'ga' }
```

### info()

Log info-level messages.

```typescript
info(...args: any[]): void
```

#### Example

```typescript
logger.info('Provider initialized successfully');
// Output: [2024-01-15 10:30:01] [MyApp] INFO: Provider initialized successfully
```

### warn()

Log warning-level messages.

```typescript
warn(...args: any[]): void
```

#### Example

```typescript
logger.warn('Event queue is nearly full', { size: 950, max: 1000 });
// Output: [2024-01-15 10:30:02] [MyApp] WARN: Event queue is nearly full { size: 950, max: 1000 }
```

### error()

Log error-level messages.

```typescript
error(...args: any[]): void
```

#### Example

```typescript
logger.error('Failed to send events', new Error('Network error'));
// Output: [2024-01-15 10:30:03] [MyApp] ERROR: Failed to send events Error: Network error
```

### setLevel()

Change the minimum log level.

```typescript
setLevel(level: LogLevel): void
```

#### Parameters

- `level`: New minimum log level

#### Example

```typescript
logger.setLevel('warn'); // Only warn and error messages will be logged
```

### setEnabled()

Enable or disable logging.

```typescript
setEnabled(enabled: boolean): void
```

#### Parameters

- `enabled`: Whether to enable logging

#### Example

```typescript
logger.setEnabled(false); // Disable all logging
```

### createChild()

Create a child logger with additional prefix.

```typescript
createChild(prefix: string): Logger
```

#### Parameters

- `prefix`: Additional prefix for the child logger

#### Returns

A new Logger instance with combined prefix.

#### Example

```typescript
const childLogger = logger.createChild('Analytics');
childLogger.info('Tracking event');
// Output: [2024-01-15 10:30:04] [MyApp:Analytics] INFO: Tracking event
```

## Complete Implementation Example

```typescript
import { Logger, LogLevel } from 'unified-tracking';

class CustomLogger extends Logger {
  private logs: LogEntry[] = [];

  constructor(options?: LoggerOptions) {
    super({
      ...options,
      customHandler: this.handleLog.bind(this),
    });
  }

  private handleLog(level: LogLevel, message: string, args: any[], timestamp: Date): void {
    // Store log entry
    this.logs.push({
      level,
      message,
      args,
      timestamp,
      context: this.getContext(),
    });

    // Still output to console
    this.defaultHandler(level, message, args, timestamp);

    // Send critical errors to monitoring service
    if (level === 'error') {
      this.sendToMonitoring(message, args);
    }
  }

  private getContext(): Record<string, any> {
    return {
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    };
  }

  private async sendToMonitoring(message: string, args: any[]): Promise<void> {
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level: 'error',
          message,
          args,
          context: this.getContext(),
        }),
      });
    } catch (error) {
      // Fail silently to avoid infinite loops
    }
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (!level) return this.logs;
    return this.logs.filter((log) => log.level === level);
  }

  clearLogs(): void {
    this.logs = [];
  }
}

interface LogEntry {
  level: LogLevel;
  message: string;
  args: any[];
  timestamp: Date;
  context: Record<string, any>;
}
```

## Advanced Usage

### 1. Structured Logging

```typescript
class StructuredLogger extends Logger {
  logEvent(event: string, data?: Record<string, any>): void {
    this.info('Event', {
      event,
      data,
      timestamp: new Date().toISOString(),
      sessionId: this.getSessionId(),
    });
  }

  logMetric(metric: string, value: number, tags?: Record<string, string>): void {
    this.info('Metric', {
      metric,
      value,
      tags,
      timestamp: new Date().toISOString(),
    });
  }

  logTiming(operation: string, duration: number): void {
    this.debug('Timing', {
      operation,
      duration,
      unit: 'ms',
    });
  }

  private getSessionId(): string {
    // Implementation depends on your session management
    return 'session-123';
  }
}
```

### 2. Performance Logging

```typescript
class PerformanceLogger extends Logger {
  private timers = new Map<string, number>();

  startTimer(label: string): void {
    this.timers.set(label, performance.now());
    this.debug(`Timer started: ${label}`);
  }

  endTimer(label: string): number {
    const start = this.timers.get(label);
    if (!start) {
      this.warn(`No timer found for: ${label}`);
      return 0;
    }

    const duration = performance.now() - start;
    this.timers.delete(label);

    this.info(`Timer ended: ${label}`, {
      duration: `${duration.toFixed(2)}ms`,
    });

    return duration;
  }

  async measureAsync<T>(label: string, operation: () => Promise<T>): Promise<T> {
    this.startTimer(label);

    try {
      const result = await operation();
      this.endTimer(label);
      return result;
    } catch (error) {
      this.endTimer(label);
      this.error(`Operation failed: ${label}`, error);
      throw error;
    }
  }
}
```

### 3. Conditional Logging

```typescript
class ConditionalLogger extends Logger {
  private conditions = new Map<string, () => boolean>();

  addCondition(name: string, condition: () => boolean): void {
    this.conditions.set(name, condition);
  }

  logIf(condition: string, level: LogLevel, ...args: any[]): void {
    const check = this.conditions.get(condition);

    if (check && check()) {
      this[level](...args);
    }
  }

  // Usage
  debugVerbose(...args: any[]): void {
    this.logIf('verbose', 'debug', ...args);
  }
}

// Example usage
const logger = new ConditionalLogger();
logger.addCondition('verbose', () => localStorage.getItem('verbose') === 'true');
logger.debugVerbose('Detailed information'); // Only logs if verbose is enabled
```

### 4. Remote Logging

```typescript
class RemoteLogger extends Logger {
  private buffer: LogEntry[] = [];
  private flushInterval: number = 5000;
  private maxBufferSize: number = 100;

  constructor(options?: LoggerOptions) {
    super(options);
    this.startFlushTimer();
  }

  protected log(level: LogLevel, ...args: any[]): void {
    super.log(level, ...args);

    // Add to buffer
    this.buffer.push({
      level,
      message: args[0],
      args: args.slice(1),
      timestamp: new Date(),
    });

    // Flush if buffer is full
    if (this.buffer.length >= this.maxBufferSize) {
      this.flush();
    }
  }

  private startFlushTimer(): void {
    setInterval(() => {
      if (this.buffer.length > 0) {
        this.flush();
      }
    }, this.flushInterval);
  }

  private async flush(): Promise<void> {
    const logs = [...this.buffer];
    this.buffer = [];

    try {
      await this.sendLogs(logs);
    } catch (error) {
      // Re-add to buffer on failure
      this.buffer.unshift(...logs);
    }
  }

  private async sendLogs(logs: LogEntry[]): Promise<void> {
    await fetch('/api/logs/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ logs }),
    });
  }
}
```

## Log Formatting

### Custom Formatters

```typescript
class FormattedLogger extends Logger {
  protected formatMessage(level: LogLevel, message: string, args: any[]): string {
    const timestamp = new Date().toISOString();
    const formattedArgs = args.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg)).join(' ');

    return `[${timestamp}] ${this.prefix} ${level.toUpperCase()}: ${message} ${formattedArgs}`;
  }

  protected formatForConsole(level: LogLevel, message: string, args: any[]): string[] {
    if (!this.options.colors) {
      return [this.formatMessage(level, message, args)];
    }

    const colors = {
      debug: 'color: gray',
      info: 'color: blue',
      warn: 'color: orange',
      error: 'color: red',
    };

    return [`%c${this.formatMessage(level, message, args)}`, colors[level]];
  }
}
```

## Best Practices

1. **Log Levels**: Use appropriate log levels for different scenarios
2. **Performance**: Avoid logging in hot paths
3. **Sensitive Data**: Never log sensitive information
4. **Structured Data**: Use objects for complex data
5. **Context**: Include relevant context in logs
6. **Production**: Adjust log levels for production environments

## Integration with Providers

```typescript
class ProviderWithLogging {
  private logger: Logger;

  constructor() {
    this.logger = new Logger({
      prefix: `[${this.constructor.name}]`,
    });
  }

  async initialize(config: any): Promise<void> {
    this.logger.debug('Initializing with config', config);

    try {
      // Initialization logic
      this.logger.info('Initialized successfully');
    } catch (error) {
      this.logger.error('Initialization failed', error);
      throw error;
    }
  }
}
```

## See Also

- [Debug Configuration](../interfaces/configuration-interfaces.md#debugconfig) - Debug settings
- [Event Queue](./event-queue.md) - Event queuing with logging
- [Base Provider](./base-provider.md) - Provider logging integration
