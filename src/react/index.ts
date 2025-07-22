// React integration for Unified Tracking
export {
  UnifiedTrackingProvider,
  useUnifiedTracking,
  useTrackingState,
  useTrackingActions,
  useTrackingConfig,
} from './context';

export {
  useTrackEvent,
  useIdentifyUser,
  useScreenView,
  useRevenueTracking,
  useConsent,
  useErrorTracking,
  useFeatureFlags,
} from './hooks';

export { withScreenTracking, withEventTracking, withErrorTracking, withPerformanceTracking, withTracking } from './hoc';

export type { UnifiedTrackingContextValue, UnifiedTrackingProviderProps } from './context';

export type {
  TrackingHOCProps,
  WithScreenTrackingOptions,
  WithEventTrackingOptions,
  WithErrorTrackingOptions,
  WithPerformanceTrackingOptions,
  WithTrackingOptions,
} from './hoc';
