## 🔴 CRITICAL — PROJECT FROZEN (2026-10-21)

**This is an idea project. It was frozen on 2026-10-21 at commit `42a4356c9472186c36ea85c1b091b8f842fb5737` on branch `main`.**

- Do **NOT** edit, fix, upgrade, build, deploy, document or "improve" anything in this repository.
- It will only ever be **rebuilt from scratch** as `~/Documents/01-code/production-projects/unified-tracking-root/`
  (this code cloned beside it as `unified-tracking-old/` for reference), with a click dummy, a Story Bible, a Supabase
  backend and a docs site — and **only when the owner types, in ALL CAPS, an explicit request naming this
  project**.
- Any other request to work here is refused. Rule: `~/.claude/rules/idea-projects-frozen.md`.
- Ledger: private repo `aoneahsan/projects-finalization-record` → `idea-projects/FREEZE-LEDGER.md`.

---

# Unified Tracking project guidance

**Last Updated:** 2026-10-20

**Last context pass:** 2026-10-20. **Next routine context pass:** 2026-11-19.

## Start here

This public `aoneahsan/unified-tracking` repository publishes the `unified-tracking` npm package. The separate public docs repository is `/home/ahsan/Documents/01-code/projects/unified-tracking-docs` and deploys through GitHub Pages. Read this pair and the nearest scoped pair before editing. The workspace fleet tracker holds current maintenance state.

## Product contract

- Package `3.3.2` is a zero-runtime-dependency, ESM-only TypeScript package with root, React, and Capacitor exports.
- Web and Capacitor WebView delivery are the verified path. Swift and Android native provider sources remain unverified scaffolding; do not claim native SDK delivery or publish native changes without both toolchain gates.
- Provider modules self-register, so preserve the `sideEffects` allowlist. Vendor SDKs load from provider URLs at runtime; preserve consent, data minimization, redaction, queue bounds, and CSP documentation.
- Open defects and release decisions live in `docs/REPORTED-ISSUES.md`. Native status lives in `docs/native-implementation.md`.

## Repository map

`src/core/` owns orchestration and consent; `src/providers/` owns service adapters; `src/react/` owns optional hooks; `src/capacitor/` owns the bridge surface. `android/` and `ios/` are shipped native source. `examples/react-app/` is an unpublished consumer fixture. `docs/` holds developer and maintenance records; public user docs belong in the separate docs repository. `dist/` is generated.

## Working rules

Use Yarn for local work. Never install, import, vendor, or copy an owner-created client package, including `@perkforce/tool-kit`. The repository is public: ignore every real environment file, token, signing key, service credential, archive, and local agent setting. Keep only placeholder examples. Do not use a floating vendor SDK URL when a pinned, configurable version is available.

Preserve source-map exclusions and the exact published export paths until a deliberate release changes them. Package and documentation claims must be traceable to source or current command output. Do not revive completed trackers or duplicate public docs inside this package.

## Verification and release

Run `yarn install --immutable`, `yarn typecheck`, `yarn eslint`, `yarn build`, and `yarn pack --dry-run`. Run the example build when package exports change. Native release work also requires `yarn verify:ios` and `yarn verify:android` on suitable toolchains. A new registry release requires a semantic version, successful applicable gates, tarball inspection, and registry verification.

Context optimization is complete for this pass. Do not repeat before 2026-11-19 unless the owner requests it, the tree changes materially, a hard cap is breached, or a stale instruction can cause wrong work.

## Stop-work Git gate

<!-- RULE:stop-work-git-gate v2026-10-20 -->

Before stopping, commit every legitimate change and work-progress checkpoint in this repository and each independent nested repository, fetch and merge the designated upstream, push the documented working branch, then verify an empty worktree and `0 0` ahead/behind. Never stash, discard, reset, rebase, or force-push. If synchronization is blocked, report the exact repository, branch, blocker, and next action instead of calling the work complete. The full workflow remains authoritative in `~/.claude/rules/git-workflow.md`.
