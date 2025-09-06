import React, { useState, useEffect } from 'react';
import { UnifiedTracking } from 'unified-tracking';
import TrackingDemo from './components/TrackingDemo';
import ErrorTrackingDemo from './components/ErrorTrackingDemo';
import ConfigurationPanel from './components/ConfigurationPanel';
import LogViewer from './components/LogViewer';

interface AppState {
  isInitialized: boolean;
  initializationError: string | null;
  logs: string[];
}

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    isInitialized: false,
    initializationError: null,
    logs: [],
  });

  const addLog = (message: string) => {
    setState((prev) => ({
      ...prev,
      logs: [...prev.logs, `[${new Date().toLocaleTimeString()}] ${message}`],
    }));
  };

  const initializeTracking = async () => {
    try {
      addLog('Initializing Unified Tracking...');

      const config = {
        analytics: {
          providers: ['google-analytics'],
          googleAnalytics: {
            measurementId: 'G-DEMO', // Demo measurement ID
          },
        },
        errorTracking: {
          providers: [], // Demo without real error tracking
        },
        debug: true, // Enable debug mode for demo
      };

      await UnifiedTracking.initialize(config);

      setState((prev) => ({
        ...prev,
        isInitialized: true,
        initializationError: null,
      }));

      addLog('✅ Unified Tracking initialized successfully');

      // Track app initialization
      await UnifiedTracking.trackEvent('app_initialized', {
        version: '1.0.0',
        environment: 'demo',
      });

      addLog('📊 App initialization event tracked');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState((prev) => ({
        ...prev,
        isInitialized: false,
        initializationError: errorMessage,
      }));

      addLog(`❌ Initialization failed: ${errorMessage}`);
    }
  };

  useEffect(() => {
    initializeTracking();
  }, []);

  const handleReset = async () => {
    try {
      addLog('Resetting tracking...');

      // Reset the tracking instance
      await UnifiedTracking.reset();

      setState({
        isInitialized: false,
        initializationError: null,
        logs: [],
      });

      // Re-initialize
      await initializeTracking();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog(`❌ Reset failed: ${errorMessage}`);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>🚀 Unified Tracking Demo</h1>
        <p>
          Interactive demo showcasing the unified-tracking plugin capabilities. Open your browser's developer tools to
          see the tracking calls in action.
        </p>

        <div className="button-group">
          <button onClick={initializeTracking} disabled={state.isInitialized}>
            {state.isInitialized ? '✅ Initialized' : '🔄 Initialize'}
          </button>
          <button onClick={handleReset}>🔄 Reset Demo</button>
        </div>

        {state.initializationError && (
          <div className="status error">
            <strong>Initialization Error:</strong> {state.initializationError}
          </div>
        )}

        {state.isInitialized && (
          <div className="status success">🎉 Unified Tracking is ready! You can now test the features below.</div>
        )}
      </div>

      {/* Configuration Panel */}
      <ConfigurationPanel onLog={addLog} />

      {/* Analytics Tracking Demo */}
      <TrackingDemo isInitialized={state.isInitialized} onLog={addLog} />

      {/* Error Tracking Demo */}
      <ErrorTrackingDemo isInitialized={state.isInitialized} onLog={addLog} />

      {/* Log Viewer */}
      <LogViewer logs={state.logs} />
    </div>
  );
};

export default App;
