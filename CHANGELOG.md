# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-08-02

### 🚨 BREAKING CHANGES

#### Removed Provider Pattern

- **BREAKING**: Removed React Context/Provider requirement. The package now works without providers!
- **BREAKING**: React hooks must now be imported from `unified-tracking/react` instead of the main package
- **BREAKING**: Removed `UnifiedTrackingProvider` component - no longer needed

#### Migration Required

```typescript
// Before (v1.x)
import { UnifiedTrackingProvider, useTrackEvent } from 'unified-tracking';

<UnifiedTrackingProvider config={config}>
  <App />
</UnifiedTrackingProvider>

// After (v2.0)
import { UnifiedTracking } from 'unified-tracking';
import { useTrackEvent } from 'unified-tracking/react';

// Initialize once
UnifiedTracking.initialize(config);
// Use hooks anywhere - no provider needed!
```

### ✨ New Features

- **Zero Dependencies**: Package now has no runtime dependencies
- **Provider-less Architecture**: Works in dynamically injected components without setup
- **Multiple Entry Points**:
  - `unified-tracking` - Core functionality
  - `unified-tracking/react` - React hooks
  - `unified-tracking/capacitor` - Capacitor integration
- **Optional Dependencies**: All dependencies (React, Capacitor) are now optional
- **ESM Only**: Removed CommonJS builds for smaller bundle size

### 🐛 Bug Fixes

- Fixed circular dependency between main package and React integration
- Fixed test files being included in production build
- Removed console warnings when Capacitor is not available

### 📦 Package Changes

- Minimum Node.js version: 18.0.0
- React peer dependency: >=16.8.0 (optional)
- Capacitor peer dependency: ^7.4.2 (optional)

### 📚 Documentation

- Updated README with provider-less examples
- Added migration guide from v1.x
- Improved TypeScript documentation

## [1.5.0] - Previous Release

[Previous changelog entries...]
