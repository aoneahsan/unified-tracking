import React, { ComponentType, useEffect, useRef, useState } from 'react';
import { useTrackEvent, useScreenView, useErrorTracking } from './hooks';
import type { ErrorContext } from '../definitions';

// Generic props interface for tracking HOCs
export interface TrackingHOCProps {
  trackingDisabled?: boolean;
  trackingProperties?: Record<string, any>;
  onTrackingError?: (error: Error) => void;
}

// HOC for automatic screen view tracking
export interface WithScreenTrackingOptions {
  screenName?: string;
  getScreenName?: (props: any) => string;
  getScreenProperties?: (props: any) => Record<string, any>;
  trackOnMount?: boolean;
  trackOnUnmount?: boolean;
  trackOnUpdate?: boolean;
}

export function withScreenTracking<P extends object>(
  Component: ComponentType<P>,
  options: WithScreenTrackingOptions = {}
) {
  const WrappedComponent: React.FC<P & TrackingHOCProps> = (props) => {
    const { trackingDisabled, trackingProperties, onTrackingError, ...componentProps } = props;
    
    const screenName = options.getScreenName?.(props) || 
                      options.screenName || 
                      Component.displayName || 
                      Component.name || 
                      'UnknownScreen';
    
    const screenProperties = {
      ...options.getScreenProperties?.(props),
      ...trackingProperties,
    };

    const { trackScreen, isTracking, lastError } = useScreenView(
      screenName,
      screenProperties,
      {
        trackOnMount: options.trackOnMount,
        trackOnUnmount: options.trackOnUnmount,
        trackOnUpdate: options.trackOnUpdate,
        onError: onTrackingError,
      }
    );

    // Handle tracking errors
    useEffect(() => {
      if (lastError && onTrackingError) {
        onTrackingError(lastError);
      }
    }, [lastError, onTrackingError]);

    return (
      <Component 
        {...(componentProps as P)} 
        trackScreen={trackingDisabled ? undefined : trackScreen}
        isTracking={isTracking}
      />
    );
  };

  WrappedComponent.displayName = `withScreenTracking(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// HOC for automatic event tracking on component interactions
export interface WithEventTrackingOptions {
  events?: {
    [key: string]: {
      eventName: string;
      getProperties?: (props: any, eventData?: any) => Record<string, any>;
    };
  };
  trackClicks?: boolean;
  trackHovers?: boolean;
  trackFocus?: boolean;
  getEventProperties?: (props: any) => Record<string, any>;
}

export function withEventTracking<P extends object>(
  Component: ComponentType<P>,
  options: WithEventTrackingOptions = {}
) {
  const WrappedComponent: React.FC<P & TrackingHOCProps> = (props) => {
    const { trackingDisabled, trackingProperties, onTrackingError, ...componentProps } = props;
    const { trackEvent } = useTrackEvent();
    const componentRef = useRef<HTMLElement>(null);

    const handleEvent = async (eventName: string, eventData?: any) => {
      if (trackingDisabled) return;

      const baseProperties = {
        component: Component.displayName || Component.name,
        ...options.getEventProperties?.(props),
        ...trackingProperties,
      };

      const eventConfig = options.events?.[eventName];
      const eventProperties = eventConfig?.getProperties?.(props, eventData) || {};

      await trackEvent(
        eventConfig?.eventName || eventName,
        { ...baseProperties, ...eventProperties },
        { onError: onTrackingError }
      );
    };

    // Set up automatic event listeners
    useEffect(() => {
      const element = componentRef.current;
      if (!element || trackingDisabled) return;

      const handlers: { [key: string]: (event: Event) => void } = {};

      if (options.trackClicks) {
        handlers.click = (event) => {
          handleEvent('click', {
            target: (event.target as HTMLElement)?.tagName,
            text: (event.target as HTMLElement)?.textContent?.slice(0, 100),
          });
        };
      }

      if (options.trackHovers) {
        handlers.mouseenter = () => handleEvent('hover');
      }

      if (options.trackFocus) {
        handlers.focus = () => handleEvent('focus');
      }

      // Add event listeners
      Object.entries(handlers).forEach(([event, handler]) => {
        element.addEventListener(event, handler);
      });

      // Cleanup
      return () => {
        Object.entries(handlers).forEach(([event, handler]) => {
          element.removeEventListener(event, handler);
        });
      };
    }, [trackingDisabled, handleEvent, options]);

    const enhancedProps = {
      ...componentProps,
      ref: componentRef,
      trackEvent: trackingDisabled ? undefined : handleEvent,
    };

    return <Component {...(enhancedProps as P)} />;
  };

  WrappedComponent.displayName = `withEventTracking(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// HOC for automatic error boundary with error tracking
export interface WithErrorTrackingOptions {
  fallbackComponent?: ComponentType<{ error: Error; resetError: () => void }>;
  getErrorContext?: (error: Error, errorInfo: any, props: any) => ErrorContext;
  onError?: (error: Error, errorInfo: any, props: any) => void;
}

export function withErrorTracking<P extends object>(
  Component: ComponentType<P>,
  options: WithErrorTrackingOptions = {}
) {
  const ErrorBoundary: React.FC<P & TrackingHOCProps> = (props) => {
    const { trackingDisabled, onTrackingError, ...componentProps } = props;
    const { trackError } = useErrorTracking();
    const [error, setError] = useState<Error | null>(null);
    const [hasError, setHasError] = useState(false);

    const resetError = () => {
      setError(null);
      setHasError(false);
    };

    // React Error Boundary implementation using hooks (requires error boundary)
    const handleError = async (error: Error, errorInfo: any) => {
      setError(error);
      setHasError(true);

      if (!trackingDisabled) {
        const context = options.getErrorContext?.(error, errorInfo, props) || {
          severity: 'error',
          tags: { 
            component: Component.displayName || Component.name,
            source: 'react-error-boundary',
          },
          extra: {
            errorInfo,
            componentStack: errorInfo.componentStack,
          },
        };

        await trackError(error, context, {
          onError: onTrackingError,
        });
      }

      options.onError?.(error, errorInfo, props);
    };

    // Custom error boundary logic
    useEffect(() => {
      const handleUnhandledError = (event: ErrorEvent) => {
        handleError(event.error || new Error(event.message), {
          componentStack: 'Global Error Handler',
        });
      };

      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        handleError(
          event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
          { componentStack: 'Global Promise Rejection Handler' }
        );
      };

      window.addEventListener('error', handleUnhandledError);
      window.addEventListener('unhandledrejection', handleUnhandledRejection);

      return () => {
        window.removeEventListener('error', handleUnhandledError);
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      };
    }, [handleError]);

    if (hasError && error) {
      const FallbackComponent = options.fallbackComponent || DefaultErrorFallback;
      return <FallbackComponent error={error} resetError={resetError} />;
    }

    return <Component {...(componentProps as P)} />;
  };

  ErrorBoundary.displayName = `withErrorTracking(${Component.displayName || Component.name})`;
  
  return ErrorBoundary;
}

// Default error fallback component
const DefaultErrorFallback: React.FC<{ error: Error; resetError: () => void }> = ({
  error,
  resetError,
}) => (
  <div role="alert" style={{ padding: '20px', border: '1px solid #ff6b6b', borderRadius: '4px' }}>
    <h2>Something went wrong:</h2>
    <details style={{ whiteSpace: 'pre-wrap', marginBottom: '10px' }}>
      {error.message}
      <br />
      {error.stack}
    </details>
    <button onClick={resetError}>Try again</button>
  </div>
);

// HOC for automatic performance tracking
export interface WithPerformanceTrackingOptions {
  trackRenderTime?: boolean;
  trackMountTime?: boolean;
  trackUpdateTime?: boolean;
  getPerformanceProperties?: (props: any) => Record<string, any>;
}

export function withPerformanceTracking<P extends object>(
  Component: ComponentType<P>,
  options: WithPerformanceTrackingOptions = {}
) {
  const WrappedComponent: React.FC<P & TrackingHOCProps> = (props) => {
    const { trackingDisabled, trackingProperties, onTrackingError, ...componentProps } = props;
    const { trackEvent } = useTrackEvent();
    const mountTime = useRef<number | undefined>(undefined);
    const renderTime = useRef<number | undefined>(undefined);
    const updateTime = useRef<number | undefined>(undefined);

    const componentName = Component.displayName || Component.name || 'UnknownComponent';

    // Track mount time
    useEffect(() => {
      if (options.trackMountTime && !trackingDisabled) {
        const mountDuration = performance.now() - (mountTime.current || 0);
        
        trackEvent('component_mount', {
          component: componentName,
          duration: mountDuration,
          ...options.getPerformanceProperties?.(props),
          ...trackingProperties,
        }, { onError: onTrackingError });
      }
    }, []);

    // Track render time
    useEffect(() => {
      if (options.trackRenderTime && !trackingDisabled) {
        const renderDuration = performance.now() - (renderTime.current || 0);
        
        trackEvent('component_render', {
          component: componentName,
          duration: renderDuration,
          ...options.getPerformanceProperties?.(props),
          ...trackingProperties,
        }, { onError: onTrackingError });
      }
    });

    // Track update time
    useEffect(() => {
      if (options.trackUpdateTime && !trackingDisabled && updateTime.current) {
        const updateDuration = performance.now() - updateTime.current;
        
        trackEvent('component_update', {
          component: componentName,
          duration: updateDuration,
          ...options.getPerformanceProperties?.(props),
          ...trackingProperties,
        }, { onError: onTrackingError });
      }
      
      updateTime.current = performance.now();
    });

    // Set timing markers
    if (options.trackMountTime && !mountTime.current) {
      mountTime.current = performance.now();
    }
    
    if (options.trackRenderTime) {
      renderTime.current = performance.now();
    }

    return <Component {...(componentProps as P)} />;
  };

  WrappedComponent.displayName = `withPerformanceTracking(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Combined HOC that applies multiple tracking HOCs
export interface WithTrackingOptions extends 
  WithScreenTrackingOptions,
  WithEventTrackingOptions,
  WithErrorTrackingOptions,
  WithPerformanceTrackingOptions {
  enableScreenTracking?: boolean;
  enableEventTracking?: boolean;
  enableErrorTracking?: boolean;
  enablePerformanceTracking?: boolean;
}

export function withTracking<P extends object>(
  Component: ComponentType<P>,
  options: WithTrackingOptions = {}
) {
  let WrappedComponent = Component;

  if (options.enableScreenTracking !== false) {
    WrappedComponent = withScreenTracking(WrappedComponent, options);
  }

  if (options.enableEventTracking !== false) {
    WrappedComponent = withEventTracking(WrappedComponent, options);
  }

  if (options.enableErrorTracking !== false) {
    WrappedComponent = withErrorTracking(WrappedComponent, options);
  }

  if (options.enablePerformanceTracking === true) {
    WrappedComponent = withPerformanceTracking(WrappedComponent, options);
  }

  WrappedComponent.displayName = `withTracking(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}