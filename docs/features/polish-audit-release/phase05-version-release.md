# Phase 05 — Version Bump + NPM Release

**Goal:** Bump to `3.1.0`, finalize changelog, verify everything, publish to NPM, push git.

**Skills:** `release` (release flow), `git-commit`.

## Version bump checklist (every location)

- [ ] `package.json` → `"version": "3.1.0"`
- [ ] `CHANGELOG.md` → `3.1.0` entry (date 2026-05-26-ish), grouped: Dependencies / Fixes / Security / Docs.
- [ ] `CLAUDE.md` + `AGENTS.md` version + history rows.
- [ ] Portfolio file version + history.
- [ ] Native version strings IF versioned: `UnifiedTracking.podspec` (`s.version`), `android/build.gradle` if it carries a version, `Package.swift` (usually unversioned). Check each; only change real version fields.
- [ ] `grep -rE '3\.0\.2' .` (excluding node_modules/dist/.git/yarn.lock) → confirm no stale version strings remain that should be 3.1.0.

## Pre-publish gate (all must pass)

1. `yarn install` clean.
2. `yarn type-check` → 0 errors.
3. `yarn build` → 0 warnings/errors; `dist/` emits ESM + d.ts for `.`, `./react`, `./capacitor`.
4. `yarn test` → all pass.
5. `yarn lint` → 0 warnings/errors.
6. Inspect publish contents: `npm pack --dry-run` (or `yarn pack`) — confirm `files` allowlist is correct (dist, native sources, bin, AI guide) and nothing secret/bloated is included.
7. `npm publish --dry-run` → clean.

## Publish

- Auth: `npm whoami` must return `aoneahsan` (token in `~/.claude/rules/publishing-compliance.md` if needed).
- `npm publish` (public). Package is already public on npm; this is a normal version publish.
- Verify: `npm view unified-tracking version` → `3.1.0`.

> **Publish is irreversible.** User pre-authorized release ("release that on NPM and let me know"). Still run `--dry-run` first and report contents before the real publish. This is the final phase; treat it as the gated last step.

## Git

- ONE commit for the release (or per-phase commits across sessions per the ONE-commit-per-prompt rule — each session that completes a phase commits that phase).
- Commit msg: conventional, e.g. `chore(release): unified-tracking v3.1.0 — deps to latest, audit fixes, docs`.
- `git pull --rebase origin main` → resolve → `git push origin main`. Confirm in sync.
- Co-author trailer: `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`.

## Done

- NPM shows 3.1.0; git pushed; tracker fully `complete`; tell the user it's released.
