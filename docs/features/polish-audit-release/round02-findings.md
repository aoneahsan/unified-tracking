# Round 02 — Fresh Independent Re-Audit Findings

**Date:** 2026-05-26 · **Package:** `unified-tracking@3.1.0` (currently published) · **Target if fixes land:** `3.2.0`
**Method:** 3 independent agents (security / functionality / provider-gap-docs), each told NOT to read the Round 01 findings, + an independent baseline gate + manual empirical verification of the two CRITICALs.

## Headline

The fresh re-audit **found real bugs the same-day Round 01 audit missed**, including **two CRITICAL packaging/loader defects** and a **HIGH secret-logging issue**. The architecture's core dispatch, consent gate (analytics/error), privacy top-level stripping, and per-provider error isolation are genuinely solid — but the package as published has correctness problems that justify a `3.2.0`.

## Empirically verified CRITICALs (not just static analysis)

| ID               | Verified how                                                                               | Result                                                                                                                                                                                                                                                                                                                                                             |
| ---------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **C1 / FUNC-01** | `node --input-type=module -e "import('./dist/esm/src/index.js')"` after fresh `yarn build` | `ERR_MODULE_NOT_FOUND: Cannot find module '.../core/unified-tracking-core'` — **import fails on the first relative specifier**. `tsconfig` = `moduleResolution:"bundler"`, `module:"esnext"`; `package.json` = `type:"module"`, `main` → `dist/esm/src/index.js`. Emitted imports are extensionless (`from './core/unified-tracking-core'`).                       |
| **C2 / FUNC-02** | `grep "import(" dist/esm/src/providers/provider-manager.js`                                | `:80 await import(modulePath)` (runtime variable specifier) + `:70 await import('./registry')` (extensionless). Variable specifier is not statically analyzable by Vite/Rollup and fails in Node ESM → provider modules may never load → `@RegisterProvider` never runs → empty `activeProviders` → `track()/logError()` fan out to nothing and resolve "success". |

Both share a root cause and a combined fix: **`moduleResolution: NodeNext` + `.js` extensions on relative imports + a static import map for provider loading** (and/or ship the inlined Rollup bundle as the entry).

---

## Consolidated severity summary (de-duplicated)

| Severity      | Count | IDs (merged)                                                                                                                                                                                                                                                                                                  |
| ------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🔴 CRITICAL   | 2     | C1 (FUNC-01), C2 (FUNC-02)                                                                                                                                                                                                                                                                                    |
| 🟠 HIGH       | 8     | H1 (SEC-01), H2 (GAP-07), H3 (GAP-01), H4 (GAP-02), H5 (FUNC-05/GAP-03), H6 (DOC-01), H7 (DOC-02), H8 (DOC-05/GAP-08)                                                                                                                                                                                         |
| 🟡 MEDIUM     | 11    | M1 (SEC-04/FUNC-13/GAP-09), M2 (SEC-05), M3 (SEC-07/FUNC-15/DOC-07), M4 (FUNC-07), M5 (FUNC-08), M6 (FUNC-14), M7 (GAP-05), M8 (GAP-12), M9 (GAP-13), M10 (SEC-06), M11 (FUNC-06)                                                                                                                             |
| 🔵 LOW        | 19    | L1 (SEC-02/03), L2 (SEC-08), L3 (SEC-10/FUNC-11), L4 (FUNC-03), L5 (FUNC-04), L6 (FUNC-09/GAP-14), L7 (FUNC-12), L8 (GAP-04), L9 (GAP-06), L10 (GAP-10), L11 (GAP-11), L12 (DOC-03), L13 (DOC-04), L14 (DOC-06), L15 (DOC-08), L16 (FUNC-16), L17 (prettier-fail), L18 (.npmignore), L19 (setup.js plaintext) |
| ⚪ INFO/clean | —     | deepMerge proto-pollution guard ✅, localStorage persistence hardened ✅, native bridge no insecure surface ✅, weak-random fallback OK ✅, dep audit clean (0 CVEs, 0 runtime deps) ✅, no eval/innerHTML ✅                                                                                                 |

