# React Hooks

Custom React hooks for integrating unified tracking in React applications.

## useUnifiedTracking()

Main hook for accessing the unified tracking instance.

### Signature

```typescript
function useUnifiedTracking(): UnifiedTrackingPlugin;
```

### Returns

The UnifiedTracking plugin instance.

### Example

```typescript
import { useUnifiedTracking } from 'unified-tracking/react';

function MyComponent() {
  const tracking = useUnifiedTracking();

  const handleClick = async () => {
    await tracking.track('button_clicked', {
      buttonId: 'submit',
      page: 'checkout'
    });
  };

  return <button onClick={handleClick}>Submit</button>;
}
```

### Error Handling

The hook throws an error if used outside of `UnifiedTrackingProvider`:

```typescript
function MyComponent() {
  try {
    const tracking = useUnifiedTracking();
    // Use tracking
  } catch (error) {
    console.error('UnifiedTrackingProvider not found');
  }
}
```

---

## useTrack()

Hook for tracking events with automatic component tracking.

### Signature

```typescript
function useTrack(): (eventName: string, properties?: Record<string, any>) => Promise<void>;
```

### Returns

A track function that automatically includes component context.

### Example

```typescript
import { useTrack } from 'unified-tracking/react';

function ProductCard({ product }) {
  const track = useTrack();

  const handleView = () => {
    track('product_viewed', {
      productId: product.id,
      productName: product.name,
      price: product.price
    });
  };

  useEffect(() => {
    handleView();
  }, [product.id]);

  return (
    <div onClick={handleView}>
      {/* Product content */}
    </div>
  );
}
```

### Automatic Properties

The hook automatically adds:

- `component`: Name of the React component
- `timestamp`: Event timestamp
- `sessionId`: Current session ID

---

## useIdentify()

Hook for user identification.

### Signature

```typescript
function useIdentify(): (userId: string, traits?: Record<string, any>) => Promise<void>;
```

### Returns

An identify function bound to the tracking instance.

### Example

```typescript
import { useIdentify } from 'unified-tracking/react';

function LoginForm() {
  const identify = useIdentify();

  const handleLogin = async (email: string, userId: string) => {
    // Perform login
    await loginUser(email);

    // Identify user
    await identify(userId, {
      email,
      loginMethod: 'email',
      plan: 'free'
    });
  };

  return (
    // Login form JSX
  );
}
```

---

## useScreenView()

Hook for tracking screen/page views with React Router integration.

### Signature

```typescript
function useScreenView(screenName?: string, properties?: Record<string, any>): void;
```

### Parameters

- `screenName` (optional): Screen name (defaults to current route)
- `properties` (optional): Additional properties

### Example

```typescript
import { useScreenView } from 'unified-tracking/react';
import { useLocation } from 'react-router-dom';

function ProductPage({ productId }) {
  const location = useLocation();

  // Track screen view with automatic route detection
  useScreenView('product-details', {
    productId,
    referrer: location.state?.from
  });

  return <div>Product Details</div>;
}
```

### With React Router

```typescript
function AppRouter() {
  const location = useLocation();

  // Track all route changes
  useScreenView();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<Products />} />
    </Routes>
  );
}
```

---

## useUserProperties()

Hook for setting user properties.

### Signature

```typescript
function useUserProperties(): (properties: Record<string, any>) => Promise<void>;
```

### Returns

A function to set user properties.

### Example

```typescript
import { useUserProperties } from 'unified-tracking/react';

function UserSettings() {
  const setUserProperties = useUserProperties();

  const updatePreferences = async (preferences) => {
    await setUserProperties({
      theme: preferences.theme,
      language: preferences.language,
      notifications: preferences.notifications
    });
  };

  return (
    // Settings form JSX
  );
}
```

---

## useConsent()

Hook for managing user consent.

### Signature

```typescript
function useConsent(): {
  consent: ConsentSettings;
  setConsent: (consent: ConsentSettings) => Promise<void>;
};
```

### Returns

Object with current consent state and setter function.

### Example

```typescript
import { useConsent } from 'unified-tracking/react';

function ConsentBanner() {
  const { consent, setConsent } = useConsent();

  const handleAcceptAll = async () => {
    await setConsent({
      analytics: true,
      errorTracking: true,
      marketing: true,
      personalization: true,
      adTracking: true
    });
  };

  const handleEssentialOnly = async () => {
    await setConsent({
      analytics: true,
      errorTracking: true,
      marketing: false,
      personalization: false,
      adTracking: false
    });
  };

  if (consent.analytics !== undefined) {
    return null; // Consent already given
  }

  return (
    <div className="consent-banner">
      <button onClick={handleEssentialOnly}>Essential Only</button>
      <button onClick={handleAcceptAll}>Accept All</button>
    </div>
  );
}
```

