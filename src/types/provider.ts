export type ProviderType = 'analytics' | 'error-tracking';

export type ProviderState = 'active' | 'paused' | 'disabled' | 'error';

export interface ProviderConfig {
  enabled?: boolean;
  apiKey?: string;
  endpoint?: string;
  debug?: boolean;
  timeout?: number;
  maxRetries?: number;
  [key: string]: any;
}

export interface ConsentSettings {
  analytics?: boolean;
  errorTracking?: boolean;
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
}

export interface ProviderMetadata {
  id: string;
  name: string;
  type: ProviderType;
  version: string;
  supportedPlatforms: Array<'web' | 'ios' | 'android'>;
  configSchema?: Record<string, any>;
}
