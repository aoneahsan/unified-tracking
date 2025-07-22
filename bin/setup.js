#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// ANSI color codes for better terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`),
  subtitle: (msg) => console.log(`${colors.bright}${msg}${colors.reset}`),
};

class UnifiedTrackingSetup {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    this.projectRoot = process.cwd();
    this.config = {
      analytics: [],
      errorTracking: [],
      consent: {
        enabled: false,
        defaultConsent: {
          analytics: true,
          errorTracking: true,
          marketing: false,
          personalization: false,
        },
      },
      debug: false,
      autoInitialize: true,
    };

    this.availableProviders = {
      analytics: {
        'google-analytics': {
          name: 'Google Analytics',
          requiredFields: ['measurementId'],
          optionalFields: ['debugMode', 'sendPageView', 'customParameters'],
          description: 'Google Analytics 4 (GA4) for web analytics',
        },
        mixpanel: {
          name: 'Mixpanel',
          requiredFields: ['token'],
          optionalFields: ['debugMode', 'persistence', 'apiHost', 'trackAutomaticEvents'],
          description: 'Mixpanel for advanced product analytics',
        },
        segment: {
          name: 'Segment',
          requiredFields: ['writeKey'],
          optionalFields: ['apiHost', 'integrations', 'trackAutomaticEvents'],
          description: 'Segment for customer data platform',
        },
        posthog: {
          name: 'PostHog',
          requiredFields: ['apiKey'],
          optionalFields: ['apiHost', 'autocapture', 'sessionRecording', 'featureFlags'],
          description: 'PostHog for product analytics and feature flags',
        },
        amplitude: {
          name: 'Amplitude',
          requiredFields: ['apiKey'],
          optionalFields: ['serverUrl', 'batchEvents', 'trackAutomaticEvents'],
          description: 'Amplitude for digital product analytics',
        },
        firebase: {
          name: 'Firebase Analytics',
          requiredFields: ['apiKey', 'authDomain', 'projectId', 'appId'],
          optionalFields: ['measurementId', 'debugMode'],
          description: 'Firebase Analytics for mobile and web apps',
        },
      },
      errorTracking: {
        sentry: {
          name: 'Sentry',
          requiredFields: ['dsn'],
          optionalFields: ['environment', 'release', 'tracesSampleRate', 'replaysSessionSampleRate'],
          description: 'Sentry for error tracking and performance monitoring',
        },
        bugsnag: {
          name: 'Bugsnag',
          requiredFields: ['apiKey'],
          optionalFields: ['appVersion', 'releaseStage', 'autoDetectErrors'],
          description: 'Bugsnag for error monitoring and stability management',
        },
        rollbar: {
          name: 'Rollbar',
          requiredFields: ['accessToken'],
          optionalFields: ['environment', 'codeVersion', 'captureUncaught'],
          description: 'Rollbar for real-time error tracking',
        },
        datadog: {
          name: 'DataDog RUM',
          requiredFields: ['clientToken', 'applicationId'],
          optionalFields: ['site', 'service', 'env', 'version', 'sessionReplaySampleRate'],
          description: 'DataDog Real User Monitoring for full-stack observability',
        },
        logrocket: {
          name: 'LogRocket',
          requiredFields: ['appID'],
          optionalFields: ['release', 'shouldCaptureIP', 'captureExceptions'],
          description: 'LogRocket for session replay and error tracking',
        },
      },
    };
  }

  async prompt(question) {
    return new Promise((resolve) => {
      this.rl.question(question, resolve);
    });
  }

  async confirmPrompt(question, defaultValue = true) {
    const defaultText = defaultValue ? 'Y/n' : 'y/N';
    const answer = await this.prompt(`${question} (${defaultText}): `);

    if (answer.toLowerCase() === '') {
      return defaultValue;
    }

    return answer.toLowerCase().startsWith('y');
  }

  async selectFromList(title, options, allowMultiple = false) {
    log.subtitle(title);

    const optionKeys = Object.keys(options);
    optionKeys.forEach((key, index) => {
      const option = options[key];
      console.log(
        `${colors.dim}${index + 1}.${colors.reset} ${option.name} - ${colors.dim}${option.description}${colors.reset}`,
      );
    });

    if (allowMultiple) {
      console.log(
        `${colors.dim}Enter numbers separated by commas (e.g., 1,3,5) or press Enter to skip:${colors.reset}`,
      );
    } else {
      console.log(`${colors.dim}Enter the number of your choice or press Enter to skip:${colors.reset}`);
    }

    const answer = await this.prompt('> ');

    if (!answer.trim()) {
      return allowMultiple ? [] : null;
    }

    if (allowMultiple) {
      const selections = answer.split(',').map((n) => parseInt(n.trim()) - 1);
      return selections.filter((i) => i >= 0 && i < optionKeys.length).map((i) => optionKeys[i]);
    } else {
      const selection = parseInt(answer) - 1;
      return selection >= 0 && selection < optionKeys.length ? optionKeys[selection] : null;
    }
  }

  async configureProvider(providerId, providerConfig) {
    log.subtitle(`Configuring ${providerConfig.name}`);

    const config = {};

    // Configure required fields
    for (const field of providerConfig.requiredFields) {
      let value;
      do {
        value = await this.prompt(`Enter ${field} (required): `);
        if (!value.trim()) {
          log.error(`${field} is required`);
        }
      } while (!value.trim());
      config[field] = value.trim();
    }

    // Configure optional fields
    if (providerConfig.optionalFields.length > 0) {
      const configureOptional = await this.confirmPrompt('Configure optional settings?', false);

      if (configureOptional) {
        for (const field of providerConfig.optionalFields) {
          const value = await this.prompt(`Enter ${field} (optional): `);
          if (value.trim()) {
            // Try to parse as JSON for complex fields
            try {
              if (value.includes('{') || value.includes('[') || value === 'true' || value === 'false') {
                config[field] = JSON.parse(value);
              } else if (!isNaN(value)) {
                config[field] = parseFloat(value);
              } else {
                config[field] = value.trim();
              }
            } catch {
              config[field] = value.trim();
            }
          }
        }
      }
    }

    return { id: providerId, config };
  }

  async detectProjectType() {
    const packageJsonPath = path.join(this.projectRoot, 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
      return null;
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    // Detect project type based on dependencies
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

    if (dependencies['@capacitor/core']) {
      return 'capacitor';
    } else if (dependencies['react'] || dependencies['react-dom']) {
      return 'react';
    } else if (dependencies['@angular/core']) {
      return 'angular';
    } else if (dependencies['vue']) {
      return 'vue';
    } else if (dependencies['svelte']) {
      return 'svelte';
    } else {
      return 'javascript';
    }
  }

  async installDependencies() {
    log.info('Installing unified-tracking...');

    try {
      // Detect package manager
      const hasYarn = fs.existsSync(path.join(this.projectRoot, 'yarn.lock'));
      const hasNpm = fs.existsSync(path.join(this.projectRoot, 'package-lock.json'));

      const packageManager = hasYarn ? 'yarn' : 'npm';
      const installCommand = packageManager === 'yarn' ? 'yarn add' : 'npm install';

      execSync(`${installCommand} unified-tracking`, {
        cwd: this.projectRoot,
        stdio: 'inherit',
      });

      log.success('Dependencies installed successfully');
      return true;
    } catch (error) {
      log.error(`Failed to install dependencies: ${error.message}`);
      return false;
    }
  }

  generateConfigFile() {
    const configContent = `// Unified Tracking Configuration
// Generated by unified-tracking setup script

export const unifiedTrackingConfig = ${JSON.stringify(this.config, null, 2)};

export default unifiedTrackingConfig;
`;

    const configPath = path.join(this.projectRoot, 'unified-tracking.config.js');
    fs.writeFileSync(configPath, configContent);
    log.success(`Configuration file created: ${configPath}`);
  }

  generateExampleUsage(projectType) {
    const examples = {
      react: `// React Integration Example
import React from 'react';
import { UnifiedTrackingProvider } from 'unified-tracking/react';
import { unifiedTrackingConfig } from './unified-tracking.config';

function App() {
  return (
    <UnifiedTrackingProvider 
      config={unifiedTrackingConfig}
      onError={(error) => console.error('Tracking error:', error)}
    >
      <YourApp />
    </UnifiedTrackingProvider>
  );
}

// Usage in components
import { useTrackEvent, useIdentifyUser } from 'unified-tracking/react';

function MyComponent() {
  const { trackEvent } = useTrackEvent();
  const { identifyUser } = useIdentifyUser();

  const handleClick = () => {
    trackEvent('button_click', { button: 'header_cta' });
  };

  const handleLogin = (user) => {
    identifyUser(user.id, { email: user.email, name: user.name });
  };

  return (
    <button onClick={handleClick}>
      Track This Click
    </button>
  );
}
`,
      capacitor: `// Capacitor Integration Example
import { UnifiedTracking } from 'unified-tracking';
import { unifiedTrackingConfig } from './unified-tracking.config';

// Initialize in your main app file
async function initializeApp() {
  try {
    const result = await UnifiedTracking.initialize(unifiedTrackingConfig);
    console.log('Tracking initialized:', result);
  } catch (error) {
    console.error('Failed to initialize tracking:', error);
  }
}

// Track events
UnifiedTracking.track('screen_view', { screen: 'home' });
UnifiedTracking.identify('user123', { email: 'user@example.com' });
UnifiedTracking.logError(new Error('Something went wrong'));
`,
      javascript: `// JavaScript Integration Example
import { UnifiedTracking } from 'unified-tracking';
import { unifiedTrackingConfig } from './unified-tracking.config';

// Initialize tracking
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await UnifiedTracking.initialize(unifiedTrackingConfig);
    console.log('Tracking initialized');
  } catch (error) {
    console.error('Failed to initialize tracking:', error);
  }
});

// Track page views
UnifiedTracking.logScreenView(window.location.pathname);

// Track user interactions
document.querySelectorAll('button').forEach(button => {
  button.addEventListener('click', (e) => {
    UnifiedTracking.track('button_click', {
      button_text: e.target.textContent,
      page: window.location.pathname
    });
  });
});
`,
    };

    const exampleContent = examples[projectType] || examples.javascript;
    const examplePath = path.join(this.projectRoot, 'unified-tracking-example.js');

    fs.writeFileSync(examplePath, exampleContent);
    log.success(`Example usage file created: ${examplePath}`);
  }

  async run() {
    try {
      log.title('🚀 Unified Tracking Setup');

      log.info('Welcome to Unified Tracking setup!');
      log.info('This tool will help you configure analytics and error tracking for your project.');

      // Detect project type
      const projectType = await this.detectProjectType();
      if (projectType) {
        log.info(`Detected project type: ${projectType}`);
      }

      // Install dependencies
      const installDeps = await this.confirmPrompt('Install unified-tracking package?', true);
      if (installDeps) {
        const installed = await this.installDependencies();
        if (!installed) {
          log.error('Setup cannot continue without installing dependencies');
          return;
        }
      }

      // Configure analytics providers
      log.title('📊 Analytics Configuration');
      const analyticsProviders = await this.selectFromList(
        'Select analytics providers:',
        this.availableProviders.analytics,
        true,
      );

      for (const providerId of analyticsProviders) {
        const providerConfig = this.availableProviders.analytics[providerId];
        const config = await this.configureProvider(providerId, providerConfig);
        this.config.analytics.push(config);
      }

      // Configure error tracking providers
      log.title('🐛 Error Tracking Configuration');
      const errorProviders = await this.selectFromList(
        'Select error tracking providers:',
        this.availableProviders.errorTracking,
        true,
      );

      for (const providerId of errorProviders) {
        const providerConfig = this.availableProviders.errorTracking[providerId];
        const config = await this.configureProvider(providerId, providerConfig);
        this.config.errorTracking.push(config);
      }

      // Configure consent management
      log.title('🔒 Privacy & Consent Configuration');
      const enableConsent = await this.confirmPrompt('Enable consent management (GDPR compliance)?', false);
      if (enableConsent) {
        this.config.consent.enabled = true;

        log.subtitle('Default consent settings:');
        this.config.consent.defaultConsent.analytics = await this.confirmPrompt('Allow analytics by default?', true);
        this.config.consent.defaultConsent.errorTracking = await this.confirmPrompt(
          'Allow error tracking by default?',
          true,
        );
        this.config.consent.defaultConsent.marketing = await this.confirmPrompt('Allow marketing by default?', false);
        this.config.consent.defaultConsent.personalization = await this.confirmPrompt(
          'Allow personalization by default?',
          false,
        );
      }

      // Other configuration options
      log.title('⚙️ General Configuration');
      this.config.debug = await this.confirmPrompt('Enable debug mode?', false);
      this.config.autoInitialize = await this.confirmPrompt('Auto-initialize on app start?', true);

      // Generate configuration files
      this.generateConfigFile();

      if (projectType) {
        this.generateExampleUsage(projectType);
      }

      // Summary
      log.title('✅ Setup Complete!');
      log.success('Unified Tracking has been configured successfully.');
      log.info('');
      log.info('Next steps:');
      log.info('1. Review the generated configuration file: unified-tracking.config.js');
      log.info('2. Check the example usage file: unified-tracking-example.js');
      log.info('3. Import and initialize the tracking in your app');
      log.info('');
      log.info('For more information, visit: https://github.com/your-org/unified-tracking');
    } catch (error) {
      log.error(`Setup failed: ${error.message}`);
    } finally {
      this.rl.close();
    }
  }
}

// Run the setup
const setup = new UnifiedTrackingSetup();
setup.run().catch(console.error);
