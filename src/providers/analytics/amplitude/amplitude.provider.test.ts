import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AmplitudeAnalyticsProvider } from './amplitude.provider';

// Mock Amplitude SDK
const mockAmplitude = {
  init: vi.fn(),
  setUserId: vi.fn(),
  setDeviceId: vi.fn(),
  setUserProperties: vi.fn(),
  track: vi.fn(),
  revenue: vi.fn(),
  setOptOut: vi.fn(),
  reset: vi.fn(),
  setServerUrl: vi.fn(),
  logEvent: vi.fn(),
  identify: vi.fn(),
  Identify: class {
    set = vi.fn().mockReturnThis();
  },
  Revenue: class {
    setPrice = vi.fn().mockReturnThis();
    setQuantity = vi.fn().mockReturnThis();
    setRevenue = vi.fn().mockReturnThis();
    setProductId = vi.fn().mockReturnThis();
    setEventProperties = vi.fn().mockReturnThis();
  },
};

describe('AmplitudeAnalyticsProvider', () => {
  let provider: AmplitudeAnalyticsProvider;
  let scriptElement: HTMLScriptElement;

  beforeEach(() => {
    provider = new AmplitudeAnalyticsProvider();
    vi.clearAllMocks();

    // Reset window.amplitude
    delete (window as any).amplitude;
    delete (window as any).amplitudeAnalytics;

    // Mock document.createElement to capture script element
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'script') {
        scriptElement = originalCreateElement('script') as HTMLScriptElement;
        return scriptElement;
      }
      return originalCreateElement(tagName);
    });

    // Mock document.head.appendChild
    vi.spyOn(document.head, 'appendChild').mockImplementation((node: Node) => {
      if (node === scriptElement) {
        // Simulate script load
        setTimeout(() => {
          (window as any).amplitudeAnalytics = mockAmplitude;
          (window as any).amplitude = mockAmplitude;
          scriptElement.onload?.(new Event('load'));
        }, 0);
      }
      return node;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should throw error if API key is not provided', async () => {
      await expect(provider.initialize({})).rejects.toThrow('Amplitude API key is required');
    });

    it('should load Amplitude SDK and initialize', async () => {
      const config = { apiKey: 'test-api-key' };

      await provider.initialize(config);

      expect(document.createElement).toHaveBeenCalledWith('script');
      expect(scriptElement.src).toContain('amplitude.com');
      expect(mockAmplitude.init).toHaveBeenCalledWith('test-api-key', undefined, {});
    });

    it('should initialize with custom server URL', async () => {
      const config = {
        apiKey: 'test-api-key',
        serverUrl: 'https://custom.amplitude.com',
      };

      await provider.initialize(config);

      expect(mockAmplitude.setServerUrl).toHaveBeenCalledWith('https://custom.amplitude.com');
    });

    it('should initialize with tracking options', async () => {
      const config = {
        apiKey: 'test-api-key',
        trackingOptions: {
          userId: 'test-user',
          sessionTimeout: 1800000,
          disableCookies: true,
        },
        defaultTracking: {
          sessions: false,
          pageViews: true,
        },
      };

      await provider.initialize(config);

      expect(mockAmplitude.init).toHaveBeenCalledWith('test-api-key', 'test-user', {
        userId: 'test-user',
        sessionTimeout: 1800000,
        disableCookies: true,
        defaultTracking: {
          sessions: false,
          pageViews: true,
        },
      });
    });

    it('should use existing Amplitude instance if already loaded', async () => {
      // Set amplitude before initialization
      (window as any).amplitude = mockAmplitude;

      const config = { apiKey: 'test-api-key' };
      await provider.initialize(config);

      expect(document.createElement).not.toHaveBeenCalledWith('script');
      expect(mockAmplitude.init).toHaveBeenCalled();
    });
  });

  describe('trackEvent', () => {
    beforeEach(async () => {
      await provider.initialize({ apiKey: 'test-api-key' });
    });

    it('should track event with properties', async () => {
      await provider.trackEvent('Button Clicked', { button: 'submit', page: 'home' });

      expect(mockAmplitude.track).toHaveBeenCalledWith('Button Clicked', { button: 'submit', page: 'home' });
    });

    it('should track event without properties', async () => {
      await provider.trackEvent('Page Viewed');

      expect(mockAmplitude.track).toHaveBeenCalledWith('Page Viewed', undefined);
    });

    it('should not track if provider is disabled', async () => {
      provider.setEnabled(false);
      await provider.trackEvent('Test Event');

      expect(mockAmplitude.track).not.toHaveBeenCalled();
    });

    it('should sanitize long event names', async () => {
      const longName = 'a'.repeat(2000);
      await provider.trackEvent(longName);

      expect(mockAmplitude.track).toHaveBeenCalledWith('a'.repeat(1024), undefined);
    });

    it('should not track if not initialized', async () => {
      const uninitializedProvider = new AmplitudeAnalyticsProvider();

      await uninitializedProvider.trackEvent('Test');

      expect(mockAmplitude.track).not.toHaveBeenCalled();
    });
  });

  describe('identifyUser', () => {
    beforeEach(async () => {
      await provider.initialize({ apiKey: 'test-api-key' });
    });

    it('should set user ID', async () => {
      await provider.identifyUser('user123');

      expect(mockAmplitude.setUserId).toHaveBeenCalledWith('user123');
    });

    it('should set user ID with traits', async () => {
      const traits = {
        name: 'John Doe',
        email: 'john@example.com',
        plan: 'premium',
      };

      await provider.identifyUser('user123', traits);

      expect(mockAmplitude.setUserId).toHaveBeenCalledWith('user123');
      expect(mockAmplitude.identify).toHaveBeenCalled();
    });

    it('should not identify if provider is disabled', async () => {
      provider.setEnabled(false);
      await provider.identifyUser('user123');

      expect(mockAmplitude.setUserId).not.toHaveBeenCalled();
    });
  });

  describe('setUserProperties', () => {
    beforeEach(async () => {
      await provider.initialize({ apiKey: 'test-api-key' });
    });

    it('should set user properties', async () => {
      const properties = {
        age: 25,
        interests: ['coding', 'music'],
        isPremium: true,
      };

      await provider.setUserProperties(properties);

      expect(mockAmplitude.identify).toHaveBeenCalled();
    });

    it('should not set properties if provider is disabled', async () => {
      provider.setEnabled(false);
      await provider.setUserProperties({ name: 'Test' });

      expect(mockAmplitude.identify).not.toHaveBeenCalled();
    });
  });

  describe('logRevenue', () => {
    beforeEach(async () => {
      await provider.initialize({ apiKey: 'test-api-key' });
    });

    it('should log revenue with basic data', async () => {
      await provider.logRevenue({
        amount: 9.99,
        currency: 'USD',
      });

      expect(mockAmplitude.revenue).toHaveBeenCalled();
    });

    it('should log revenue with full data', async () => {
      await provider.logRevenue({
        amount: 29.99,
        currency: 'USD',
        quantity: 2,
        productId: 'prod_123',
        productName: 'Premium Widget',
      });

      expect(mockAmplitude.revenue).toHaveBeenCalled();
    });

    it('should not log revenue if provider is disabled', async () => {
      provider.setEnabled(false);
      await provider.logRevenue({ amount: 10, currency: 'USD' });

      expect(mockAmplitude.revenue).not.toHaveBeenCalled();
    });
  });

  describe('logScreenView', () => {
    beforeEach(async () => {
      await provider.initialize({ apiKey: 'test-api-key' });
    });

    it('should log screen view', async () => {
      await provider.logScreenView('Home Screen', { source: 'navigation' });

      expect(mockAmplitude.track).toHaveBeenCalledWith('Screen View', {
        screen_name: 'Home Screen',
        source: 'navigation',
      });
    });
  });

  describe('updateConsent', () => {
    beforeEach(async () => {
      await provider.initialize({ apiKey: 'test-api-key' });
    });

    it('should opt out when analytics consent is revoked', async () => {
      await provider.updateConsent({ analytics: false });

      expect(mockAmplitude.setOptOut).toHaveBeenCalledWith(true);
    });

    it('should opt in when analytics consent is granted', async () => {
      await provider.updateConsent({ analytics: true });

      expect(mockAmplitude.setOptOut).toHaveBeenCalledWith(false);
    });
  });

  describe('reset', () => {
    beforeEach(async () => {
      await provider.initialize({ apiKey: 'test-api-key' });
    });

    it('should reset Amplitude', async () => {
      await provider.reset();

      expect(mockAmplitude.reset).toHaveBeenCalled();
    });
  });

  describe('setDebugMode', () => {
    beforeEach(async () => {
      await provider.initialize({ apiKey: 'test-api-key' });
    });

    it('should handle debug mode', () => {
      // Debug mode doesn't throw or cause issues
      expect(() => provider.setDebugMode(true)).not.toThrow();
      expect(() => provider.setDebugMode(false)).not.toThrow();
    });
  });

  describe('isReady and isEnabled', () => {
    it('should not be ready before initialization', () => {
      expect(provider.isReady()).toBe(false);
    });

    it('should be ready after initialization', async () => {
      await provider.initialize({ apiKey: 'test-api-key' });
      expect(provider.isReady()).toBe(true);
    });

    it('should not be ready if disabled during init', async () => {
      await provider.initialize({ apiKey: 'test-api-key', enabled: false });
      expect(provider.isReady()).toBe(false);
      expect(provider.isEnabled()).toBe(false);
    });
  });

  describe('property sanitization', () => {
    beforeEach(async () => {
      await provider.initialize({ apiKey: 'test-api-key' });
    });

    it('should sanitize long property keys and values', async () => {
      const longKey = 'k'.repeat(2000);
      const longValue = 'v'.repeat(2000);

      await provider.trackEvent('Test', {
        [longKey]: longValue,
        normal: 'value',
      });

      const call = mockAmplitude.track.mock.calls[0];
      const properties = call[1];

      expect(Object.keys(properties)[0]).toHaveLength(1024);
      expect(properties['k'.repeat(1024)]).toHaveLength(1024);
      expect(properties.normal).toBe('value');
    });

    it('should handle nested objects and arrays', async () => {
      await provider.trackEvent('Test', {
        nested: {
          array: [1, 2, 'test'],
          object: {
            deep: 'value',
          },
        },
      });

      expect(mockAmplitude.track).toHaveBeenCalledWith('Test', {
        nested: {
          array: [1, 2, 'test'],
          object: {
            deep: 'value',
          },
        },
      });
    });

    it('should filter out null and undefined values', async () => {
      await provider.trackEvent('Test', {
        valid: 'value',
        nullValue: null,
        undefinedValue: undefined,
        zero: 0,
        empty: '',
      });

      const call = mockAmplitude.track.mock.calls[0];
      const properties = call[1];

      expect(properties).toEqual({
        valid: 'value',
        zero: 0,
        empty: '',
      });
    });
  });
});
