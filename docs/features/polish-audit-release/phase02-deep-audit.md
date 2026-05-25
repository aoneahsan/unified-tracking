# Phase 02 — Deep Codebase Audit

**Goal:** A full, deep audit of the codebase. Identify **all** issues across functionality, security, incomplete features/gaps, and code quality. Output a single prioritized findings doc (`phase02-findings.md`) that drives Phase 03.

**Skills:** `security-review` (vuln methodology), `analytics-tracking` (event-model / consent correctness), `simplify` (quality/dead-code), `capacitor-best-practices` (native bridge), `react-best-practices` (hooks), `vitest` (test gaps).

## Audit dimensions

### 2.1 — Security audit (security-review Steps 2–6)

- **Dependency CVEs:** `yarn npm audit` (yarn 4) — record advisories.
- **Secrets:** confirm no hardcoded API keys/tokens/DSNs in `src/`; verify keys live only in user-supplied config types.
- **Remote script injection:** 15+ providers inject `<script>` to load vendor SDKs. This is _by design_ for web analytics (gtag, amplitude, etc.). Audit for: (a) URL construction from unsanitized user config, (b) missing error handling on load failure, (c) whether config values flow into the DOM unsafely. Recommend hardening (validate config-supplied URLs/ids), do NOT rip out script loading.
- **localStorage:** `event-queue.ts` persists queued events (may contain user IDs/props/error messages) in plaintext under `unified_tracking_queue`. Assess exposure; consider opt-out / size cap / sensitive-field redaction.
- **Input validation:** validate public API inputs (event names, properties, revenue amounts, config) at boundaries.
- **XSS sinks:** confirm no `eval`, `innerHTML`, `dangerouslySetInnerHTML`, `new Function`. (Explore: none found — verify.)
- **Consent/privacy:** verify consent gating actually pauses providers; `privacy.excludedProperties` is enforced; data-minimization respected.

### 2.2 — Functionality audit

- **Logger violations:** direct `console.*` in `src/react/hooks.ts` (≈ lines 42,135,227,441) and `src/providers/analytics/segment/segment.provider.ts` (≈134-135). Route through logger / error callbacks.
- **Error-handling paths:** swallowed errors, unhandled promise rejections, init failures, missing try/catch around SDK calls.
- **Event flow correctness:** init guard, consent checks, provider fan-out, listener notification, reset behavior.
- **React hooks:** dependency arrays, stale closures, effect cleanup, SSR-safety (`window`/`document` guards).
- **Capacitor bridge:** parity between web core and native expectations; listener registration; error propagation.
- **Skipped tests (3):** segment (script-load failure; init w/o window.analytics), mixpanel (group analytics) — determine if they mark real gaps. Per "no new tests" rule, only act if they reveal a real bug to fix in source.

### 2.3 — Feature-gap audit

- **Provider parity:** web vs iOS (Swift) vs Android (Kotlin) — which providers exist on each platform; document gaps honestly.
- **Documented-vs-implemented:** every provider/feature claimed in README/types is actually implemented (or clearly marked platform-specific).
- **Type completeness:** public config types match what each provider reads; no `any` leaks in public API; exhaustive provider unions.
- **Missing capabilities:** e.g. mixpanel `timeEvent` referenced in tests as not implemented — decide include or document.

### 2.4 — Code-quality audit (simplify)

- Dead/unused code & exports, duplication across providers (extract to base classes), naming/consistency, file size (<500 lines), TODO/FIXME/"coming soon" (must be zero), `peerDependenciesMeta` correctness, barrel-export hygiene.

## Output: `phase02-findings.md`

Each finding: `ID | category | severity (CRITICAL/HIGH/MEDIUM/LOW/INFO) | file:line | description | proposed fix | confidence`. Group by category. This list becomes Phase 03's checklist (mirrored into tracker sub-tasks).
