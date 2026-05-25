# Phase 03 — Implement Fixes

**Goal:** Work through every finding from `phase02-findings.md`, fixing issues one by one, best-possible and complete (no TODOs, no placeholders).

**Skills:** per-fix domain — `simplify`, `react-best-practices`, `capacitor-best-practices`, `security-review`, `analytics-tracking`.

## Working method

- Fixes are populated from `phase02-findings.md` once the audit completes. Each finding → a tracker sub-task under `phase03`.
- Order: **CRITICAL → HIGH → MEDIUM → LOW**, security before cosmetic.
- After each logical group, run the verification gate: `yarn type-check && yarn build && yarn test && yarn lint`.
- Keep changes backward-compatible (this is a **minor** release — no breaking public API changes). New optional config/behavior is fine; removing/renaming public exports is not.

## Expected fix buckets (pre-audit hypothesis — confirm/replace in phase02)

1. **Logger compliance** — replace direct `console.*` in `react/hooks.ts` + `segment.provider.ts` with logger/error-callback. Add `no-console` ESLint guard if not present.
2. **Input validation** — guard public API (`track`, `identify`, `logRevenue`, `logScreenView`, `initialize`) against bad input; never throw raw into consumer apps.
3. **Script-injection hardening** — validate config-derived URLs/ids before DOM insertion; ensure load-failure handling + cleanup; no user string → script src without validation.
4. **localStorage privacy** — cap queue size, optional disable, redact known-sensitive keys; document behavior.
5. **Error-handling robustness** — wrap SDK calls; fail-open per provider so one bad provider can't break tracking.
6. **React hooks correctness** — deps arrays, cleanup, SSR guards.
7. **Type/feature completeness** — tighten public types; document platform-specific provider availability.
8. **Dead code / duplication** — remove unused, lift shared logic to base classes.

## Gate to exit Phase 03

- All non-deferred findings resolved.
- Full verification gate green.
- No `TODO`/`FIXME`/"coming soon" in `src/`.
