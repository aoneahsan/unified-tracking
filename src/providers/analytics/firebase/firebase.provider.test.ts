import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FirebaseAnalyticsProvider } from './firebase.provider';

describe('FirebaseAnalyticsProvider', () => {
  let provider: FirebaseAnalyticsProvider;
  let mockAnalytics: any;

  beforeEach(() => {
    mockAnalytics = {
      logEvent: vi.fn(),
      setUserId: vi.fn(),
      setUserProperties: vi.fn(),
      setAnalyticsCollectionEnabled: vi.fn(),
    };

    // Mock Firebase on window
    (window as any).firebase = {
      analytics: vi.fn(() => mockAnalytics)
    };

    provider = new FirebaseAnalyticsProvider();
  });

  afterEach(() => {
    delete (window as any).firebase;
  });

  describe('initialization', () => {
    it('should initialize successfully when Firebase is available', async () => {
      await provider.initialize({ enabled: true });
      
      expect(provider.isReady()).toBe(true);
      expect((window as any).firebase.analytics).toHaveBeenCalled();
    });

    it('should not initialize when disabled in config', async () => {
      await provider.initialize({ enabled: false });
      
      expect(provider.isReady()).toBe(false);
      expect(provider.isEnabled()).toBe(false);
    });

    it('should throw error when Firebase is not available', async () => {
      delete (window as any).firebase;
      
      await expect(provider.initialize({})).rejects.toThrow(
        'Firebase not found'
      );
    });

    it('should throw error when Firebase Analytics is not available', async () => {
      (window as any).firebase = {};
      
      await expect(provider.initialize({})).rejects.toThrow(
        'Firebase Analytics not found'
      );
    });
  });

  describe('trackEvent', () => {
    beforeEach(async () => {
      await provider.initialize({});
    });

    it('should track event with sanitized name', async () => {
      await provider.trackEvent('Test Event!', { value: 100 });
      
      expect(mockAnalytics.logEvent).toHaveBeenCalledWith(
        'test_event_',
        { value: 100 }
      );
    });

    it('should sanitize long event names', async () => {
      const longEventName = 'a'.repeat(50);
      await provider.trackEvent(longEventName);
      
      expect(mockAnalytics.logEvent).toHaveBeenCalledWith(
        'a'.repeat(40),
        {}
      );
    });

    it('should sanitize property keys and values', async () => {
      await provider.trackEvent('test', {
        'Property Name!': 'value',
        longValue: 'x'.repeat(150)
      });
      
      expect(mockAnalytics.logEvent).toHaveBeenCalledWith('test', {
        property_name_: 'value',
        longvalue: 'x'.repeat(100)
      });
    });

    it('should not track when not ready', async () => {
      provider = new FirebaseAnalyticsProvider();
      
      await provider.trackEvent('test');
      
      expect(mockAnalytics.logEvent).not.toHaveBeenCalled();
    });
  });

  describe('identifyUser', () => {
    beforeEach(async () => {
      await provider.initialize({});
    });

    it('should set user ID', async () => {
      await provider.identifyUser('user123');
      
      expect(mockAnalytics.setUserId).toHaveBeenCalledWith('user123');
    });

    it('should set user ID with traits', async () => {
      await provider.identifyUser('user123', {
        name: 'John Doe',
        email: 'john@example.com'
      });
      
      expect(mockAnalytics.setUserId).toHaveBeenCalledWith('user123');
      expect(mockAnalytics.setUserProperties).toHaveBeenCalledWith({
        name: 'John Doe'
      });
      expect(mockAnalytics.setUserProperties).toHaveBeenCalledWith({
        email: 'john@example.com'
      });
    });
  });

  describe('logScreenView', () => {
    beforeEach(async () => {
      await provider.initialize({});
    });

    it('should log screen view event', async () => {
      await provider.logScreenView('HomeScreen', { 
        screenClass: 'MainActivity' 
      });
      
      expect(mockAnalytics.logEvent).toHaveBeenCalledWith('screen_view', {
        screen_name: 'HomeScreen',
        screen_class: 'MainActivity',
        screenclass: 'MainActivity'
      });
    });

    it('should use screen name as default screen class', async () => {
      await provider.logScreenView('HomeScreen');
      
      expect(mockAnalytics.logEvent).toHaveBeenCalledWith('screen_view', {
        screen_name: 'HomeScreen',
        screen_class: 'HomeScreen'
      });
    });
  });

  describe('logRevenue', () => {
    beforeEach(async () => {
      await provider.initialize({});
    });

    it('should log purchase event for product revenue', async () => {
      await provider.logRevenue({
        amount: 9.99,
        currency: 'USD',
        productId: 'premium_upgrade',
        productName: 'Premium Upgrade',
        quantity: 1
      });
      
      expect(mockAnalytics.logEvent).toHaveBeenCalledWith('purchase', {
        value: 9.99,
        currency: 'USD',
        items: [{
          item_id: 'premium_upgrade',
          item_name: 'Premium Upgrade',
          quantity: 1,
          price: 9.99
        }]
      });
    });

    it('should log earn_virtual_currency for non-product revenue', async () => {
      await provider.logRevenue({
        amount: 50
      });
      
      expect(mockAnalytics.logEvent).toHaveBeenCalledWith(
        'earn_virtual_currency',
        {
          value: 50,
          currency: 'USD'
        }
      );
    });
  });

  describe('consent management', () => {
    beforeEach(async () => {
      await provider.initialize({});
    });

    it('should disable analytics collection when consent is false', async () => {
      await provider.updateConsent({ analytics: false });
      
      expect(mockAnalytics.setAnalyticsCollectionEnabled)
        .toHaveBeenCalledWith(false);
    });

    it('should enable analytics collection when consent is true', async () => {
      await provider.updateConsent({ analytics: true });
      
      expect(mockAnalytics.setAnalyticsCollectionEnabled)
        .toHaveBeenCalledWith(true);
    });
  });

  describe('reset', () => {
    beforeEach(async () => {
      await provider.initialize({});
    });

    it('should clear user ID on reset', async () => {
      await provider.identifyUser('user123');
      await provider.reset();
      
      expect(mockAnalytics.setUserId).toHaveBeenCalledWith(null);
    });
  });
});