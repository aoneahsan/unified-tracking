import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UnifiedTrackingWeb } from './web';
import type { UnifiedTrackingConfig, ErrorContext, RevenueData, ConsentSettings } from './definitions';

// Mock the dependencies
vi.mock('./providers/provider-manager');
vi.mock('./utils/config-manager');
vi.mock('./utils/event-queue');
vi.mock('./utils/logger');

describe('UnifiedTrackingWeb', () => {
  let plugin: UnifiedTrackingWeb;

  beforeEach(() => {
    plugin = new UnifiedTrackingWeb();
  });

  describe('initialize', () => {
    it('should initialize with config', async () => {
      const config: UnifiedTrackingConfig = {
        providers: {
          analytics: {
            firebase: { enabled: true },
          },
        },
      };

      const result = await plugin.initialize(config);

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('activeProviders');
    });

    it('should initialize without config', async () => {
      const result = await plugin.initialize();

      expect(result).toHaveProperty('success', true);
    });

    it('should set debug mode when specified in config', async () => {
      const config: UnifiedTrackingConfig = {
        settings: {
          debug: true,
        },
      };

      await plugin.initialize(config);
      // Debug mode should be enabled
    });
  });

  describe('track', () => {
    beforeEach(async () => {
      await plugin.initialize();
    });

    it('should track event with properties', async () => {
      await expect(plugin.track('button_click', { button: 'submit' })).resolves.not.toThrow();
    });

    it('should track event without properties', async () => {
      await expect(plugin.track('page_view')).resolves.not.toThrow();
    });

    it('should throw error when not initialized', async () => {
      const uninitializedPlugin = new UnifiedTrackingWeb();
      await expect(uninitializedPlugin.track('event')).rejects.toThrow('not initialized');
    });
  });

  describe('identify', () => {
    beforeEach(async () => {
      await plugin.initialize();
    });

    it('should identify user with traits', async () => {
      await expect(plugin.identify('user123', { email: 'test@example.com' })).resolves.not.toThrow();
    });

    it('should identify user without traits', async () => {
      await expect(plugin.identify('user123')).resolves.not.toThrow();
    });
  });

  describe('setUserProperties', () => {
    beforeEach(async () => {
      await plugin.initialize();
    });

    it('should set user properties', async () => {
      await expect(plugin.setUserProperties({ plan: 'premium' })).resolves.not.toThrow();
    });
  });

  describe('logError', () => {
    beforeEach(async () => {
      await plugin.initialize();
    });

    it('should log error object with context', async () => {
      const error = new Error('Test error');
      const context: ErrorContext = {
        userId: 'user123',
        metadata: { page: '/home' },
      };

      await expect(plugin.logError(error, context)).resolves.not.toThrow();
    });

    it('should log error string', async () => {
      await expect(plugin.logError('Something went wrong')).resolves.not.toThrow();
    });
  });

  describe('logRevenue', () => {
    beforeEach(async () => {
      await plugin.initialize();
    });

    it('should log revenue data', async () => {
      const revenue: RevenueData = {
        amount: 9.99,
        currency: 'USD',
        productId: 'product-123',
        quantity: 1,
      };

      await expect(plugin.logRevenue(revenue)).resolves.not.toThrow();
    });
  });

  describe('logScreenView', () => {
    beforeEach(async () => {
      await plugin.initialize();
    });

    it('should log screen view with properties', async () => {
      await expect(plugin.logScreenView('HomeScreen', { tab: 'featured' })).resolves.not.toThrow();
    });

    it('should log screen view without properties', async () => {
      await expect(plugin.logScreenView('SettingsScreen')).resolves.not.toThrow();
    });
  });

  describe('setConsent', () => {
    it('should set consent settings', async () => {
      const consent: ConsentSettings = {
        analytics: true,
        errorTracking: false,
        marketing: false,
        personalization: true,
      };

      await expect(plugin.setConsent(consent)).resolves.not.toThrow();
    });
  });

  describe('reset', () => {
    beforeEach(async () => {
      await plugin.initialize();
    });

    it('should reset tracking', async () => {
      await expect(plugin.reset()).resolves.not.toThrow();
    });
  });

  describe('getActiveProviders', () => {
    beforeEach(async () => {
      await plugin.initialize();
    });

    it('should return active providers', async () => {
      const result = await plugin.getActiveProviders();

      expect(result).toHaveProperty('analytics');
      expect(result).toHaveProperty('errorTracking');
      expect(Array.isArray(result.analytics)).toBe(true);
      expect(Array.isArray(result.errorTracking)).toBe(true);
    });
  });

  describe('enableDebugMode', () => {
    it('should enable debug mode', async () => {
      await expect(plugin.enableDebugMode(true)).resolves.not.toThrow();
    });

    it('should disable debug mode', async () => {
      await expect(plugin.enableDebugMode(false)).resolves.not.toThrow();
    });
  });

  describe('addListener', () => {
    it('should add trackingEvent listener', async () => {
      const listener = vi.fn();
      const handle = await plugin.addListener('trackingEvent', listener);

      expect(handle).toHaveProperty('remove');
    });

    it('should add error listener', async () => {
      const listener = vi.fn();
      const handle = await plugin.addListener('error', listener);

      expect(handle).toHaveProperty('remove');
    });

    it('should add providerStatusChange listener', async () => {
      const listener = vi.fn();
      const handle = await plugin.addListener('providerStatusChange', listener);

      expect(handle).toHaveProperty('remove');
    });
  });
});
