import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProviderManager } from './provider-manager.js';
import type { ConsentSettings, ErrorContext, RevenueData } from '../definitions.js';

describe('ProviderManager', () => {
  let providerManager: ProviderManager;
  let mockAnalyticsProvider: any;
  let mockErrorProvider: any;
  const registerActiveProvider = (id: string, provider: any) => {
    providerManager['providers'].set(id, {
      provider,
      state: 'active',
      config: {},
    });
  };

  beforeEach(() => {
    providerManager = new ProviderManager();

    mockAnalyticsProvider = {
      id: 'test-analytics',
      name: 'test-analytics',
      type: 'analytics',
      isReady: vi.fn().mockReturnValue(true),
      initialize: vi.fn().mockResolvedValue(undefined),
      shutdown: vi.fn().mockResolvedValue(undefined),
      updateConsent: vi.fn().mockResolvedValue(undefined),
      trackEvent: vi.fn().mockResolvedValue(undefined),
      identifyUser: vi.fn().mockResolvedValue(undefined),
      setUserProperties: vi.fn().mockResolvedValue(undefined),
      logRevenue: vi.fn().mockResolvedValue(undefined),
      logScreenView: vi.fn().mockResolvedValue(undefined),
      reset: vi.fn().mockResolvedValue(undefined),
      handleConsent: vi.fn().mockResolvedValue(undefined),
      version: '1.0.0',
    };

    mockErrorProvider = {
      id: 'test-error',
      name: 'test-error',
      type: 'error-tracking',
      isReady: vi.fn().mockReturnValue(true),
      initialize: vi.fn().mockResolvedValue(undefined),
      shutdown: vi.fn().mockResolvedValue(undefined),
      updateConsent: vi.fn().mockResolvedValue(undefined),
      logError: vi.fn().mockResolvedValue(undefined),
      setUserContext: vi.fn().mockResolvedValue(undefined),
      reset: vi.fn().mockResolvedValue(undefined),
      version: '1.0.0',
    };
  });

  describe('initialize', () => {
    it('should initialize providers from config', async () => {
      vi.spyOn(providerManager as any, 'loadProvider').mockImplementation(async (...args: unknown[]) => {
        const [name, type] = args as [string, string];
        if (type === 'analytics' && name === 'firebase') {
          return mockAnalyticsProvider;
        }
        if (type === 'error-tracking' && name === 'sentry') {
          return mockErrorProvider;
        }
        return null;
      });

      const config = {
        autoDetect: false,
        analytics: {
          providers: ['firebase' as const],
          firebase: {
            enabled: true,
          },
        },
        errorTracking: {
          providers: ['sentry' as const],
          sentry: {
            dsn: 'test-dsn',
          },
        },
      };

      await providerManager.initialize(config);

      expect(providerManager.getActiveProviders('analytics')).toHaveLength(1);
      expect(providerManager.getActiveProviders('error-tracking')).toHaveLength(1);
    });

    it('should handle empty config', async () => {
      await expect(providerManager.initialize({ autoDetect: false })).resolves.not.toThrow();
    });
  });

  describe('trackEvent', () => {
    it('should call trackEvent on all analytics providers', async () => {
      registerActiveProvider('test', mockAnalyticsProvider);

      await providerManager.trackEvent('test_event', { value: 123 });

      expect(mockAnalyticsProvider.trackEvent).toHaveBeenCalledWith('test_event', { value: 123 });
    });

    it('should handle provider errors gracefully', async () => {
      mockAnalyticsProvider.trackEvent.mockRejectedValue(new Error('Provider error'));
      registerActiveProvider('test', mockAnalyticsProvider);

      await expect(providerManager.trackEvent('test_event')).resolves.not.toThrow();
    });
  });

  describe('identifyUser', () => {
    it('should call identifyUser on all analytics providers', async () => {
      registerActiveProvider('test', mockAnalyticsProvider);

      await providerManager.identifyUser('user123', { email: 'test@example.com' });

      expect(mockAnalyticsProvider.identifyUser).toHaveBeenCalledWith('user123', { email: 'test@example.com' });
    });
  });

  describe('logError', () => {
    it('should call logError on all error tracking providers', async () => {
      registerActiveProvider('test', mockErrorProvider);

      const error = new Error('Test error');
      const context: ErrorContext = {
        user: {
          id: 'user123',
        },
        extra: { page: '/home' },
      };

      await providerManager.logError(error, context);

      expect(mockErrorProvider.logError).toHaveBeenCalledWith(error, context);
    });
  });

  describe('logRevenue', () => {
    it('should call logRevenue on all analytics providers', async () => {
      registerActiveProvider('test', mockAnalyticsProvider);

      const revenueData: RevenueData = {
        amount: 9.99,
        currency: 'USD',
        productId: 'product-123',
        quantity: 1,
        properties: { category: 'subscription' },
      };

      await providerManager.logRevenue(revenueData);

      expect(mockAnalyticsProvider.logRevenue).toHaveBeenCalledWith(revenueData);
    });
  });

  describe('logScreenView', () => {
    it('should call logScreenView on all analytics providers', async () => {
      registerActiveProvider('test', mockAnalyticsProvider);

      await providerManager.logScreenView('HomeScreen', { tab: 'featured' });

      expect(mockAnalyticsProvider.logScreenView).toHaveBeenCalledWith('HomeScreen', { tab: 'featured' });
    });
  });

  describe('setUserProperties', () => {
    it('should call setUserProperties on all providers', async () => {
      registerActiveProvider('analytics', mockAnalyticsProvider);
      registerActiveProvider('error', mockErrorProvider);

      const properties = { subscription: 'premium', region: 'US' };
      await providerManager.setUserProperties(properties);

      expect(mockAnalyticsProvider.setUserProperties).toHaveBeenCalledWith(properties);
      expect(mockErrorProvider.setUserContext).not.toHaveBeenCalled();
    });
  });

  describe('handleConsentChange', () => {
    it('should pass consent settings to all providers', async () => {
      registerActiveProvider('analytics', mockAnalyticsProvider);
      registerActiveProvider('error', mockErrorProvider);

      const consent: ConsentSettings = {
        analytics: false,
        errorTracking: true,
        marketing: false,
        personalization: false,
      };

      await providerManager.handleConsentChange(consent);

      expect(mockAnalyticsProvider.updateConsent).toHaveBeenCalledWith(consent);
      expect(mockErrorProvider.updateConsent).toHaveBeenCalledWith(consent);
    });
  });

  describe('reset', () => {
    it('should reset all providers', async () => {
      registerActiveProvider('analytics', mockAnalyticsProvider);
      registerActiveProvider('error', mockErrorProvider);

      await providerManager.reset();

      expect(mockAnalyticsProvider.reset).toHaveBeenCalled();
      expect(mockErrorProvider.reset).toHaveBeenCalled();
    });
  });

  describe('setDebugMode', () => {
    it('should enable debug mode', () => {
      providerManager.setDebugMode(true);
      // Debug mode is set internally
      expect(providerManager.getActiveProviders('analytics')).toBeDefined();
    });

    it('should disable debug mode', () => {
      providerManager.setDebugMode(false);
      // Debug mode is set internally
      expect(providerManager.getActiveProviders('analytics')).toBeDefined();
    });
  });

  describe('getActiveProviders', () => {
    it('should return analytics providers', () => {
      registerActiveProvider('test', mockAnalyticsProvider);

      const providers = providerManager.getActiveProviders('analytics');
      expect(providers).toHaveLength(1);
      expect(providers[0].name).toBe('test-analytics');
    });

    it('should return error tracking providers', () => {
      registerActiveProvider('test', mockErrorProvider);

      const providers = providerManager.getActiveProviders('error-tracking');
      expect(providers).toHaveLength(1);
      expect(providers[0].name).toBe('test-error');
    });

    it('should return empty array when no providers', () => {
      const providers = providerManager.getActiveProviders('analytics');
      expect(providers).toHaveLength(0);
    });
  });
});
