import React, { useState } from 'react';
import { UnifiedTracking } from 'unified-tracking';

interface ConfigurationPanelProps {
  onLog: (message: string) => void;
}

interface ConfigState {
  showConfig: boolean;
  providers: string[];
}

const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({ onLog }) => {
  const [state, setState] = useState<ConfigState>({
    showConfig: false,
    providers: [],
  });

  const demoConfig = {
    analytics: {
      providers: ['google-analytics'],
      googleAnalytics: {
        measurementId: 'G-DEMO',
        config: {
          send_page_view: false, // We'll handle page views manually
          anonymize_ip: true,
          allow_google_signals: false,
          allow_ad_personalization_signals: false,
        },
      },
      // Example configurations for other providers (commented out for demo)
      /*
      mixpanel: {
        token: 'YOUR_MIXPANEL_TOKEN',
        config: {
          debug: true,
          track_pageview: false,
          persistence: 'localStorage'
        }
      },
      segment: {
        writeKey: 'YOUR_SEGMENT_WRITE_KEY',
        config: {
          integrations: {
            'Google Analytics': false // Let unified-tracking handle it
          }
        }
      },
      amplitude: {
        apiKey: 'YOUR_AMPLITUDE_API_KEY',
        config: {
          includeUtm: true,
          includeReferrer: true,
          saveEvents: true
        }
      }
      */
    },
    errorTracking: {
      providers: [], // No error tracking providers in demo
      // Example error tracking configurations (commented out)
      /*
      sentry: {
        dsn: 'YOUR_SENTRY_DSN',
        config: {
          environment: 'production',
          tracesSampleRate: 1.0,
          debug: false,
          beforeSend: (event) => {
            // Custom event filtering
            return event;
          }
        }
      },
      bugsnag: {
        apiKey: 'YOUR_BUGSNAG_API_KEY',
        config: {
          enabledReleaseStages: ['production', 'staging'],
          collectUserIp: false
        }
      }
      */
    },
    privacy: {
      respectDoNotTrack: true,
      anonymizeIp: true,
      cookieConsent: true,
    },
    debug: true, // Enable debug mode for demo
    queue: {
      maxRetries: 3,
      retryDelay: 1000,
      maxQueueSize: 100,
    },
  };

  const handleGetActiveProviders = async () => {
    try {
      const providers = await UnifiedTracking.getActiveProviders();
      setState((prev) => ({ ...prev, providers: providers.map((p) => p.id) }));
      onLog(`📋 Active providers: ${providers.map((p) => p.name).join(', ')}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      onLog(`❌ Failed to get active providers: ${errorMessage}`);
    }
  };

  const handleTestConsent = async () => {
    try {
      // Set consent preferences
      await UnifiedTracking.setConsent({
        analytics: true,
        errorTracking: true,
        marketing: false,
        personalization: false,
      });
      onLog('🛡️ Consent preferences updated');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      onLog(`❌ Failed to set consent: ${errorMessage}`);
    }
  };

  const handleGetStatus = async () => {
    try {
      const status = await UnifiedTracking.getStatus();
      onLog(
        `📊 Status: Initialized=${status.isInitialized}, Providers=${status.activeProviders.length}, Queue=${status.queueSize}`,
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      onLog(`❌ Failed to get status: ${errorMessage}`);
    }
  };

  return (
    <div className="demo-section">
      <h2>⚙️ Configuration & Management</h2>
      <p>View configuration details and test management features.</p>

      <div className="button-group">
        <button onClick={() => setState((prev) => ({ ...prev, showConfig: !prev.showConfig }))}>
          {state.showConfig ? '👁️ Hide Config' : '👁️ Show Config'}
        </button>

        <button onClick={handleGetActiveProviders}>📋 Get Active Providers</button>

        <button onClick={handleTestConsent}>🛡️ Test Consent Management</button>

        <button onClick={handleGetStatus}>📊 Get System Status</button>
      </div>

      {state.providers.length > 0 && (
        <div className="status success">
          <strong>Active Providers:</strong> {state.providers.join(', ')}
        </div>
      )}

      {state.showConfig && (
        <div>
          <h3>📋 Current Configuration</h3>
          <div className="config-display">{JSON.stringify(demoConfig, null, 2)}</div>

          <div style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
            <h4>🔧 Configuration Notes:</h4>
            <ul style={{ textAlign: 'left', paddingLeft: '20px' }}>
              <li>
                <strong>Analytics Providers:</strong> Only Google Analytics is enabled for this demo
              </li>
              <li>
                <strong>Error Tracking:</strong> No providers configured (add Sentry DSN to test)
              </li>
              <li>
                <strong>Debug Mode:</strong> Enabled to show detailed console logs
              </li>
              <li>
                <strong>Privacy:</strong> Respects Do Not Track and anonymizes IPs
              </li>
              <li>
                <strong>Queue:</strong> Configured for offline support and retry logic
              </li>
            </ul>

            <h4>💡 To add real providers:</h4>
            <ul style={{ textAlign: 'left', paddingLeft: '20px' }}>
              <li>Replace 'G-DEMO' with your actual Google Analytics Measurement ID</li>
              <li>Add your Mixpanel token, Segment write key, etc.</li>
              <li>Configure Sentry DSN for error tracking</li>
              <li>Enable the providers you want to use</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigurationPanel;
