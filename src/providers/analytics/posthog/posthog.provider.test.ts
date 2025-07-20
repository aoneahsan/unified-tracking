import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PostHogAnalyticsProvider } from './posthog.provider';
import type { ConsentSettings } from '../../../types/provider';

// Mock the global PostHog object
const mockPostHog = {
  init: vi.fn(),
  capture: vi.fn(),
  identify: vi.fn(),
  people: {
    set: vi.fn(),
    set_once: vi.fn(),
    increment: vi.fn(),
    append: vi.fn(),
    delete: vi.fn(),
  },
  alias: vi.fn(),
  reset: vi.fn(),
  get_distinct_id: vi.fn(() => 'test-distinct-id'),
  get_session_id: vi.fn(() => 'test-session-id'),
  opt_out_capturing: vi.fn(),
  opt_in_capturing: vi.fn(),
  has_opted_out_capturing: vi.fn(() => false),
  set_config: vi.fn(),
  register: vi.fn(),
  register_once: vi.fn(),
  unregister: vi.fn(),
  get_property: vi.fn((prop) => `test-${prop}`),
  startSessionRecording: vi.fn(),
  stopSessionRecording: vi.fn(),
  feature_flags: {
    reloadFeatureFlags: vi.fn(),
    isFeatureEnabled: vi.fn((flag) => flag === 'test-flag'),
    getFeatureFlag: vi.fn((flag) => `flag-${flag}`),
    onFeatureFlags: vi.fn(),
  },
  group: vi.fn(),
  debug: vi.fn(),
  setPersonProperties: vi.fn(),
  setPersonPropertiesForFlags: vi.fn(),
  isFeatureEnabled: vi.fn((flag) => flag === 'test-flag'),
  getFeatureFlag: vi.fn((flag) => `flag-${flag}`),
  onFeatureFlags: vi.fn(),
  reloadFeatureFlags: vi.fn(),
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
  posthog: mockPostHog,
} as any;

global.document = mockDocument as any;

