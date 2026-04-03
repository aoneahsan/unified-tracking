# unified-tracking Package

**Package Name**: `unified-tracking`
**Version**: `3.0.2`
**NPM**: `https://www.npmjs.com/package/unified-tracking`
**Last Updated**: `2026-04-03`

Unified analytics and error tracking infrastructure for React, web, and Capacitor apps with provider-based integrations, consent controls, React hooks, and cross-platform delivery targets.

## Current Verified State

- Reviewed on: `2026-03-25`
- Install: `yarn install` passed
- Build: `yarn build` passed cleanly
- Typecheck: `yarn type-check` passed
- Tests: `yarn test` passed (`268` passed, `2` skipped)

## CLAUDE.md + AGENTS.md Sync Rule (IRON-SOLID)

**Every important rule MUST exist in BOTH `CLAUDE.md` AND `AGENTS.md` at each level.**
- When adding or updating a rule in one file, ALWAYS update the other
- This applies to root and ALL nested files in every folder
- Never add a rule to just `CLAUDE.md` or just `AGENTS.md` — always both
- Create reasonable nested `CLAUDE.md` and `AGENTS.md` files in all important folders where rules will improve development results

## CLAUDE.md + AGENTS.md Update Frequency (IRON-SOLID)

**ALL `CLAUDE.md` and `AGENTS.md` files MUST be reviewed and updated at least once every 3 days.**
- On every session start, check `Last Updated` dates across all project files
- If any file is >3 days stale, update it BEFORE proceeding with other work
- Stale instruction files directly degrade development quality
- Every file must have a `Last Updated` date field

## Claude Code Agents (MANDATORY - IRON-SOLID)

**For EVERY prompt and task, Claude Code MUST use agents (Task tool) to deliver the best possible experience.**
- Use **Explore agent** for codebase search, file discovery, understanding architecture
- Use **Plan agent** for implementation planning, architecture decisions
- Use **general-purpose agent** for complex multi-step tasks, parallel processing
- Launch multiple agents in parallel when tasks are independent
- Use Explore agent before making changes to unfamiliar code
- Use Plan agent before implementing non-trivial features

## Implemented Feature Areas

| Area | Scope |
|------|-------|
| Unified core API | Event tracking, user identification, revenue logging, screen tracking, consent handling, provider orchestration |
| Analytics providers | Google Analytics, Mixpanel, Segment, PostHog, Amplitude, Firebase, Heap, Matomo |
| Error tracking providers | Sentry, Bugsnag, Rollbar, LogRocket, Raygun, DataDog RUM, AppCenter, Firebase Crashlytics |
| React integration | Hooks, context helpers, HOC support, provider-free usage patterns |
| Platform support | Web entrypoint plus optional Capacitor integration for iOS and Android |
| Tooling | Setup CLI, generated distribution exports, package-level build/test/typecheck workflows |

## Privacy & Compliance

- GDPR compliant with consent management built into provider orchestration
- Data minimization — only collect what providers are configured to track
- Consent updates toggle providers on/off dynamically via `updateConsent()`

## Critical Working Rules

- Use `yarn` exclusively. No `npm`, `pnpm`, or `package-lock.json`.
- Keep docs aligned with actual package version and verified repo state.
- Do not describe this package as uninitialized or in planning; it is implemented and published.
- Document known build or test issues honestly until fixed.
- When providers, exports, or operational status change, update `Readme.md`, this file, and the portfolio file in the same pass.
- Test framework: **Vitest** (NEVER Jest). Build: **Rollup + tsc**. Lint: **ESLint + Prettier**.

## Root Portfolio File Maintenance Rule

- Maintain exactly one current root portfolio info file: `UNIFIED-TRACKING_portfolio-info_YYYY-MM-DD.md`
- Refresh only after 7+ days unless major release or material capability change.
- Keep at most 10 update-history records inside the portfolio file.
- When the portfolio file changes, update `Readme.md` and this `CLAUDE.md` in the same pass.

## Nested Instruction Files

Domain-specific rules live in nested `CLAUDE.md` + `AGENTS.md` files to optimize context usage:

| Location | Scope |
|----------|-------|
| `src/` | Source conventions, imports, path aliases, TypeScript rules |
| `src/core/` | Core engine architecture, event flow, singletons |
| `src/providers/` | Provider architecture, base classes, adding/testing providers |
| `src/react/` | React hooks, context, HOC patterns |
| `docs/` | Documentation structure, update rules, API docs |
| `android/` | Android native build, Kotlin/Java patterns |
| `ios/` | iOS native build, Swift patterns, CocoaPods/SPM |

## Documentation Surface

- Core README: `/Readme.md`
- API and setup docs: `/docs`
- AI agent usage guide: `/AI-INTEGRATION-GUIDE.md`
- Release/readiness notes: `/IMPLEMENTATION_COMPLETE.md`, `/VALIDATION_COMPLETE.md`, `/RELEASE_READY.md`

## Package Update History

| Date | Version | Notes |
|------|---------|-------|
| 2026-03-25 | 3.0.2 | Fixed provider-manager/web/google-analytics test failures, removed fragile docgen from default build |
| 2026-03-24 | 3.0.2 | Refreshed docs, recorded current verification status, added portfolio maintenance rule |
| 2026-02-02 | unknown | Full update to latest versions, build passed, lint had known issues |

## Comprehensive Audit Record

| Date | Audit Type | Status | Issues Found | Resolved |
|------|-----------|--------|-------------|----------|
| 2026-03-25 | Issue Remediation | Passed with minor warning | 4 | 4 |
| 2026-03-24 | Portfolio + Docs Refresh | Passed with issues | 3 | 0 |
| 2026-02-02 | Package Update | Passed with issues | 2 | 0 |
| 2026-01-23 | Full Audit | Passed with issues | 2 | 0 |

### Last Audit Details

- Package Manager: yarn confirmed
- Build: passes cleanly; `docgen` moved out of default build path
- TypeScript: passes
- Tests: passing
- Features: implemented surface is substantial and reflected in docs

### Next Audit Due: 2026-04-07
