# Error Constants

Constants for error tracking, severity levels, and error types.

## Error Severity Levels

```typescript
export const SEVERITY_LEVELS = {
  FATAL: 'fatal',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  DEBUG: 'debug',
} as const;

export type SeverityLevel = (typeof SEVERITY_LEVELS)[keyof typeof SEVERITY_LEVELS];

// Numeric severity values for comparison
export const SEVERITY_VALUES: Record<SeverityLevel, number> = {
  [SEVERITY_LEVELS.FATAL]: 5,
  [SEVERITY_LEVELS.ERROR]: 4,
  [SEVERITY_LEVELS.WARNING]: 3,
  [SEVERITY_LEVELS.INFO]: 2,
  [SEVERITY_LEVELS.DEBUG]: 1,
};
```

## Error Types

### JavaScript Error Types

```typescript
export const JS_ERROR_TYPES = {
  ERROR: 'Error',
  TYPE_ERROR: 'TypeError',
  REFERENCE_ERROR: 'ReferenceError',
  SYNTAX_ERROR: 'SyntaxError',
  RANGE_ERROR: 'RangeError',
  URI_ERROR: 'URIError',
  EVAL_ERROR: 'EvalError',
  INTERNAL_ERROR: 'InternalError',
} as const;
```

### Network Error Types

```typescript
export const NETWORK_ERROR_TYPES = {
  NETWORK_ERROR: 'NetworkError',
  TIMEOUT_ERROR: 'TimeoutError',
  ABORT_ERROR: 'AbortError',
  NOT_FOUND_ERROR: 'NotFoundError',
  PERMISSION_ERROR: 'PermissionError',
  RATE_LIMIT_ERROR: 'RateLimitError',
  SERVER_ERROR: 'ServerError',
} as const;
```

### Application Error Types

```typescript
export const APP_ERROR_TYPES = {
  VALIDATION_ERROR: 'ValidationError',
  AUTHENTICATION_ERROR: 'AuthenticationError',
  AUTHORIZATION_ERROR: 'AuthorizationError',
  CONFIGURATION_ERROR: 'ConfigurationError',
  INITIALIZATION_ERROR: 'InitializationError',
  BUSINESS_LOGIC_ERROR: 'BusinessLogicError',
  DATA_ERROR: 'DataError',
  INTEGRATION_ERROR: 'IntegrationError',
} as const;
```

## Error Categories

```typescript
export const ERROR_CATEGORIES = {
  // System
  SYSTEM: 'system',
  RUNTIME: 'runtime',
  MEMORY: 'memory',

  // Network
  NETWORK: 'network',
  API: 'api',
  WEBSOCKET: 'websocket',

  // User
  USER_INPUT: 'user_input',
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',

  // Data
  DATABASE: 'database',
  VALIDATION: 'validation',
  PARSING: 'parsing',

  // Integration
  THIRD_PARTY: 'third_party',
  PLUGIN: 'plugin',
  SDK: 'sdk',

  // Application
  BUSINESS_LOGIC: 'business_logic',
  CONFIGURATION: 'configuration',
  INITIALIZATION: 'initialization',
} as const;
```

## Error Sources

```typescript
export const ERROR_SOURCES = {
  // Browser
  WINDOW_ERROR: 'window.onerror',
  UNHANDLED_REJECTION: 'unhandledrejection',
  CONSOLE_ERROR: 'console.error',

  // Manual
  MANUAL: 'manual',
  TRY_CATCH: 'try_catch',
  ERROR_BOUNDARY: 'error_boundary',

  // Network
  FETCH: 'fetch',
  XHR: 'xhr',
  WEBSOCKET: 'websocket',

  // Framework
  REACT: 'react',
  VUE: 'vue',
  ANGULAR: 'angular',

  // Custom
  CUSTOM: 'custom',
  LOGGER: 'logger',
  MONITOR: 'monitor',
} as const;
```

## Breadcrumb Types