Dependency audit: `yarn npm audit --all --recursive` → **clean**. Secrets scan → **0 committed credentials**. Zero runtime dependencies (strongest security property).

---

## CRITICAL

### C1 — Published ESM is unimportable in pure Node ESM (FUNC-01) · FIX

Extensionless relative imports + `type:module` + `moduleResolution:bundler`. Breaks SSR/edge/Node consumers and node-env tests. Bundler consumers (Vite/webpack) tolerate it, masking the bug.
**Fix:** `tsconfig` → `moduleResolution:"NodeNext"`, `module:"NodeNext"`; add `.js` to every relative import in `src/`; rebuild; re-run the Node-ESM import test as a gate.

### C2 — Provider auto-loading via variable dynamic import → silent no-op (FUNC-02) · FIX

`provider-manager.ts` builds `./analytics/${folder}/${file}.provider` at runtime and `await import()`s it. Not statically analyzable → provider module may be absent from the bundle / unresolvable → registry stays empty → all tracking silently dispatches to nothing. Tests mock `loadProvider`, so this was never exercised.
**Fix:** Replace with a **static import map** of literal specifiers (`{ google: () => import('./analytics/google-analytics/google-analytics.provider.js'), ... }`). Statically analyzable, tree-shakeable, deterministic decorator registration. Pairs with C1's extension fix.

---

## HIGH

### H1 — Provider secrets logged in cleartext (SEC-01) · FIX

8 providers call `logger.info('… initialized', { token/apiKey/accessToken/appSecret/writeKey/clientToken })`. `logger.info/debug` pass args straight to `console.*`; `Logger.redact()` is only applied at 2 call sites, not in the sink. When a consumer raises log level / enables debug, raw credentials print to console (CWE-532).
Files: mixpanel:142, rollbar:204, appcenter:208, bugsnag:164, posthog:172, raygun:190, datadog:144, segment:117.
**Fix:** apply `Logger.redact()` **inside** the logger sink methods (`.map(redact)` over args) so every call is covered; extend `SENSITIVE_KEY` to include `accessToken`, `appSecret`, `writeKey`, `clientToken`, `appId`/`appID`, `measurementId`. This also fixes L1 (PII in debug logs).

### H2 — `definitions.ts` public config keys don't match what providers read (GAP-07) · FIX **[verified]**

Type-clean configs silently fail at runtime:

- **Matomo** `definitions` `siteId:string, url` → provider reads `siteId:number, trackerUrl` (throws "siteId and trackerUrl required").
- **PostHog** `host, featureFlags:boolean, sessionRecording:boolean` → provider reads `apiHost, featureFlags:Record, sessionRecording:{enabled…}`.
- **Segment** `integrations` → provider reads `enabledIntegrations`.
- **LogRocket** `appId` → provider reads `appID` (throws "app ID is required").
- **GA** `customMetrics` declared, never read.
  **Fix (non-breaking):** make providers accept the documented key as an alias (`trackerUrl ?? url`, `apiHost ?? host`, `enabledIntegrations ?? integrations`, `appID ?? appId`) AND correct the `definitions.ts` types to the real shape (keep aliases optional). Coerce `siteId` to number.

### H3 — Breadcrumbs from public API never reach any SDK (GAP-01) · FIX

`BaseErrorTrackingProvider.addBreadcrumb()` only pushes to an internal array; it never calls `doAddBreadcrumb()`, and nothing replays `context.breadcrumbs` at capture (Sentry `doLogError` ignores them). Advertised feature that silently drops data.
**Fix:** base `addBreadcrumb()` calls `this.doAddBreadcrumb?.()`; declare `doAddBreadcrumb` on the base/interface; Sentry `doLogError` replays `context.breadcrumbs` into `scope.addBreadcrumb`.

### H4 — Firebase Crashlytics provider can't work on web (GAP-02) · FIX(doc/disable)

