import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AppCenterProvider } from './appcenter.provider';
import type { ConsentSettings, ErrorContext } from '../../../definitions';

// Mock App Center SDK
const mockAppCenter = {
  start: vi.fn(),
  setLogLevel: vi.fn(),
  isEnabled: vi.fn(),
  setEnabled: vi.fn(),
  getInstallId: vi.fn(),
  setUserId: vi.fn(),
  setCountryCode: vi.fn(),
  Crashes: {
    setEnabled: vi.fn(),
    isEnabled: vi.fn(),
    generateTestCrash: vi.fn(),
    hasReceivedMemoryWarningInLastSession: vi.fn(),
    hasCrashedInLastSession: vi.fn(),
    lastSessionCrashReport: vi.fn(),
    trackError: vi.fn(),
    setListener: vi.fn(),
    notifyUserConfirmation: vi.fn(),
  },
  Analytics: {
    setEnabled: vi.fn(),
    isEnabled: vi.fn(),
    trackEvent: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    enableManualSessionTracker: vi.fn(),
    startSession: vi.fn(),
    endSession: vi.fn(),
    setTransmissionInterval: vi.fn(),
  },
  Push: {
    setEnabled: vi.fn(),
    isEnabled: vi.fn(),
    setListener: vi.fn(),
  },
  Distribute: {
    setEnabled: vi.fn(),
    isEnabled: vi.fn(),
    notifyUpdateAction: vi.fn(),
    disableAutomaticCheckForUpdate: vi.fn(),
    checkForUpdate: vi.fn(),
    setListener: vi.fn(),
  },
};

Object.defineProperty(window, 'AppCenter', {
  value: mockAppCenter,
  writable: true,
});

Object.defineProperty(window, 'MSAppCenter', {
  value: mockAppCenter,
  writable: true,
});