```typescript
export const BREADCRUMB_TYPES = {
  // Navigation
  NAVIGATION: 'navigation',
  ROUTE_CHANGE: 'route_change',

  // User actions
  CLICK: 'click',
  INPUT: 'input',
  FORM_SUBMIT: 'form_submit',

  // Console
  CONSOLE_LOG: 'console.log',
  CONSOLE_WARN: 'console.warn',
  CONSOLE_ERROR: 'console.error',
  CONSOLE_INFO: 'console.info',

  // Network
  HTTP_REQUEST: 'http_request',
  HTTP_RESPONSE: 'http_response',
  WS_OPEN: 'websocket_open',
  WS_MESSAGE: 'websocket_message',
  WS_CLOSE: 'websocket_close',

  // System
  APP_LIFECYCLE: 'app_lifecycle',
  CUSTOM: 'custom',
  DEBUG: 'debug',
} as const;
```

## Error Context Keys

```typescript
export const ERROR_CONTEXT_KEYS = {
  // User
  USER_ID: 'userId',
  USER_EMAIL: 'userEmail',
  USER_NAME: 'userName',
  USER_ROLE: 'userRole',

  // Session
  SESSION_ID: 'sessionId',
  SESSION_START: 'sessionStart',
  SESSION_DURATION: 'sessionDuration',

  // Device
  DEVICE_TYPE: 'deviceType',
  DEVICE_MODEL: 'deviceModel',
  OS_NAME: 'osName',
  OS_VERSION: 'osVersion',
  BROWSER_NAME: 'browserName',
  BROWSER_VERSION: 'browserVersion',

  // Application
  APP_VERSION: 'appVersion',
  APP_BUILD: 'appBuild',
  ENVIRONMENT: 'environment',
  RELEASE: 'release',

  // Request
  URL: 'url',
  METHOD: 'method',
  STATUS_CODE: 'statusCode',
  REQUEST_ID: 'requestId',

  // Component
  COMPONENT_NAME: 'componentName',
  COMPONENT_STACK: 'componentStack',
  PROPS: 'props',
  STATE: 'state',
} as const;
```

## Error Messages

```typescript
export const ERROR_MESSAGES = {
  // Initialization
  NOT_INITIALIZED: 'UnifiedTracking is not initialized',
  ALREADY_INITIALIZED: 'UnifiedTracking is already initialized',
  INITIALIZATION_FAILED: 'Failed to initialize UnifiedTracking',

  // Configuration
  INVALID_CONFIG: 'Invalid configuration provided',
  MISSING_CONFIG: 'Configuration is required',
  INVALID_PROVIDER: 'Invalid provider specified',

  // Tracking
  INVALID_EVENT_NAME: 'Event name must be a non-empty string',
  INVALID_USER_ID: 'User ID must be a non-empty string',
  INVALID_PROPERTIES: 'Properties must be a plain object',

  // Network
  NETWORK_ERROR: 'Network request failed',
  TIMEOUT_ERROR: 'Request timed out',
  OFFLINE_ERROR: 'No internet connection',

  // Permission
  PERMISSION_DENIED: 'Permission denied',
  CONSENT_REQUIRED: 'User consent is required',

  // Limits
  QUEUE_FULL: 'Event queue is full',
  RATE_LIMITED: 'Rate limit exceeded',
  SIZE_EXCEEDED: 'Maximum size exceeded',
} as const;
```

## Error Filters

```typescript
export const ERROR_FILTERS = {
  // Ignored error messages
  IGNORED_MESSAGES: [
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
    'Non-Error promise rejection captured',
    'Network request failed',
    'NetworkError when attempting to fetch resource',
  ],

  // Ignored error types
  IGNORED_TYPES: ['ResizeObserverError', 'SecurityError'],

  // Ignored URLs
  IGNORED_URLS: ['chrome-extension://', 'moz-extension://', 'safari-extension://', 'extensions://'],

  // Ignored sources
  IGNORED_SOURCES: ['browser extensions', 'third-party scripts'],
} as const;
```

## Error Sampling