Loads `gstatic.com/firebasejs/10.7.2/firebase-crashlytics.js` — **no such web SDK exists** (Crashlytics is native-only). Always 404s → never initializes; native isn't wired either (H8). Yet listed as a supported provider.
**Fix:** mark `crashlytics` as native-only/not-yet-functional in code (clear init warning) + remove from the "works today" provider list in docs/keywords.

### H5 — EventQueue / batching / offline buffering is inert (FUNC-05 / GAP-03) · DECISION NEEDED

`eventQueue.add()` is never called; `EventQueue.start()` never invoked; `addEventForProvider()` never called. So documented "event batching" + "offline storage" + pre-init buffering **do nothing**; events before a provider is ready are lost. `EventQueue` is a public export.
**Two options (needs user call):**

- **(A) Wire it up** — buffer events in core when `!initialized`/provider-not-ready, drain on init/register; honor `settings.batching`. Real feature, bigger effort + must fix M11 (retry/dedupe/order bugs).
- **(B) Trim honestly** — keep `EventQueue` export but stop advertising batching/offline as working (or schedule removal for a major); document accurately.

### H6 — `docs/api-reference.md` documents an entirely non-existent API (DOC-01) · DOC

Wrong config shape (array `analytics:[{id,config}]`), a `<UnifiedTrackingProvider>`, 7 fake hooks (`useIdentifyUser`, `useScreenView`, `useRevenueTracking`, `useConsent`, `useErrorTracking`, `useFeatureFlags`, …), 5 fake HOCs, wrong result field names. **Fix:** rewrite to the real 2-hook / object-config API (mirror `AI-INTEGRATION-GUIDE.md`).

### H7 — `docs/react-integration.md` documents a deleted Provider/context/HOC API (DOC-02) · DOC

`UnifiedTrackingProvider`, `useTracking`, `usePageTracking`, `useErrorBoundary`, `withTracking`, `MockTrackingProvider`, Jest examples — none exist. **Fix:** replace with real `useUnifiedTracking` + `useTrackEvent`.

### H8 — `docs/native-implementation.md` + keywords/badge overclaim native SDKs (DOC-05 / GAP-08) · DOC

Native iOS = `echo()`+stubs (~69 TODOs, 0 SDK imports); Android = only Firebase real, rest stubs; `registerCapacitorPlugin` registers **only `web`** so even real Android Firebase is unreachable. But `native-implementation.md` claims fully-working SDK bridges, Pod/SPM, a JS→native method table. Violates the repo's own "never describe unimplemented features as available" rule.
**Fix:** rewrite `native-implementation.md` to "scaffolding, not yet wired" (match README note); qualify `keywords`/README badge.

---

## MEDIUM