---

## useErrorTracking()

Hook for error boundary integration.

### Signature

```typescript
function useErrorTracking(): (error: Error, errorInfo?: ErrorInfo) => Promise<void>;
```

### Returns

Function to log errors with React error boundary context.

### Example

```typescript
import { useErrorTracking } from 'unified-tracking/react';
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  const logError = useErrorTracking();

  useEffect(() => {
    logError(error, {
      component: 'ErrorBoundary',
      action: 'render-fallback'
    });
  }, [error]);

  return (
    <div>
      <h2>Something went wrong</h2>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <MyApp />
    </ErrorBoundary>
  );
}
```

---

## useRevenue()

Hook for tracking revenue events.

### Signature

```typescript
function useRevenue(): (data: RevenueData) => Promise<void>;
```

### Returns

Function to log revenue events.

### Example

```typescript
import { useRevenue } from 'unified-tracking/react';

function CheckoutComplete({ order }) {
  const logRevenue = useRevenue();

  useEffect(() => {
    logRevenue({
      amount: order.total,
      currency: order.currency,
      productId: order.items[0]?.sku,
      quantity: order.items.length,
      properties: {
        orderId: order.id,
        paymentMethod: order.paymentMethod,
        shippingMethod: order.shippingMethod
      }
    });
  }, [order.id]);

  return <div>Thank you for your order!</div>;
}
```

---

## useDebugMode()

Hook for toggling debug mode.

### Signature

```typescript
function useDebugMode(): {
  debugMode: boolean;
  setDebugMode: (enabled: boolean) => Promise<void>;
};
```

### Returns

Object with debug mode state and setter.

### Example

```typescript
import { useDebugMode } from 'unified-tracking/react';

function DebugToggle() {
  const { debugMode, setDebugMode } = useDebugMode();

  return (
    <label>
      <input
        type="checkbox"
        checked={debugMode}
        onChange={(e) => setDebugMode(e.target.checked)}
      />
      Enable Debug Mode
    </label>
  );
}
```

---

## useActiveProviders()

Hook for monitoring active providers.

### Signature

```typescript
function useActiveProviders(): string[];
```

### Returns

Array of active provider IDs.

### Example

```typescript
import { useActiveProviders } from 'unified-tracking/react';

function ProviderStatus() {
  const providers = useActiveProviders();

  return (
    <div>
      <h3>Active Providers ({providers.length})</h3>
      <ul>
        {providers.map(provider => (
          <li key={provider}>{provider}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Custom Hooks Examples

### usePageTracking

Automatic page tracking with metadata:

```typescript
function usePageTracking(pageName: string, metadata?: Record<string, any>) {
  const track = useTrack();
  const [startTime] = useState(Date.now());

  useEffect(() => {
    // Track page view on mount
    track('page_viewed', {
      pageName,
      ...metadata,
    });

    // Track time spent on unmount
    return () => {
      const timeSpent = Date.now() - startTime;
      track('page_exited', {
        pageName,
        timeSpent,
        ...metadata,
      });
    };
  }, [pageName]);
}
```

### useClickTracking

Click tracking with element details:

```typescript
function useClickTracking(elementId: string) {
  const track = useTrack();

  const trackClick = useCallback((event: MouseEvent) => {
    const element = event.currentTarget as HTMLElement;

    track('element_clicked', {
      elementId,
      elementType: element.tagName.toLowerCase(),
      elementText: element.textContent?.substring(0, 50),
      x: event.clientX,
      y: event.clientY
    });
  }, [elementId, track]);

  return trackClick;
}

// Usage
function Button({ id, children }) {
  const trackClick = useClickTracking(id);

  return (
    <button id={id} onClick={trackClick}>
      {children}
    </button>
  );
}
```

## Best Practices

1. **Provider Placement**: Place `UnifiedTrackingProvider` at the app root
2. **Error Boundaries**: Use `useErrorTracking` with React error boundaries
3. **Effect Cleanup**: Clean up tracking in useEffect return functions
4. **Memoization**: Memoize tracking functions with useCallback when needed
5. **Conditional Tracking**: Check consent before tracking sensitive events

## See Also

- [UnifiedTrackingProvider](./provider.md) - Provider component
- [React Integration Guide](../../react-integration.md) - Complete setup guide
- [Core Interfaces](../interfaces/core-interfaces.md) - Type definitions