```typescript
export const ERROR_SAMPLING = {
  // Default sample rates by severity
  DEFAULT_RATES: {
    [SEVERITY_LEVELS.FATAL]: 1.0, // 100%
    [SEVERITY_LEVELS.ERROR]: 1.0, // 100%
    [SEVERITY_LEVELS.WARNING]: 0.5, // 50%
    [SEVERITY_LEVELS.INFO]: 0.1, // 10%
    [SEVERITY_LEVELS.DEBUG]: 0.01, // 1%
  },

  // Environment-based rates
  ENVIRONMENT_RATES: {
    development: 1.0,
    staging: 1.0,
    production: 0.1,
  },
} as const;
```

## Error Formatting

```typescript
export const ERROR_FORMATTING = {
  // Stack trace patterns
  STACK_TRACE_PATTERNS: {
    CHROME: /^\s*at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)$/,
    FIREFOX: /^(.+?)@(.+?):(\d+):(\d+)$/,
    SAFARI: /^(.+?)@(.+?):(\d+):(\d+)$/,
    EDGE: /^\s*at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)$/,
  },

  // Maximum values
  MAX_MESSAGE_LENGTH: 1000,
  MAX_STACK_FRAMES: 50,
  MAX_BREADCRUMBS: 100,
  MAX_CONTEXT_DEPTH: 5,
  MAX_TAG_KEY_LENGTH: 32,
  MAX_TAG_VALUE_LENGTH: 200,
} as const;
```

## Usage Examples

### Error Logging with Severity

```typescript
import { SEVERITY_LEVELS, ERROR_CATEGORIES } from 'unified-tracking/constants';

try {
  await riskyOperation();
} catch (error) {
  await tracking.logError(error, {
    severity: SEVERITY_LEVELS.ERROR,
    tags: {
      category: ERROR_CATEGORIES.API,
    },
  });
}
```

### Error Filtering

```typescript
import { ERROR_FILTERS } from 'unified-tracking/constants';

function shouldIgnoreError(error: Error): boolean {
  // Check ignored messages
  for (const ignored of ERROR_FILTERS.IGNORED_MESSAGES) {
    if (error.message.includes(ignored)) {
      return true;
    }
  }

  // Check ignored types
  if (ERROR_FILTERS.IGNORED_TYPES.includes(error.name)) {
    return true;
  }

  return false;
}
```

### Breadcrumb Creation

```typescript
import { BREADCRUMB_TYPES } from 'unified-tracking/constants';

// Add navigation breadcrumb
await tracking.addBreadcrumb({
  type: BREADCRUMB_TYPES.NAVIGATION,
  message: 'Navigated to product page',
  timestamp: new Date().toISOString(),
  data: {
    from: '/home',
    to: '/product/123',
  },
});
```

### Error Context

```typescript
import { ERROR_CONTEXT_KEYS, ERROR_SOURCES } from 'unified-tracking/constants';

window.addEventListener('error', async (event) => {
  await tracking.logError(event.error, {
    source: ERROR_SOURCES.WINDOW_ERROR,
    extra: {
      [ERROR_CONTEXT_KEYS.URL]: window.location.href,
      [ERROR_CONTEXT_KEYS.USER_AGENT]: navigator.userAgent,
      [ERROR_CONTEXT_KEYS.TIMESTAMP]: new Date().toISOString(),
    },
  });
});
```

### Severity Comparison

```typescript
import { SEVERITY_VALUES, SeverityLevel } from 'unified-tracking/constants';

function isSeverityHigherOrEqual(severity1: SeverityLevel, severity2: SeverityLevel): boolean {
  return SEVERITY_VALUES[severity1] >= SEVERITY_VALUES[severity2];
}

// Only log errors of warning level or higher
if (isSeverityHigherOrEqual(errorSeverity, SEVERITY_LEVELS.WARNING)) {
  await tracking.logError(error, { severity: errorSeverity });
}
```

## Best Practices

1. **Use Severity Levels**: Always specify appropriate severity levels
2. **Add Context**: Include relevant context for debugging
3. **Filter Noise**: Filter out known non-critical errors
4. **Sample Appropriately**: Use sampling to manage volume
5. **Structured Data**: Use constants for consistent error categorization

## See Also

- [Event Constants](./events.md) - Event tracking constants
- [Provider Constants](./providers.md) - Provider-specific constants
- [Error Interfaces](../interfaces/event-interfaces.md#errorcontext) - Error context interface
