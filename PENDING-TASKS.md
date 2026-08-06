# Pending tasks — {proj}

> Fixed path: `PENDING-TASKS.md` at the repo root. Global spec: `~/.claude/rules/pending-tasks.md`.
> Read at session start, **indexed** — grep `^### TASK-`, read only overlapping blocks.
> Completed entries move to [`docs/DONE-TASKS.md`](./docs/DONE-TASKS.md). **Last updated:** 2026-08-06

## ⏳ Open

### TASK-001 — Bring the session-start context layer inside budget

- **Source:** `~/.claude/rules/context-budget.md`; gate `measure-project-context.sh`
- **Why:** root `CLAUDE.md` is 24,838 B and auto-loads into **every** session here (cap 28,672 B). Measured 2026-08-06.
- **Scope:** `CLAUDE.md` + its `AGENTS.md` mirror (global-rule duplicates → one-line pointers,
  project detail → `docs/`); over-long `PENDING-TASKS.md` entries trimmed to the ~500 B format.
- **Applies when:** `when touching CLAUDE.md`, else the next substantive session
- **Added:** 2026-08-06
- <!-- TASK:context-budget-project-layer v2026-08-06 -->

## ✅ Done

Completed entries live in [`docs/DONE-TASKS.md`](./docs/DONE-TASKS.md). Nothing is deleted.
