# ConfigManager Class

Manages configuration for providers and the plugin.

## Overview

`ConfigManager` is responsible for validating, storing, and retrieving configuration for the unified tracking plugin. It provides a centralized way to manage provider configurations and global settings.

## Class Definition

```typescript
export class ConfigManager {
  private config: UnifiedTrackingConfig;
  private providerConfigs: Map<string, any>;

  constructor(initialConfig?: UnifiedTrackingConfig);

  getConfig(): UnifiedTrackingConfig;
  setConfig(config: UnifiedTrackingConfig): void;
  getProviderConfig(providerId: string): any;
  setProviderConfig(providerId: string, config: any): void;
  validateConfig(config: UnifiedTrackingConfig): void;
  mergeConfigs(base: any, override: any): any;
  isDebugMode(): boolean;
  getPrivacySettings(): PrivacySettings;
  getBatchingSettings(): BatchingSettings;
}
```

## Constructor

```typescript
constructor(initialConfig?: UnifiedTrackingConfig)
```

### Parameters

- `initialConfig` (optional): Initial configuration object

### Example

```typescript
const configManager = new ConfigManager({
  analytics: [
    {
      id: 'google-analytics',
      config: { measurementId: 'G-XXXXXXXXXX' },
    },
  ],
  debug: true,
});
```

## Methods

### getConfig()

Get the current configuration.

```typescript
getConfig(): UnifiedTrackingConfig
```

#### Returns

The complete plugin configuration.

#### Example

```typescript
const config = configManager.getConfig();
console.log(config.debug); // true
```

### setConfig()

Update the configuration.

```typescript
setConfig(config: UnifiedTrackingConfig): void
```

#### Parameters

- `config`: New configuration object

#### Example

```typescript
configManager.setConfig({
  ...configManager.getConfig(),
  debug: false,
});
```

### getProviderConfig()

Get configuration for a specific provider.

```typescript
getProviderConfig(providerId: string): any
```

#### Parameters

- `providerId`: Provider identifier

#### Returns

Provider-specific configuration or undefined.

#### Example

```typescript
const gaConfig = configManager.getProviderConfig('google-analytics');
console.log(gaConfig.measurementId); // 'G-XXXXXXXXXX'
```

### setProviderConfig()

Update configuration for a specific provider.

```typescript
setProviderConfig(providerId: string, config: any): void
```

#### Parameters

- `providerId`: Provider identifier
- `config`: Provider configuration

#### Example

```typescript
configManager.setProviderConfig('mixpanel', {
  token: 'new-token',
  debug: true,
});
```

### validateConfig()

Validate a configuration object.

```typescript
validateConfig(config: UnifiedTrackingConfig): void
```

#### Parameters

- `config`: Configuration to validate

#### Throws

- Error if configuration is invalid

#### Example

```typescript
try {
  configManager.validateConfig(newConfig);
  console.log('Configuration is valid');
} catch (error) {
  console.error('Invalid configuration:', error.message);
}
```

### mergeConfigs()

Deep merge two configuration objects.

```typescript
mergeConfigs(base: any, override: any): any
```

#### Parameters

- `base`: Base configuration
- `override`: Configuration to merge

#### Returns

Merged configuration object.

#### Example

```typescript
const merged = configManager.mergeConfigs(
  { analytics: true, tracking: { enabled: true } },
  { tracking: { verbose: true } },
);
// Result: { analytics: true, tracking: { enabled: true, verbose: true } }
```

### isDebugMode()

Check if debug mode is enabled.

```typescript
isDebugMode(): boolean
```

#### Returns

True if debug mode is enabled.

#### Example

```typescript
if (configManager.isDebugMode()) {
  console.log('Debug mode is active');
}
```

### getPrivacySettings()

Get privacy settings with defaults.

```typescript
getPrivacySettings(): PrivacySettings
```

#### Returns

Privacy settings object with defaults applied.

#### Example

```typescript
const privacy = configManager.getPrivacySettings();
console.log(privacy.anonymizeIp); // true (default)
```

### getBatchingSettings()

Get batching settings with defaults.

```typescript
getBatchingSettings(): BatchingSettings
```

#### Returns

Batching settings object with defaults applied.

#### Example

```typescript
const batching = configManager.getBatchingSettings();
console.log(batching.maxSize); // 50 (default)
```

## Usage Examples

### Basic Usage

