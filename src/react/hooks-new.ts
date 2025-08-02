import { useCallback, useState } from 'react';
import { getUnifiedTracking } from '../core/unified-tracking-core';

const UnifiedTracking = getUnifiedTracking();

// Direct access to UnifiedTracking instance - no provider needed
export const useUnifiedTracking = () => {
  return {
    track: UnifiedTracking.track.bind(UnifiedTracking),
    identify: UnifiedTracking.identify.bind(UnifiedTracking),
    setUserProperties: UnifiedTracking.setUserProperties.bind(UnifiedTracking),
    logError: UnifiedTracking.logError.bind(UnifiedTracking),
    logRevenue: UnifiedTracking.logRevenue.bind(UnifiedTracking),
    logScreenView: UnifiedTracking.logScreenView.bind(UnifiedTracking),
    setConsent: UnifiedTracking.setConsent.bind(UnifiedTracking),
    reset: UnifiedTracking.reset.bind(UnifiedTracking),
    getActiveProviders: UnifiedTracking.getActiveProviders.bind(UnifiedTracking),
    enableDebugMode: UnifiedTracking.enableDebugMode.bind(UnifiedTracking),
  };
};

// Hook for tracking events
export const useTrackEvent = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [lastError, setLastError] = useState<Error | null>(null);

  const trackEvent = useCallback(async (event: string, properties?: Record<string, unknown>) => {
    try {
      setIsTracking(true);
      setLastError(null);
      await UnifiedTracking.track(event, properties);
    } catch (error) {
      const err = error as Error;
      setLastError(err);
      throw err;
    } finally {
      setIsTracking(false);
    }
  }, []);

  return { trackEvent, isTracking, lastError };
};
