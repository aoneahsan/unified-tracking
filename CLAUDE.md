# unified-tracking Package

**Package Name**: `unified-tracking`
**Version**: `3.0.2`
**NPM**: `https://www.npmjs.com/package/unified-tracking`
**Last Updated**: `2026-03-25`

Unified analytics and error tracking infrastructure for React, web, and Capacitor apps with provider-based integrations, consent controls, React hooks, and cross-platform delivery targets.

## Current Verified State

- Reviewed on: `2026-03-25`
- Install: `yarn install` passed
- Build: `yarn build` passed cleanly
- Typecheck: `yarn type-check` passed
- Tests: `yarn test` passed
  - `268` tests passed
  - `2` tests skipped

## Implemented Feature Areas

| Area                     | Scope                                                                                                           |
| ------------------------ | --------------------------------------------------------------------------------------------------------------- |
| Unified core API         | Event tracking, user identification, revenue logging, screen tracking, consent handling, provider orchestration |
| Analytics providers      | Google Analytics, Mixpanel, Segment, PostHog, Amplitude, Firebase, Heap, Matomo                                 |
| Error tracking providers | Sentry, Bugsnag, Rollbar, LogRocket, Raygun, DataDog RUM, AppCenter, Firebase Crashlytics                       |
| React integration        | Hooks, context helpers, HOC support, provider-free usage patterns                                               |
| Platform support         | Web entrypoint plus optional Capacitor integration for iOS and Android                                          |
| Tooling                  | Setup CLI, generated distribution exports, package-level build/test/typecheck workflows                         |

## Package Structure

```text
src/
  core/
  providers/
    analytics/
    error-tracking/
  react/
  capacitor/
  utils/
  web.ts
android/
ios/
docs/
bin/
```

## Working Rules

- Keep docs aligned with the actual package version and verified repo state.
- Use `yarn` as the only documented package manager workflow for this package.
- Do not use `npm`, `pnpm`, or `package-lock.json` in this repository. Use `yarn install` for dependency installation.
- When providers, exports, supported surfaces, or operational status change, update `Readme.md`, this file, and the root portfolio file in the same pass.
- Do not describe this package as uninitialized or in planning; it is implemented and published.
- Document known build or test issues honestly in user-facing project docs until they are fixed.

## Root Portfolio File Maintenance Rule

- Maintain exactly one current root portfolio info file for this package.
- File naming format: `UNIFIED-TRACKING_portfolio-info_YYYY-MM-DD.md`
- Refresh the portfolio file only after at least 7 days have passed unless a major release or material capability change happens sooner.
- Keep at most 10 update-history records inside the portfolio file.
- When the portfolio file changes, update `Readme.md` and this `CLAUDE.md` in the same pass.

## Documentation Surface

- Core README: `/Readme.md`
- API and setup docs: `/docs`
- AI agent usage guide: `/AI-INTEGRATION-GUIDE.md`
- Release/readiness notes: `/IMPLEMENTATION_COMPLETE.md`, `/VALIDATION_COMPLETE.md`, `/RELEASE_READY.md`

## Package Update History

| Date       | Version | Notes                                                                                                                                                             |
| ---------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-03-25 | 3.0.2   | Fixed provider-manager/web/google-analytics test failures, removed the fragile docgen step from default build, and refreshed docs with current green verification |
| 2026-03-24 | 3.0.2   | Refreshed docs, recorded current verification status, added root portfolio maintenance rule                                                                       |
| 2026-02-02 | unknown | Full update to latest versions, build passed, lint had known issues                                                                                               |

## Comprehensive Audit Record

| Date       | Audit Type               | Status                    | Issues Found | Issues Resolved |
| ---------- | ------------------------ | ------------------------- | ------------ | --------------- |
| 2026-03-25 | Issue Remediation        | Passed with minor warning | 4            | 4               |
| 2026-03-24 | Portfolio + Docs Refresh | Passed with issues        | 3            | 0               |
| 2026-02-02 | Package Update           | Passed with issues        | 2            | 0               |
| 2026-01-23 | Full Audit               | Passed with issues        | 2            | 0               |

### Last Audit Details

- Package Manager: yarn confirmed, `yarn install` used for verification
- Dependencies: no dependency upgrade was performed in this pass
- Build: passes cleanly; `docgen` was moved out of the default build path
- TypeScript: passes
- Tests: passing in current pass
- Features: implemented package surface is substantial and reflected in docs

### Next Audit Due: 2026-04-01