- **M1 — ConsentSettings divergence + marketing/personalization not enforced (SEC-04/FUNC-13/GAP-09) · FIX.** Two different `ConsentSettings` shapes exported (`definitions` vs `types/provider`); dispatch gate only honors `analytics`/`errorTracking`. Collapse to one canonical open interface; document which categories actually gate dispatch (analytics + errorTracking) vs which map to provider-native consent only.
- **M2 — `anonymizeIp` / `dataRetentionDays` defaulted ON but inert (SEC-05) · FIX or DOC.** Global `privacy.anonymizeIp:true` is never read; only GA's own `anonymizeIp` (default false) acts. Wire global into providers (GA `anonymize_ip`, Matomo) or remove + stop documenting as active.
- **M3 — CDN script loads lack SRI; "zero deps"/MV3 misleading; stale pins (SEC-07/FUNC-15/DOC-07) · FIX+DOC.** 14/15 loaders have no `integrity`/`crossOrigin` (Sentry does). Add SRI + pinned versions where the URL is immutable; document CDN-load model + CSP allowlist + "not MV3-extension compatible". Sentry pinned 7.99 (current 9.x) — note as maintenance drift.
- **M4 — Capacitor adapter never invoked; `addListener` double-registers + leaks (FUNC-07) · FIX or DEFER.** `registerCapacitorPlugin` has 0 call sites; `addListener` registers on both core and `super` (WebPlugin) but `remove()` only detaches core → leak; `remove()` promise not awaited. Delegate to shared singleton + drop the `super` registration, or keep the adapter out of the public story.
- **M5 — Multiple `UnifiedTrackingCore` instances (FUNC-08) · FIX.** `src/index.ts`/hooks use `getUnifiedTracking()` singleton; `capacitor/index.ts` does `new UnifiedTrackingCore()`. Init via the Capacitor instance leaves the hook's core `initialized:false` → `track()` throws. Make all paths delegate to the singleton.
- **M6 — `useUnifiedTracking()` returns unstable reference each render (FUNC-14) · FIX.** New object + fresh `.bind()` per render → effect churn / loops when used in deps. `useMemo(()=>({…}),[])` with module-scope binds (mirror the correct `useTrackEvent`).
- **M7 — Firebase & Amplitude bypass `BaseAnalyticsProvider` (GAP-05) · FIX.** They `implements` the interface directly → ignore `superProperties`, lack timed events, weaker `isReady`; CLAUDE.md falsely says they extend the base. Refactor to extend the base + implement `doXxx()`. (This is the Round-01 deferred phase03.7 — now backed by a concrete behavior gap.)
- **M8 — GA4 consent default `granted` before consent known (GAP-12) · FIX.** Default GA Consent Mode to `denied`, then `update` from `defaultConsent` (GDPR posture).
- **M9 — Amplitude/AppCenter SDK script URLs broken (GAP-13) · FIX.** Amplitude loads a `.js.gz` as `<script src>` and reads `window.amplitudeAnalytics` (real global `window.amplitude`); AppCenter `appcenter.ms/sdk/js/latest` isn't a real web SDK CDN. Fix URLs/globals or document "bring your own SDK on `window`".
- **M10 — `excludedProperties` stripping is shallow (SEC-06) · FIX or DOC.** Top-level exact-match delete only; nested `{user:{email}}` not stripped; shallow copy shares nested refs. Recurse + deep-clone, or document top-level-only.
- **M11 — EventQueue retry/dedupe/ordering bugs (FUNC-06) · FIX only if H5=A.** Batch re-queued to all listeners on one failure (duplicate delivery); `unshift` inverts order; `id` never used to dedupe. Latent until the queue is wired.

---

## LOW (selected; full list in summary table)

- **L1 (SEC-02/03)** PII in debug logs — fixed by H1 sink redaction.
- **L2 (SEC-08)** allowlist the dynamic-import provider name (defense-in-depth; mostly resolved by C2 static map).
- **L3 (SEC-10/FUNC-11)** validate `setUserProperties`/`setConsent` inputs; `setConsent` skips `ensureInitialized()`; pre-init `setConsent` is clobbered by `defaultConsent` deep-merge in `loadConfig`.
- **L4 (FUNC-03)** orphan `dist/plugin.js` Rollup bundle never referenced — wire into `exports` or drop the Rollup step.
- **L5 (FUNC-04)** `*.test.js` + `test-setup.js` compiled into published `dist/` — exclude via `tsconfig.build.json`.
- **L6 (FUNC-09/GAP-14)** dead `loadProviders()` + `getProviderManager()`.
- **L7 (FUNC-12)** no public teardown; `reset()` leaves providers registered + listeners attached.
- **L8 (GAP-04)** no unified `flush()`.
- **L9 (GAP-06)** `reset()`/`setDebugMode` not on `Provider` interface (duck-typed `as any`).
- **L10 (GAP-10)** `addListener` typed `(event:unknown)`/`PluginListenerHandle`; real is `EventData`/`{remove}`.
- **L11 (GAP-11)** `any` leaks across public base classes (`base.ts`, `setExtraContext(any)`, `startTransaction():any`).
- **L12 (DOC-03)** `setup-guide.md` wrong config + fake Provider + incomplete provider list.
- **L13 (DOC-04)** `migration-guide.md` wrong config + broken `logScreenView({})`/`logRevenue({price})` examples.
- **L14 (DOC-06)** README links to non-existent `docs/api/README.md`, `docs/README.md`, Discord, etc.
- **L15 (DOC-08)** README "Custom Providers" snippet won't compile (missing `version`/`supportedPlatforms`/imports).
- **L16 (FUNC-16)** provider `doInitialize` touches `document`/`window` with no SSR guard (contained by try/catch, but provider silently absent server-side).
- **L17 (prettier-fail)** shipped tree fails `yarn prettier --check` on `src/providers/AGENTS.md` + `CLAUDE.md` → full `yarn lint` is red. `yarn fmt`.
- **L18 (.npmignore)** `.npmignore` ignores `bin/`+`docs/` while `package.json#files` allowlists `bin/` — npm honors `files`; reconcile/remove `.npmignore` to avoid confusion.
- **L19 (setup.js)** `bin/setup.js` writes provider keys into a plaintext `unified-tracking.config.js` — add a `.gitignore` reminder + suggest env vars.

