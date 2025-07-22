import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SentryErrorTrackingProvider } from './sentry.provider';
import type { ConsentSettings, ErrorContext } from '../../../definitions';

// Mock Sentry SDK
const mockSentry = {
  init: vi.fn(),
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  setUser: vi.fn(),
  setTag: vi.fn(),
  setTags: vi.fn(),
  setContext: vi.fn(),
  setExtra: vi.fn(),
  setExtras: vi.fn(),
  addBreadcrumb: vi.fn(),
  configureScope: vi.fn(),
  withScope: vi.fn(),
  setLevel: vi.fn(),
  setFingerprint: vi.fn(),
  getCurrentHub: vi.fn(),
  getClient: vi.fn(),
  startTransaction: vi.fn(),
  addGlobalEventProcessor: vi.fn(),
  flush: vi.fn(),
  close: vi.fn(),
  lastEventId: vi.fn(),
  showReportDialog: vi.fn(),
  Hub: vi.fn(),
  Scope: vi.fn(),
  getCurrentScope: vi.fn(),
  getGlobalScope: vi.fn(),
  getIsolationScope: vi.fn(),
  setCurrentClient: vi.fn(),
  makeMain: vi.fn(),
  captureEvent: vi.fn(),
  captureSession: vi.fn(),
  endSession: vi.fn(),
  startSession: vi.fn(),
};

Object.defineProperty(window, 'Sentry', {
  value: mockSentry,
  writable: true,
});

// Mock script loading
const mockScriptElement = {
  onload: null as (() => void) | null,
  onerror: null as (() => void) | null,
  src: '',
  async: false,
};

Object.defineProperty(document, 'createElement', {
  value: vi.fn((tagName: string) => {
    if (tagName === 'script') {
      return mockScriptElement;
    }
    return {};
  }),
  writable: true,
});

Object.defineProperty(document.head, 'appendChild', {
  value: vi.fn(),
  writable: true,
});

