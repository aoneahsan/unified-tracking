import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { UnifiedTracking } from '../index';
import type { 
  UnifiedTrackingConfig, 
  ErrorContext, 
  RevenueData, 
  ConsentSettings,
  ActiveProvidersResult 
} from '../definitions';

export interface UnifiedTrackingContextValue {
  // Core tracking methods
  track: (event: string, properties?: Record<string, any>) => Promise<void>;
  identify: (userId: string, traits?: Record<string, any>) => Promise<void>;
  setUserProperties: (properties: Record<string, any>) => Promise<void>;
  logError: (error: Error | string, context?: ErrorContext) => Promise<void>;
  logRevenue: (revenue: RevenueData) => Promise<void>;
  logScreenView: (screenName: string, properties?: Record<string, any>) => Promise<void>;
  setConsent: (consent: ConsentSettings) => Promise<void>;
  reset: () => Promise<void>;
  
  // State management
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  activeProviders: ActiveProvidersResult | null;
  
  // Utility methods
  enableDebugMode: (enabled: boolean) => Promise<void>;
  getActiveProviders: () => Promise<ActiveProvidersResult>;
  
  // Configuration
  config: UnifiedTrackingConfig | null;
  updateConfig: (config: Partial<UnifiedTrackingConfig>) => Promise<void>;
}

const UnifiedTrackingContext = createContext<UnifiedTrackingContextValue | null>(null);

export interface UnifiedTrackingProviderProps {
  children: ReactNode;
  config?: UnifiedTrackingConfig;
  autoInitialize?: boolean;
  onError?: (error: Error) => void;
  onInitialized?: (providers: ActiveProvidersResult) => void;
  onEvent?: (event: string, properties?: Record<string, any>) => void;
}

export const UnifiedTrackingProvider: React.FC<UnifiedTrackingProviderProps> = ({
  children,
  config,
  autoInitialize = true,
  onError,
  onInitialized,
  onEvent,
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeProviders, setActiveProviders] = useState<ActiveProvidersResult | null>(null);
  const [currentConfig, setCurrentConfig] = useState<UnifiedTrackingConfig | null>(config || null);

  // Initialize the plugin when component mounts
  useEffect(() => {
    if (autoInitialize && config && !isInitialized) {
      initialize(config);
    }
  }, [autoInitialize, config, isInitialized]);

  const initialize = async (initConfig: UnifiedTrackingConfig) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await UnifiedTracking.initialize(initConfig);
      
      setIsInitialized(result.success);
      setActiveProviders(result.activeProviders);
      setCurrentConfig(initConfig);
      
      if (result.success) {
        onInitialized?.(result.activeProviders);
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  const track = async (event: string, properties?: Record<string, any>) => {
    try {
      await UnifiedTracking.track(event, properties);
      onEvent?.(event, properties);
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      onError?.(error);
      throw error;
    }
  };

  const identify = async (userId: string, traits?: Record<string, any>) => {
    try {
      await UnifiedTracking.identify(userId, traits);
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      onError?.(error);
      throw error;
    }
  };

  const setUserProperties = async (properties: Record<string, any>) => {
    try {
      await UnifiedTracking.setUserProperties(properties);
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      onError?.(error);
      throw error;
    }
  };

  const logError = async (error: Error | string, context?: ErrorContext) => {
    try {
      await UnifiedTracking.logError(error, context);
    } catch (err) {
      const trackingError = err as Error;
      setError(trackingError.message);
      onError?.(trackingError);
      throw trackingError;
    }
  };

  const logRevenue = async (revenue: RevenueData) => {
    try {
      await UnifiedTracking.logRevenue(revenue);
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      onError?.(error);
      throw error;
    }
  };

  const logScreenView = async (screenName: string, properties?: Record<string, any>) => {
    try {
      await UnifiedTracking.logScreenView(screenName, properties);
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      onError?.(error);
      throw error;
    }
  };

  const setConsent = async (consent: ConsentSettings) => {
    try {
      await UnifiedTracking.setConsent(consent);
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      onError?.(error);
      throw error;
    }
  };

  const reset = async () => {
    try {
      await UnifiedTracking.reset();
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      onError?.(error);
      throw error;
    }
  };

  const enableDebugMode = async (enabled: boolean) => {
    try {
      await UnifiedTracking.enableDebugMode(enabled);
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      onError?.(error);
      throw error;
    }
  };

  const getActiveProviders = async () => {
    try {
      const providers = await UnifiedTracking.getActiveProviders();
      setActiveProviders(providers);
      return providers;
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      onError?.(error);
      throw error;
    }
  };

  const updateConfig = async (newConfig: Partial<UnifiedTrackingConfig>) => {
    try {
      const updatedConfig = { ...currentConfig, ...newConfig } as UnifiedTrackingConfig;
      await initialize(updatedConfig);
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      onError?.(error);
      throw error;
    }
  };

  const contextValue: UnifiedTrackingContextValue = {
    // Core tracking methods
    track,
    identify,
    setUserProperties,
    logError,
    logRevenue,
    logScreenView,
    setConsent,
    reset,
    
    // State management
    isInitialized,
    isLoading,
    error,
    activeProviders,
    
    // Utility methods
    enableDebugMode,
    getActiveProviders,
    
    // Configuration
    config: currentConfig,
    updateConfig,
  };

  return (
    <UnifiedTrackingContext.Provider value={contextValue}>
      {children}
    </UnifiedTrackingContext.Provider>
  );
};

export const useUnifiedTracking = (): UnifiedTrackingContextValue => {
  const context = useContext(UnifiedTrackingContext);
  
  if (!context) {
    throw new Error('useUnifiedTracking must be used within a UnifiedTrackingProvider');
  }
  
  return context;
};

// Additional specialized hooks
export const useTrackingState = () => {
  const { isInitialized, isLoading, error, activeProviders } = useUnifiedTracking();
  
  return {
    isInitialized,
    isLoading,
    error,
    activeProviders,
  };
};

export const useTrackingActions = () => {
  const { 
    track, 
    identify, 
    setUserProperties, 
    logError, 
    logRevenue, 
    logScreenView, 
    setConsent, 
    reset 
  } = useUnifiedTracking();
  
  return {
    track,
    identify,
    setUserProperties,
    logError,
    logRevenue,
    logScreenView,
    setConsent,
    reset,
  };
};

export const useTrackingConfig = () => {
  const { config, updateConfig, enableDebugMode, getActiveProviders } = useUnifiedTracking();
  
  return {
    config,
    updateConfig,
    enableDebugMode,
    getActiveProviders,
  };
};