```typescript
import { ConfigManager } from 'unified-tracking';

// Create config manager
const configManager = new ConfigManager({
  analytics: [
    {
      id: 'google-analytics',
      config: { measurementId: 'G-XXXXXXXXXX' },
    },
    {
      id: 'mixpanel',
      config: { token: 'your-token' },
    },
  ],
  debug: true,
  privacy: {
    anonymizeIp: true,
    requireConsent: true,
  },
});

// Access configuration
const isDebug = configManager.isDebugMode();
const gaConfig = configManager.getProviderConfig('google-analytics');
const privacy = configManager.getPrivacySettings();
```

### Dynamic Configuration

```typescript
class DynamicConfigManager extends ConfigManager {
  private configUrl: string;

  constructor(configUrl: string) {
    super();
    this.configUrl = configUrl;
  }

  async loadRemoteConfig(): Promise<void> {
    try {
      const response = await fetch(this.configUrl);
      const remoteConfig = await response.json();

      // Validate remote config
      this.validateConfig(remoteConfig);

      // Merge with existing config
      const currentConfig = this.getConfig();
      const merged = this.mergeConfigs(currentConfig, remoteConfig);

      this.setConfig(merged);
    } catch (error) {
      console.error('Failed to load remote config:', error);
    }
  }
}
```

### Configuration Validation

```typescript
class StrictConfigManager extends ConfigManager {
  validateConfig(config: UnifiedTrackingConfig): void {
    super.validateConfig(config);

    // Additional validation
    if (config.analytics) {
      config.analytics.forEach((provider) => {
        this.validateProviderConfig(provider);
      });
    }

    if (config.errorTracking) {
      config.errorTracking.forEach((provider) => {
        this.validateProviderConfig(provider);
      });
    }
  }

  private validateProviderConfig(provider: any): void {
    if (!provider.id) {
      throw new Error('Provider ID is required');
    }

    if (!provider.config) {
      throw new Error(`Configuration required for provider ${provider.id}`);
    }

    // Provider-specific validation
    switch (provider.id) {
      case 'google-analytics':
        if (!provider.config.measurementId) {
          throw new Error('Google Analytics requires measurementId');
        }
        break;
      case 'mixpanel':
        if (!provider.config.token) {
          throw new Error('Mixpanel requires token');
        }
        break;
      // Add more provider validations
    }
  }
}
```

### Environment-based Configuration

```typescript
class EnvironmentConfigManager extends ConfigManager {
  constructor() {
    const config = this.getEnvironmentConfig();
    super(config);
  }

  private getEnvironmentConfig(): UnifiedTrackingConfig {
    const env = process.env.NODE_ENV || 'development';

    const configs = {
      development: {
        debug: true,
        analytics: [
          {
            id: 'google-analytics',
            config: { measurementId: 'G-DEV' },
          },
        ],
      },
      staging: {
        debug: false,
        analytics: [
          {
            id: 'google-analytics',
            config: { measurementId: 'G-STAGING' },
          },
        ],
      },
      production: {
        debug: false,
        analytics: [
          {
            id: 'google-analytics',
            config: { measurementId: 'G-PROD' },
          },
        ],
        errorTracking: [
          {
            id: 'sentry',
            config: { dsn: 'https://prod@sentry.io/project' },
          },
        ],
      },
    };

    return configs[env] || configs.development;
  }
}
```

## Default Values

The ConfigManager applies these default values:

```typescript
// Privacy Settings Defaults
{
  anonymizeIp: true,
  excludedProperties: [],
  dataRetention: 365,
  requireConsent: false
}

// Batching Settings Defaults
{
  enabled: true,
  maxSize: 50,
  timeout: 30000
}

// Debug Mode Default
{
  debug: false
}
```

## Best Practices

1. **Validation**: Always validate configuration before applying
2. **Defaults**: Provide sensible defaults for optional settings
3. **Immutability**: Consider making configuration immutable after initialization
4. **Type Safety**: Use TypeScript interfaces for configuration objects
5. **Environment**: Support environment-specific configurations

## See Also

- [UnifiedTrackingConfig Interface](../interfaces/core-interfaces.md#unifiedtrackingconfig) - Configuration structure
- [Configuration Guide](../../setup-guide.md) - Setup instructions
- [Privacy Settings](../interfaces/configuration-interfaces.md#privacysettings) - Privacy configuration