describe('SentryErrorTrackingProvider', () => {
  let provider: SentryErrorTrackingProvider;
  let mockLogger: any;

  beforeEach(() => {
    provider = new SentryErrorTrackingProvider();
    mockLogger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };
    (provider as any).logger = mockLogger;

    // Reset mocks
    vi.clearAllMocks();
    Object.values(mockSentry).forEach((mock) => {
      if (typeof mock === 'function') {
        mock.mockClear();
      }
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with valid configuration', async () => {
      const config = {
        dsn: 'https://test@sentry.io/123',
        environment: 'test',
        release: '1.0.0',
        tracesSampleRate: 1.0,
      };

      // Mock successful script loading
      setTimeout(() => {
        mockScriptElement.onload?.();
      }, 0);

      await provider.initialize(config);

      expect(provider.isInitialized).toBe(true);
      expect(mockSentry.init).toHaveBeenCalledWith({
        dsn: 'https://test@sentry.io/123',
        environment: 'test',
        release: '1.0.0',
        tracesSampleRate: 1.0,
        integrations: expect.any(Array),
        beforeSend: expect.any(Function),
      });
    });

    it('should throw error if DSN is missing', async () => {
      const config = {};

      await expect(provider.initialize(config)).rejects.toThrow('Sentry DSN is required');
    });

    it('should handle script loading failure', async () => {
      const config = {
        dsn: 'https://test@sentry.io/123',
      };

      // Mock script loading error
      setTimeout(() => {
        mockScriptElement.onerror?.();
      }, 0);

      await expect(provider.initialize(config)).rejects.toThrow('Failed to load Sentry SDK');
    });
  });

  describe('consent management', () => {
    beforeEach(async () => {
      const config = {
        dsn: 'https://test@sentry.io/123',
      };

      setTimeout(() => {
        mockScriptElement.onload?.();
      }, 0);

      await provider.initialize(config);
      vi.clearAllMocks();
    });

    it('should handle consent updates', async () => {
      const consent: ConsentSettings = {
        analytics: true,
        errorTracking: true,
        marketing: false,
        personalization: false,
      };

      await provider.updateConsent(consent);

      expect(mockLogger.info).toHaveBeenCalledWith('Sentry error tracking enabled by consent');
    });

    it('should disable tracking when consent is denied', async () => {
      const consent: ConsentSettings = {
        analytics: false,
        errorTracking: false,
        marketing: false,
        personalization: false,
      };

      await provider.updateConsent(consent);

      expect(mockLogger.info).toHaveBeenCalledWith('Sentry error tracking disabled by consent');
    });
  });

  describe('error tracking', () => {
    beforeEach(async () => {
      const config = {
        dsn: 'https://test@sentry.io/123',
      };

      setTimeout(() => {
        mockScriptElement.onload?.();
      }, 0);

      await provider.initialize(config);
      vi.clearAllMocks();
    });

    it('should track Error objects', async () => {
      const error = new Error('Test error');
      const context: ErrorContext = {
        severity: 'error',
        tags: { component: 'test' },
        extra: { details: 'test details' },
        user: { id: 'user123', email: 'test@example.com' },
      };

      mockSentry.withScope.mockImplementation((callback) => {
        callback({
          setLevel: vi.fn(),
          setTag: vi.fn(),
          setTags: vi.fn(),
          setUser: vi.fn(),
          setContext: vi.fn(),
          setExtra: vi.fn(),
          setExtras: vi.fn(),
          setFingerprint: vi.fn(),
        });
      });

      await provider.trackError(error, context);

      expect(mockSentry.withScope).toHaveBeenCalled();
      expect(mockSentry.captureException).toHaveBeenCalledWith(error);
    });

    it('should track string errors', async () => {
      const error = 'Test string error';
      const context: ErrorContext = {
        severity: 'warning',
        tags: { source: 'test' },
      };

      mockSentry.withScope.mockImplementation((callback) => {
        callback({
          setLevel: vi.fn(),
          setTag: vi.fn(),
          setTags: vi.fn(),
          setUser: vi.fn(),
          setContext: vi.fn(),
          setExtra: vi.fn(),
          setExtras: vi.fn(),
          setFingerprint: vi.fn(),
        });
      });

      await provider.trackError(error, context);

      expect(mockSentry.withScope).toHaveBeenCalled();
      expect(mockSentry.captureMessage).toHaveBeenCalledWith(error, 'warning');
    });

    it('should handle errors without context', async () => {
      const error = new Error('Test error');

      mockSentry.withScope.mockImplementation((callback) => {
        callback({
          setLevel: vi.fn(),
          setTag: vi.fn(),
          setTags: vi.fn(),
          setUser: vi.fn(),
          setContext: vi.fn(),
          setExtra: vi.fn(),
          setExtras: vi.fn(),
          setFingerprint: vi.fn(),
        });
      });

      await provider.trackError(error);

      expect(mockSentry.withScope).toHaveBeenCalled();
      expect(mockSentry.captureException).toHaveBeenCalledWith(error);
    });

    it('should throw error when not initialized', async () => {
      const uninitializedProvider = new SentryErrorTrackingProvider();

      await expect(uninitializedProvider.trackError(new Error('test'))).rejects.toThrow('Sentry not initialized');
    });
  });

  describe('user management', () => {
    beforeEach(async () => {
      const config = {
        dsn: 'https://test@sentry.io/123',
      };

      setTimeout(() => {
        mockScriptElement.onload?.();
      }, 0);

      await provider.initialize(config);
      vi.clearAllMocks();
    });

    it('should set user information', async () => {
      const user = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        customProperty: 'custom_value',
      };

      await provider.setUser(user);

      expect(mockSentry.setUser).toHaveBeenCalledWith({
        id: 'user123',
        email: 'test@example.com',
        username: 'Test User',
        customProperty: 'custom_value',
      });
    });
  });

  describe('context management', () => {
    beforeEach(async () => {
      const config = {
        dsn: 'https://test@sentry.io/123',
      };

      setTimeout(() => {
        mockScriptElement.onload?.();
      }, 0);

      await provider.initialize(config);
      vi.clearAllMocks();
    });

    it('should set context', async () => {
      const context = {
        key1: 'value1',
        key2: 'value2',
      };

      await provider.setContext(context);

      expect(mockSentry.setContext).toHaveBeenCalledWith('custom', context);
    });

    it('should remove context', async () => {
      await provider.removeContext('testKey');

      expect(mockSentry.setContext).toHaveBeenCalledWith('testKey', null);
    });

    it('should clear context', async () => {
      await provider.clearContext();

      expect(mockSentry.setContext).toHaveBeenCalledWith('custom', {});
    });
  });

  describe('breadcrumbs', () => {
    beforeEach(async () => {
      const config = {
        dsn: 'https://test@sentry.io/123',
      };

      setTimeout(() => {
        mockScriptElement.onload?.();
      }, 0);

      await provider.initialize(config);
      vi.clearAllMocks();
    });

    it('should capture breadcrumbs', async () => {
      const breadcrumb = {
        message: 'Test breadcrumb',
        category: 'test',
        level: 'info',
        data: { key: 'value' },
      };

      await provider.captureBreadcrumb(breadcrumb);

      expect(mockSentry.addBreadcrumb).toHaveBeenCalledWith({
        message: 'Test breadcrumb',
        category: 'test',
        level: 'info',
        data: { key: 'value' },
      });
    });
  });

  describe('debug mode', () => {
    it('should set debug mode', () => {
      provider.setDebugMode(true);
      expect(mockLogger.info).toHaveBeenCalledWith('Sentry debug mode enabled');

      provider.setDebugMode(false);
      expect(mockLogger.info).toHaveBeenCalledWith('Sentry debug mode disabled');
    });
  });

  describe('provider info', () => {
    it('should return correct provider information', () => {
      expect(provider.id).toBe('sentry');
      expect(provider.name).toBe('Sentry Error Tracking');
      expect(provider.version).toBe('1.0.0');
    });
  });

  describe('beforeSend callback', () => {
    it('should use custom beforeSend callback', async () => {
      const beforeSend = vi.fn((event) => event);
      const config = {
        dsn: 'https://test@sentry.io/123',
        beforeSend,
      };

      setTimeout(() => {
        mockScriptElement.onload?.();
      }, 0);

      await provider.initialize(config);

      expect(mockSentry.init).toHaveBeenCalledWith(
        expect.objectContaining({
          beforeSend: expect.any(Function),
        }),
      );
    });
  });

  describe('integrations', () => {
    it('should configure integrations', async () => {
      const config = {
        dsn: 'https://test@sentry.io/123',
        integrations: [],
      };

      setTimeout(() => {
        mockScriptElement.onload?.();
      }, 0);

      await provider.initialize(config);

      expect(mockSentry.init).toHaveBeenCalledWith(
        expect.objectContaining({
          integrations: expect.any(Array),
        }),
      );
    });
  });

  describe('shutdown', () => {
    it('should shutdown properly', async () => {
      const config = {
        dsn: 'https://test@sentry.io/123',
      };

      setTimeout(() => {
        mockScriptElement.onload?.();
      }, 0);

      await provider.initialize(config);
      await provider.shutdown();

      expect(mockSentry.close).toHaveBeenCalled();
      expect(provider.isInitialized).toBe(false);
    });
  });
});
