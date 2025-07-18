import { BaseErrorTrackingProvider } from '../../base-error-tracking-provider';
import { RegisterProvider } from '../../registry';
import type { ProviderConfig, ProviderType, ConsentSettings } from '../../../types/provider';
import type { ErrorContext } from '../../../definitions';

interface FirebaseCrashlyticsConfig extends ProviderConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
  measurementId?: string;
  crashlyticsCollectionEnabled?: boolean;
  automaticDataCollectionEnabled?: boolean;
  userId?: string;
  customKeys?: Record<string, string>;
  customAttributes?: Record<string, any>;
}

interface FirebaseApp {
  options: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId: string;
    measurementId?: string;
  };
}

interface FirebaseCrashlytics {
  log: (message: string) => void;
  recordError: (error: Error) => void;
  recordException: (error: Error) => void;
  setUserId: (userId: string) => void;
  setCustomKey: (key: string, value: string | number | boolean) => void;
  setCustomKeys: (keys: Record<string, string | number | boolean>) => void;
  setAttribute: (key: string, value: string) => void;
  setAttributes: (attributes: Record<string, string>) => void;
  setCrashlyticsCollectionEnabled: (enabled: boolean) => void;
  sendUnsentReports: () => void;
  deleteUnsentReports: () => void;
  didCrashOnPreviousExecution: () => boolean;
  checkForUnsentReports: () => Promise<boolean>;
}

interface FirebaseSDK {
  initializeApp: (config: any, name?: string) => FirebaseApp;
  getApps: () => FirebaseApp[];
  getApp: (name?: string) => FirebaseApp;
  crashlytics: {
    getCrashlytics: (app?: FirebaseApp) => FirebaseCrashlytics;
  };
}

declare global {
  interface Window {
    firebase?: FirebaseSDK;
  }
}

@RegisterProvider({
  id: 'firebase-crashlytics',
  name: 'Firebase Crashlytics',
  type: 'error-tracking' as ProviderType,
  version: '1.0.0',
  supportedPlatforms: ['web', 'ios', 'android'],
  configSchema: {
    apiKey: { type: 'string', required: true },
    authDomain: { type: 'string', required: true },
    projectId: { type: 'string', required: true },
    appId: { type: 'string', required: true },
    storageBucket: { type: 'string' },
    messagingSenderId: { type: 'string' },
    measurementId: { type: 'string' },
    crashlyticsCollectionEnabled: { type: 'boolean', default: true },
    automaticDataCollectionEnabled: { type: 'boolean', default: true },
  },
})
export class FirebaseCrashlyticsProvider extends BaseErrorTrackingProvider {
  readonly id = 'firebase-crashlytics';
  readonly name = 'Firebase Crashlytics';
  readonly version = '1.0.0';

  private firebase?: FirebaseSDK;
  private crashlytics?: FirebaseCrashlytics;
  private firebaseApp?: FirebaseApp;
  private crashlyticsConfig: FirebaseCrashlyticsConfig | null = null;
  private scriptLoaded = false;

