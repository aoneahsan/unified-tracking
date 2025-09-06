# Unified Tracking Setup Guide

This guide explains how to set up Unified Tracking in your project with minimal configuration.

## Quick Start

The fastest way to get started is using the automated setup script:

```bash
# Using npx (recommended)
npx unified-tracking-setup

# Or if you have the package installed globally
unified-tracking-setup
```

## What the Setup Script Does

The setup script will:

1. **Detect your project type** (React, Capacitor, Angular, Vue, etc.)
2. **Install the unified-tracking package** using your preferred package manager
3. **Guide you through provider configuration** with interactive prompts
4. **Generate configuration files** with your settings
5. **Create example usage files** tailored to your project type
6. **Set up consent management** (optional, for GDPR compliance)

## Supported Providers

### Analytics Providers

- **Google Analytics 4** - Web analytics and user behavior tracking
- **Mixpanel** - Advanced product analytics and user segmentation
- **Segment** - Customer data platform and event routing
- **PostHog** - Product analytics with feature flags and session replay
- **Amplitude** - Digital product analytics and user journey tracking
- **Firebase Analytics** - Mobile and web app analytics

### Error Tracking Providers

- **Sentry** - Error tracking and performance monitoring
- **Bugsnag** - Error monitoring and stability management
- **Rollbar** - Real-time error tracking and debugging
- **DataDog RUM** - Full-stack observability and monitoring
- **LogRocket** - Session replay and error tracking

## Manual Configuration

If you prefer to configure manually or the automated setup doesn't work for your project:

### 1. Install the Package

```bash
# Using npm
npm install unified-tracking

# Using yarn
yarn add unified-tracking
```

### 2. Create Configuration File

Create a `unified-tracking.config.js` file in your project root:

```javascript
export const unifiedTrackingConfig = {
  analytics: [
    {
      id: 'google-analytics',
      config: {
        measurementId: 'G-XXXXXXXXXX',
        debugMode: false,
        sendPageView: true,
      },
    },
    {
      id: 'mixpanel',
      config: {
        token: 'your-mixpanel-token',
        debugMode: false,
        persistence: 'localStorage',
      },
    },
  ],
  errorTracking: [
    {
      id: 'sentry',
      config: {
        dsn: 'https://your-sentry-dsn@sentry.io/project-id',
        environment: 'production',
        release: '1.0.0',
        tracesSampleRate: 1.0,
      },
    },
  ],
  consent: {
    enabled: true,
    defaultConsent: {
      analytics: true,
      errorTracking: true,
      marketing: false,
      personalization: false,
    },
  },
  debug: false,
  autoInitialize: true,
};
```

### 3. Initialize in Your App

#### React Applications

```javascript
import React from 'react';
import { UnifiedTrackingProvider } from 'unified-tracking/react';
import { unifiedTrackingConfig } from './unified-tracking.config';

function App() {
  return (
    <UnifiedTrackingProvider
      config={unifiedTrackingConfig}
      onError={(error) => console.error('Tracking error:', error)}
      onInitialized={(providers) => console.log('Initialized providers:', providers)}
    >
      <YourApp />
    </UnifiedTrackingProvider>
  );
}
```

#### Capacitor Applications

```javascript
import { UnifiedTracking } from 'unified-tracking';
import { unifiedTrackingConfig } from './unified-tracking.config';

// Initialize in your main app file
async function initializeApp() {
  try {
    const result = await UnifiedTracking.initialize(unifiedTrackingConfig);
    console.log('Tracking initialized:', result);
  } catch (error) {
    console.error('Failed to initialize tracking:', error);
  }
}

// Call during app startup
initializeApp();
```

#### Vanilla JavaScript

```javascript
import { UnifiedTracking } from 'unified-tracking';
import { unifiedTrackingConfig } from './unified-tracking.config';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await UnifiedTracking.initialize(unifiedTrackingConfig);
    console.log('Tracking initialized');
  } catch (error) {
    console.error('Failed to initialize tracking:', error);
  }
});
```

## Provider Configuration Examples

### Google Analytics 4

```javascript
{
  id: 'google-analytics',
  config: {
    measurementId: 'G-XXXXXXXXXX', // Required
    debugMode: false,
    sendPageView: true,
    customParameters: {
      custom_parameter_1: 'value1',
      custom_parameter_2: 'value2',
    },
  },
}
```

### Mixpanel

```javascript
{
  id: 'mixpanel',
  config: {
    token: 'your-mixpanel-token', // Required
    debugMode: false,
    persistence: 'localStorage', // 'localStorage', 'cookie', 'memory'
    apiHost: 'https://api.mixpanel.com',
    trackAutomaticEvents: true,
  },
}
```

### Sentry

```javascript
{
  id: 'sentry',
  config: {
    dsn: 'https://your-sentry-dsn@sentry.io/project-id', // Required
    environment: 'production',
    release: '1.0.0',
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  },
}
```

### PostHog

```javascript
{
  id: 'posthog',
  config: {
    apiKey: 'your-posthog-api-key', // Required
    apiHost: 'https://app.posthog.com',
    autocapture: true,
    sessionRecording: {
      enabled: true,
      maskAllInputs: true,
      sampleRate: 0.1,
    },
    featureFlags: {},
  },
}
```

## Consent Management

Unified Tracking includes built-in consent management for GDPR compliance:

```javascript
// Enable consent management
const config = {
  consent: {
    enabled: true,
    defaultConsent: {
      analytics: false, // Require opt-in for analytics
      errorTracking: true, // Allow error tracking by default
      marketing: false, // Require opt-in for marketing
      personalization: false, // Require opt-in for personalization
    },
  },
  // ... other config
};

// Update consent programmatically
await UnifiedTracking.setConsent({
  analytics: true,
  errorTracking: true,
  marketing: false,
  personalization: false,
});
```

## Environment-Specific Configuration

You can create different configurations for different environments:

```javascript
const baseConfig = {
  analytics: [
    {
      id: 'google-analytics',
      config: {
        measurementId: process.env.GA_MEASUREMENT_ID,
        debugMode: process.env.NODE_ENV === 'development',
      },
    },
  ],
  errorTracking: [
    {
      id: 'sentry',
      config: {
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV,
        debug: process.env.NODE_ENV === 'development',
      },
    },
  ],
  debug: process.env.NODE_ENV === 'development',
};

export const unifiedTrackingConfig = baseConfig;
```

## Troubleshooting

### Common Issues

1. **Providers not initializing**
   - Check that all required configuration fields are provided
   - Verify API keys and tokens are correct
   - Check browser console for error messages

2. **Events not being tracked**
   - Ensure providers are properly initialized
   - Check if consent is required and granted
   - Verify debug mode is enabled to see tracking events

3. **TypeScript errors**
   - Make sure to import types: `import type { UnifiedTrackingConfig } from 'unified-tracking';`
   - Check that configuration matches the expected schema

### Debug Mode

Enable debug mode to see detailed logging:

```javascript
const config = {
  debug: true,
  // ... other config
};
```

This will log all tracking events and provider interactions to the console.

## Next Steps

- [API Reference](./api-reference.md)
- [React Integration Guide](./react-integration.md)
- [Provider Configuration Reference](./provider-configuration.md)
- [Migration Guide](./migration-guide.md)
