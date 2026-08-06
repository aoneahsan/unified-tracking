# Completed tasks — unified-tracking

> History for [`PENDING-TASKS.md`](../PENDING-TASKS.md). Fixed path: `docs/DONE-TASKS.md`.
> Never auto-read, never grepped by a hook, never truncated. Global spec:
> `~/.claude/rules/pending-tasks.md`. **Last updated:** 2026-08-06

## ✅ Done

### DONE-001 — Bring the session-start context layer inside budget — 2026-08-06

<!-- TASK:context-budget-project-layer v2026-08-06 -->

- **Source:** `~/.claude/rules/context-budget.md`; gate `measure-project-context.sh`
- **Why:** root `CLAUDE.md` was 24,838 B and auto-loads into **every** session here (cap 28,672 B). Measured 2026-08-06.
- **Scope:** `CLAUDE.md` + its `AGENTS.md` mirror (global-rule duplicates → one-line pointers,
  project detail → `docs/`); over-long `PENDING-TASKS.md` entries trimmed to the ~500 B format.
- **Added:** 2026-08-06 · **Done:** 2026-08-06 — landed in the context-budget pass: seven fleet-copy
  sections deleted in favour of the pointer table, two project-knowledge sections (CLAUDE/AGENTS sync
  rule, portfolio-info weekly rule) moved to [`docs/PROJECT-RULES.md`](./PROJECT-RULES.md),
  `CLAUDE.md` 24,838 → 22,306 B and `AGENTS.md` 15,171 → 12,848 B. The package-specific AGENTS.md
  sections (Build & Test Commands, Module Exports, Pre-Publish Testing Requirements, Example App, …)
  were left untouched.