---

## Verified solid (checked, no action)

Core fan-out **error isolation** (per-provider `.catch`, `Promise.all`, no unhandled rejections); **init fail-open** with `warnings` surfaced; **consent gate** for analytics/errorTracking at dispatch (only explicit `false` denies; re-enable scoped by provider type); **privacy top-level stripping** non-mutating; **logger** default `warn`, doesn't patch global console, `redact()` recursive + correct; **input validation** on `track/identify/logScreenView/logRevenue`; **deepMerge** prototype-pollution guard (all depths); **localStorage** persistence fully guarded + capped (1000); **weak-random** prefers `crypto.randomUUID`; **native bridge** exposes no insecure surface, manifest requests only INTERNET + ACCESS_NETWORK_STATE; **dependency audit** clean, **zero runtime deps**, **no committed secrets**, **no `eval`/`innerHTML`/`document.write`**. `useTrackEvent` hook is correct (`useCallback([])`).

---

## Proposed fix plan → `phase07` batches (security/correctness first)

| Batch       | Theme                                    | Findings                                                                                                                                      | Risk                                        |
| ----------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| **7.1**     | **CRITICAL build/loader**                | C1 + C2 (+ L4 orphan bundle, L5 tests-in-dist) — NodeNext + `.js` extensions + static import map; add Node-ESM import smoke check to the gate | Touches every import + build; highest value |
| **7.2**     | **Security**                             | H1 (logger sink redaction, +L1), M3 SRI (+pin), L2, L19                                                                                       | Low                                         |
| **7.3**     | **Config-key correctness**               | H2 (provider aliases + `definitions` types), M9 (Amplitude/AppCenter URLs), M8 (GA consent default)                                           | Low–med                                     |
| **7.4**     | **Error-provider + privacy correctness** | H3 breadcrumbs, H4 crashlytics, M1 consent unify, M2 anonymizeIp, M10 excludedProperties deep-strip                                           | Med                                         |
| **7.5**     | **Engine/React correctness**             | M5 single core, M6 hook memo, M4 capacitor adapter, L3 validation/guards, L7 teardown, M7 Firebase/Amplitude base-class (the old phase03.7)   | Med (M7 has regression risk)                |
| **7.6**     | **EventQueue**                           | H5 (per user decision A/B) + M11 if A                                                                                                         | Med–high if A                               |
| **7.7**     | **Types/cleanup**                        | L6, L8, L9, L10, L11, L16, L18, prettier (L17)                                                                                                | Low                                         |
| **phase08** | **Docs**                                 | H6, H7, H8, L12, L13, L14, L15, M3-doc, DOC-07 + nested CLAUDE/AGENTS + portfolio                                                             | Low                                         |

**Release recommendation:** the CRITICAL + HIGH findings make a `3.2.0` clearly warranted (not npm churn). All planned fixes preserve the public API (config-key changes are additive aliases; consent unify is additive) → minor bump is correct. Gate behind full `type-check + build + test + lint + Node-ESM import smoke + npm pack review` and confirm `3.2.0` intent before the irreversible publish.
