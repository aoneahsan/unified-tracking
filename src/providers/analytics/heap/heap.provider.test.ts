import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HeapAnalyticsProvider } from './heap.provider';

// Mock the global window object
const mockHeap = {
  load: vi.fn(),
  track: vi.fn(),
  identify: vi.fn(),
  addUserProperties: vi.fn(),
  removeEventProperty: vi.fn(),
  addEventProperties: vi.fn(),
  clearEventProperties: vi.fn(),
  resetUserId: vi.fn(),
  getUserId: vi.fn().mockReturnValue('test-user-id'),
  getSessionId: vi.fn().mockReturnValue('test-session-id'),
  startRecording: vi.fn(),
  stopRecording: vi.fn(),
  appid: 'test-app-id',
  loaded: true,
  config: {
    disableTextCapture: false,
    secureCookie: true,
    disableCookies: false,
    forceSSL: true,
  },
};

describe('HeapAnalyticsProvider', () => {
  let provider: HeapAnalyticsProvider;

  beforeEach(() => {
    // Mock window.heap
    vi.stubGlobal('window', {
      heap: mockHeap,
    });

    provider = new HeapAnalyticsProvider();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  describe('initialization', () => {
    it('should initialize successfully with valid config', async () => {
      const config = {
        appId: 'test-app-id',
        enableAutocapture: true,
        captureClicks: true,
      };

      await provider.initialize(config);

      expect(provider.isReady()).toBe(true);
      expect(mockHeap.load).toHaveBeenCalledWith('test-app-id', {
        disableTextCapture: false,
        secureCookie: true,
        disableCookies: false,
        forceSSL: true,
      });
    });

    it('should throw error if appId is missing', async () => {
      const config = {};

      await expect(provider.initialize(config)).rejects.toThrow('Heap App ID is required');
    });

    it('should apply default configuration values', async () => {
      const config = {
        appId: 'test-app-id',
      };

      await provider.initialize(config);

      expect(mockHeap.load).toHaveBeenCalledWith('test-app-id', {
        disableTextCapture: false,
        secureCookie: true,
        disableCookies: false,
        forceSSL: true,
      });
    });

    it('should override defaults with user-provided values', async () => {
      const config = {
        appId: 'test-app-id',
        disableTextCapture: true,
        secureCookie: false,
        forceSSL: false,
      };

      await provider.initialize(config);

      expect(mockHeap.load).toHaveBeenCalledWith('test-app-id', {
        disableTextCapture: true,
        secureCookie: false,
        disableCookies: false,
        forceSSL: false,
      });
    });

    it('should set global properties if provided', async () => {
      const config = {
        appId: 'test-app-id',
        globalProperties: {
          app_version: '1.0.0',
          environment: 'production',
        },
      };

      await provider.initialize(config);

      expect(mockHeap.addEventProperties).toHaveBeenCalledWith({
        app_version: '1.0.0',
        environment: 'production',
      });
    });
  });

  describe('event tracking', () => {
    beforeEach(async () => {
      await provider.initialize({ appId: 'test-app-id' });
    });

    it('should track events successfully', async () => {
      const eventName = 'test_event';
      const properties = { key: 'value' };

      await provider.track(eventName, properties);

      expect(mockHeap.track).toHaveBeenCalledWith(eventName, properties);
    });

    it('should track events without properties', async () => {
      const eventName = 'test_event';

      await provider.track(eventName);

      expect(mockHeap.track).toHaveBeenCalledWith(eventName, {});
    });

    it('should sanitize properties before tracking', async () => {
      const eventName = 'test_event';
      const properties = {
        valid_prop: 'value',
        null_prop: null,
        undefined_prop: undefined,
        empty_string: '',
        zero: 0,
        false_value: false,
      };

      await provider.track(eventName, properties);

      expect(mockHeap.track).toHaveBeenCalledWith(eventName, {
        valid_prop: 'value',
        empty_string: '',
        zero: 0,
        false_value: false,
      });
    });
  });

  describe('user identification', () => {
    beforeEach(async () => {
      await provider.initialize({ appId: 'test-app-id' });
    });

    it('should identify user successfully', async () => {
      const userId = 'test-user-123';
      const traits = { name: 'Test User', email: 'test@example.com' };

      await provider.identifyUser(userId, traits);

      expect(mockHeap.identify).toHaveBeenCalledWith(userId);
      expect(mockHeap.addUserProperties).toHaveBeenCalledWith(traits);
    });

    it('should identify user without traits', async () => {
      const userId = 'test-user-123';

      await provider.identifyUser(userId);

      expect(mockHeap.identify).toHaveBeenCalledWith(userId);
      expect(mockHeap.addUserProperties).not.toHaveBeenCalled();
    });
  });

  describe('user properties', () => {
    beforeEach(async () => {
      await provider.initialize({ appId: 'test-app-id' });
    });

    it('should set user properties successfully', async () => {
      const properties = { plan: 'premium', age: 30 };

      await provider.setUserProperties(properties);

      expect(mockHeap.addUserProperties).toHaveBeenCalledWith(properties);
    });
  });

  describe('screen view tracking', () => {
    beforeEach(async () => {
      await provider.initialize({ appId: 'test-app-id' });
    });

    it('should track screen views successfully', async () => {
      const screenName = 'Home';
      const properties = { section: 'main' };

      await provider.logScreenView(screenName, properties);

      expect(mockHeap.track).toHaveBeenCalledWith('Screen View', {
        screen_name: screenName,
        section: 'main',
      });
    });
  });

  describe('revenue tracking', () => {
    beforeEach(async () => {
      await provider.initialize({ appId: 'test-app-id' });
    });

    it('should track revenue successfully', async () => {
      const revenue = {
        amount: 29.99,
        currency: 'USD',
        productId: 'premium-plan',
        productName: 'Premium Plan',
        quantity: 1,
      };

      await provider.logRevenue(revenue);

      expect(mockHeap.track).toHaveBeenCalledWith('Purchase', {
        revenue: 29.99,
        currency: 'USD',
        value: 29.99,
        product_id: 'premium-plan',
        product_name: 'Premium Plan',
        quantity: 1,
      });
    });

    it('should track revenue with default currency', async () => {
      const revenue = {
        amount: 19.99,
      };

      await provider.logRevenue(revenue);

      expect(mockHeap.track).toHaveBeenCalledWith('Purchase', {
        revenue: 19.99,
        currency: 'USD',
        value: 19.99,
      });
    });
  });

  describe('consent management', () => {
    beforeEach(async () => {
      await provider.initialize({ appId: 'test-app-id' });
    });

    it('should handle consent updates', async () => {
      const consent = { analytics: false };

      await provider.updateConsent(consent);

      // Note: Heap doesn't have built-in consent management
      // This test mainly ensures no errors are thrown
      expect(provider.isReady()).toBe(true);
    });
  });

  describe('reset functionality', () => {
    beforeEach(async () => {
      await provider.initialize({ appId: 'test-app-id' });
    });

    it('should reset user data', async () => {
      await provider.reset();

      expect(mockHeap.resetUserId).toHaveBeenCalled();
      expect(mockHeap.clearEventProperties).toHaveBeenCalled();
    });
  });

  describe('heap-specific methods', () => {
    beforeEach(async () => {
      await provider.initialize({ appId: 'test-app-id' });
    });

    it('should add event properties', () => {
      const properties = { app_version: '1.0.0' };

      provider.addEventProperties(properties);

      expect(mockHeap.addEventProperties).toHaveBeenCalledWith(properties);
    });

    it('should remove event property', () => {
      const property = 'test_property';

      provider.removeEventProperty(property);

      expect(mockHeap.removeEventProperty).toHaveBeenCalledWith(property);
    });

    it('should clear event properties', () => {
      provider.clearEventProperties();

      expect(mockHeap.clearEventProperties).toHaveBeenCalled();
    });

    it('should get user ID', () => {
      const userId = provider.getUserId();

      expect(userId).toBe('test-user-id');
      expect(mockHeap.getUserId).toHaveBeenCalled();
    });

    it('should get session ID', () => {
      const sessionId = provider.getSessionId();

      expect(sessionId).toBe('test-session-id');
      expect(mockHeap.getSessionId).toHaveBeenCalled();
    });

    it('should start recording', () => {
      const options = { maskAllInputs: true };

      provider.startRecording(options);

      expect(mockHeap.startRecording).toHaveBeenCalledWith(options);
    });

    it('should stop recording', () => {
      provider.stopRecording();

      expect(mockHeap.stopRecording).toHaveBeenCalled();
    });

    it('should check if loaded', () => {
      const isLoaded = provider.isLoaded();

      expect(isLoaded).toBe(true);
    });

    it('should get app ID', () => {
      const appId = provider.getAppId();

      expect(appId).toBe('test-app-id');
    });
  });

  describe('error handling', () => {
    it('should throw error when tracking without initialization', async () => {
      await expect(provider.track('test_event')).rejects.toThrow('Heap not initialized');
    });

    it('should throw error when identifying without initialization', async () => {
      await expect(provider.identifyUser('user-123')).rejects.toThrow('Heap not initialized');
    });

    it('should throw error when setting user properties without initialization', async () => {
      await expect(provider.setUserProperties({ key: 'value' })).rejects.toThrow('Heap not initialized');
    });

    it('should throw error when logging screen view without initialization', async () => {
      await expect(provider.logScreenView('Home')).rejects.toThrow('Heap not initialized');
    });

    it('should throw error when logging revenue without initialization', async () => {
      await expect(provider.logRevenue({ amount: 10 })).rejects.toThrow('Heap not initialized');
    });
  });
});