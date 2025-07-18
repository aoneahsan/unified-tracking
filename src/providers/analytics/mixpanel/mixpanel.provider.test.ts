import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MixpanelProvider } from './mixpanel.provider';
import type { ConsentSettings } from '../../../types/provider';

// Mock the global Mixpanel object
const mockMixpanel = {
  init: vi.fn(),
  track: vi.fn(),
  identify: vi.fn(),
  people: {
    set: vi.fn(),
    increment: vi.fn(),
    track_charge: vi.fn(),
  },
  register: vi.fn(),
  register_once: vi.fn(),
  unregister: vi.fn(),
  reset: vi.fn(),
  opt_out_tracking: vi.fn(),
  opt_in_tracking: vi.fn(),
  has_opted_out_tracking: vi.fn(() => false),
  set_config: vi.fn(),
  get_config: vi.fn(),
  get_property: vi.fn(),
  time_event: vi.fn(),
  track_pageview: vi.fn(),
  track_links: vi.fn(),
  track_forms: vi.fn(),
  disable: vi.fn(),
  get_distinct_id: vi.fn(() => 'test-distinct-id'),
  alias: vi.fn(),
  name_tag: vi.fn(),
  set_group: vi.fn(),
  add_group: vi.fn(),
  remove_group: vi.fn(),
  track_with_groups: vi.fn(),
  get_group: vi.fn(),
  toString: vi.fn(() => 'mixpanel'),
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
  mixpanel: mockMixpanel,
} as any;

global.document = mockDocument as any;

