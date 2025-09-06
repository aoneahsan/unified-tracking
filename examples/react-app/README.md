# Unified Tracking React Example

This is a comprehensive example React application that demonstrates how to use the `unified-tracking` plugin in a React web application.

## Features Demonstrated

- ✅ **Plugin Initialization** - Setting up unified-tracking with configuration
- 📊 **Analytics Tracking** - Event tracking, user identification, revenue tracking
- 🐛 **Error Tracking** - Error logging with context and breadcrumbs
- 🎣 **React Hooks** - Using `useUnifiedTracking` hook in components
- ⚙️ **Configuration Management** - Dynamic configuration and provider management
- 🛡️ **Privacy Controls** - Consent management and privacy settings
- 📝 **Real-time Logging** - Interactive log viewer for all operations

## Quick Start

1. **Install dependencies:**

   ```bash
   # From the example directory
   npm install
   ```

2. **Start the development server:**

   ```bash
   npm run dev
   ```

3. **Open your browser:**
   - Navigate to `http://localhost:3000`
   - Open developer tools (F12) to see tracking calls

## What You'll See

### 🚀 Initialization Section

- Initialize the unified-tracking plugin
- View current configuration
- See active providers

### 📊 Analytics Tracking Section

- **User Identification**: Associate events with specific users
- **Event Tracking**: Track button clicks, feature usage, form submissions
- **E-commerce Tracking**: Track purchases, product views, cart actions
- **Page Tracking**: Track page views and section views

### 🐛 Error Tracking Section

- **Context Management**: Set user context, custom context, breadcrumbs
- **Error Simulation**: Test different types of errors (JavaScript, Network, React)
- **Custom Errors**: Log custom error messages with rich context
- **React Error Boundaries**: Simulate React component errors

### ⚙️ Configuration Panel

- View the complete configuration object
- Test consent management
- Get system status and active providers
- Real-time provider information

### 📝 Activity Log

- Real-time log of all tracking operations
- Color-coded log entries with icons
- Copy logs to clipboard
- Clear log history

## Configuration

The example uses a demo configuration:

```typescript
{
  analytics: {
    providers: ['google-analytics'],
    googleAnalytics: {
      measurementId: 'G-DEMO', // Replace with your actual ID
    }
  },
  errorTracking: {
    providers: [], // Add your error tracking providers
  },
  privacy: {
    respectDoNotTrack: true,
    anonymizeIp: true,
    cookieConsent: true,
  },
  debug: true
}
```

### Adding Real Providers

To test with real analytics providers:

1. **Google Analytics:**
   - Replace `G-DEMO` with your actual Measurement ID
   - Include the gtag script in `index.html`

2. **Mixpanel:**
   - Add your Mixpanel token to the configuration
   - Include the Mixpanel SDK

3. **Sentry (Error Tracking):**
   - Add your Sentry DSN to the configuration
   - Include the Sentry SDK

4. **Other Providers:**
   - Follow the unified-tracking documentation for each provider

## Code Structure

```
src/
├── components/
│   ├── TrackingDemo.tsx      # Analytics tracking examples
│   ├── ErrorTrackingDemo.tsx # Error tracking examples
│   ├── ConfigurationPanel.tsx # Configuration management
│   └── LogViewer.tsx         # Real-time activity log
├── App.tsx                   # Main application component
└── main.tsx                  # React entry point
```

## Key React Patterns

### Using the Hook

```typescript
import { useUnifiedTracking } from 'unified-tracking/react';

function MyComponent() {
  const { trackEvent, identify, logError } = useUnifiedTracking();

  const handleClick = async () => {
    await trackEvent('button_clicked', {
      button_name: 'demo_button',
      component: 'MyComponent'
    });
  };

  return <button onClick={handleClick}>Track Me!</button>;
}
```

### Error Handling

```typescript
try {
  // Your application code
} catch (error) {
  await logError(error, {
    component: 'MyComponent',
    user_action: 'button_click',
    additional_context: 'Any relevant data',
  });
}
```

### User Identification

```typescript
// When user logs in
await identify('user-123', {
  email: 'user@example.com',
  name: 'John Doe',
  plan: 'premium',
});
```

## Browser Developer Tools

Open your browser's developer console to see:

- **Network Tab**: Actual HTTP requests to analytics providers
- **Console**: Debug logs from unified-tracking (when debug: true)
- **Application Tab**: Local storage data and cookies
- **Performance Tab**: Impact of tracking on page performance

## Troubleshooting

### No tracking calls visible?

- Check that providers are properly configured
- Ensure debug mode is enabled
- Verify provider SDKs are loaded
- Check console for error messages

### Hook errors?

- Ensure unified-tracking is initialized before using hooks
- Check that React version is 19.0.0 or higher
- Verify the plugin is properly installed

### Provider not working?

- Check provider-specific configuration
- Ensure required SDKs are included in index.html
- Verify API keys/tokens are correct
- Check network requests in developer tools

## Next Steps

1. **Add Real Providers**: Replace demo configuration with real provider credentials
2. **Customize Events**: Modify tracking calls to match your application's events
3. **Add Privacy Controls**: Implement user-facing privacy controls
4. **Test Error Handling**: Add real error boundary components
5. **Performance Testing**: Test with realistic data volumes

## Learn More

- 📖 [Unified Tracking Documentation](../../docs/README.md)
- 🎣 [React Hooks Guide](../../docs/react-integration.md)
- ⚙️ [Configuration Reference](../../docs/api/interfaces/configuration-interfaces.md)
- 🚀 [Migration Guide](../../docs/migration-guide.md)
