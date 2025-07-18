import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SegmentProvider } from './segment.provider';
import type { ConsentSettings } from '../../../types/provider';

// Mock the global analytics object
const mockAnalytics = {
  load: vi.fn(),
  ready: vi.fn(),
  track: vi.fn(),
  page: vi.fn(),
  identify: vi.fn(),
  alias: vi.fn(),
  group: vi.fn(),
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
  emitter: {
    on: vi.fn(),
    off: vi.fn(),
    once: vi.fn(),
  },
  Integrations: {},
  VERSION: '4.0.0',
  _writeKey: 'test-write-key',
  _user: {
    id: vi.fn(() => 'test-user-id'),
    traits: vi.fn(() => ({ email: 'test@example.com' })),
    anonymousId: vi.fn(() => 'anonymous-id'),
  },
  _options: {},
  _readyState: 'ready',
  _integrations: {},
  _plan: {},
  _sourceMiddlewares: [],
  _destinationMiddlewares: [],
  _timeout: 300,
  _user_id: 'test-user-id',
  _debug: false,
  _loaded: true,
  _loadOptions: {},
  _writeKey: 'test-write-key',
  _cdn: 'https://cdn.segment.com',
  _retryQueue: [],
  _sourceMiddleware: [],
  _destinationMiddleware: [],
  _integrationOptions: {},
  _plan: {},
  _timeout: 300,
  _user: {},
  _options: {},
  _readyState: 'ready',
  _integrations: {},
  _sourceMiddlewares: [],
  _destinationMiddlewares: [],
  _retryQueue: [],
  _sourceMiddleware: [],
  _destinationMiddleware: [],
  _integrationOptions: {},
  _debug: false,
  _loaded: true,
  _loadOptions: {},
  _cdn: 'https://cdn.segment.com',
  _user_id: 'test-user-id',
  _writeKey: 'test-write-key',
  _plan: {},
  _timeout: 300,
  _user: {},
  _options: {},
  _readyState: 'ready',
  _integrations: {},
  _sourceMiddlewares: [],
  _destinationMiddlewares: [],
  _retryQueue: [],
  _sourceMiddleware: [],
  _destinationMiddleware: [],
  _integrationOptions: {},
  _debug: false,
  _loaded: true,
  _loadOptions: {},
  _cdn: 'https://cdn.segment.com',
  _user_id: 'test-user-id',
  _writeKey: 'test-write-key',
  _plan: {},
  _timeout: 300,
  _user: {},
  _options: {},
  _readyState: 'ready',
  _integrations: {},
  _sourceMiddlewares: [],
  _destinationMiddlewares: [],
  _retryQueue: [],
  _sourceMiddleware: [],
  _destinationMiddleware: [],
  _integrationOptions: {},
  _debug: false,
  _loaded: true,
  _loadOptions: {},
  _cdn: 'https://cdn.segment.com',
  _user_id: 'test-user-id',
};

// Mock document.createElement for script loading
const mockScript = {
  src: '',
  async: false,
  onload: null as (() => void) | null,
  onerror: null as (() => void) | null,
};

