import { registerPlugin } from '@capacitor/core';

import type { UnifiedTrackingPlugin } from './definitions';

const UnifiedTracking = registerPlugin<UnifiedTrackingPlugin>('UnifiedTracking', {
  web: () => import('./web').then((m) => new m.UnifiedTrackingWeb()),
});

export * from './definitions';
export { UnifiedTracking, UnifiedTrackingPlugin };