describe('MixpanelProvider', () => {
  let provider: MixpanelProvider;

  beforeEach(() => {
    provider = new MixpanelProvider();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with valid configuration', async () => {
      const config = {
        token: 'test-token',
        debug: true,
        loaded: vi.fn(),
        upgrade: false,
        track_pageview: true,
        persistence: 'localStorage',
        cookie_expiration: 365,
        secure_cookie: false,
        cross_site_cookie: false,
        cross_subdomain_cookie: true,
        autotrack: true,
        api_host: 'https://api.mixpanel.com',
        api_transport: 'XHR',
        property_blacklist: [],
        ignore_dnt: false,
        batch_requests: true,
        batch_size: 50,
        batch_flush_interval_ms: 5000,
        batch_request_timeout_ms: 90000,
        hooks: {},
        inapp_protocol: 'https://',
        inapp_link_new_window: false,
        test: false,
        verbose: false,
        img: false,
        save_referrer: true,
        opt_out_tracking_by_default: false,
        opt_out_persistence_by_default: false,
        opt_out_tracking_persistence_type: 'localStorage',
        opt_out_tracking_cookie_prefix: null,
        persistence_name: '',
        cookie_name: '',
        disable_persistence: false,
        disable_cookie: false,
        track_marketing: true,
        track_ad_campaigns: true,
        sourcemap_url: '',
      };

      await provider.initialize(config);

      expect(provider.isInitialized()).toBe(true);
      expect(provider.getId()).toBe('mixpanel');
      expect(provider.getName()).toBe('Mixpanel Analytics');
    });

    it('should throw error if token is missing', async () => {
      const config = {};

      await expect(provider.initialize(config)).rejects.toThrow('Mixpanel token is required');
    });

    it('should handle script loading failure', async () => {
      const config = { token: 'test-token' };
      
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

      await expect(provider.initialize(config)).rejects.toThrow('Failed to load Mixpanel SDK');
    });
  });

  describe('event tracking', () => {
    beforeEach(async () => {
      await provider.initialize({ token: 'test-token' });
    });

    it('should track events with properties', async () => {
      const eventName = 'test_event';
      const properties = { category: 'test', value: 123 };

      await provider.track(eventName, properties);

      expect(mockMixpanel.track).toHaveBeenCalledWith(eventName, properties);
    });

    it('should track events without properties', async () => {
      const eventName = 'test_event';

      await provider.track(eventName);

      expect(mockMixpanel.track).toHaveBeenCalledWith(eventName, {});
    });

    it('should track page views', async () => {
      const pageName = 'test_page';
      const properties = { section: 'analytics' };

      await provider.trackPageView(pageName, properties);

      expect(mockMixpanel.track_pageview).toHaveBeenCalledWith(pageName, properties);
    });

    it('should time events', async () => {
      const eventName = 'test_event';

      await provider.timeEvent(eventName);

      expect(mockMixpanel.time_event).toHaveBeenCalledWith(eventName);
    });
  });

  describe('user identification', () => {
    beforeEach(async () => {
      await provider.initialize({ token: 'test-token' });
    });

    it('should identify users with traits', async () => {
      const userId = 'user123';
      const traits = { email: 'test@example.com', name: 'Test User' };

      await provider.identify(userId, traits);

      expect(mockMixpanel.identify).toHaveBeenCalledWith(userId);
      expect(mockMixpanel.people.set).toHaveBeenCalledWith(traits);
    });

    it('should identify users without traits', async () => {
      const userId = 'user123';

      await provider.identify(userId);

      expect(mockMixpanel.identify).toHaveBeenCalledWith(userId);
      expect(mockMixpanel.people.set).toHaveBeenCalledWith({});
    });

    it('should set user properties', async () => {
      const properties = { plan: 'premium', age: 30 };

      await provider.setUserProperties(properties);

      expect(mockMixpanel.people.set).toHaveBeenCalledWith(properties);
    });

    it('should increment user properties', async () => {
      const properties = { login_count: 1, page_views: 5 };

      await provider.incrementUserProperties(properties);

      expect(mockMixpanel.people.increment).toHaveBeenCalledWith(properties);
    });

    it('should alias users', async () => {
      const alias = 'user_alias';

      await provider.alias(alias);

      expect(mockMixpanel.alias).toHaveBeenCalledWith(alias);
    });
  });

  describe('revenue tracking', () => {
    beforeEach(async () => {
      await provider.initialize({ token: 'test-token' });
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

      expect(mockMixpanel.people.track_charge).toHaveBeenCalledWith(
        revenue.amount,
        expect.objectContaining({
          currency: revenue.currency,
          product_id: revenue.productId,
          transaction_id: revenue.transactionId,
          ...revenue.properties,
        })
      );
    });

    it('should track revenue with minimal data', async () => {
      const revenue = { amount: 9.99 };

      await provider.trackRevenue(revenue);

      expect(mockMixpanel.people.track_charge).toHaveBeenCalledWith(
        revenue.amount,
        expect.objectContaining({
          currency: 'USD',
        })
      );
    });
  });

  describe('consent management', () => {
    beforeEach(async () => {
      await provider.initialize({ token: 'test-token' });
    });

    it('should handle consent granted', async () => {
      const consent: ConsentSettings = {
        analytics: true,
        marketing: true,
        personalization: true,
        errorTracking: true,
      };

      await provider.updateConsent(consent);

      expect(mockMixpanel.opt_in_tracking).toHaveBeenCalled();
    });

    it('should handle consent denied', async () => {
      const consent: ConsentSettings = {
        analytics: false,
        marketing: false,
        personalization: false,
        errorTracking: false,
      };

      await provider.updateConsent(consent);

      expect(mockMixpanel.opt_out_tracking).toHaveBeenCalled();
    });

    it('should check opt-out status', async () => {
      const hasOptedOut = await provider.hasOptedOutTracking();

      expect(mockMixpanel.has_opted_out_tracking).toHaveBeenCalled();
      expect(hasOptedOut).toBe(false);
    });
  });

  describe('provider management', () => {
    beforeEach(async () => {
      await provider.initialize({ token: 'test-token' });
    });

    it('should reset provider', async () => {
      await provider.reset();

      expect(mockMixpanel.reset).toHaveBeenCalled();
    });

    it('should disable provider', async () => {
      await provider.disable();

      expect(mockMixpanel.disable).toHaveBeenCalled();
    });

    it('should get distinct ID', async () => {
      const distinctId = await provider.getDistinctId();

      expect(mockMixpanel.get_distinct_id).toHaveBeenCalled();
      expect(distinctId).toBe('test-distinct-id');
    });

    it('should register super properties', async () => {
      const properties = { app_version: '1.0.0', platform: 'web' };

      await provider.registerSuperProperties(properties);

      expect(mockMixpanel.register).toHaveBeenCalledWith(properties);
    });

    it('should register super properties once', async () => {
      const properties = { first_visit: true };

      await provider.registerSuperPropertiesOnce(properties);

      expect(mockMixpanel.register_once).toHaveBeenCalledWith(properties);
    });

    it('should unregister super properties', async () => {
      const propertyName = 'temp_property';

      await provider.unregisterSuperProperty(propertyName);

      expect(mockMixpanel.unregister).toHaveBeenCalledWith(propertyName);
    });
  });

  describe('group analytics', () => {
    beforeEach(async () => {
      await provider.initialize({ token: 'test-token' });
    });

    it('should set group', async () => {
      const groupKey = 'company';
      const groupId = 'acme_inc';

      await provider.setGroup(groupKey, groupId);

      expect(mockMixpanel.set_group).toHaveBeenCalledWith(groupKey, groupId);
    });

    it('should add group', async () => {
      const groupKey = 'team';
      const groupId = 'engineering';

      await provider.addGroup(groupKey, groupId);

      expect(mockMixpanel.add_group).toHaveBeenCalledWith(groupKey, groupId);
    });

    it('should remove group', async () => {
      const groupKey = 'team';
      const groupId = 'engineering';

      await provider.removeGroup(groupKey, groupId);

      expect(mockMixpanel.remove_group).toHaveBeenCalledWith(groupKey, groupId);
    });

    it('should track with groups', async () => {
      const eventName = 'team_action';
      const properties = { action: 'deploy' };
      const groups = { team: 'engineering', company: 'acme_inc' };

      await provider.trackWithGroups(eventName, properties, groups);

      expect(mockMixpanel.track_with_groups).toHaveBeenCalledWith(eventName, properties, groups);
    });
  });

  describe('error handling', () => {
    it('should handle initialization without window.mixpanel', async () => {
      // Remove mixpanel from window
      delete (global.window as any).mixpanel;

      const config = { token: 'test-token' };

      await expect(provider.initialize(config)).rejects.toThrow('Failed to load Mixpanel SDK');
    });

    it('should handle methods when not initialized', async () => {
      const uninitializedProvider = new MixpanelProvider();

      await expect(uninitializedProvider.track('test')).rejects.toThrow('Mixpanel not initialized');
      await expect(uninitializedProvider.identify('user')).rejects.toThrow('Mixpanel not initialized');
      await expect(uninitializedProvider.trackRevenue({ amount: 10 })).rejects.toThrow('Mixpanel not initialized');
    });
  });
});