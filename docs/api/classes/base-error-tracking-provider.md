# BaseErrorTrackingProvider Class

Abstract base class for error tracking providers.

## Overview

`BaseErrorTrackingProvider` extends `BaseProvider` and provides a common foundation for all error tracking providers. It defines the standard error tracking methods that must be implemented.

## Class Definition

```typescript
export abstract class BaseErrorTrackingProvider extends BaseProvider implements ErrorTrackingProvider {
  abstract logError(error: Error | string, context?: ErrorContext): Promise<void>;
  abstract setUserContext(user: UserContext): Promise<void>;
  abstract clearUserContext(): Promise<void>;
  abstract addBreadcrumb(breadcrumb: Breadcrumb): Promise<void>;
}
```

## Abstract Methods

All error tracking providers must implement these methods:

### logError()

Log an error with optional context.

```typescript
abstract logError(error: Error | string, context?: ErrorContext): Promise<void>
```

#### Parameters

- `error`: Error object or error message
- `context`: Optional context information

### setUserContext()

Set user information for error attribution.

```typescript
abstract setUserContext(user: UserContext): Promise<void>
```

#### Parameters

- `user`: User information (id, email, username)

### clearUserContext()

Clear the current user context.

```typescript
abstract clearUserContext(): Promise<void>
```

### addBreadcrumb()

Add a breadcrumb for error context.

```typescript
abstract addBreadcrumb(breadcrumb: Breadcrumb): Promise<void>
```

#### Parameters

- `breadcrumb`: Breadcrumb data

## Type Definitions

### ErrorContext

```typescript
interface ErrorContext {
  severity?: 'fatal' | 'error' | 'warning' | 'info' | 'debug';
  tags?: Record<string, string>;
  extra?: Record<string, any>;
  user?: UserContext;
  breadcrumbs?: Breadcrumb[];
}
```

### UserContext

```typescript
interface UserContext {
  id?: string;
  email?: string;
  username?: string;
  [key: string]: any;
}
```

### Breadcrumb

```typescript
interface Breadcrumb {
  timestamp: string;
  message: string;
  category?: string;
  level?: string;
  data?: Record<string, any>;
}
```

## Implementation Example

```typescript
import { BaseErrorTrackingProvider, ErrorContext, UserContext, Breadcrumb } from 'unified-tracking';

export class MyErrorProvider extends BaseErrorTrackingProvider {
  private client: any;
  private breadcrumbs: Breadcrumb[] = [];

  async initialize(config: MyErrorConfig): Promise<void> {
    if (this.initialized) return;

    // Initialize error tracking SDK
    this.client = new MyErrorSDK({
      apiKey: config.apiKey,
      environment: config.environment || 'production',
      debug: this.debugMode,
    });

    await this.client.init();

    this.config = config;
    this.initialized = true;
  }

  isAvailable(): boolean {
    return typeof MyErrorSDK !== 'undefined';
  }

  async logError(error: Error | string, context?: ErrorContext): Promise<void> {
    this.ensureInitialized();

    const errorObj = this.normalizeError(error);
    const enrichedContext = this.enrichContext(context);

    if (this.debugMode) {
      console.error(`[MyErrorProvider] Logging error:`, errorObj, enrichedContext);
    }

    await this.client.captureError(errorObj, {
      severity: enrichedContext.severity || 'error',
      tags: enrichedContext.tags,
      extra: enrichedContext.extra,
      breadcrumbs: [...this.breadcrumbs, ...(enrichedContext.breadcrumbs || [])],
    });
  }

  async setUserContext(user: UserContext): Promise<void> {
    this.ensureInitialized();

    await this.client.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
      ...user,
    });
  }

  async clearUserContext(): Promise<void> {
    this.ensureInitialized();

    await this.client.setUser(null);
    this.breadcrumbs = [];
  }

  async addBreadcrumb(breadcrumb: Breadcrumb): Promise<void> {
    this.ensureInitialized();

    // Maintain a rolling window of breadcrumbs
    this.breadcrumbs.push(breadcrumb);
    if (this.breadcrumbs.length > 100) {
      this.breadcrumbs.shift();
    }

    // Some SDKs handle breadcrumbs directly
    if (this.client.addBreadcrumb) {
      await this.client.addBreadcrumb(breadcrumb);
    }
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('Provider not initialized');
    }
  }

  private normalizeError(error: Error | string): Error {
    if (typeof error === 'string') {
      return new Error(error);
    }
    return error;
  }

  private enrichContext(context?: ErrorContext): ErrorContext {
    return {
      ...context,
      tags: {
        ...this.getDefaultTags(),
        ...(context?.tags || {}),
      },
      extra: {
        ...this.getDefaultExtra(),
        ...(context?.extra || {}),
      },
    };
  }

  private getDefaultTags(): Record<string, string> {
    return {
      platform: this.getPlatform(),
      version: this.getAppVersion(),
      environment: this.config.environment || 'production',
    };
  }

  private getDefaultExtra(): Record<string, any> {
    return {
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    };
  }

  private getPlatform(): string {
    // Implementation depends on your environment
    return 'web';
  }

  private getAppVersion(): string {
    // Implementation depends on your setup
    return '1.0.0';
  }
}
```

