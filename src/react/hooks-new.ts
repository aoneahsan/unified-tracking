import { useCallback, useMemo, useState } from 'react';
import { getUnifiedTracking } from '../core/unified-tracking-core.js';

const UnifiedTracking = getUnifiedTracking();

// Bind the singleton's methods ONCE at module scope so the returned API object has a
// stable identity across renders. The previous version returned a fresh object with
// fresh .bind() calls on every render, which churns any useEffect/useMemo/useCallback
// that lists the API (or one of its methods) in its dependency array.
const boundApi = {
  track: UnifiedTracking.track.bind(UnifiedTracking),
  identify: UnifiedTracking.identify.bind(UnifiedTracking),
  setUserProperties: UnifiedTracking.setUserProperties.bind(UnifiedTracking),
  logError: UnifiedTracking.logError.bind(UnifiedTracking),
  logRevenue: UnifiedTracking.logRevenue.bind(UnifiedTracking),
  logScreenView: UnifiedTracking.logScreenView.bind(UnifiedTracking),
  setConsent: UnifiedTracking.setConsent.bind(UnifiedTracking),
  reset: UnifiedTracking.reset.bind(UnifiedTracking),
  flush: UnifiedTracking.flush.bind(UnifiedTracking),
  getActiveProviders: UnifiedTracking.getActiveProviders.bind(UnifiedTracking),
  enableDebugMode: UnifiedTracking.enableDebugMode.bind(UnifiedTracking),
};

// Direct access to the UnifiedTracking singleton — no provider needed. Returns a stable
// (memoized) reference so it is safe to use in effect dependency arrays.
export const useUnifiedTracking = () => useMemo(() => boundApi, []);

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
