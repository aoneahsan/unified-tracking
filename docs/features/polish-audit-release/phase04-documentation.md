# Phase 04 — Documentation Update

**Goal:** Bring all documentation in line with v3.1.0 and the polished/audited state. Accurate, honest, complete.

**Skills:** `documentation-writer` / `technical-writing` (structure), `copywriting` (only if marketing copy needed — keep factual).

## Files to update

| File                                                                                     | Update                                                                                                                                                       |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Readme.md`                                                                              | Version, provider matrix (web/iOS/Android parity), install, quick start, consent/privacy, new hardening behavior, examples that compile against current API. |
| `CLAUDE.md` (root)                                                                       | Version → 3.1.0, "Current Verified State" (build/test/lint dates + counts), update history row, audit record row, "Last Updated".                            |
| `AGENTS.md` (root)                                                                       | Mirror CLAUDE.md changes (sync rule).                                                                                                                        |
| `src/CLAUDE.md` + `src/AGENTS.md`                                                        | Any new conventions (logger enforcement, validation helpers).                                                                                                |
| `src/core/`, `src/providers/`, `src/react/` nested CLAUDE/AGENTS                         | Reflect changes made in those dirs.                                                                                                                          |
| `docs/` nested CLAUDE/AGENTS + content                                                   | Keep API/setup docs accurate.                                                                                                                                |
| `AI-INTEGRATION-GUIDE.md`                                                                | Verify examples match current exports/signatures.                                                                                                            |
| `CHANGELOG.md`                                                                           | Add `3.1.0` entry (deps, fixes, audit, docs).                                                                                                                |
| `UNIFIED-TRACKING_portfolio-info_YYYY-MM-DD.md`                                          | Refresh (rename to today if >7 days), keep ≤10 history records.                                                                                              |
| Status docs (`IMPLEMENTATION_COMPLETE.md`, `VALIDATION_COMPLETE.md`, `RELEASE_READY.md`) | Update or note current; don't fabricate.                                                                                                                     |

## Rules

- **CLAUDE.md + AGENTS.md sync** — every rule/change in both, root + nested.
- Don't describe the package as planned/uninitialized — it's published & mature.
- Document known limitations honestly (e.g. native provider parity gaps, plaintext queue trade-offs).
- Provider names/keywords in `package.json` must match what actually ships.
- Keep CLAUDE.md < 40k chars.

## Gate

Docs reviewed for accuracy against the actual shipped code; version strings consistent everywhere (cross-check in phase05).
