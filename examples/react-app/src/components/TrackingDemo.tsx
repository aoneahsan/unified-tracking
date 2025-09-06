import React, { useState } from 'react';
import { useUnifiedTracking } from 'unified-tracking/react';

interface TrackingDemoProps {
  isInitialized: boolean;
  onLog: (message: string) => void;
}

interface DemoState {
  userId: string;
  isProcessing: boolean;
}

const TrackingDemo: React.FC<TrackingDemoProps> = ({ isInitialized, onLog }) => {
  const { trackEvent, identify, trackRevenue, trackPageView } = useUnifiedTracking();
  const [state, setState] = useState<DemoState>({
    userId: 'demo-user-123',
    isProcessing: false,
  });

  const handleTrackEvent = async (eventName: string, properties: Record<string, any>) => {
    if (!isInitialized) {
      onLog('❌ Cannot track event - not initialized');
      return;
    }

    setState((prev) => ({ ...prev, isProcessing: true }));

    try {
      await trackEvent(eventName, properties);
      onLog(`📊 Event tracked: ${eventName} ${JSON.stringify(properties)}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      onLog(`❌ Event tracking failed: ${errorMessage}`);
    } finally {
      setState((prev) => ({ ...prev, isProcessing: false }));
    }
  };

  const handleIdentify = async () => {
    if (!isInitialized) {
      onLog('❌ Cannot identify user - not initialized');
      return;
    }

    setState((prev) => ({ ...prev, isProcessing: true }));

    try {
      await identify(state.userId, {
        email: 'demo@example.com',
        name: 'Demo User',
        plan: 'premium',
        signup_date: new Date().toISOString(),
      });
      onLog(`👤 User identified: ${state.userId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      onLog(`❌ User identification failed: ${errorMessage}`);
    } finally {
      setState((prev) => ({ ...prev, isProcessing: false }));
    }
  };

  const handleTrackRevenue = async () => {
    if (!isInitialized) {
      onLog('❌ Cannot track revenue - not initialized');
      return;
    }

    setState((prev) => ({ ...prev, isProcessing: true }));

    try {
      await trackRevenue({
        amount: 99.99,
        currency: 'USD',
        productId: 'premium-plan',
        transactionId: `txn-${Date.now()}`,
      });
      onLog('💰 Revenue tracked: $99.99 USD');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      onLog(`❌ Revenue tracking failed: ${errorMessage}`);
    } finally {
      setState((prev) => ({ ...prev, isProcessing: false }));
    }
  };

  const handleTrackPageView = async () => {
    if (!isInitialized) {
      onLog('❌ Cannot track page view - not initialized');
      return;
    }

    setState((prev) => ({ ...prev, isProcessing: true }));

    try {
      await trackPageView('/demo-page', 'Demo Page');
      onLog('📄 Page view tracked: /demo-page');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      onLog(`❌ Page view tracking failed: ${errorMessage}`);
    } finally {
      setState((prev) => ({ ...prev, isProcessing: false }));
    }
  };

  return (
    <div className="demo-section">
      <h2>📊 Analytics Tracking</h2>
      <p>Test different analytics tracking features using React hooks.</p>

      {/* User Identification */}
      <div>
        <h3>👤 User Identification</h3>
        <div className="button-group">
          <input
            type="text"
            value={state.userId}
            onChange={(e) => setState((prev) => ({ ...prev, userId: e.target.value }))}
            placeholder="User ID"
            style={{ padding: '10px', marginRight: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
          <button onClick={handleIdentify} disabled={!isInitialized || state.isProcessing || !state.userId}>
            {state.isProcessing ? '⏳ Identifying...' : '👤 Identify User'}
          </button>
        </div>
      </div>

      {/* Event Tracking */}
      <div>
        <h3>📈 Event Tracking</h3>
        <div className="button-group">
          <button
            onClick={() =>
              handleTrackEvent('button_clicked', {
                button_name: 'demo_button',
                page: 'demo',
                timestamp: new Date().toISOString(),
              })
            }
            disabled={!isInitialized || state.isProcessing}
          >
            {state.isProcessing ? '⏳ Tracking...' : '🖱️ Track Button Click'}
          </button>

          <button
            onClick={() =>
              handleTrackEvent('feature_used', {
                feature_name: 'demo_feature',
                category: 'engagement',
                value: Math.floor(Math.random() * 100),
              })
            }
            disabled={!isInitialized || state.isProcessing}
          >
            {state.isProcessing ? '⏳ Tracking...' : '⭐ Track Feature Usage'}
          </button>

          <button
            onClick={() =>
              handleTrackEvent('form_submitted', {
                form_name: 'contact_form',
                form_type: 'demo',
                fields_completed: 5,
              })
            }
            disabled={!isInitialized || state.isProcessing}
          >
            {state.isProcessing ? '⏳ Tracking...' : '📝 Track Form Submit'}
          </button>
        </div>
      </div>

      {/* E-commerce Tracking */}
      <div>
        <h3>💰 E-commerce Tracking</h3>
        <div className="button-group">
          <button onClick={handleTrackRevenue} disabled={!isInitialized || state.isProcessing}>
            {state.isProcessing ? '⏳ Tracking...' : '💳 Track Purchase'}
          </button>

          <button
            onClick={() =>
              handleTrackEvent('product_viewed', {
                product_id: 'demo-product-123',
                product_name: 'Demo Premium Plan',
                category: 'subscription',
                price: 99.99,
                currency: 'USD',
              })
            }
            disabled={!isInitialized || state.isProcessing}
          >
            {state.isProcessing ? '⏳ Tracking...' : '👁️ Track Product View'}
          </button>

          <button
            onClick={() =>
              handleTrackEvent('cart_item_added', {
                product_id: 'demo-product-456',
                product_name: 'Demo Add-on',
                price: 19.99,
                quantity: 1,
              })
            }
            disabled={!isInitialized || state.isProcessing}
          >
            {state.isProcessing ? '⏳ Tracking...' : '🛒 Track Add to Cart'}
          </button>
        </div>
      </div>

      {/* Navigation Tracking */}
      <div>
        <h3>📄 Page Tracking</h3>
        <div className="button-group">
          <button onClick={handleTrackPageView} disabled={!isInitialized || state.isProcessing}>
            {state.isProcessing ? '⏳ Tracking...' : '📄 Track Page View'}
          </button>

          <button
            onClick={() =>
              handleTrackEvent('section_viewed', {
                section_name: 'analytics_demo',
                page: 'demo',
                scroll_depth: Math.floor(Math.random() * 100),
              })
            }
            disabled={!isInitialized || state.isProcessing}
          >
            {state.isProcessing ? '⏳ Tracking...' : '📊 Track Section View'}
          </button>
        </div>
      </div>

      {!isInitialized && (
        <div className="status info">ℹ️ Initialize the tracking system first to test these features.</div>
      )}
    </div>
  );
};

export default TrackingDemo;
