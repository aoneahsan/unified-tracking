# React Integration Guide

This guide covers how to integrate Unified Tracking with React applications using our provided hooks, context providers, and higher-order components.

## Installation

```bash
# npm
npm install unified-tracking

# yarn
yarn add unified-tracking
```

## Quick Start

### 1. Wrap Your App with the Provider

```tsx
import { UnifiedTrackingProvider } from 'unified-tracking/react';

const trackingConfig = {
  analytics: [
    {
      id: 'google-analytics',
      config: {
        measurementId: 'G-XXXXXXXXXX',
      },
    },
  ],
  errorTracking: [
    {
      id: 'sentry',
      config: {
        dsn: 'your-sentry-dsn',
      },
    },
  ],
};

function App() {
  return (
    <UnifiedTrackingProvider config={trackingConfig}>
      <YourApp />
    </UnifiedTrackingProvider>
  );
}
```

### 2. Use Tracking Hooks

```tsx
import { useTracking } from 'unified-tracking/react';

function MyComponent() {
  const { track, identify, logError } = useTracking();

  const handleButtonClick = () => {
    track('button_clicked', {
      button_name: 'purchase',
      value: 99.99,
    });
  };

  const handleLogin = (userId: string, userEmail: string) => {
    identify(userId, {
      email: userEmail,
      plan: 'premium',
    });
  };

  const handleError = (error: Error) => {
    logError(error, {
      context: 'payment_processing',
    });
  };

  return <button onClick={handleButtonClick}>Track Event</button>;
}
```

## Available Hooks

### useTracking

The main hook that provides access to all tracking methods:

```tsx
const {
  track,
  identify,
  setUserProperties,
  logError,
  logRevenue,
  logScreenView,
  setConsent,
  reset,
  getActiveProviders,
  enableDebugMode,
} = useTracking();
```

### usePageTracking

Automatically tracks page views on route changes:

```tsx
import { usePageTracking } from 'unified-tracking/react';

function App() {
  // Automatically tracks page views
  usePageTracking();

  return <YourRouter />;
}

// With custom options
usePageTracking({
  excludePaths: ['/admin', '/settings'],
  includeQueryParams: true,
  customProperties: (path) => ({
    section: path.split('/')[1],
  }),
});
```

### useErrorBoundary

Integrates with React Error Boundaries to automatically log errors:

```tsx
import { useErrorBoundary } from 'unified-tracking/react';

function MyErrorBoundary({ children }) {
  const { logError } = useErrorBoundary();

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        logError(error, {
          componentStack: errorInfo.componentStack,
        });
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
```

## Higher-Order Components

### withTracking

Injects tracking props into class components:

```tsx
import { withTracking } from 'unified-tracking/react';

class MyComponent extends React.Component {
  handleClick = () => {
    this.props.tracking.track('button_clicked');
  };

  render() {
    return <button onClick={this.handleClick}>Click me</button>;
  }
}

export default withTracking(MyComponent);
```

### withPageTracking

Automatically tracks when a component mounts:

```tsx
import { withPageTracking } from 'unified-tracking/react';

const HomePage = () => <div>Home Page</div>;

export default withPageTracking(HomePage, {
  pageName: 'home',
  properties: { section: 'main' },
});
```

## Advanced Usage

### Custom Event Types

```tsx
import { useTracking } from 'unified-tracking/react';

function CheckoutFlow() {
  const { track } = useTracking();

  // E-commerce events
  const trackProductView = (product) => {
    track('product_viewed', {
      product_id: product.id,
      product_name: product.name,
      price: product.price,
      category: product.category,
    });
  };

  const trackAddToCart = (product, quantity) => {
    track('add_to_cart', {
      product_id: product.id,
      quantity,
      cart_value: product.price * quantity,
    });
  };

  const trackPurchase = (orderId, items, total) => {
    track('purchase', {
      order_id: orderId,
      value: total,
      currency: 'USD',
      items: items.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
      })),
    });
  };

  return <YourCheckoutUI />;
}
```

### Conditional Tracking

```tsx
import { useTracking } from 'unified-tracking/react';

function ConditionalComponent() {
  const { track, setConsent } = useTracking();
  const [hasConsent, setHasConsent] = useState(false);

  const handleAcceptCookies = () => {
    setHasConsent(true);
    setConsent({
      analytics: true,
      marketing: true,
      functional: true,
    });
  };

  const handleAction = () => {
    if (hasConsent) {
      track('user_action', { type: 'click' });
    }
  };

  return (
    <>
      {!hasConsent && <CookieBanner onAccept={handleAcceptCookies} />}
      <button onClick={handleAction}>Perform Action</button>
    </>
  );
}
```

### Debug Mode

```tsx
import { useTracking } from 'unified-tracking/react';

function DebugComponent() {
  const { enableDebugMode, track } = useTracking();

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      enableDebugMode(true);
    }
  }, [enableDebugMode]);

  return <YourComponent />;
}
```

## TypeScript Support

All hooks and components are fully typed:

```tsx
import { TrackingEvent, UserProperties } from 'unified-tracking/react';

interface CustomEvent extends TrackingEvent {
  name: 'custom_event';
  properties: {
    customField: string;
    value: number;
  };
}

function TypedComponent() {
  const { track } = useTracking<CustomEvent>();

  // TypeScript will enforce the event structure
  track('custom_event', {
    customField: 'value',
    value: 123,
  });
}
```

## Performance Considerations

1. **Lazy Loading**: The provider lazy loads analytics scripts to improve initial page load
2. **Batching**: Events are automatically batched to reduce network requests
3. **Debouncing**: Rapid successive events are debounced to prevent spam
4. **Memory Management**: Event queues are capped to prevent memory leaks

## Testing

Mock the tracking provider in your tests:

```tsx
import { MockTrackingProvider } from 'unified-tracking/react/testing';

describe('MyComponent', () => {
  it('tracks events correctly', () => {
    const mockTrack = jest.fn();

    render(
      <MockTrackingProvider track={mockTrack}>
        <MyComponent />
      </MockTrackingProvider>,
    );

    fireEvent.click(screen.getByText('Click me'));

    expect(mockTrack).toHaveBeenCalledWith('button_clicked', {
      button_name: 'cta',
    });
  });
});
```

## Next Steps

- Check the [API Reference](./api-reference.md) for detailed method documentation
- See [Migration Guide](./migration-guide.md) for migrating from other analytics libraries
- Review [Best Practices](./best-practices.md) for optimal tracking implementation
