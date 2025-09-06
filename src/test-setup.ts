/**
 * Vitest Test Setup File
 *
 * This file is executed before all test files.
 * It sets up global test utilities and mocks.
 */

import { vi } from 'vitest';

// Mock console methods to reduce noise during tests
global.console = {
  ...console,
  // Keep error and warn for debugging
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
};

// Mock window object for browser APIs
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    protocol: 'http:',
    host: 'localhost:3000',
    hostname: 'localhost',
    port: '3000',
    pathname: '/',
    search: '',
    hash: '',
  },
  writable: true,
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Mock fetch API
global.fetch = vi.fn();

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  unobserve: vi.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
  takeRecords: vi.fn().mockReturnValue([]),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  unobserve: vi.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock common analytics globals
(global as any).gtag = vi.fn();
(global as any).ga = vi.fn();
(global as any).mixpanel = {
  init: vi.fn(),
  track: vi.fn(),
  identify: vi.fn(),
  register: vi.fn(),
  reset: vi.fn(),
};
(global as any).analytics = {
  load: vi.fn(),
  ready: vi.fn(),
  track: vi.fn(),
  identify: vi.fn(),
  page: vi.fn(),
  group: vi.fn(),
  alias: vi.fn(),
};

// Mock Sentry
(global as any).Sentry = {
  init: vi.fn(),
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  setUser: vi.fn(),
  setContext: vi.fn(),
  setTag: vi.fn(),
  addBreadcrumb: vi.fn(),
};

// Mock Capacitor
(global as any).Capacitor = {
  getPlatform: vi.fn(() => 'web'),
  isNative: false,
  convertFileSrc: vi.fn((url: string) => url),
};

// Note: beforeEach is available in test files via vitest globals

// Global test utilities
export const mockAnalyticsProvider = {
  id: 'test-provider',
  name: 'Test Provider',
  initialize: vi.fn().mockResolvedValue(undefined),
  trackEvent: vi.fn().mockResolvedValue(undefined),
  identify: vi.fn().mockResolvedValue(undefined),
  setUserProperties: vi.fn().mockResolvedValue(undefined),
  trackRevenue: vi.fn().mockResolvedValue(undefined),
  trackPageView: vi.fn().mockResolvedValue(undefined),
  reset: vi.fn().mockResolvedValue(undefined),
  isInitialized: vi.fn().mockReturnValue(true),
};

export const mockErrorTrackingProvider = {
  id: 'test-error-provider',
  name: 'Test Error Provider',
  initialize: vi.fn().mockResolvedValue(undefined),
  logError: vi.fn().mockResolvedValue(undefined),
  setUser: vi.fn().mockResolvedValue(undefined),
  setContext: vi.fn().mockResolvedValue(undefined),
  addBreadcrumb: vi.fn().mockResolvedValue(undefined),
  isInitialized: vi.fn().mockReturnValue(true),
};

// Helper to create mock configurations
export const createMockConfig = (overrides = {}) => ({
  analytics: {
    providers: ['test-provider'],
    testProvider: {
      apiKey: 'test-key',
    },
  },
  errorTracking: {
    providers: ['test-error-provider'],
    testErrorProvider: {
      dsn: 'test-dsn',
    },
  },
  ...overrides,
});

// Export common test constants
export const TEST_CONSTANTS = {
  USER_ID: 'test-user-123',
  EVENT_NAME: 'test_event',
  EVENT_PROPERTIES: {
    category: 'test',
    action: 'click',
    value: 1,
  },
  ERROR_MESSAGE: 'Test error message',
  API_KEY: 'test-api-key',
  DSN: 'https://test@sentry.io/123456',
};
