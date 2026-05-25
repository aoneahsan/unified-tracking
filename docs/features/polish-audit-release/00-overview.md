# Polish, Audit & Release — `unified-tracking` v3.1.0

**Feature slug:** `polish-audit-release`
**Created:** 2026-05-26
**Owner:** Ahsan Mahmood (aoneahsan@gmail.com)
**Current version:** `3.0.2` → **Target version:** `3.1.0` (minor)
**Single source of resume truth:** [`00-tracker.json`](./00-tracker.json)

---

## What & Why

Polish the `unified-tracking` npm package end-to-end and ship a clean **minor** release to NPM. The work, in the user's words, is:

1. **Update every dependency to its latest _stable_ version** (the version `yarn add <pkg>` resolves to on npmjs.com — never alpha/beta/rc/next). Apply patch, minor, AND major bumps.
2. **Fix all breakage / deprecations** introduced by those updates.
3. **Deep, full-codebase audit** — find _all_ issues: functionality bugs, security issues, incomplete features / feature gaps, code-quality problems.
4. **Fix every identified issue**, one by one, as completely as possible.
5. **Update all documentation** — `Readme.md`, root + nested `CLAUDE.md`/`AGENTS.md`, `AI-INTEGRATION-GUIDE.md`, portfolio file, `CHANGELOG.md`, and `/docs`.
6. **Bump to 3.1.0**, build/test/lint clean, **publish to NPM**, push git.

## Hard Constraints (from global + project rules)

- **Package manager: `yarn` only.** Never `npm`/`pnpm` for installs. (`npm publish` is the one allowed npm use — publishing.)
- **Centralized logger** — no direct `console.*` in `src/` except inside `src/utils/logger.ts`.
- **No new automated tests** unless explicitly requested. Running existing tests as a gate is fine; fixing tests broken by our changes is fine. Do NOT expand coverage or un-skip tests just to raise numbers.
- **No dev/preview/watch servers.** Only one-shot `yarn build` / `yarn test` (vitest run) / `yarn type-check` / `yarn lint`.
- **No throwaway scripts / `scripts/` folders.** Run commands directly.
- **No hardcoded secrets.**
- **ONE git commit per session/phase** (not per file). Push after commit.
- **Honest reporting** — if a test fails or a major update is held back, say so plainly with the reason.

## Acceptance Criteria

- [ ] `yarn install` clean; `yarn.lock` updated and committed.
- [ ] Every dependency at latest stable, OR explicitly documented in the tracker why it is held back (with the blocker).
- [ ] `peerDependencies` corrected to reflect actual supported Capacitor range.
- [ ] `yarn build` → 0 errors, 0 warnings.
- [ ] `yarn type-check` → 0 errors.
- [ ] `yarn test` (vitest run) → all pass (skips only where pre-existing & documented).
- [ ] `yarn lint` → 0 errors, 0 warnings.
- [ ] Findings doc (`phase02`) lists every issue with severity; every CRITICAL/HIGH/MEDIUM is fixed or has a documented rationale for deferral.
- [ ] No direct `console.*` in `src/` outside the logger.
- [ ] Docs (README, CLAUDE/AGENTS root+nested, AI guide, portfolio, CHANGELOG, /docs) reflect v3.1.0 and current capabilities.
- [ ] Version bumped to `3.1.0` in every location (package.json, native podspec/gradle if versioned, CHANGELOG, portfolio, docs).
- [ ] `npm publish --dry-run` clean; published to NPM as `unified-tracking@3.1.0`; git pushed.

## Phases

| Phase | File                                                             | Goal                                                                              |
| ----- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| 00    | (this file + tracker)                                            | Plan + resumable tracker scaffolding                                              |
| 01    | [phase01-dependency-updates.md](./phase01-dependency-updates.md) | All deps → latest stable; fix breakage; fix peerDeps                              |
| 02    | [phase02-deep-audit.md](./phase02-deep-audit.md)                 | Full audit → prioritized findings doc (functionality / security / gaps / quality) |
| 03    | [phase03-fixes.md](./phase03-fixes.md)                           | Implement every fix from phase 02 findings                                        |
| 04    | [phase04-documentation.md](./phase04-documentation.md)           | Update all docs to v3.1.0 + current state                                         |
| 05    | [phase05-version-release.md](./phase05-version-release.md)       | Bump 3.1.0, changelog, dry-run, NPM publish, git push                             |

## Resume Contract

When this prompt is re-run:

1. Read [`00-tracker.json`](./00-tracker.json).
2. Find the **first** phase/sub-task with `status: "pending"` or `"in_progress"`.
3. Read that phase's `.md` file.
4. Invoke matching skills (RULE #0) for that phase.
5. Complete the sub-task → mark `complete` → append a `runHistory` row → bump `lastUpdated`.
6. NEVER restart from scratch. NEVER redo `complete` work.

## Package Snapshot (at kickoff, 2026-05-26)

- 65 `.ts` source files; 11 test files; 60% coverage threshold (vitest + jsdom).
- 8 analytics providers (google, firebase, amplitude, mixpanel, segment, posthog, heap, matomo) + 8 error providers (sentry, crashlytics, datadog, bugsnag, rollbar, logrocket, raygun, appcenter).
- Web/React + Capacitor (iOS Swift, Android Kotlin) native bridges.
- Build: `tsc` + Rollup. Lint: ESLint (flat) + Prettier (`@ionic/*` configs). Test: Vitest.
- Entry points: `.` (core), `./react`, `./capacitor`.
