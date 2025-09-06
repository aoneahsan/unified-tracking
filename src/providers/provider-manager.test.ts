import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProviderManager } from './provider-manager';
import type { BaseProvider } from './base';
import type { ConsentSettings, ErrorContext, RevenueData } from '../definitions';

describe('ProviderManager', () => {
  let providerManager: ProviderManager;
  let mockAnalyticsProvider: any;
  let mockErrorProvider: any;

  beforeEach(() => {
    providerManager = new ProviderManager();

    mockAnalyticsProvider = {
      name: 'test-analytics',
      type: 'analytics',
      isReady: vi.fn().mockReturnValue(true),
      initialize: vi.fn().mockResolvedValue(undefined),
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
      name: 'test-error',
      type: 'error-tracking',
      isReady: vi.fn().mockReturnValue(true),
      initialize: vi.fn().mockResolvedValue(undefined),
      logError: vi.fn().mockResolvedValue(undefined),
      setUserContext: vi.fn().mockResolvedValue(undefined),
      reset: vi.fn().mockResolvedValue(undefined),
      handleConsent: vi.fn().mockResolvedValue(undefined),
      version: '1.0.0',
    };
  });

  describe('initialize', () => {
    it('should initialize providers from config', async () => {
      const config = {
        providers: {
          analytics: {
            firebase: { enabled: true },
          },
          errorTracking: {
            sentry: { enabled: true, dsn: 'test-dsn' },
          },
        },
      };

      await providerManager.initialize(config);

      const activeProviders = providerManager.getActiveProviders('analytics');
      expect(activeProviders.length).toBeGreaterThan(0);
    });

    it('should handle empty config', async () => {
      await expect(providerManager.initialize({})).resolves.not.toThrow();
    });
  });

  describe('trackEvent', () => {
    it('should call trackEvent on all analytics providers', async () => {
      providerManager['providers'].set('test', mockAnalyticsProvider);

      await providerManager.trackEvent('test_event', { value: 123 });

      expect(mockAnalyticsProvider.trackEvent).toHaveBeenCalledWith('test_event', { value: 123 });
    });

    it('should handle provider errors gracefully', async () => {
      mockAnalyticsProvider.trackEvent.mockRejectedValue(new Error('Provider error'));
      providerManager['providers'].set('test', mockAnalyticsProvider);

      await expect(providerManager.trackEvent('test_event')).resolves.not.toThrow();
    });
  });

  describe('identifyUser', () => {
    it('should call identifyUser on all analytics providers', async () => {
      providerManager['providers'].set('test', mockAnalyticsProvider);

      await providerManager.identifyUser('user123', { email: 'test@example.com' });

      expect(mockAnalyticsProvider.identifyUser).toHaveBeenCalledWith('user123', { email: 'test@example.com' });
    });
  });

  describe('logError', () => {
    it('should call logError on all error tracking providers', async () => {
      providerManager['providers'].set('test', mockErrorProvider);

      const error = new Error('Test error');
      const context: ErrorContext = {
        userId: 'user123',
        metadata: { page: '/home' },
      };

      await providerManager.logError(error, context);

      expect(mockErrorProvider.logError).toHaveBeenCalledWith(error, context);
    });
  });

  describe('logRevenue', () => {
    it('should call logRevenue on all analytics providers', async () => {
      providerManager['providers'].set('test', mockAnalyticsProvider);

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
      providerManager['providers'].set('test', mockAnalyticsProvider);

      await providerManager.logScreenView('HomeScreen', { tab: 'featured' });

      expect(mockAnalyticsProvider.logScreenView).toHaveBeenCalledWith('HomeScreen', { tab: 'featured' });
    });
  });

  describe('setUserProperties', () => {
    it('should call setUserProperties on all providers', async () => {
      providerManager['providers'].set('analytics', mockAnalyticsProvider);
      providerManager['providers'].set('error', mockErrorProvider);

      const properties = { subscription: 'premium', region: 'US' };
      await providerManager.setUserProperties(properties);

      expect(mockAnalyticsProvider.setUserProperties).toHaveBeenCalledWith(properties);
      expect(mockErrorProvider.setUserContext).toHaveBeenCalledWith(undefined, properties);
    });
  });

  describe('handleConsentChange', () => {
    it('should pass consent settings to all providers', async () => {
      providerManager['providers'].set('analytics', mockAnalyticsProvider);
      providerManager['providers'].set('error', mockErrorProvider);

      const consent: ConsentSettings = {
        analytics: false,
        errorTracking: true,
        marketing: false,
        personalization: false,
      };

      await providerManager.handleConsentChange(consent);

      expect(mockAnalyticsProvider.handleConsent).toHaveBeenCalledWith(consent);
      expect(mockErrorProvider.handleConsent).toHaveBeenCalledWith(consent);
    });
  });

  describe('reset', () => {
    it('should reset all providers', async () => {
      providerManager['providers'].set('analytics', mockAnalyticsProvider);
      providerManager['providers'].set('error', mockErrorProvider);

      await providerManager.reset();

      expect(mockAnalyticsProvider.reset).toHaveBeenCalled();
      expect(mockErrorProvider.reset).toHaveBeenCalled();
    });
  });

  describe('setDebugMode', () => {
    it('should enable debug mode', () => {
      providerManager.setDebugMode(true);
      expect(providerManager['debugMode']).toBe(true);
    });

    it('should disable debug mode', () => {
      providerManager.setDebugMode(false);
      expect(providerManager['debugMode']).toBe(false);
    });
  });

  describe('getActiveProviders', () => {
    it('should return analytics providers', () => {
      providerManager['providers'].set('test', mockAnalyticsProvider);

      const providers = providerManager.getActiveProviders('analytics');
      expect(providers).toHaveLength(1);
      expect(providers[0].name).toBe('test-analytics');
    });

    it('should return error tracking providers', () => {
      providerManager['providers'].set('test', mockErrorProvider);

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
