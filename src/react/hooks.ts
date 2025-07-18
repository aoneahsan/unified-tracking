import { useCallback, useEffect, useRef, useState } from 'react';
import { useUnifiedTracking } from './context';
import type { ErrorContext, RevenueData, ConsentSettings } from '../definitions';

// Hook for tracking events with automatic error handling
export const useTrackEvent = () => {
  const { track, logError: contextLogError } = useUnifiedTracking();
  const [isTracking, setIsTracking] = useState(false);
  const [lastError, setLastError] = useState<Error | null>(null);

  const trackEvent = useCallback(async (
    event: string, 
    properties?: Record<string, any>,
    options?: {
      onSuccess?: () => void;
      onError?: (error: Error) => void;
      logErrors?: boolean;
    }
  ) => {
    try {
      setIsTracking(true);
      setLastError(null);
      
      await track(event, properties);
      
      options?.onSuccess?.();
    } catch (error) {
      const err = error as Error;
      setLastError(err);
      
      if (options?.logErrors !== false) {
        try {
          await contextLogError(err, {
            extra: { event, properties },
            tags: { source: 'useTrackEvent' },
          });
        } catch (logError) {
          console.error('Failed to log tracking error:', logError);
        }
      }
      
      options?.onError?.(err);
    } finally {
      setIsTracking(false);
    }
  }, [track, contextLogError]);

  return {
    trackEvent,
    isTracking,
    lastError,
  };
};

// Hook for user identification with automatic error handling
export const useIdentifyUser = () => {
  const { identify } = useUnifiedTracking();
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [lastError, setLastError] = useState<Error | null>(null);

  const identifyUser = useCallback(async (
    userId: string,
    traits?: Record<string, any>,
    options?: {
      onSuccess?: () => void;
      onError?: (error: Error) => void;
    }
  ) => {
    try {
      setIsIdentifying(true);
      setLastError(null);
      
      await identify(userId, traits);
      
      options?.onSuccess?.();
    } catch (error) {
      const err = error as Error;
      setLastError(err);
      options?.onError?.(err);
    } finally {
      setIsIdentifying(false);
    }
  }, [identify]);

  return {
    identifyUser,
    isIdentifying,
    lastError,
  };
};

// Hook for screen view tracking with automatic lifecycle management
export const useScreenView = (
  screenName: string,
  properties?: Record<string, any>,
  options?: {
    trackOnMount?: boolean;
    trackOnUnmount?: boolean;
    trackOnUpdate?: boolean;
    onError?: (error: Error) => void;
  }
) => {
  const { logScreenView, logError } = useUnifiedTracking();
  const [isTracking, setIsTracking] = useState(false);
  const [lastError, setLastError] = useState<Error | null>(null);
  const previousScreenName = useRef<string>(screenName);
  const previousProperties = useRef<Record<string, any> | undefined>(properties);

  const trackScreen = useCallback(async (
    name: string = screenName,
    props: Record<string, any> = properties || {}
  ) => {
    try {
      setIsTracking(true);
      setLastError(null);
      
      await logScreenView(name, props);
    } catch (error) {
      const err = error as Error;
      setLastError(err);
      
      try {
        await logError(err, {
          extra: { screenName: name, properties: props },
          tags: { source: 'useScreenView' },
        });
      } catch (logErrorErr) {
        console.error('Failed to log screen view error:', logErrorErr);
      }
      
      options?.onError?.(err);
    } finally {
      setIsTracking(false);
    }
  }, [screenName, properties, logScreenView, logError, options]);

  // Track screen view on mount
  useEffect(() => {
    if (options?.trackOnMount !== false) {
      trackScreen();
    }
  }, []);

  // Track screen view on screen name or properties change
  useEffect(() => {
    if (options?.trackOnUpdate !== false) {
      const screenChanged = previousScreenName.current !== screenName;
      const propertiesChanged = JSON.stringify(previousProperties.current) !== JSON.stringify(properties);
      
      if (screenChanged || propertiesChanged) {
        trackScreen();
      }
    }
    
    previousScreenName.current = screenName;
    previousProperties.current = properties;
  }, [screenName, properties, trackScreen, options?.trackOnUpdate]);

  // Track screen view on unmount
  useEffect(() => {
    return () => {
      if (options?.trackOnUnmount === true) {
        trackScreen(`${screenName}_exit`);
      }
    };
  }, [screenName, trackScreen, options?.trackOnUnmount]);

  return {
    trackScreen,
    isTracking,
    lastError,
  };
};