## Advanced Features

### 1. Error Filtering

```typescript
export class MyErrorProvider extends BaseErrorTrackingProvider {
  private shouldIgnoreError(error: Error): boolean {
    // Ignore certain errors
    const ignoredMessages = ['ResizeObserver loop limit exceeded', 'Non-Error promise rejection captured'];

    return ignoredMessages.some((msg) => error.message?.includes(msg));
  }

  async logError(error: Error | string, context?: ErrorContext): Promise<void> {
    const errorObj = this.normalizeError(error);

    if (this.shouldIgnoreError(errorObj)) {
      if (this.debugMode) {
        console.log(`[MyErrorProvider] Ignoring error: ${errorObj.message}`);
      }
      return;
    }

    // Continue with normal error logging
    await super.logError(errorObj, context);
  }
}
```

### 2. Error Grouping

```typescript
export class MyErrorProvider extends BaseErrorTrackingProvider {
  private getErrorFingerprint(error: Error): string[] {
    // Create a fingerprint for error grouping
    const fingerprint: string[] = [];

    // Group by error type
    fingerprint.push(error.name || 'Error');

    // Group by file if available
    const stackMatch = error.stack?.match(/at .+ \((.+?):\d+:\d+\)/);
    if (stackMatch) {
      fingerprint.push(stackMatch[1]);
    }

    return fingerprint;
  }

  async logError(error: Error | string, context?: ErrorContext): Promise<void> {
    const errorObj = this.normalizeError(error);
    const fingerprint = this.getErrorFingerprint(errorObj);

    await this.client.captureError(errorObj, {
      ...context,
      fingerprint,
    });
  }
}
```

### 3. Automatic Breadcrumbs

```typescript
export class MyErrorProvider extends BaseErrorTrackingProvider {
  async initialize(config: MyErrorConfig): Promise<void> {
    await super.initialize(config);

    // Automatically capture console logs as breadcrumbs
    this.instrumentConsole();

    // Automatically capture network requests
    this.instrumentFetch();
  }

  private instrumentConsole(): void {
    const methods = ['log', 'warn', 'error', 'info'] as const;

    methods.forEach((method) => {
      const original = console[method];
      console[method] = (...args: any[]) => {
        this.addBreadcrumb({
          timestamp: new Date().toISOString(),
          message: args.join(' '),
          category: 'console',
          level: method,
        }).catch(() => {
          // Ignore breadcrumb errors
        });

        original.apply(console, args);
      };
    });
  }

  private instrumentFetch(): void {
    if (typeof window === 'undefined' || !window.fetch) return;

    const originalFetch = window.fetch;
    window.fetch = async (...args: Parameters<typeof fetch>) => {
      const [url] = args;
      const startTime = Date.now();

      try {
        const response = await originalFetch(...args);

        this.addBreadcrumb({
          timestamp: new Date().toISOString(),
          message: `${response.status} ${url}`,
          category: 'fetch',
          data: {
            status: response.status,
            duration: Date.now() - startTime,
          },
        }).catch(() => {});

        return response;
      } catch (error) {
        this.addBreadcrumb({
          timestamp: new Date().toISOString(),
          message: `Failed ${url}`,
          category: 'fetch',
          level: 'error',
          data: {
            error: error.message,
            duration: Date.now() - startTime,
          },
        }).catch(() => {});

        throw error;
      }
    };
  }
}
```

## Best Practices

1. **Error Normalization**: Always normalize errors to Error objects
2. **Context Enrichment**: Add platform-specific context automatically
3. **Breadcrumb Management**: Maintain a reasonable breadcrumb buffer
4. **Error Filtering**: Filter out noise and known issues
5. **Performance**: Don't let error tracking impact app performance
6. **Privacy**: Sanitize sensitive data before sending

## Common Patterns

### Rate Limiting

```typescript
private errorCounts = new Map<string, number>();
private resetInterval = 60000; // 1 minute

private isRateLimited(error: Error): boolean {
  const key = error.message;
  const count = this.errorCounts.get(key) || 0;

  if (count >= 10) {
    return true;
  }

  this.errorCounts.set(key, count + 1);
  setTimeout(() => {
    this.errorCounts.delete(key);
  }, this.resetInterval);

  return false;
}
```

### Error Sampling

```typescript
private shouldSample(error: Error, context?: ErrorContext): boolean {
  // Sample fatal errors at 100%
  if (context?.severity === 'fatal') {
    return true;
  }

  // Sample other errors at configured rate
  const sampleRate = this.config.sampleRate || 1.0;
  return Math.random() < sampleRate;
}
```

## See Also

- [BaseProvider](./base-provider.md) - Parent class
- [Provider Implementations](../../providers/error-handling/README.md) - Example implementations
- [ErrorTrackingProvider Interface](../interfaces/core-interfaces.md#errortrackingprovider) - Interface definition
