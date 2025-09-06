import React, { useState } from 'react';
import { useUnifiedTracking } from 'unified-tracking/react';

interface ErrorTrackingDemoProps {
  isInitialized: boolean;
  onLog: (message: string) => void;
}

interface DemoState {
  isProcessing: boolean;
  customErrorMessage: string;
}

const ErrorTrackingDemo: React.FC<ErrorTrackingDemoProps> = ({ isInitialized, onLog }) => {
  const { logError, setUser, setContext, addBreadcrumb } = useUnifiedTracking();
  const [state, setState] = useState<DemoState>({
    isProcessing: false,
    customErrorMessage: 'This is a demo error message',
  });

  const handleLogError = async (error: Error, context?: Record<string, any>) => {
    if (!isInitialized) {
      onLog('❌ Cannot log error - not initialized');
      return;
    }

    setState((prev) => ({ ...prev, isProcessing: true }));

    try {
      await logError(error, context);
      onLog(`🐛 Error logged: ${error.message}`);
    } catch (logError) {
      const errorMessage = logError instanceof Error ? logError.message : 'Unknown error';
      onLog(`❌ Error logging failed: ${errorMessage}`);
    } finally {
      setState((prev) => ({ ...prev, isProcessing: false }));
    }
  };

  const handleSetUser = async () => {
    if (!isInitialized) {
      onLog('❌ Cannot set user context - not initialized');
      return;
    }

    setState((prev) => ({ ...prev, isProcessing: true }));

    try {
      await setUser({
        id: 'demo-user-123',
        email: 'demo@example.com',
        username: 'demo_user',
        ip_address: '{{auto}}',
      });
      onLog('👤 User context set for error tracking');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      onLog(`❌ Setting user context failed: ${errorMessage}`);
    } finally {
      setState((prev) => ({ ...prev, isProcessing: false }));
    }
  };

  const handleSetContext = async () => {
    if (!isInitialized) {
      onLog('❌ Cannot set context - not initialized');
      return;
    }

    setState((prev) => ({ ...prev, isProcessing: true }));

    try {
      await setContext('demo_context', {
        component: 'ErrorTrackingDemo',
        feature: 'error_tracking',
        environment: 'demo',
        timestamp: new Date().toISOString(),
      });
      onLog('🏷️ Context set for error tracking');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      onLog(`❌ Setting context failed: ${errorMessage}`);
    } finally {
      setState((prev) => ({ ...prev, isProcessing: false }));
    }
  };

  const handleAddBreadcrumb = async () => {
    if (!isInitialized) {
      onLog('❌ Cannot add breadcrumb - not initialized');
      return;
    }

    setState((prev) => ({ ...prev, isProcessing: true }));

    try {
      await addBreadcrumb({
        message: 'User clicked demo button',
        category: 'user.action',
        level: 'info',
        data: {
          button_id: 'demo_button',
          timestamp: new Date().toISOString(),
        },
      });
      onLog('🍞 Breadcrumb added');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      onLog(`❌ Adding breadcrumb failed: ${errorMessage}`);
    } finally {
      setState((prev) => ({ ...prev, isProcessing: false }));
    }
  };

  // Demo error generators
  const simulateJavaScriptError = () => {
    const error = new Error('Demo JavaScript Error: Something went wrong in the demo');
    error.stack = `Error: Demo JavaScript Error: Something went wrong in the demo
    at ErrorTrackingDemo.simulateJavaScriptError (ErrorTrackingDemo.tsx:${Math.floor(Math.random() * 100)})
    at onClick (ErrorTrackingDemo.tsx:${Math.floor(Math.random() * 100)})`;
    return error;
  };

  const simulateTypeError = () => {
    const error = new TypeError('Demo TypeError: Cannot read property of undefined');
    error.stack = `TypeError: Demo TypeError: Cannot read property of undefined
    at ErrorTrackingDemo.simulateTypeError (ErrorTrackingDemo.tsx:${Math.floor(Math.random() * 100)})
    at Object.handleError (demo-utils.js:${Math.floor(Math.random() * 50)})`;
    return error;
  };

  const simulateNetworkError = () => {
    const error = new Error('Demo Network Error: Failed to fetch data from API');
    error.name = 'NetworkError';
    error.stack = `NetworkError: Demo Network Error: Failed to fetch data from API
    at fetch (native)
    at api.getData (api-client.js:${Math.floor(Math.random() * 200)})
    at async ErrorTrackingDemo.loadData (ErrorTrackingDemo.tsx:${Math.floor(Math.random() * 100)})`;
    return error;
  };

  const simulateCustomError = () => {
    const error = new Error(state.customErrorMessage);
    error.name = 'CustomDemoError';
    return error;
  };

  return (
    <div className="demo-section">
      <h2>🐛 Error Tracking</h2>
      <p>Test error tracking and context management features.</p>

      {/* Context Management */}
      <div>
        <h3>🏷️ Context Management</h3>
        <div className="button-group">
          <button onClick={handleSetUser} disabled={!isInitialized || state.isProcessing}>
            {state.isProcessing ? '⏳ Setting...' : '👤 Set User Context'}
          </button>

          <button onClick={handleSetContext} disabled={!isInitialized || state.isProcessing}>
            {state.isProcessing ? '⏳ Setting...' : '🏷️ Set Custom Context'}
          </button>

          <button onClick={handleAddBreadcrumb} disabled={!isInitialized || state.isProcessing}>
            {state.isProcessing ? '⏳ Adding...' : '🍞 Add Breadcrumb'}
          </button>
        </div>
      </div>

      {/* Error Simulation */}
      <div>
        <h3>⚠️ Error Simulation</h3>
        <div className="button-group">
          <button
            onClick={() =>
              handleLogError(simulateJavaScriptError(), {
                component: 'ErrorTrackingDemo',
                action: 'simulate_error',
                error_type: 'javascript',
              })
            }
            disabled={!isInitialized || state.isProcessing}
          >
            {state.isProcessing ? '⏳ Logging...' : '💥 Log JavaScript Error'}
          </button>

          <button
            onClick={() =>
              handleLogError(simulateTypeError(), {
                component: 'ErrorTrackingDemo',
                action: 'simulate_error',
                error_type: 'type_error',
              })
            }
            disabled={!isInitialized || state.isProcessing}
          >
            {state.isProcessing ? '⏳ Logging...' : '🔧 Log Type Error'}
          </button>

          <button
            onClick={() =>
              handleLogError(simulateNetworkError(), {
                component: 'ErrorTrackingDemo',
                action: 'simulate_error',
                error_type: 'network',
                endpoint: '/api/demo',
              })
            }
            disabled={!isInitialized || state.isProcessing}
          >
            {state.isProcessing ? '⏳ Logging...' : '🌐 Log Network Error'}
          </button>
        </div>
      </div>

      {/* Custom Error */}
      <div>
        <h3>✏️ Custom Error</h3>
        <div className="button-group">
          <input
            type="text"
            value={state.customErrorMessage}
            onChange={(e) => setState((prev) => ({ ...prev, customErrorMessage: e.target.value }))}
            placeholder="Enter custom error message"
            style={{
              padding: '10px',
              marginRight: '10px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              minWidth: '250px',
            }}
          />
          <button
            onClick={() =>
              handleLogError(simulateCustomError(), {
                component: 'ErrorTrackingDemo',
                action: 'custom_error',
                user_input: true,
              })
            }
            disabled={!isInitialized || state.isProcessing || !state.customErrorMessage}
          >
            {state.isProcessing ? '⏳ Logging...' : '📝 Log Custom Error'}
          </button>
        </div>
      </div>

      {/* Error with Rich Context */}
      <div>
        <h3>📊 Error with Rich Context</h3>
        <div className="button-group">
          <button
            onClick={() => {
              const error = new Error('Demo error with rich context data');
              handleLogError(error, {
                component: 'ErrorTrackingDemo',
                user_agent: navigator.userAgent,
                url: window.location.href,
                timestamp: new Date().toISOString(),
                user_id: 'demo-user-123',
                session_id: 'session-' + Date.now(),
                feature_flags: {
                  new_ui: true,
                  beta_feature: false,
                },
                performance: {
                  memory_usage: (performance as any).memory?.usedJSHeapSize || 0,
                  connection_type: (navigator as any).connection?.effectiveType || 'unknown',
                },
                custom_data: {
                  demo_mode: true,
                  error_simulation: true,
                  test_scenario: 'rich_context',
                },
              });
            }}
            disabled={!isInitialized || state.isProcessing}
          >
            {state.isProcessing ? '⏳ Logging...' : '🔍 Log Error with Rich Context'}
          </button>
        </div>
      </div>

      {/* Testing with React Error Boundary */}
      <div>
        <h3>⚛️ React Error Boundary</h3>
        <p style={{ fontSize: '14px', color: '#666' }}>
          These buttons simulate React component errors that would be caught by error boundaries.
        </p>
        <div className="button-group">
          <button
            onClick={() => {
              // Simulate a React render error
              const error = new Error('Demo React render error in component lifecycle');
              error.name = 'ChunkLoadError';
              handleLogError(error, {
                error_boundary: true,
                component_stack: 'at ErrorTrackingDemo\nat DemoSection\nat App',
                react_version: '19.0.0',
                lifecycle: 'render',
              });
            }}
            disabled={!isInitialized || state.isProcessing}
          >
            {state.isProcessing ? '⏳ Logging...' : '⚛️ Log React Render Error'}
          </button>

          <button
            onClick={() => {
              const error = new Error('Demo async operation failed in useEffect');
              handleLogError(error, {
                error_boundary: false,
                hook: 'useEffect',
                async_operation: 'data_fetch',
                component: 'ErrorTrackingDemo',
              });
            }}
            disabled={!isInitialized || state.isProcessing}
          >
            {state.isProcessing ? '⏳ Logging...' : '🔄 Log Async Hook Error'}
          </button>
        </div>
      </div>

      {!isInitialized && (
        <div className="status info">
          ℹ️ Initialize the tracking system first to test error tracking features.
          <br />
          <small>Note: Error tracking requires configured providers (Sentry, Bugsnag, etc.)</small>
        </div>
      )}
    </div>
  );
};

export default ErrorTrackingDemo;
