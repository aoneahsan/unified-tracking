# UnifiedTrackingProvider

React context provider for unified tracking integration.

## Overview

`UnifiedTrackingProvider` is a React component that provides tracking functionality to your entire React application through React Context. It must wrap your app at the root level to make tracking hooks available throughout the component tree.

## Component Definition

```typescript
interface UnifiedTrackingProviderProps {
  config?: UnifiedTrackingConfig;
  children: React.ReactNode;
  onInitialized?: () => void;
  onError?: (error: Error) => void;
}

export function UnifiedTrackingProvider(props: UnifiedTrackingProviderProps): JSX.Element;
```

## Props

### config

Optional configuration for the tracking plugin.

- **Type**: `UnifiedTrackingConfig`
- **Default**: `undefined`

### children

React children to render.

- **Type**: `React.ReactNode`
- **Required**: Yes

### onInitialized

Callback fired when tracking is successfully initialized.

- **Type**: `() => void`
- **Default**: `undefined`

### onError

Callback fired when initialization fails.

- **Type**: `(error: Error) => void`
- **Default**: `undefined`

## Basic Usage

```typescript
import { UnifiedTrackingProvider } from 'unified-tracking/react';

function App() {
  return (
    <UnifiedTrackingProvider
      config={{
        analytics: [
          {
            id: 'google-analytics',
            config: {
              measurementId: 'G-XXXXXXXXXX'
            }
          }
        ],
        debug: true
      }}
    >
      <YourApp />
    </UnifiedTrackingProvider>
  );
}
```

## Advanced Usage

### With Error Handling

```typescript
function App() {
  const handleInitialized = () => {
    console.log('Tracking initialized successfully');
  };

  const handleError = (error: Error) => {
    console.error('Tracking initialization failed:', error);
    // Send to error monitoring service
  };

  return (
    <UnifiedTrackingProvider
      config={trackingConfig}
      onInitialized={handleInitialized}
      onError={handleError}
    >
      <YourApp />
    </UnifiedTrackingProvider>
  );
}
```

### With Suspense

```typescript
import { Suspense } from 'react';

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <UnifiedTrackingProvider config={trackingConfig}>
        <YourApp />
      </UnifiedTrackingProvider>
    </Suspense>
  );
}
```

### With Multiple Providers

```typescript
const trackingConfig: UnifiedTrackingConfig = {
  analytics: [
    {
      id: 'google-analytics',
      config: {
        measurementId: 'G-XXXXXXXXXX'
      }
    },
    {
      id: 'mixpanel',
      config: {
        token: 'your-mixpanel-token'
      }
    }
  ],
  errorTracking: [
    {
      id: 'sentry',
      config: {
        dsn: 'https://your-dsn@sentry.io/project'
      }
    }
  ],
  debug: process.env.NODE_ENV === 'development'
};

function App() {
  return (
    <UnifiedTrackingProvider config={trackingConfig}>
      <YourApp />
    </UnifiedTrackingProvider>
  );
}
```

## Context Value

The provider exposes the following context value:

```typescript
interface UnifiedTrackingContextValue {
  tracking: UnifiedTrackingPlugin | null;
  initialized: boolean;
  error: Error | null;
}
```

### Properties

- `tracking`: The UnifiedTracking instance (null before initialization)
- `initialized`: Whether initialization is complete
- `error`: Any initialization error

## Initialization State

The provider handles asynchronous initialization:

```typescript
function TrackingStatus() {
  const { initialized, error } = useContext(UnifiedTrackingContext);

  if (error) {
    return <div>Tracking initialization failed: {error.message}</div>;
  }

  if (!initialized) {
    return <div>Initializing tracking...</div>;
  }

  return <div>Tracking is active</div>;
}
```

## Environment-based Configuration

```typescript
function App() {
  const config = useMemo(() => {
    const baseConfig: UnifiedTrackingConfig = {
      debug: process.env.NODE_ENV === 'development'
    };

    if (process.env.REACT_APP_GA_ID) {
      baseConfig.analytics = [{
        id: 'google-analytics',
        config: {
          measurementId: process.env.REACT_APP_GA_ID
        }
      }];
    }

    if (process.env.REACT_APP_SENTRY_DSN) {
      baseConfig.errorTracking = [{
        id: 'sentry',
        config: {
          dsn: process.env.REACT_APP_SENTRY_DSN,
          environment: process.env.NODE_ENV
        }
      }];
    }

    return baseConfig;
  }, []);

  return (
    <UnifiedTrackingProvider config={config}>
      <YourApp />
    </UnifiedTrackingProvider>
  );
}
```