// Mock script loading
const mockScriptElement = {
  onload: null as (() => void) | null,
  onerror: null as (() => void) | null,
  src: '',
  async: false,
  crossOrigin: '',
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

describe('AppCenterProvider', () => {
  let provider: AppCenterProvider;
  let mockLogger: any;

  beforeEach(() => {
    provider = new AppCenterProvider();
    mockLogger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };
    (provider as any).logger = mockLogger;
    
    // Reset mocks
    vi.clearAllMocks();
    Object.values(mockAppCenter).forEach(mock => {
      if (typeof mock === 'function') {
        mock.mockClear();
      }
    });
    Object.values(mockAppCenter.Crashes).forEach(mock => {
      if (typeof mock === 'function') {
        mock.mockClear();
      }
    });
    Object.values(mockAppCenter.Analytics).forEach(mock => {
      if (typeof mock === 'function') {
        mock.mockClear();
      }
    });
    Object.values(mockAppCenter.Push).forEach(mock => {
      if (typeof mock === 'function') {
        mock.mockClear();
      }
    });
    Object.values(mockAppCenter.Distribute).forEach(mock => {
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
        appSecret: 'test-app-secret',
        enableCrashes: true,
        enableAnalytics: true,
        logLevel: 'info' as const,
        userId: 'test-user',
        countryCode: 'US',
      };

      // Mock successful script loading
      setTimeout(() => {
        mockScriptElement.onload?.();
      }, 0);

      await provider.initialize(config);

      expect(provider.isInitialized).toBe(true);
      expect(mockAppCenter.setLogLevel).toHaveBeenCalledWith('info');
      expect(mockAppCenter.start).toHaveBeenCalledWith(
        'test-app-secret',
        expect.arrayContaining([mockAppCenter.Crashes, mockAppCenter.Analytics])
      );
      expect(mockAppCenter.setUserId).toHaveBeenCalledWith('test-user');
      expect(mockAppCenter.setCountryCode).toHaveBeenCalledWith('US');
    });

    it('should throw error if app secret is missing', async () => {
      const config = {};

      await expect(provider.initialize(config)).rejects.toThrow(
        'App Center app secret is required'
      );
    });

    it('should handle script loading failure', async () => {
      const config = {
        appSecret: 'test-app-secret',
      };

      // Mock script loading error
      setTimeout(() => {
        mockScriptElement.onerror?.();
      }, 0);

      await expect(provider.initialize(config)).rejects.toThrow(
        'Failed to load App Center SDK'
      );
    });

    it('should initialize with selective services', async () => {
      const config = {
        appSecret: 'test-app-secret',
        enableCrashes: false,
        enableAnalytics: true,
        enableDistribute: true,
        enablePush: true,
      };

      // Mock successful script loading
      setTimeout(() => {
        mockScriptElement.onload?.();
      }, 0);

      await provider.initialize(config);

      expect(mockAppCenter.start).toHaveBeenCalledWith(
        'test-app-secret',
        expect.arrayContaining([
          mockAppCenter.Analytics,
          mockAppCenter.Distribute,
          mockAppCenter.Push,
        ])
      );
      expect(mockAppCenter.start).toHaveBeenCalledWith(
        'test-app-secret',
        expect.not.arrayContaining([mockAppCenter.Crashes])
      );
    });

    it('should configure manual session tracking', async () => {
      const config = {
        appSecret: 'test-app-secret',
        enableManualSessionTracker: true,
        sessionTimeout: 3600,
      };

      // Mock successful script loading
      setTimeout(() => {
        mockScriptElement.onload?.();
      }, 0);

      await provider.initialize(config);

      expect(mockAppCenter.Analytics.enableManualSessionTracker).toHaveBeenCalled();
      expect(mockAppCenter.Analytics.setTransmissionInterval).toHaveBeenCalledWith(3600);
    });

    it('should configure crashes listener', async () => {
      const crashesListener = {
        shouldProcess: vi.fn(),
        shouldAwaitUserConfirmation: vi.fn(),
        getErrorAttachments: vi.fn(),
      };

      const config = {
        appSecret: 'test-app-secret',
        crashesListener,
      };

      // Mock successful script loading
      setTimeout(() => {
        mockScriptElement.onload?.();
      }, 0);

      await provider.initialize(config);

      expect(mockAppCenter.Crashes.setListener).toHaveBeenCalledWith(crashesListener);
    });
  });

  describe('consent management', () => {
    beforeEach(async () => {
      const config = {
        appSecret: 'test-app-secret',
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

      expect(mockAppCenter.setEnabled).toHaveBeenCalledWith(true);
      expect(mockAppCenter.Crashes.setEnabled).toHaveBeenCalledWith(true);
      expect(mockLogger.info).toHaveBeenCalledWith('App Center error tracking enabled by consent');
    });

    it('should disable tracking when consent is denied', async () => {
      const consent: ConsentSettings = {
        analytics: false,
        errorTracking: false,
        marketing: false,
        personalization: false,
      };

      await provider.updateConsent(consent);

      expect(mockAppCenter.setEnabled).toHaveBeenCalledWith(false);
      expect(mockAppCenter.Crashes.setEnabled).toHaveBeenCalledWith(false);
      expect(mockLogger.info).toHaveBeenCalledWith('App Center error tracking disabled by consent');
    });
  });

  describe('error tracking', () => {
    beforeEach(async () => {
      const config = {
        appSecret: 'test-app-secret',
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
        breadcrumbs: [
          {
            timestamp: Date.now(),
            category: 'test',
            message: 'Test breadcrumb',
            data: { key: 'value' },
          },
        ],
      };

      await provider.trackError(error, context);

      expect(mockAppCenter.Crashes.trackError).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          component: 'test',
          details: 'test details',
          user_id: 'user123',
          user_email: 'test@example.com',
          severity: 'error',
        }),
        expect.arrayContaining([
          expect.objectContaining({
            textAttachment: expect.stringContaining('Test breadcrumb'),
            fileName: 'breadcrumbs.txt',
            contentType: 'text/plain',
          }),
          expect.objectContaining({
            textAttachment: expect.stringContaining('"severity": "error"'),
            fileName: 'context.json',
            contentType: 'application/json',
          }),
        ])
      );
    });

    it('should handle errors without context', async () => {
      const error = new Error('Test error');

      await provider.trackError(error);

      expect(mockAppCenter.Crashes.trackError).toHaveBeenCalledWith(
        error,
        {},
        expect.arrayContaining([
          expect.objectContaining({
            fileName: 'context.json',
            contentType: 'application/json',
          }),
        ])
      );
    });

    it('should throw error when not initialized', async () => {
      const uninitializedProvider = new AppCenterProvider();
      
      await expect(uninitializedProvider.trackError(new Error('test'))).rejects.toThrow(
        'App Center Crashes not initialized'
      );
    });

    it('should log messages as analytics events', async () => {
      const message = 'Test message';
      const level = 'info';

      await provider.logMessage(message, level);

      expect(mockAppCenter.Analytics.trackEvent).toHaveBeenCalledWith(
        'log_info',
        expect.objectContaining({
          message: 'Test message',
          timestamp: expect.any(String),
        })
      );
    });
  });

  describe('user management', () => {
    beforeEach(async () => {
      const config = {
        appSecret: 'test-app-secret',
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
        countryCode: 'US',
        customProperty: 'custom_value',
      };

      await provider.setUser(user);

      expect(mockAppCenter.setUserId).toHaveBeenCalledWith('user123');
      expect(mockAppCenter.setCountryCode).toHaveBeenCalledWith('US');
    });
  });

  describe('debug mode', () => {
    beforeEach(async () => {
      const config = {
        appSecret: 'test-app-secret',
      };

      setTimeout(() => {
        mockScriptElement.onload?.();
      }, 0);

      await provider.initialize(config);
      vi.clearAllMocks();
    });

    it('should set debug mode', () => {
      provider.setDebugMode(true);
      expect(mockAppCenter.setLogLevel).toHaveBeenCalledWith('verbose');
      expect(mockLogger.debug).toHaveBeenCalledWith('App Center debug mode enabled');

      provider.setDebugMode(false);
      expect(mockAppCenter.setLogLevel).toHaveBeenCalledWith('warning');
    });
  });

  describe('provider info', () => {
    it('should return correct provider information', () => {
      expect(provider.id).toBe('appcenter');
      expect(provider.name).toBe('Microsoft App Center');
      expect(provider.version).toBe('1.0.0');
    });
  });

  describe('specific App Center methods', () => {
    beforeEach(async () => {
      const config = {
        appSecret: 'test-app-secret',
      };

      setTimeout(() => {
        mockScriptElement.onload?.();
      }, 0);

      await provider.initialize(config);
      vi.clearAllMocks();
    });

    it('should check if enabled', async () => {
      mockAppCenter.isEnabled.mockResolvedValue(true);

      const result = await provider.isEnabled();

      expect(result).toBe(true);
      expect(mockAppCenter.isEnabled).toHaveBeenCalled();
    });

    it('should set enabled state', async () => {
      await provider.setAppCenterEnabled(false);

      expect(mockAppCenter.setEnabled).toHaveBeenCalledWith(false);
    });

    it('should get install ID', async () => {
      mockAppCenter.getInstallId.mockResolvedValue('test-install-id');

      const result = await provider.getInstallId();

      expect(result).toBe('test-install-id');
      expect(mockAppCenter.getInstallId).toHaveBeenCalled();
    });

    it('should set user ID', () => {
      provider.setUserId('new-user-id');

      expect(mockAppCenter.setUserId).toHaveBeenCalledWith('new-user-id');
    });

    it('should set country code', () => {
      provider.setCountryCode('CA');

      expect(mockAppCenter.setCountryCode).toHaveBeenCalledWith('CA');
    });

    it('should generate test crash', () => {
      provider.generateTestCrash();

      expect(mockAppCenter.Crashes.generateTestCrash).toHaveBeenCalled();
    });

    it('should check if crashed in last session', async () => {
      mockAppCenter.Crashes.hasCrashedInLastSession.mockResolvedValue(true);

      const result = await provider.hasCrashedInLastSession();

      expect(result).toBe(true);
      expect(mockAppCenter.Crashes.hasCrashedInLastSession).toHaveBeenCalled();
    });

    it('should check if received memory warning in last session', async () => {
      mockAppCenter.Crashes.hasReceivedMemoryWarningInLastSession.mockResolvedValue(false);

      const result = await provider.hasReceivedMemoryWarningInLastSession();

      expect(result).toBe(false);
      expect(mockAppCenter.Crashes.hasReceivedMemoryWarningInLastSession).toHaveBeenCalled();
    });

    it('should get last session crash report', async () => {
      const mockReport = {
        id: 'crash-123',
        threadName: 'main',
        exception: new Error('Test crash'),
      };
      mockAppCenter.Crashes.lastSessionCrashReport.mockResolvedValue(mockReport);

      const result = await provider.lastSessionCrashReport();

      expect(result).toBe(mockReport);
      expect(mockAppCenter.Crashes.lastSessionCrashReport).toHaveBeenCalled();
    });

    it('should track analytics event', () => {
      provider.trackEvent('test_event', { key: 'value' });

      expect(mockAppCenter.Analytics.trackEvent).toHaveBeenCalledWith('test_event', { key: 'value' });
    });

    it('should manage manual sessions', () => {
      provider.startSession();
      expect(mockAppCenter.Analytics.startSession).toHaveBeenCalled();

      provider.endSession();
      expect(mockAppCenter.Analytics.endSession).toHaveBeenCalled();
    });

    it('should pause and resume analytics', () => {
      provider.pauseAnalytics();
      expect(mockAppCenter.Analytics.pause).toHaveBeenCalled();

      provider.resumeAnalytics();
      expect(mockAppCenter.Analytics.resume).toHaveBeenCalled();
    });

    it('should check for updates', () => {
      provider.checkForUpdate();
      expect(mockAppCenter.Distribute.checkForUpdate).toHaveBeenCalled();
    });

    it('should disable automatic check for updates', () => {
      provider.disableAutomaticCheckForUpdate();
      expect(mockAppCenter.Distribute.disableAutomaticCheckForUpdate).toHaveBeenCalled();
    });
  });

  describe('shutdown', () => {
    it('should shutdown properly', async () => {
      const config = {
        appSecret: 'test-app-secret',
      };

      setTimeout(() => {
        mockScriptElement.onload?.();
      }, 0);

      await provider.initialize(config);
      await provider.shutdown();

      expect(mockAppCenter.setEnabled).toHaveBeenCalledWith(false);
      expect(provider.isInitialized).toBe(false);
    });
  });

  describe('provider reset', () => {
    beforeEach(async () => {
      const config = {
        appSecret: 'test-app-secret',
      };

      setTimeout(() => {
        mockScriptElement.onload?.();
      }, 0);

      await provider.initialize(config);
      vi.clearAllMocks();
    });

    it('should reset provider state', async () => {
      await provider.reset();

      expect(mockAppCenter.setUserId).toHaveBeenCalledWith('');
    });
  });

  describe('error handling for uninitialized provider', () => {
    it('should handle methods gracefully when not initialized', async () => {
      const uninitializedProvider = new AppCenterProvider();

      // These should not throw errors
      await uninitializedProvider.setUser({ id: 'test' });
      uninitializedProvider.setUserId('test');
      uninitializedProvider.setCountryCode('US');
      uninitializedProvider.generateTestCrash();
      uninitializedProvider.trackEvent('test', {});
      uninitializedProvider.startSession();
      uninitializedProvider.endSession();
      uninitializedProvider.pauseAnalytics();
      uninitializedProvider.resumeAnalytics();
      uninitializedProvider.checkForUpdate();
      uninitializedProvider.disableAutomaticCheckForUpdate();

      // These should return default values
      expect(await uninitializedProvider.isEnabled()).toBe(false);
      expect(await uninitializedProvider.getInstallId()).toBe('');
      expect(await uninitializedProvider.hasCrashedInLastSession()).toBe(false);
      expect(await uninitializedProvider.hasReceivedMemoryWarningInLastSession()).toBe(false);
      expect(await uninitializedProvider.lastSessionCrashReport()).toBeNull();
    });
  });
});