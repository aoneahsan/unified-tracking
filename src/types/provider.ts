export type ProviderType = 'analytics' | 'error-tracking';

export type ProviderState = 'active' | 'paused' | 'disabled' | 'error';

export interface ProviderConfig {
  enabled?: boolean;
  apiKey?: string;
  endpoint?: string;
  debug?: boolean;
  timeout?: number;
  maxRetries?: number;
  [key: string]: unknown;
}

/**
 * Unified consent categories. NOTE: only `analytics` and `errorTracking` gate event
 * dispatch in the engine (ProviderManager.hasConsent); the remaining categories are
 * forwarded to provider-native consent APIs (e.g. GA Consent Mode) where supported.
 * Kept structurally identical to the ConsentSettings in definitions.ts.
 */
export interface ConsentSettings {
  analytics?: boolean;
  errorTracking?: boolean;
  marketing?: boolean;
  personalization?: boolean;
  advertising?: boolean;
  functional?: boolean;
  performance?: boolean;
  [key: string]: boolean | undefined;
}

export interface Provider {
  id: string;
  name: string;
  type: ProviderType;
  version: string;

  initialize(config: ProviderConfig): Promise<void>;
  shutdown(): Promise<void>;
  updateConsent(consent: ConsentSettings): Promise<void>;

  pause?(): Promise<void>;
  resume?(): Promise<void>;

  isReady(): boolean;
  getConfig(): ProviderConfig;

  /** Optional: clear user-scoped state (invoked by ProviderManager.reset()). */
  reset?(): void | Promise<void>;
  /** Optional: toggle provider-level debug logging. */
  setDebugMode?(enabled: boolean): void;
  /** Optional: flush any buffered events to the provider's backend (invoked by ProviderManager.flush()). Return value (if any) is ignored. */
  flush?(): void | Promise<unknown>;
}

export interface ProviderMetadata {
  id: string;
  name: string;
  type: ProviderType;
  version: string;
  supportedPlatforms: Array<'web' | 'ios' | 'android'>;
  configSchema?: Record<string, unknown>;
}
