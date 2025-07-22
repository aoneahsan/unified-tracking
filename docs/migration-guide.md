# Migration Guide

This guide helps you migrate from popular analytics and error tracking libraries to Unified Tracking.

## Table of Contents

- [From Google Analytics](#from-google-analytics)
- [From Firebase Analytics](#from-firebase-analytics)
- [From Mixpanel](#from-mixpanel)
- [From Amplitude](#from-amplitude)
- [From Segment](#from-segment)
- [From Sentry](#from-sentry)
- [From Multiple Libraries](#from-multiple-libraries)

## From Google Analytics

### Before (gtag.js)

```javascript
// Installation
gtag('config', 'G-XXXXXXXXXX');

// Track event
gtag('event', 'purchase', {
  value: 99.99,
  currency: 'USD',
  transaction_id: '12345',
});

// Set user properties
gtag('set', 'user_properties', {
  favorite_color: 'blue',
});
```

### After (Unified Tracking)

```typescript
import { UnifiedTracking } from 'unified-tracking';

// Installation
await UnifiedTracking.initialize({
  analytics: [
    {
      id: 'google-analytics',
      config: {
        measurementId: 'G-XXXXXXXXXX',
      },
    },
  ],
});

// Track event
await UnifiedTracking.track('purchase', {
  value: 99.99,
  currency: 'USD',
  transaction_id: '12345',
});

// Set user properties
await UnifiedTracking.setUserProperties({
  favorite_color: 'blue',
});
```

## From Firebase Analytics

### Before

```javascript
import { getAnalytics, logEvent, setUserProperties } from 'firebase/analytics';

const analytics = getAnalytics();

// Track event
logEvent(analytics, 'select_content', {
  content_type: 'image',
  item_id: 'P12453',
});

// Set user properties
setUserProperties(analytics, {
  favorite_food: 'pizza',
});
```

### After

```typescript
import { UnifiedTracking } from 'unified-tracking';

await UnifiedTracking.initialize({
  analytics: [
    {
      id: 'firebase-analytics',
      config: {
        apiKey: 'your-api-key',
        projectId: 'your-project-id',
        appId: 'your-app-id',
      },
    },
  ],
});

// Track event
await UnifiedTracking.track('select_content', {
  content_type: 'image',
  item_id: 'P12453',
});

// Set user properties
await UnifiedTracking.setUserProperties({
  favorite_food: 'pizza',
});
```

## From Mixpanel

### Before

```javascript
import mixpanel from 'mixpanel-browser';

mixpanel.init('YOUR_TOKEN');

// Track event
mixpanel.track('Video Played', {
  video_title: 'Tutorial',
  video_length: 120,
});

// Identify user
mixpanel.identify('USER_ID');
mixpanel.people.set({
  $email: 'user@example.com',
  plan: 'Premium',
});

// Track revenue
mixpanel.track('Purchase', {
  amount: 99.99,
});
mixpanel.people.track_charge(99.99);
```

### After

```typescript
import { UnifiedTracking } from 'unified-tracking';

await UnifiedTracking.initialize({
  analytics: [
    {
      id: 'mixpanel',
      config: {
        token: 'YOUR_TOKEN',
      },
    },
  ],
});

// Track event
await UnifiedTracking.track('Video Played', {
  video_title: 'Tutorial',
  video_length: 120,
});

// Identify user
await UnifiedTracking.identify('USER_ID', {
  email: 'user@example.com',
  plan: 'Premium',
});

// Track revenue
await UnifiedTracking.logRevenue({
  amount: 99.99,
  currency: 'USD',
});
```

## From Amplitude

### Before

```javascript
import * as amplitude from '@amplitude/analytics-browser';

amplitude.init('YOUR_API_KEY');

// Track event
amplitude.track('Button Clicked', {
  button_name: 'signup',
  page: 'homepage',
});

// Identify user
amplitude.setUserId('USER_ID');
amplitude.identify(new amplitude.Identify().set('email', 'user@example.com').set('plan', 'Pro'));

// Track revenue
amplitude.revenue(new amplitude.Revenue().setProductId('product_123').setPrice(49.99).setQuantity(1));
```

### After

```typescript
import { UnifiedTracking } from 'unified-tracking';

await UnifiedTracking.initialize({
  analytics: [
    {
      id: 'amplitude',
      config: {
        apiKey: 'YOUR_API_KEY',
      },
    },
  ],
});

// Track event
await UnifiedTracking.track('Button Clicked', {
  button_name: 'signup',
  page: 'homepage',
});

// Identify user
await UnifiedTracking.identify('USER_ID', {
  email: 'user@example.com',
  plan: 'Pro',
});

// Track revenue
await UnifiedTracking.logRevenue({
  productId: 'product_123',
  price: 49.99,
  quantity: 1,
});
```

## From Segment

### Before

```javascript
// Track event
analytics.track('Article Completed', {
  title: 'How to Track Events',
  author: 'John Doe',
});

// Identify user
analytics.identify('USER_ID', {
  email: 'user@example.com',
  name: 'John Doe',
});

// Track page
analytics.page('Pricing', {
  plan: 'Enterprise',
});
```

### After

```typescript
import { UnifiedTracking } from 'unified-tracking';

await UnifiedTracking.initialize({
  analytics: [
    {
      id: 'segment',
      config: {
        writeKey: 'YOUR_WRITE_KEY',
      },
    },
  ],
});

// Track event
await UnifiedTracking.track('Article Completed', {
  title: 'How to Track Events',
  author: 'John Doe',
});

// Identify user
await UnifiedTracking.identify('USER_ID', {
  email: 'user@example.com',
  name: 'John Doe',
});

// Track page
await UnifiedTracking.logScreenView({
  screenName: 'Pricing',
  properties: {
    plan: 'Enterprise',
  },
});
```

## From Sentry

### Before

```javascript
import * as Sentry from '@sentry/browser';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
});

// Capture exception
try {
  someFunction();
} catch (error) {
  Sentry.captureException(error);
}

// Set user context
Sentry.setUser({
  id: 'USER_ID',
  email: 'user@example.com',
});

// Add breadcrumb
Sentry.addBreadcrumb({
  message: 'User clicked button',
  level: 'info',
});
```

### After

```typescript
import { UnifiedTracking } from 'unified-tracking';

await UnifiedTracking.initialize({
  errorTracking: [
    {
      id: 'sentry',
      config: {
        dsn: 'YOUR_SENTRY_DSN',
      },
    },
  ],
});

// Capture exception
try {
  someFunction();
} catch (error) {
  await UnifiedTracking.logError(error);
}

// Set user context
await UnifiedTracking.identify('USER_ID', {
  email: 'user@example.com',
});

// Add context (breadcrumbs are automatic)
await UnifiedTracking.track('button_clicked', {
  button: 'submit',
});
```

## From Multiple Libraries

If you're currently using multiple analytics and error tracking libraries, Unified Tracking makes it easy to consolidate:

### Before

```javascript
// Multiple imports and initializations
import { getAnalytics, logEvent } from 'firebase/analytics';
import mixpanel from 'mixpanel-browser';
import * as Sentry from '@sentry/browser';

const analytics = getAnalytics();
mixpanel.init('MIXPANEL_TOKEN');
Sentry.init({ dsn: 'SENTRY_DSN' });

// Track to multiple providers
function trackEvent(name, properties) {
  logEvent(analytics, name, properties);
  mixpanel.track(name, properties);
  Sentry.addBreadcrumb({
    message: `Event: ${name}`,
    data: properties,
  });
}

// Multiple error handling
function logError(error) {
  Sentry.captureException(error);
  console.error(error);
}
```

### After

```typescript
import { UnifiedTracking } from 'unified-tracking';

// Single initialization for all providers
await UnifiedTracking.initialize({
  analytics: [
    {
      id: 'firebase-analytics',
      config: {
        /* Firebase config */
      },
    },
    {
      id: 'mixpanel',
      config: { token: 'MIXPANEL_TOKEN' },
    },
  ],
  errorTracking: [
    {
      id: 'sentry',
      config: { dsn: 'SENTRY_DSN' },
    },
  ],
});

// Single method tracks to all providers
await UnifiedTracking.track('event_name', properties);

// Single error logging method
await UnifiedTracking.logError(error);
```

## Migration Checklist

1. **Install Unified Tracking**

   ```bash
   npm install unified-tracking
   ```

2. **Remove old analytics libraries**

   ```bash
   npm uninstall gtag mixpanel-browser @sentry/browser
   ```

3. **Update initialization code**
   - Replace multiple initialization calls with single `UnifiedTracking.initialize()`
   - Move provider credentials to configuration object

4. **Update tracking calls**
   - Replace provider-specific methods with Unified Tracking methods
   - Update event names and properties to match your schema

5. **Update error handling**
   - Replace Sentry/Bugsnag calls with `UnifiedTracking.logError()`
   - Update error context and metadata

6. **Test thoroughly**
   - Verify events are being sent to all providers
   - Check that user properties are set correctly
   - Ensure error tracking is working

## Common Gotchas

1. **Event Name Formatting**
   - Some providers have specific event name requirements
   - Unified Tracking handles normalization automatically

2. **User ID vs Anonymous ID**
   - Unified Tracking manages both automatically
   - Call `identify()` when you have a user ID

3. **Revenue Tracking**
   - Use `logRevenue()` for consistent revenue tracking across providers
   - Currency is required for some providers

4. **Custom Properties**
   - Property names are normalized across providers
   - Reserved properties are handled automatically

## Need Help?

- Check our [API Reference](./api-reference.md) for detailed method documentation
- See [Setup Guide](./setup-guide.md) for configuration options
- Join our [Discord Community](https://discord.gg/unified-tracking) for support