// Hook for revenue tracking with validation
export const useRevenueTracking = () => {
  const { logRevenue, logError } = useUnifiedTracking();
  const [isTracking, setIsTracking] = useState(false);
  const [lastError, setLastError] = useState<Error | null>(null);

  const trackRevenue = useCallback(async (
    revenue: RevenueData,
    options?: {
      validate?: boolean;
      onSuccess?: () => void;
      onError?: (error: Error) => void;
    }
  ) => {
    try {
      setIsTracking(true);
      setLastError(null);
      
      // Validate revenue data if requested
      if (options?.validate !== false) {
        if (!revenue.amount || revenue.amount <= 0) {
          throw new Error('Revenue amount must be greater than 0');
        }
        
        if (revenue.currency && !/^[A-Z]{3}$/.test(revenue.currency)) {
          throw new Error('Currency must be a valid 3-letter ISO code');
        }
      }
      
      await logRevenue(revenue);
      
      options?.onSuccess?.();
    } catch (error) {
      const err = error as Error;
      setLastError(err);
      
      try {
        await logError(err, {
          extra: { revenue },
          tags: { source: 'useRevenueTracking' },
        });
      } catch (logErrorErr) {
        console.error('Failed to log revenue tracking error:', logErrorErr);
      }
      
      options?.onError?.(err);
    } finally {
      setIsTracking(false);
    }
  }, [logRevenue, logError]);

  return {
    trackRevenue,
    isTracking,
    lastError,
  };
};

// Hook for consent management
export const useConsent = () => {
  const { setConsent } = useUnifiedTracking();
  const [consent, setConsentState] = useState<ConsentSettings>({
    analytics: true,
    errorTracking: true,
    marketing: false,
    personalization: false,
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastError, setLastError] = useState<Error | null>(null);

  const updateConsent = useCallback(async (
    newConsent: Partial<ConsentSettings>,
    options?: {
      onSuccess?: () => void;
      onError?: (error: Error) => void;
    }
  ) => {
    try {
      setIsUpdating(true);
      setLastError(null);
      
      const updatedConsent = { ...consent, ...newConsent };
      
      await setConsent(updatedConsent);
      setConsentState(updatedConsent);
      
      options?.onSuccess?.();
    } catch (error) {
      const err = error as Error;
      setLastError(err);
      options?.onError?.(err);
    } finally {
      setIsUpdating(false);
    }
  }, [consent, setConsent]);

  const acceptAll = useCallback(async (options?: {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
  }) => {
    await updateConsent({
      analytics: true,
      errorTracking: true,
      marketing: true,
      personalization: true,
    }, options);
  }, [updateConsent]);

  const rejectAll = useCallback(async (options?: {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
  }) => {
    await updateConsent({
      analytics: false,
      errorTracking: false,
      marketing: false,
      personalization: false,
    }, options);
  }, [updateConsent]);

  const acceptEssential = useCallback(async (options?: {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
  }) => {
    await updateConsent({
      analytics: true,
      errorTracking: true,
      marketing: false,
      personalization: false,
    }, options);
  }, [updateConsent]);

  return {
    consent,
    updateConsent,
    acceptAll,
    rejectAll,
    acceptEssential,
    isUpdating,
    lastError,
  };
};

// Hook for error tracking
export const useErrorTracking = () => {
  const { logError } = useUnifiedTracking();
  const [isLogging, setIsLogging] = useState(false);
  const [lastError, setLastError] = useState<Error | null>(null);

  const trackError = useCallback(async (
    error: Error | string,
    context?: ErrorContext,
    options?: {
      onSuccess?: () => void;
      onError?: (error: Error) => void;
    }
  ) => {
    try {
      setIsLogging(true);
      setLastError(null);
      
      await logError(error, context);
      
      options?.onSuccess?.();
    } catch (err) {
      const trackingError = err as Error;
      setLastError(trackingError);
      options?.onError?.(trackingError);
    } finally {
      setIsLogging(false);
    }
  }, [logError]);

  // Automatically track unhandled errors
  useEffect(() => {
    const handleUnhandledError = (event: ErrorEvent) => {
      trackError(event.error || event.message, {
        severity: 'error',
        tags: { source: 'unhandledError' },
        extra: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackError(event.reason, {
        severity: 'error',
        tags: { source: 'unhandledRejection' },
      });
    };

    window.addEventListener('error', handleUnhandledError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleUnhandledError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [trackError]);

  return {
    trackError,
    isLogging,
    lastError,
  };
};

// Hook for A/B testing and feature flags (PostHog integration)
export const useFeatureFlags = () => {
  const { getActiveProviders } = useUnifiedTracking();
  const [flags, setFlags] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);

  const isFeatureEnabled = useCallback((flagName: string): boolean => {
    return flags[flagName] === true;
  }, [flags]);

  const getFeatureFlag = useCallback((flagName: string): any => {
    return flags[flagName];
  }, [flags]);

  const refreshFlags = useCallback(async () => {
    setIsLoading(true);
    try {
      const providers = await getActiveProviders();
      // This would integrate with PostHog or other feature flag providers
      // For now, we'll just return the current flags
      setFlags(prevFlags => ({ ...prevFlags }));
    } catch (error) {
      console.error('Failed to refresh feature flags:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getActiveProviders]);

  return {
    flags,
    isFeatureEnabled,
    getFeatureFlag,
    refreshFlags,
    isLoading,
  };
};