## With Router Integration

```typescript
import { BrowserRouter } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <UnifiedTrackingProvider config={trackingConfig}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
        </Routes>
      </UnifiedTrackingProvider>
    </BrowserRouter>
  );
}
```

## Testing

### Mock Provider

```typescript
import { UnifiedTrackingProvider } from 'unified-tracking/react';
import { render } from '@testing-library/react';

const mockTracking = {
  track: jest.fn(),
  identify: jest.fn(),
  logError: jest.fn()
  // ... other methods
};

function MockProvider({ children }) {
  return (
    <UnifiedTrackingContext.Provider
      value={{
        tracking: mockTracking,
        initialized: true,
        error: null
      }}
    >
      {children}
    </UnifiedTrackingContext.Provider>
  );
}

test('tracks button click', () => {
  const { getByText } = render(
    <MockProvider>
      <MyComponent />
    </MockProvider>
  );

  fireEvent.click(getByText('Click me'));

  expect(mockTracking.track).toHaveBeenCalledWith('button_clicked', {
    buttonText: 'Click me'
  });
});
```

### Test Initialization

```typescript
test('initializes tracking on mount', async () => {
  const onInitialized = jest.fn();

  render(
    <UnifiedTrackingProvider
      config={testConfig}
      onInitialized={onInitialized}
    >
      <div>Test</div>
    </UnifiedTrackingProvider>
  );

  await waitFor(() => {
    expect(onInitialized).toHaveBeenCalled();
  });
});
```

## Performance Considerations

### Lazy Loading

```typescript
const UnifiedTrackingProvider = lazy(() =>
  import('unified-tracking/react').then(module => ({
    default: module.UnifiedTrackingProvider
  }))
);

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UnifiedTrackingProvider config={trackingConfig}>
        <YourApp />
      </UnifiedTrackingProvider>
    </Suspense>
  );
}
```

### Memoization

```typescript
function App() {
  // Memoize config to prevent re-initialization
  const config = useMemo(() => ({
    analytics: [{
      id: 'google-analytics',
      config: { measurementId: GA_ID }
    }]
  }), [GA_ID]);

  return (
    <UnifiedTrackingProvider config={config}>
      <YourApp />
    </UnifiedTrackingProvider>
  );
}
```

## Error Boundaries

```typescript
class TrackingErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console as fallback
    console.error('Tracking error:', error, errorInfo);
  }

  render() {
    return this.props.children;
  }
}

function App() {
  return (
    <TrackingErrorBoundary>
      <UnifiedTrackingProvider config={trackingConfig}>
        <YourApp />
      </UnifiedTrackingProvider>
    </TrackingErrorBoundary>
  );
}
```

## TypeScript Usage

```typescript
import {
  UnifiedTrackingProvider,
  UnifiedTrackingProviderProps
} from 'unified-tracking/react';

const MyProvider: React.FC<UnifiedTrackingProviderProps> = (props) => {
  return <UnifiedTrackingProvider {...props} />;
};
```

## Common Patterns

### Feature Flags

```typescript
function App() {
  const [features, setFeatures] = useState({});

  const config = useMemo(() => {
    const providers = [];

    if (features.googleAnalytics) {
      providers.push({
        id: 'google-analytics',
        config: { measurementId: 'G-XXXXXXXXXX' }
      });
    }

    if (features.mixpanel) {
      providers.push({
        id: 'mixpanel',
        config: { token: 'your-token' }
      });
    }

    return { analytics: providers };
  }, [features]);

  return (
    <UnifiedTrackingProvider config={config}>
      <YourApp />
    </UnifiedTrackingProvider>
  );
}
```

### Development Tools

```typescript
function DevTools() {
  const { tracking, initialized } = useContext(UnifiedTrackingContext);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="dev-tools">
      <div>Tracking: {initialized ? 'Active' : 'Initializing'}</div>
      <button onClick={() => tracking?.enableDebugMode(true)}>
        Enable Debug
      </button>
    </div>
  );
}
```

## Best Practices

1. **Single Provider**: Only use one UnifiedTrackingProvider per app
2. **Root Level**: Place the provider at the root of your app
3. **Error Handling**: Always provide error callbacks in production
4. **Configuration**: Memoize configuration objects to prevent re-renders
5. **Testing**: Use mock providers for unit tests

## See Also

- [React Hooks](./hooks.md) - Available hooks
- [React Integration Guide](../../react-integration.md) - Complete setup guide
- [Configuration](../interfaces/core-interfaces.md#unifiedtrackingconfig) - Configuration options
