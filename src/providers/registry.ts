import { Logger } from '../utils/logger';
import type { Provider } from '../types/provider';
import type { ProviderMetadata } from '../types/provider';

export type ProviderConstructor = new () => Provider;

export interface ProviderRegistration {
  metadata: ProviderMetadata;
  constructor: ProviderConstructor;
}

/**
 * Registry for all available providers
 */
export class ProviderRegistry {
  private static instance: ProviderRegistry;
  private providers: Map<string, ProviderRegistration> = new Map();
  private logger: Logger;

  private constructor() {
    this.logger = Logger.getInstance();
  }

  static getInstance(): ProviderRegistry {
    if (!ProviderRegistry.instance) {
      ProviderRegistry.instance = new ProviderRegistry();
    }
    return ProviderRegistry.instance;
  }

  /**
   * Register a provider
   */
  register(registration: ProviderRegistration): void;
  register(id: string, type: string, constructor: ProviderConstructor): void;
  register(arg1: ProviderRegistration | string, arg2?: string, arg3?: ProviderConstructor): void {
    if (typeof arg1 === 'object') {
      const { metadata } = arg1;
      
      if (this.providers.has(metadata.id)) {
        this.logger.warn(`Provider ${metadata.id} already registered, overwriting`);
      }

      this.providers.set(metadata.id, arg1);
      this.logger.info(`Registered provider: ${metadata.id} (${metadata.name})`);
    } else {
      // Handle the decorator case where we don't have full metadata yet
      const id = arg1;
      const constructor = arg3!;
      
      if (this.providers.has(id)) {
        this.logger.warn(`Provider ${id} already registered, overwriting`);
      }

      // Create minimal registration for now
      const registration: ProviderRegistration = {
        metadata: {
          id,
          name: id,
          type: arg2 as any,
          version: '1.0.0',
          supportedPlatforms: ['web', 'ios', 'android']
        },
        constructor
      };

      this.providers.set(id, registration);
      this.logger.info(`Registered provider: ${id}`);
    }
  }

  /**
   * Unregister a provider
   */
  unregister(id: string): void {
    if (this.providers.delete(id)) {
      this.logger.info(`Unregistered provider: ${id}`);
    }
  }

  /**
   * Get a provider registration
   */
  get(id: string): ProviderRegistration | undefined {
    return this.providers.get(id);
  }

  /**
   * Get all registered providers
   */
  getAll(): ProviderRegistration[] {
    return Array.from(this.providers.values());
  }

  /**
   * Get providers by type
   */
  getByType(type: 'analytics' | 'error-tracking'): ProviderRegistration[] {
    return this.getAll().filter(reg => reg.metadata.type === type);
  }

  /**
   * Get providers by platform support
   */
  getByPlatform(platform: 'web' | 'ios' | 'android'): ProviderRegistration[] {
    return this.getAll().filter(reg => 
      reg.metadata.supportedPlatforms.includes(platform)
    );
  }

  /**
   * Create a provider instance
   */
  createProvider(id: string): Provider | null {
    const registration = this.providers.get(id);
    
    if (!registration) {
      this.logger.error(`Provider ${id} not found in registry`);
      return null;
    }

    try {
      const provider = new registration.constructor();
      this.logger.info(`Created provider instance: ${id}`);
      return provider;
    } catch (error) {
      this.logger.error(`Failed to create provider ${id}`, error);
      return null;
    }
  }

  /**
   * Check if a provider is registered
   */
  has(id: string): boolean {
    return this.providers.has(id);
  }

  /**
   * Get provider metadata
   */
  getMetadata(id: string): ProviderMetadata | undefined {
    return this.providers.get(id)?.metadata;
  }

  /**
   * Clear all registrations
   */
  clear(): void {
    this.providers.clear();
    this.logger.info('Cleared all provider registrations');
  }
}

/**
 * Decorator to auto-register providers
 */
export function RegisterProvider(metadata: ProviderMetadata) {
  return function <T extends ProviderConstructor>(constructor: T): T {
    const registry = ProviderRegistry.getInstance();
    registry.register({ metadata, constructor: constructor as ProviderConstructor });
    return constructor;
  };
}