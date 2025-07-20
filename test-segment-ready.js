// Test if ready method exists on SegmentAnalyticsProvider
import { SegmentAnalyticsProvider } from './src/providers/analytics/segment/segment.provider.js';

const provider = new SegmentAnalyticsProvider();
console.log('Provider instance:', provider);
console.log('ready method exists:', 'ready' in provider);
console.log('ready is function:', typeof provider.ready === 'function');
console.log('Methods on provider:', Object.getOwnPropertyNames(Object.getPrototypeOf(provider)).filter(m => m.includes('ready')));