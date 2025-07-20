import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SegmentAnalyticsProvider } from './segment.provider';
import type { ConsentSettings } from '../../../types/provider';

// Mock the global analytics object
const mockAnalytics = {
  load: vi.fn(),
  ready: vi.fn((callback) => callback()),
  track: vi.fn((event, properties, options, callback) => callback?.()),
  page: vi.fn((category, name, properties, options, callback) => {
    // Handle different overloads of page method
    if (typeof category === 'string' && typeof name === 'string') {
      callback?.();
    } else if (typeof category === 'string' && typeof name === 'object') {
      // page(name, properties, options, callback)
      const actualCallback = options;
      actualCallback?.();
    } else if (typeof category === 'function') {
      // page(callback)
      category();
    }
  }),
  identify: vi.fn((userId, traits, options, callback) => callback?.()),
  alias: vi.fn((userId, previousId, options, callback) => callback?.()),
  group: vi.fn((groupId, traits, options, callback) => callback?.()),
  reset: vi.fn(),
  debug: vi.fn(),
  timeout: vi.fn(),
  user: vi.fn(() => ({
    id: vi.fn(() => 'test-user-id'),
    traits: vi.fn(() => ({ email: 'test@example.com' })),
    anonymousId: vi.fn(() => 'anonymous-id'),
  })),
  addSourceMiddleware: vi.fn(),
  addDestinationMiddleware: vi.fn(),
  setAnonymousId: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  once: vi.fn(),
};

// Mock document.createElement for script loading
const mockScript = {
  src: '',
  async: false,
  type: '',
  onload: null as (() => void) | null,
  onerror: null as (() => void) | null,
};

const mockInsertBefore = vi.fn();

const mockDocument = {
  createElement: vi.fn(() => mockScript),
  getElementsByTagName: vi.fn(() => [{
    parentNode: {
      insertBefore: mockInsertBefore,
    },
  }]),
  head: {
    appendChild: vi.fn(),
  },
  body: {
    appendChild: vi.fn(),
  },
};

// Setup global mocks
global.window = {
  ...global.window,
  analytics: mockAnalytics,
} as any;

global.document = mockDocument as any;