  protected async doInitialize(config: FirebaseCrashlyticsConfig): Promise<void> {
    if (!config.apiKey || !config.authDomain || !config.projectId || !config.appId) {
      throw new Error('Firebase configuration requires apiKey, authDomain, projectId, and appId');
    }

    this.crashlyticsConfig = config;

    // Load Firebase SDK
    await this.loadFirebaseSDK();

    if (!window.firebase) {
      throw new Error('Failed to load Firebase SDK');
    }

    this.firebase = window.firebase;

    // Initialize Firebase app
    const firebaseConfig = {
      apiKey: config.apiKey,
      authDomain: config.authDomain,
      projectId: config.projectId,
      storageBucket: config.storageBucket,
      messagingSenderId: config.messagingSenderId,
      appId: config.appId,
      measurementId: config.measurementId,
    };

    // Check if app already exists
    try {
      this.firebaseApp = this.firebase.getApp();
    } catch (error) {
      // App doesn't exist, initialize it
      this.firebaseApp = this.firebase.initializeApp(firebaseConfig);
    }

    // Initialize Crashlytics
    this.crashlytics = this.firebase.crashlytics.getCrashlytics(this.firebaseApp);

    // Configure Crashlytics
    if (config.crashlyticsCollectionEnabled !== undefined) {
      this.crashlytics.setCrashlyticsCollectionEnabled(config.crashlyticsCollectionEnabled);
    }

    // Set initial custom keys and attributes
    if (config.customKeys) {
      this.crashlytics.setCustomKeys(config.customKeys);
    }

    if (config.customAttributes) {
      this.crashlytics.setAttributes(config.customAttributes);
    }

    if (config.userId) {
      this.crashlytics.setUserId(config.userId);
    }

    this.logger.info('Firebase Crashlytics initialized successfully', {
      projectId: config.projectId,
      appId: config.appId,
      crashlyticsCollectionEnabled: config.crashlyticsCollectionEnabled,
    });
  }