const mockDocument = {
  createElement: vi.fn(() => mockScript),
  head: {
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
  let provider: SegmentProvider;

  beforeEach(() => {
    provider = new SegmentProvider();
    vi.clearAllMocks();
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
      expect(provider.getId()).toBe('segment');
      expect(provider.getName()).toBe('Segment Analytics');
      expect(mockAnalytics.load).toHaveBeenCalledWith('test-write-key', expect.any(Object));
    });

    it('should throw error if writeKey is missing', async () => {
      const config = {};

      await expect(provider.initialize(config)).rejects.toThrow('Segment write key is required');
    });

    it('should handle script loading failure', async () => {
      const config = { writeKey: 'test-write-key' };
      
      // Mock script loading failure
      vi.mocked(mockDocument.createElement).mockImplementation(() => ({
        ...mockScript,
        onerror: null,
      }));

      // Simulate script error
      setTimeout(() => {
        if (mockScript.onerror) {
          mockScript.onerror();
        }
      }, 10);

      await expect(provider.initialize(config)).rejects.toThrow('Failed to load Segment SDK');
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

      expect(mockAnalytics.track).toHaveBeenCalledWith(eventName, properties, options);
    });

    it('should track events without properties', async () => {
      const eventName = 'test_event';

      await provider.track(eventName);

      expect(mockAnalytics.track).toHaveBeenCalledWith(eventName, {}, {});
    });

    it('should track page views', async () => {
      const pageName = 'Home';
      const properties = { section: 'landing' };
      const options = { integrations: { 'All': true } };

      await provider.trackPageView(pageName, properties, options);

      expect(mockAnalytics.page).toHaveBeenCalledWith(pageName, properties, options);
    });

    it('should track page views with category', async () => {
      const category = 'Blog';
      const pageName = 'Article';
      const properties = { author: 'John Doe' };

      await provider.trackPageViewWithCategory(category, pageName, properties);

      expect(mockAnalytics.page).toHaveBeenCalledWith(category, pageName, properties, {});
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

      expect(mockAnalytics.identify).toHaveBeenCalledWith(userId, traits, options);
    });

    it('should identify users without traits', async () => {
      const userId = 'user123';

      await provider.identify(userId);

      expect(mockAnalytics.identify).toHaveBeenCalledWith(userId, {}, {});
    });

    it('should alias users', async () => {
      const userId = 'user123';
      const previousId = 'anonymous123';
      const options = { integrations: { 'All': true } };

      await provider.alias(userId, previousId, options);

      expect(mockAnalytics.alias).toHaveBeenCalledWith(userId, previousId, options);
    });

    it('should alias users without previous ID', async () => {
      const userId = 'user123';

      await provider.alias(userId);

      expect(mockAnalytics.alias).toHaveBeenCalledWith(userId, undefined, {});
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

      expect(mockAnalytics.group).toHaveBeenCalledWith(groupId, traits, options);
    });

    it('should track groups without traits', async () => {
      const groupId = 'company123';

      await provider.group(groupId);

      expect(mockAnalytics.group).toHaveBeenCalledWith(groupId, {}, {});
    });
  });

  describe('user data', () => {
    beforeEach(async () => {
      await provider.initialize({ writeKey: 'test-write-key' });
    });

    it('should get user ID', async () => {
      const userId = await provider.getUserId();

      expect(mockAnalytics.user().id).toHaveBeenCalled();
      expect(userId).toBe('test-user-id');
    });

    it('should get user traits', async () => {
      const traits = await provider.getUserTraits();

      expect(mockAnalytics.user().traits).toHaveBeenCalled();
      expect(traits).toEqual({ email: 'test@example.com' });
    });

    it('should get anonymous ID', async () => {
      const anonymousId = await provider.getAnonymousId();

      expect(mockAnalytics.user().anonymousId).toHaveBeenCalled();
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
        product_id: revenue.productId,
        order_id: revenue.transactionId,
        ...revenue.properties,
      });
    });

    it('should track revenue with minimal data', async () => {
      const revenue = { amount: 9.99 };

      await provider.trackRevenue(revenue);

      expect(mockAnalytics.track).toHaveBeenCalledWith('Order Completed', {
        revenue: revenue.amount,
        currency: 'USD',
      });
    });
  });

  describe('error handling', () => {
    it('should handle initialization without window.analytics', async () => {
      // Remove analytics from window
      delete (global.window as any).analytics;

      const config = { writeKey: 'test-write-key' };

      await expect(provider.initialize(config)).rejects.toThrow('Failed to load Segment SDK');
    });

    it('should handle methods when not initialized', async () => {
      const uninitializedProvider = new SegmentProvider();

      await expect(uninitializedProvider.track('test')).rejects.toThrow('Segment not initialized');
      await expect(uninitializedProvider.identify('user')).rejects.toThrow('Segment not initialized');
      await expect(uninitializedProvider.group('group')).rejects.toThrow('Segment not initialized');
    });
  });
});