describe('SegmentProvider', () => {
  let provider: SegmentAnalyticsProvider;

  beforeEach(() => {
    provider = new SegmentAnalyticsProvider();
    vi.clearAllMocks();
    
    // Reset mock script behavior
    mockScript.onload = null;
    mockScript.onerror = null;
    
    // Simulate successful script load by default
    mockInsertBefore.mockImplementation(() => {
      setTimeout(() => {
        if (mockScript.onload) {
          mockScript.onload();
        }
      }, 0);
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with valid configuration', async () => {
      const config = {
        writeKey: 'test-write-key',
        debug: true,
        timeout: 300,
        apiHost: 'https://api.segment.io',
        cdnHost: 'https://cdn.segment.com',
        integrations: {
          'All': false,
          'Google Analytics': true,
          'Mixpanel': true,
        },
        plan: {
          track: {
            'page view': {
              enabled: true,
            },
          },
        },
        retryQueue: true,
        crossDomainId: true,
        obfuscate: false,
        useQueryString: false,
        user: {
          persist: true,
          cookie: {
            key: 'ajs_user_id',
            oldKey: 'ajs_user',
          },
          localStorage: {
            key: 'ajs_user_traits',
          },
        },
        group: {
          persist: true,
          cookie: {
            key: 'ajs_group_id',
          },
          localStorage: {
            key: 'ajs_group_properties',
          },
        },
        initialPageview: true,
        cookie: {
          domain: '.example.com',
          path: '/',
          sameSite: 'Lax',
          secure: true,
        },
        localStorage: {
          enabled: true,
        },
        persistOptions: {
          user: true,
          group: true,
        },
        middleware: [],
        sourceMiddleware: [],
        destinationMiddleware: [],
        automaticErrorCollection: true,
        defaultTrackingPlan: {},
        unloadOnBeforeUnload: true,
      };

      await provider.initialize(config);

      expect(provider.isInitialized()).toBe(true);
      expect(provider.id).toBe('segment');
      expect(provider.name).toBe('Segment Analytics');
      expect(mockAnalytics.load).toHaveBeenCalledWith('test-write-key', expect.any(Object));
    });

    it('should throw error if writeKey is missing', async () => {
      const config = {};

      await expect(provider.initialize(config)).rejects.toThrow('Segment write key is required');
    });

    it('should handle script loading failure', async () => {
      const config = { writeKey: 'test-write-key' };
      
      // Remove the existing analytics object to force script loading
      delete (global.window as any).analytics;
      
      // Mock script loading failure
      mockInsertBefore.mockImplementation(() => {
        setTimeout(() => {
          if (mockScript.onerror) {
            mockScript.onerror();
          }
        }, 0);
      });

      await expect(provider.initialize(config)).rejects.toThrow('Failed to load Segment SDK');
      
      // Restore window.analytics for other tests
      global.window.analytics = mockAnalytics;
    });
  });

  describe('event tracking', () => {
    beforeEach(async () => {
      await provider.initialize({ writeKey: 'test-write-key' });
    });

    it('should track events with properties', async () => {
      const eventName = 'test_event';
      const properties = { category: 'test', value: 123 };
      const options = { integrations: { 'Google Analytics': false } };

      await provider.track(eventName, properties, options);

      expect(mockAnalytics.track).toHaveBeenCalledWith(eventName, properties, options, expect.any(Function));
    });

    it('should track events without properties', async () => {
      const eventName = 'test_event';

      await provider.track(eventName);

      expect(mockAnalytics.track).toHaveBeenCalledWith(eventName, {}, {}, expect.any(Function));
    });

    it('should track page views', async () => {
      const pageName = 'Home';
      const properties = { section: 'landing' };
      const options = { integrations: { 'All': true } };

      await provider.trackPageView(pageName, properties, options);

      expect(mockAnalytics.page).toHaveBeenCalledWith(pageName, properties, options, expect.any(Function));
    });

    it('should track page views with category', async () => {
      const category = 'Blog';
      const pageName = 'Article';
      const properties = { author: 'John Doe' };

      await provider.trackPageViewWithCategory(category, pageName, properties);

      expect(mockAnalytics.page).toHaveBeenCalledWith(category, pageName, properties, {}, expect.any(Function));
    });
  });

  describe('user identification', () => {
    beforeEach(async () => {
      await provider.initialize({ writeKey: 'test-write-key' });
    });

    it('should identify users with traits', async () => {
      const userId = 'user123';
      const traits = { email: 'test@example.com', name: 'Test User' };
      const options = { integrations: { 'Mixpanel': true } };

      await provider.identify(userId, traits, options);

      expect(mockAnalytics.identify).toHaveBeenCalledWith(userId, traits, options, expect.any(Function));
    });

    it('should identify users without traits', async () => {
      const userId = 'user123';

      await provider.identify(userId);

      expect(mockAnalytics.identify).toHaveBeenCalledWith(userId, {}, {}, expect.any(Function));
    });

    it('should alias users', async () => {
      const userId = 'user123';
      const previousId = 'anonymous123';
      const options = { integrations: { 'All': true } };

      await provider.alias(userId, previousId, options);

      expect(mockAnalytics.alias).toHaveBeenCalledWith(userId, previousId, options, expect.any(Function));
    });

    it('should alias users without previous ID', async () => {
      const userId = 'user123';

      await provider.alias(userId);

      expect(mockAnalytics.alias).toHaveBeenCalledWith(userId, undefined, {}, expect.any(Function));
    });
  });

  describe('group tracking', () => {
    beforeEach(async () => {
      await provider.initialize({ writeKey: 'test-write-key' });
    });

    it('should track groups with traits', async () => {
      const groupId = 'company123';
      const traits = { name: 'Acme Inc', industry: 'Technology' };
      const options = { integrations: { 'Salesforce': true } };

      await provider.group(groupId, traits, options);

      expect(mockAnalytics.group).toHaveBeenCalledWith(groupId, traits, options, expect.any(Function));
    });

    it('should track groups without traits', async () => {
      const groupId = 'company123';

      await provider.group(groupId);

      expect(mockAnalytics.group).toHaveBeenCalledWith(groupId, {}, {}, expect.any(Function));
    });
  });

  describe('user data', () => {
    beforeEach(async () => {
      await provider.initialize({ writeKey: 'test-write-key' });
    });

    it('should get user ID', async () => {
      const userId = await provider.getUserId();

      expect(mockAnalytics.user).toHaveBeenCalled();
      expect(userId).toBe('test-user-id');
    });

    it('should get user traits', async () => {
      const traits = await provider.getUserTraits();

      expect(mockAnalytics.user).toHaveBeenCalled();
      expect(traits).toEqual({ email: 'test@example.com' });
    });

    it('should get anonymous ID', async () => {
      const anonymousId = await provider.getAnonymousId();

      expect(mockAnalytics.user).toHaveBeenCalled();
      expect(anonymousId).toBe('anonymous-id');
    });

    it('should set anonymous ID', async () => {
      const anonymousId = 'new-anonymous-id';

      await provider.setAnonymousId(anonymousId);

      expect(mockAnalytics.setAnonymousId).toHaveBeenCalledWith(anonymousId);
    });
  });

  describe('middleware', () => {
    beforeEach(async () => {
      await provider.initialize({ writeKey: 'test-write-key' });
    });

    it('should add source middleware', async () => {
      const middleware = vi.fn();

      await provider.addSourceMiddleware(middleware);

      expect(mockAnalytics.addSourceMiddleware).toHaveBeenCalledWith(middleware);
    });

    it('should add destination middleware', async () => {
      const integrationName = 'Google Analytics';
      const middleware = vi.fn();

      await provider.addDestinationMiddleware(integrationName, middleware);

      expect(mockAnalytics.addDestinationMiddleware).toHaveBeenCalledWith(integrationName, middleware);
    });
  });

  describe('event listeners', () => {
    beforeEach(async () => {
      await provider.initialize({ writeKey: 'test-write-key' });
    });

    it('should add event listener', async () => {
      const event = 'track';
      const callback = vi.fn();

      await provider.on(event, callback);

      expect(mockAnalytics.on).toHaveBeenCalledWith(event, callback);
    });

    it('should remove event listener', async () => {
      const event = 'track';
      const callback = vi.fn();

      await provider.off(event, callback);

      expect(mockAnalytics.off).toHaveBeenCalledWith(event, callback);
    });

    it('should add one-time event listener', async () => {
      const event = 'ready';
      const callback = vi.fn();

      await provider.once(event, callback);

      expect(mockAnalytics.once).toHaveBeenCalledWith(event, callback);
    });
  });

  describe('consent management', () => {
    beforeEach(async () => {
      await provider.initialize({ writeKey: 'test-write-key' });
    });

    it('should handle consent granted', async () => {
      const consent: ConsentSettings = {
        analytics: true,
        marketing: true,
        personalization: true,
        errorTracking: true,
      };

      await provider.updateConsent(consent);

      // Segment doesn't have built-in consent management
      // This would typically integrate with a consent management platform
      expect(provider.isEnabled()).toBe(true);
    });

    it('should handle consent denied', async () => {
      const consent: ConsentSettings = {
        analytics: false,
        marketing: false,
        personalization: false,
        errorTracking: false,
      };

      await provider.updateConsent(consent);

      // Segment doesn't have built-in consent management
      // This would typically integrate with a consent management platform
      expect(provider.isEnabled()).toBe(false);
    });
  });

  describe('provider management', () => {
    beforeEach(async () => {
      await provider.initialize({ writeKey: 'test-write-key' });
    });

    it('should reset provider', async () => {
      await provider.reset();

      expect(mockAnalytics.reset).toHaveBeenCalled();
    });

    it('should enable debug mode', async () => {
      await provider.enableDebug();

      expect(mockAnalytics.debug).toHaveBeenCalledWith(true);
    });

    it('should disable debug mode', async () => {
      await provider.disableDebug();

      expect(mockAnalytics.debug).toHaveBeenCalledWith(false);
    });

    it('should set timeout', async () => {
      const timeout = 500;

      await provider.setTimeout(timeout);

      expect(mockAnalytics.timeout).toHaveBeenCalledWith(timeout);
    });

    it('should wait for ready state', async () => {
      const callback = vi.fn();

      // Check if the method exists
      expect(typeof provider.ready).toBe('function');
      
      await provider.ready(callback);

      expect(mockAnalytics.ready).toHaveBeenCalledWith(callback);
    });
  });

  describe('revenue tracking', () => {
    beforeEach(async () => {
      await provider.initialize({ writeKey: 'test-write-key' });
    });

    it('should track revenue', async () => {
      const revenue = {
        amount: 29.99,
        currency: 'USD',
        productId: 'premium_plan',
        transactionId: 'txn_123',
        properties: { plan: 'premium' },
      };

      await provider.trackRevenue(revenue);

      expect(mockAnalytics.track).toHaveBeenCalledWith('Order Completed', {
        revenue: revenue.amount,
        currency: revenue.currency,
        value: revenue.amount,
        product_id: revenue.productId,
        order_id: revenue.transactionId,
        ...revenue.properties,
      }, {}, expect.any(Function));
    });

    it('should track revenue with minimal data', async () => {
      const revenue = { amount: 9.99 };

      await provider.trackRevenue(revenue);

      expect(mockAnalytics.track).toHaveBeenCalledWith('Order Completed', {
        revenue: revenue.amount,
        currency: 'USD',
        value: revenue.amount,
      }, {}, expect.any(Function));
    });
  });

  describe('error handling', () => {
    it('should handle initialization without window.analytics', async () => {
      // Remove analytics from window
      delete (global.window as any).analytics;

      const config = { writeKey: 'test-write-key' };
      
      // Mock script loading failure by not calling onload
      mockInsertBefore.mockImplementation(() => {
        // Don't call onload or onerror, simulating a timeout
      });
      
      // The initialization should fail because window.analytics won't be created
      const promise = provider.initialize(config);
      
      // Wait a bit for the script loading to attempt
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Now trigger script loading error
      if (mockScript.onerror) {
        mockScript.onerror();
      }
      
      await expect(promise).rejects.toThrow('Failed to load Segment SDK');
      
      // Restore window.analytics for other tests
      global.window.analytics = mockAnalytics;
    }, 15000);

    it('should handle methods when not initialized', async () => {
      const uninitializedProvider = new SegmentAnalyticsProvider();

      await expect(uninitializedProvider.track('test')).rejects.toThrow('Segment not initialized');
      await expect(uninitializedProvider.identify('user')).rejects.toThrow('Segment not initialized');
      await expect(uninitializedProvider.group('group')).rejects.toThrow('Segment not initialized');
    });
  });
});