describe('PostHogAnalyticsProvider', () => {
  let provider: PostHogAnalyticsProvider;
  let originalPostHog: any;

  beforeEach(() => {
    provider = new PostHogAnalyticsProvider();
    vi.clearAllMocks();
    // Store original posthog
    originalPostHog = (global.window as any).posthog;
    (global.window as any).posthog = mockPostHog;
  });

  afterEach(() => {
    vi.clearAllMocks();
    // Restore original posthog
    if (originalPostHog) {
      (global.window as any).posthog = originalPostHog;
    }
  });

  describe('initialization', () => {
    it('should initialize with valid configuration', async () => {
      const config = {
        apiKey: 'test-api-key',
        apiHost: 'https://app.posthog.com',
        autocapture: true,
        capturePageview: true,
        capturePageleave: true,
        crossSubdomainCookie: true,
        persistence: 'localStorage' as const,
        cookieName: 'ph_test',
        cookieExpiration: 365,
        respectDnt: false,
        propertyBlacklist: ['password', 'credit_card'],
        xhr_headers: {
          'X-Custom-Header': 'test-value',
        },
        ipCapture: true,
        optOutCapturingByDefault: false,
        mask_all_text: false,
        mask_all_element_attributes: false,
        sessionRecording: {
          enabled: true,
          maskAllInputs: true,
          maskInputOptions: {
            password: true,
            email: false,
          },
          sampleRate: 0.1,
          minimumDuration: 4000,
        },
        loaded: vi.fn(),
      };

      await provider.initialize(config);

      expect(provider.isInitialized()).toBe(true);
      expect(provider.getId()).toBe('posthog');
      expect(provider.getName()).toBe('PostHog Analytics');
      expect(mockPostHog.init).toHaveBeenCalledWith('test-api-key', expect.objectContaining({
        api_host: 'https://app.posthog.com',
        autocapture: true,
        capture_pageview: true,
        capture_pageleave: true,
        cross_subdomain_cookie: true,
        persistence: 'localStorage',
        cookie_name: 'ph_test',
        cookie_expiration: 365,
        respect_dnt: false,
        property_blacklist: ['password', 'credit_card'],
        xhr_headers: {
          'X-Custom-Header': 'test-value',
        },
        ip: true,
        opt_out_capturing_by_default: false,
        mask_all_text: false,
        mask_all_element_attributes: false,
        session_recording: {
          enabled: true,
          maskAllInputs: true,
          maskInputOptions: {
            password: true,
            email: false,
          },
          sampleRate: 0.1,
          minimumDuration: 4000,
        },
        loaded: expect.any(Function),
      }));
    });

    it('should throw error if apiKey is missing', async () => {
      const config = {};

      await expect(provider.initialize(config)).rejects.toThrow('PostHog API key is required');
    });

    it('should handle script loading failure', async () => {
      const config = { apiKey: 'test-api-key' };
      
      // Remove posthog to trigger script loading
      delete (global.window as any).posthog;
      
      // Mock script loading failure
      let scriptErrorCallback: any = null;
      vi.mocked(mockDocument.createElement).mockImplementation(() => {
        const script = {
          src: '',
          async: false,
          type: '',
          onload: null,
          onerror: null,
        };
        // Capture the error callback
        Object.defineProperty(script, 'onerror', {
          set(value) {
            scriptErrorCallback = value;
          },
          get() {
            return scriptErrorCallback;
          }
        });
        return script as any;
      });

      // Start initialization
      const initPromise = provider.initialize(config);

      // Simulate script error after a brief delay
      await new Promise(resolve => setTimeout(resolve, 10));
      if (scriptErrorCallback) {
        scriptErrorCallback();
      }

      await expect(initPromise).rejects.toThrow('Failed to load PostHog SDK');
    });
  });

  describe('event tracking', () => {
    beforeEach(async () => {
      await provider.initialize({ apiKey: 'test-api-key' });
    });

    it('should track events with properties', async () => {
      const eventName = 'test_event';
      const properties = { category: 'test', value: 123 };

      await provider.track(eventName, properties);

      expect(mockPostHog.capture).toHaveBeenCalledWith(eventName, properties);
    });

    it('should track events without properties', async () => {
      const eventName = 'test_event';

      await provider.track(eventName);

      expect(mockPostHog.capture).toHaveBeenCalledWith(eventName, {});
    });

    it('should track screen views', async () => {
      const screenName = 'Dashboard';
      const properties = { user_type: 'premium' };

      await provider.logScreenView(screenName, properties);

      expect(mockPostHog.capture).toHaveBeenCalledWith('$pageview', {
        $screen_name: screenName,
        ...properties,
      });
    });

    it('should track revenue', async () => {
      const revenue = {
        amount: 29.99,
        currency: 'USD',
        productId: 'premium_plan',
        productName: 'Premium Plan',
        quantity: 1,
        properties: { plan: 'premium' },
      };

      await provider.logRevenue(revenue);

      expect(mockPostHog.capture).toHaveBeenCalledWith('Purchase', {
        $revenue: revenue.amount,
        currency: revenue.currency,
        value: revenue.amount,
        product_id: revenue.productId,
        product_name: revenue.productName,
        quantity: revenue.quantity,
        plan: 'premium',
      });
    });

    it('should track revenue with minimal data', async () => {
      const revenue = { amount: 9.99 };

      await provider.logRevenue(revenue);

      expect(mockPostHog.capture).toHaveBeenCalledWith('Purchase', {
        $revenue: revenue.amount,
        currency: 'USD',
        value: revenue.amount,
      });
    });
  });

  describe('user identification', () => {
    beforeEach(async () => {
      await provider.initialize({ apiKey: 'test-api-key' });
    });

    it('should identify users with traits', async () => {
      const userId = 'user123';
      const traits = { email: 'test@example.com', name: 'Test User' };

      await provider.identify(userId, traits);

      expect(mockPostHog.identify).toHaveBeenCalledWith(userId, traits);
    });

    it('should identify users without traits', async () => {
      const userId = 'user123';

      await provider.identify(userId);

      expect(mockPostHog.identify).toHaveBeenCalledWith(userId, {});
    });

    it('should set user properties', async () => {
      const properties = { plan: 'premium', age: 30 };

      await provider.setUserProperties(properties);

      expect(mockPostHog.people.set).toHaveBeenCalledWith(properties);
    });

    it('should alias users', async () => {
      const alias = 'user_alias';
      const distinctId = 'previous_id';

      provider.alias(alias, distinctId);

      expect(mockPostHog.alias).toHaveBeenCalledWith(alias, distinctId);
    });

    it('should alias users without previous ID', async () => {
      const alias = 'user_alias';

      provider.alias(alias);

      expect(mockPostHog.alias).toHaveBeenCalledWith(alias, undefined);
    });
  });

  describe('super properties', () => {
    beforeEach(async () => {
      await provider.initialize({ apiKey: 'test-api-key' });
    });

    it('should register super properties', async () => {
      const properties = { app_version: '1.0.0', platform: 'web' };

      provider.setSuperProperties(properties);

      expect(mockPostHog.register).toHaveBeenCalledWith(properties);
    });

    it('should register super properties once', async () => {
      const properties = { first_visit: true };

      provider.setSuperPropertiesOnce(properties);

      expect(mockPostHog.register_once).toHaveBeenCalledWith(properties);
    });

    it('should unregister super properties', async () => {
      const propertyName = 'temp_property';

      provider.unregisterSuperProperty(propertyName);

      expect(mockPostHog.unregister).toHaveBeenCalledWith(propertyName);
    });

    it('should get super property', async () => {
      const propertyName = 'app_version';

      const result = provider.getSuperProperty(propertyName);

      expect(mockPostHog.get_property).toHaveBeenCalledWith(propertyName);
      expect(result).toBe('test-app_version');
    });
  });

  describe('feature flags', () => {
    beforeEach(async () => {
      await provider.initialize({ apiKey: 'test-api-key' });
    });

    it('should check if feature is enabled', async () => {
      const flag = 'test-flag';

      const result = provider.isFeatureEnabled(flag);

      expect(mockPostHog.isFeatureEnabled).toHaveBeenCalledWith(flag);
      expect(result).toBe(true);
    });

    it('should get feature flag value', async () => {
      const flag = 'test-flag';

      const result = provider.getFeatureFlag(flag);

      expect(mockPostHog.getFeatureFlag).toHaveBeenCalledWith(flag);
      expect(result).toBe('flag-test-flag');
    });

    it('should listen for feature flag changes', async () => {
      const callback = vi.fn();

      provider.onFeatureFlags(callback);

      expect(mockPostHog.onFeatureFlags).toHaveBeenCalledWith(callback);
    });

    it('should reload feature flags', async () => {
      provider.reloadFeatureFlags();

      expect(mockPostHog.reloadFeatureFlags).toHaveBeenCalled();
    });
  });

  describe('group analytics', () => {
    beforeEach(async () => {
      await provider.initialize({ apiKey: 'test-api-key' });
    });

    it('should associate user with group', async () => {
      const groupType = 'company';
      const groupKey = 'acme_inc';
      const properties = { name: 'Acme Inc', plan: 'enterprise' };

      provider.group(groupType, groupKey, properties);

      expect(mockPostHog.group).toHaveBeenCalledWith(groupType, groupKey, properties);
    });

    it('should associate user with group without properties', async () => {
      const groupType = 'company';
      const groupKey = 'acme_inc';

      provider.group(groupType, groupKey);

      expect(mockPostHog.group).toHaveBeenCalledWith(groupType, groupKey, undefined);
    });
  });

  describe('session recording', () => {
    beforeEach(async () => {
      await provider.initialize({ apiKey: 'test-api-key' });
    });

    it('should start session recording', async () => {
      provider.startSessionRecording();

      expect(mockPostHog.startSessionRecording).toHaveBeenCalled();
    });

    it('should stop session recording', async () => {
      provider.stopSessionRecording();

      expect(mockPostHog.stopSessionRecording).toHaveBeenCalled();
    });
  });

  describe('consent management', () => {
    beforeEach(async () => {
      await provider.initialize({ apiKey: 'test-api-key' });
    });

    it('should handle consent granted', async () => {
      const consent: ConsentSettings = {
        analytics: true,
        marketing: true,
        personalization: true,
        errorTracking: true,
      };

      await provider.updateConsent(consent);

      expect(mockPostHog.opt_in_capturing).toHaveBeenCalled();
    });

    it('should handle consent denied', async () => {
      const consent: ConsentSettings = {
        analytics: false,
        marketing: false,
        personalization: false,
        errorTracking: false,
      };

      await provider.updateConsent(consent);

      expect(mockPostHog.opt_out_capturing).toHaveBeenCalled();
    });
  });

  describe('provider management', () => {
    beforeEach(async () => {
      await provider.initialize({ apiKey: 'test-api-key' });
    });

    it('should reset provider', async () => {
      await provider.reset();

      expect(mockPostHog.reset).toHaveBeenCalled();
    });

    it('should enable debug mode', async () => {
      provider.setDebugMode(true);

      expect(mockPostHog.debug).toHaveBeenCalledWith(true);
    });

    it('should disable debug mode', async () => {
      provider.setDebugMode(false);

      expect(mockPostHog.debug).toHaveBeenCalledWith(false);
    });

    it('should get distinct ID', async () => {
      const distinctId = provider.getDistinctId();

      expect(mockPostHog.get_distinct_id).toHaveBeenCalled();
      expect(distinctId).toBe('test-distinct-id');
    });

    it('should get session ID', async () => {
      const sessionId = provider.getSessionId();

      expect(mockPostHog.get_session_id).toHaveBeenCalled();
      expect(sessionId).toBe('test-session-id');
    });

    it('should set person properties for flags', async () => {
      const properties = { plan: 'premium', role: 'admin' };

      provider.setPersonPropertiesForFlags(properties);

      expect(mockPostHog.setPersonPropertiesForFlags).toHaveBeenCalledWith(properties);
    });
  });

  describe('error handling', () => {
    it('should handle initialization without window.posthog', async () => {
      // Remove posthog from window
      delete (global.window as any).posthog;

      const config = { apiKey: 'test-api-key' };

      // Mock script loading that doesn't set window.posthog
      let scriptLoadCallback: any = null;
      vi.mocked(mockDocument.createElement).mockImplementation(() => {
        const script = {
          src: '',
          async: false,
          type: '',
          onload: null,
          onerror: null,
        };
        // Capture the load callback
        Object.defineProperty(script, 'onload', {
          set(value) {
            scriptLoadCallback = value;
          },
          get() {
            return scriptLoadCallback;
          }
        });
        return script as any;
      });

      // Start initialization
      const initPromise = provider.initialize(config);

      // Simulate script load (but window.posthog is still not available)
      await new Promise(resolve => setTimeout(resolve, 10));
      if (scriptLoadCallback) {
        scriptLoadCallback();
      }

      await expect(initPromise).rejects.toThrow('PostHog SDK loaded but window.posthog is not available');
    });

    it('should handle methods when not initialized', async () => {
      const uninitializedProvider = new PostHogAnalyticsProvider();

      await expect(uninitializedProvider.track('test')).rejects.toThrow('PostHog not initialized');
      await expect(uninitializedProvider.identify('user')).rejects.toThrow('PostHog not initialized');
      await expect(uninitializedProvider.setUserProperties({ plan: 'premium' })).rejects.toThrow('PostHog not initialized');
      await expect(uninitializedProvider.logScreenView('dashboard')).rejects.toThrow('PostHog not initialized');
      await expect(uninitializedProvider.logRevenue({ amount: 10 })).rejects.toThrow('PostHog not initialized');
    });

    it('should handle methods gracefully when not initialized for optional methods', async () => {
      const uninitializedProvider = new PostHogAnalyticsProvider();

      expect(() => uninitializedProvider.setSuperProperties({ test: 'value' })).not.toThrow();
      expect(() => uninitializedProvider.alias('alias')).not.toThrow();
      expect(() => uninitializedProvider.group('company', 'acme')).not.toThrow();
      expect(uninitializedProvider.isFeatureEnabled('flag')).toBe(false);
      expect(uninitializedProvider.getFeatureFlag('flag')).toBe(null);
      expect(uninitializedProvider.getDistinctId()).toBe(null);
      expect(uninitializedProvider.getSessionId()).toBe(null);
    });
  });

  describe('property sanitization', () => {
    beforeEach(async () => {
      await provider.initialize({ apiKey: 'test-api-key' });
    });

    it('should sanitize properties by removing null and undefined values', async () => {
      const properties = {
        validProperty: 'value',
        nullProperty: null,
        undefinedProperty: undefined,
        zeroValue: 0,
        falseValue: false,
        emptyString: '',
      };

      await provider.track('test_event', properties);

      expect(mockPostHog.capture).toHaveBeenCalledWith('test_event', {
        validProperty: 'value',
        zeroValue: 0,
        falseValue: false,
        emptyString: '',
      });
    });
  });
});