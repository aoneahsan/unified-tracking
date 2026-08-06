# Project rules & implementation records — unified-tracking

> Project-specific rules and implementation records, lifted out of `CLAUDE.md` on 2026-08-06 so the
> session-start context layer stays inside its 28,672 B budget (`~/.claude/rules/context-budget.md`).
> **Nothing here is global law** — that lives in `~/.claude/rules/` and is linked from `CLAUDE.md`.
> Each section keeps the heading it had in `CLAUDE.md`. Read the one that names the area you are working on.
>
> **Last updated:** 2026-08-06

---

## CLAUDE.md + AGENTS.md Sync Rule (IRON-SOLID)

**Every important rule MUST exist in BOTH `CLAUDE.md` AND `AGENTS.md` at each level.**

- When adding or updating a rule in one file, ALWAYS update the other
- This applies to root and ALL nested files in every folder
- Never add a rule to just `CLAUDE.md` or just `AGENTS.md` — always both
- Create reasonable nested `CLAUDE.md` and `AGENTS.md` files in all important folders where rules will improve development results

---

## Portfolio Info File — Weekly Update Rule

- Canonical portfolio info file: `/home/ahsan/Documents/ahsan-notebook/static/assets/personal/projects-info-as-portfolio-item/packages/UNIFIED-TRACKING_portfolio-info_<YYYY-MM-DD>.md`
- Update at least once per week (and on any material change). Keep the last-updated date in the filename.
- Keep a max-10-entry update history inside the file. On each refresh: prepend today's row, delete the previous dated file, write the new one.
- Tracker: `/home/ahsan/Documents/01-code/docs/tracking/portfolio-info-files-update-tracker.json`
- Last applied: 2026-06-05
- Note: a now-stale in-repo copy (`UNIFIED-TRACKING_portfolio-info_2026-05-27.md`) predates the move to the canonical ahsan-notebook location; the ahsan-notebook file is authoritative.
