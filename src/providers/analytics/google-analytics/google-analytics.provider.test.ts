import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GoogleAnalyticsProvider } from './google-analytics.provider';
import type { ConsentSettings } from '../../../types/provider';

// Mock window.gtag
const mockGtag = vi.fn();
Object.defineProperty(window, 'gtag', {
  value: mockGtag,
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

describe('GoogleAnalyticsProvider', () => {
  let provider: GoogleAnalyticsProvider;
  let mockLogger: any;

  beforeEach(() => {
    provider = new GoogleAnalyticsProvider();
    mockLogger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };
    (provider as any).logger = mockLogger;
    
    // Reset mocks
    vi.clearAllMocks();
    mockGtag.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with valid configuration', async () => {
      const config = {
        measurementId: 'G-TEST123',
        debugMode: false,
        sendPageView: true,
      };

      // Mock successful script loading
      setTimeout(() => {
        mockScriptElement.onload?.();
      }, 0);

      await provider.initialize(config);

      expect(provider.isInitialized).toBe(true);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Google Analytics initialized successfully',
        expect.objectContaining({
          measurementId: 'G-TEST123',
        })
      );
    });

    it('should throw error if measurement ID is missing', async () => {
      const config = {};

      await expect(provider.initialize(config)).rejects.toThrow(
        'Google Analytics measurement ID is required'
      );
    });

    it('should handle script loading failure', async () => {
      const config = {
        measurementId: 'G-TEST123',
      };

      // Mock script loading error
      setTimeout(() => {
        mockScriptElement.onerror?.();
      }, 0);

      await expect(provider.initialize(config)).rejects.toThrow(
        'Failed to load Google Analytics SDK'
      );
    });
  });

  describe('consent management', () => {
    beforeEach(async () => {
      const config = {
        measurementId: 'G-TEST123',
      };

      setTimeout(() => {
        mockScriptElement.onload?.();
      }, 0);

      await provider.initialize(config);
      mockGtag.mockClear();
    });

    it('should update consent settings', async () => {
      const consent: ConsentSettings = {
        analytics: true,
        errorTracking: true,
        marketing: false,
        personalization: false,
      };

      await provider.updateConsent(consent);

      expect(mockGtag).toHaveBeenCalledWith('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'denied',
        personalization_storage: 'denied',
        functionality_storage: 'granted',
        security_storage: 'granted',
      });
    });

    it('should deny all consent when analytics is disabled', async () => {
      const consent: ConsentSettings = {
        analytics: false,
        errorTracking: false,
        marketing: false,
        personalization: false,
      };

      await provider.updateConsent(consent);

      expect(mockGtag).toHaveBeenCalledWith('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        personalization_storage: 'denied',
        functionality_storage: 'denied',
        security_storage: 'denied',
      });
    });
  });

  describe('tracking', () => {
    beforeEach(async () => {
      const config = {
        measurementId: 'G-TEST123',
      };

      setTimeout(() => {
        mockScriptElement.onload?.();
      }, 0);

      await provider.initialize(config);
      mockGtag.mockClear();
    });

    it('should track custom events', async () => {
      const eventName = 'test_event';
      const properties = {
        event_category: 'test',
        event_label: 'test_label',
        value: 1,
      };

      await provider.track(eventName, properties);

      expect(mockGtag).toHaveBeenCalledWith('event', eventName, properties);
    });

    it('should identify users', async () => {
      const userId = 'user123';
      const traits = {
        email: 'test@example.com',
        name: 'Test User',
      };

      await provider.identifyUser(userId, traits);

      expect(mockGtag).toHaveBeenCalledWith('config', 'G-TEST123', {
        user_id: userId,
        custom_map: traits,
      });
    });

    it('should set user properties', async () => {
      const properties = {
        user_type: 'premium',
        subscription_level: 'pro',
      };

      await provider.setUserProperties(properties);

      expect(mockGtag).toHaveBeenCalledWith('config', 'G-TEST123', {
        custom_map: properties,
      });
    });

    it('should log screen views', async () => {
      const screenName = 'home_screen';
      const properties = {
        screen_class: 'HomeScreen',
        content_group1: 'main',
      };

      await provider.logScreenView(screenName, properties);

      expect(mockGtag).toHaveBeenCalledWith('event', 'screen_view', {
        screen_name: screenName,
        ...properties,
      });
    });

    it('should log revenue events', async () => {
      const revenueData = {
        amount: 29.99,
        currency: 'USD',
        productId: 'prod123',
        productName: 'Test Product',
        quantity: 1,
        properties: {
          category: 'subscription',
        },
      };

      await provider.logRevenue(revenueData);

      expect(mockGtag).toHaveBeenCalledWith('event', 'purchase', {
        transaction_id: expect.any(String),
        value: 29.99,
        currency: 'USD',
        items: [
          {
            item_id: 'prod123',
            item_name: 'Test Product',
            quantity: 1,
            price: 29.99,
          },
        ],
        category: 'subscription',
      });
    });
  });

  describe('provider reset', () => {
    beforeEach(async () => {
      const config = {
        measurementId: 'G-TEST123',
      };

      setTimeout(() => {
        mockScriptElement.onload?.();
      }, 0);

      await provider.initialize(config);
      mockGtag.mockClear();
    });

    it('should reset the provider', async () => {
      await provider.reset();

      expect(mockGtag).toHaveBeenCalledWith('config', 'G-TEST123', {
        user_id: null,
        custom_map: {},
      });
    });
  });

  describe('debug mode', () => {
    it('should set debug mode', () => {
      provider.setDebugMode(true);
      expect(mockLogger.info).toHaveBeenCalledWith('Google Analytics debug mode enabled');

      provider.setDebugMode(false);
      expect(mockLogger.info).toHaveBeenCalledWith('Google Analytics debug mode disabled');
    });
  });

  describe('error handling', () => {
    it('should throw error when tracking without initialization', async () => {
      const uninitializedProvider = new GoogleAnalyticsProvider();
      
      await expect(uninitializedProvider.track('test_event')).rejects.toThrow(
        'Google Analytics not initialized'
      );
    });

    it('should handle gtag errors gracefully', async () => {
      const config = {
        measurementId: 'G-TEST123',
      };

      setTimeout(() => {
        mockScriptElement.onload?.();
      }, 0);

      await provider.initialize(config);
      
      // Mock gtag to throw an error
      mockGtag.mockImplementation(() => {
        throw new Error('GA error');
      });

      await expect(provider.track('test_event')).rejects.toThrow('GA error');
    });
  });

  describe('provider info', () => {
    it('should return correct provider information', () => {
      expect(provider.id).toBe('google-analytics');
      expect(provider.name).toBe('Google Analytics');
      expect(provider.version).toBe('1.0.0');
    });
  });

  describe('custom parameters', () => {
    it('should handle custom parameters during initialization', async () => {
      const config = {
        measurementId: 'G-TEST123',
        customParameters: {
          custom_parameter_1: 'value1',
          custom_parameter_2: 'value2',
        },
      };

      setTimeout(() => {
        mockScriptElement.onload?.();
      }, 0);

      await provider.initialize(config);

      expect(mockGtag).toHaveBeenCalledWith('config', 'G-TEST123', {
        custom_parameter_1: 'value1',
        custom_parameter_2: 'value2',
      });
    });
  });

  describe('page view tracking', () => {
    it('should send page view by default', async () => {
      const config = {
        measurementId: 'G-TEST123',
      };

      setTimeout(() => {
        mockScriptElement.onload?.();
      }, 0);

      await provider.initialize(config);

      expect(mockGtag).toHaveBeenCalledWith('config', 'G-TEST123', {
        send_page_view: true,
      });
    });

    it('should not send page view when disabled', async () => {
      const config = {
        measurementId: 'G-TEST123',
        sendPageView: false,
      };

      setTimeout(() => {
        mockScriptElement.onload?.();
      }, 0);

      await provider.initialize(config);

      expect(mockGtag).toHaveBeenCalledWith('config', 'G-TEST123', {
        send_page_view: false,
      });
    });
  });
});