// Example: Using unified-tracking in a React app without providers

import React from 'react';
import { UnifiedTracking } from 'unified-tracking';
import { useTrackEvent, useUnifiedTracking } from 'unified-tracking/react';

// 1. Initialize once in your app (e.g., in index.tsx or App.tsx)
UnifiedTracking.initialize({
  analytics: {
    providers: ['google-analytics', 'mixpanel'],
    googleAnalytics: {
      measurementId: 'G-XXXXXXXXXX',
    },
    mixpanel: {
      token: 'YOUR_MIXPANEL_TOKEN',
    },
  },
  errorTracking: {
    providers: ['sentry'],
    sentry: {
      dsn: 'YOUR_SENTRY_DSN',
    },
  },
});

// 2. Use directly in any component - no providers needed!
function MyComponent() {
  const { trackEvent } = useTrackEvent();

  const handleClick = async () => {
    await trackEvent('button_clicked', {
      button_name: 'Subscribe',
      page: 'homepage',
    });
  };

  return <button onClick={handleClick}>Subscribe</button>;
}

// 3. Or use the full API
function AnotherComponent() {
  const tracking = useUnifiedTracking();

  const handlePurchase = async () => {
    // Track the purchase event
    await tracking.track('purchase_completed', {
      product_id: '123',
      price: 99.99,
    });

    // Log revenue
    await tracking.logRevenue({
      amount: 99.99,
      currency: 'USD',
      productId: '123',
    });

    // Identify the user
    await tracking.identify('user123', {
      email: 'user@example.com',
      plan: 'premium',
    });
  };

  return <button onClick={handlePurchase}>Complete Purchase</button>;
}

// 4. For Capacitor apps, import from /capacitor
// import { UnifiedTracking } from 'unified-tracking/capacitor';

// 5. Works in dynamically injected components without any setup!
const DynamicComponent = () => {
  const { track } = useUnifiedTracking();

  React.useEffect(() => {
    track('dynamic_component_loaded');
  }, [track]);

  return <div>I can be injected anywhere!</div>;
};