  private async loadFirebaseSDK(): Promise<void> {
    if (this.scriptLoaded || window.firebase) {
      return;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js';
      script.async = true;

      script.onload = async () => {
        // Load Crashlytics module
        const crashlyticsScript = document.createElement('script');
        crashlyticsScript.src = 'https://www.gstatic.com/firebasejs/10.7.2/firebase-crashlytics.js';
        crashlyticsScript.async = true;

        crashlyticsScript.onload = () => {
          this.scriptLoaded = true;
          resolve();
        };

        crashlyticsScript.onerror = () => {
          reject(new Error('Failed to load Firebase Crashlytics SDK'));
        };

        document.head.appendChild(crashlyticsScript);
      };

      script.onerror = () => {
        reject(new Error('Failed to load Firebase SDK'));
      };

      document.head.appendChild(script);
    });
  }

  protected async doShutdown(): Promise<void> {
    this.crashlytics = undefined;
    this.firebaseApp = undefined;
    this.firebase = undefined;
    this.crashlyticsConfig = null;
    this.scriptLoaded = false;
  }

  protected async doUpdateConsent(consent: ConsentSettings): Promise<void> {
    if (!this.crashlytics) return;

    if (consent.errorTracking === false) {
      this.crashlytics.setCrashlyticsCollectionEnabled(false);
      this.setEnabled(false);
      this.logger.info('Firebase Crashlytics disabled by consent');
    } else if (consent.errorTracking === true) {
      this.crashlytics.setCrashlyticsCollectionEnabled(true);
      this.setEnabled(true);
      this.logger.info('Firebase Crashlytics enabled by consent');
    }
  }

  protected async doLogError(error: Error, context: ErrorContext): Promise<void> {
    if (!this.crashlytics) {
      throw new Error('Firebase Crashlytics not initialized');
    }

    // Set user context
    if (context.user?.id) {
      this.crashlytics.setUserId(context.user.id);
    }

    // Set custom attributes
    if (context.tags) {
      this.crashlytics.setAttributes(context.tags);
    }

    // Set extra context as custom keys
    if (context.extra) {
      const customKeys: Record<string, string | number | boolean> = {};
      Object.entries(context.extra).forEach(([key, value]) => {
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          customKeys[key] = value;
        } else {
          customKeys[key] = JSON.stringify(value);
        }
      });
      this.crashlytics.setCustomKeys(customKeys);
    }

    // Add breadcrumbs as log messages
    if (context.breadcrumbs) {
      context.breadcrumbs.forEach((breadcrumb) => {
        this.crashlytics!.log(`[${breadcrumb.category}] ${breadcrumb.message}`);
      });
    }

    // Log error message as breadcrumb
    this.crashlytics.log(`Error: ${error.message}`);

    // Record the error
    this.crashlytics.recordError(error);
  }

  protected async doLogMessage(message: string, level: 'debug' | 'info' | 'warning'): Promise<void> {
    if (!this.crashlytics) {
      throw new Error('Firebase Crashlytics not initialized');
    }

    // Log message as breadcrumb
    this.crashlytics.log(`[${level}] ${message}`);
  }

  protected doSetUserContext(user: Record<string, any>): void {
    if (!this.crashlytics) return;

    if (user.id) {
      this.crashlytics.setUserId(user.id);
    }

    // Set user properties as custom attributes
    const userAttributes: Record<string, string> = {};
    Object.entries(user).forEach(([key, value]) => {
      if (key !== 'id' && value !== undefined) {
        userAttributes[`user_${key}`] = String(value);
      }
    });

    if (Object.keys(userAttributes).length > 0) {
      this.crashlytics.setAttributes(userAttributes);
    }
  }

  protected doSetExtraContext(key: string, value: any): void {
    if (!this.crashlytics) return;

    let customValue: string | number | boolean;
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      customValue = value;
    } else {
      customValue = JSON.stringify(value);
    }

    this.crashlytics.setCustomKey(key, customValue);
  }

  protected doSetTags(tags: Record<string, string>): void {
    if (!this.crashlytics) return;

    this.crashlytics.setAttributes(tags);
  }

  protected async doCaptureException(exception: Error, context: ErrorContext): Promise<void> {
    if (!this.crashlytics) {
      throw new Error('Firebase Crashlytics not initialized');
    }

    // Set context before recording exception
    await this.doLogError(exception, context);

    // Record exception
    this.crashlytics.recordException(exception);
  }

  protected async doProviderReset(): Promise<void> {
    if (!this.crashlytics) return;

    // Firebase Crashlytics doesn't have a direct reset method
    // We can clear the user ID and send unsent reports
    this.crashlytics.setUserId('');
    this.crashlytics.sendUnsentReports();
  }

  protected doSetDebugMode(enabled: boolean): void {
    if (enabled) {
      this.logger.debug('Firebase Crashlytics debug mode enabled');
    }
  }

  /**
   * Send any unsent crash reports
   */
  async sendUnsentReports(): Promise<void> {
    if (!this.crashlytics) return;

    this.crashlytics.sendUnsentReports();
  }

  /**
   * Delete any unsent crash reports
   */
  async deleteUnsentReports(): Promise<void> {
    if (!this.crashlytics) return;

    this.crashlytics.deleteUnsentReports();
  }

  /**
   * Check if the app crashed on the previous execution
   */
  didCrashOnPreviousExecution(): boolean {
    if (!this.crashlytics) return false;

    return this.crashlytics.didCrashOnPreviousExecution();
  }

  /**
   * Check for unsent crash reports
   */
  async checkForUnsentReports(): Promise<boolean> {
    if (!this.crashlytics) return false;

    return this.crashlytics.checkForUnsentReports();
  }

  /**
   * Set a custom key-value pair
   */
  setCustomKey(key: string, value: string | number | boolean): void {
    if (!this.crashlytics) return;

    this.crashlytics.setCustomKey(key, value);
  }

  /**
   * Set multiple custom key-value pairs
   */
  setCustomKeys(keys: Record<string, string | number | boolean>): void {
    if (!this.crashlytics) return;

    this.crashlytics.setCustomKeys(keys);
  }

  /**
   * Set a custom attribute
   */
  setAttribute(key: string, value: string): void {
    if (!this.crashlytics) return;

    this.crashlytics.setAttribute(key, value);
  }

  /**
   * Set multiple custom attributes
   */
  setAttributes(attributes: Record<string, string>): void {
    if (!this.crashlytics) return;

    this.crashlytics.setAttributes(attributes);
  }

  /**
   * Enable or disable crash collection
   */
  setCrashlyticsCollectionEnabled(enabled: boolean): void {
    if (!this.crashlytics) return;

    this.crashlytics.setCrashlyticsCollectionEnabled(enabled);
  }
}