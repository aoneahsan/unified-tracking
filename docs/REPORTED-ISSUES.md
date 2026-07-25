# Reported issues — unified-tracking

Open issues only. When one is fixed, **move** the entry to `RESOLVED-ISSUES.md` with the date and the fixing
version — never delete it.

Greppable: every open entry starts with `### ISSUE-`.

**Last Updated:** 2026-07-25

---

### ISSUE-001 — No CommonJS build; the package is ESM-only

- **Symptom:** `require('unified-tracking')` fails with `ERR_PACKAGE_PATH_NOT_EXPORTED` —
  `No "exports" main defined` (verified against the installed tarball, 2026-07-25; note it is _not_
  `ERR_REQUIRE_ESM`, because the `exports` map declares no `require` condition at all). Any consumer on a CommonJS
  toolchain (older Jest transforms, a CJS Node service, some bundler configs) cannot load the package without
  switching to a dynamic `import()`.
- **Affected version:** all 3.x, including `3.3.0`.
- **Where:** `package.json` — `"type": "module"`, and the `exports` map declares only `types` + `import`, no
  `require` condition. The build is a single `tsc -p tsconfig.build.json` emitting ESM to `dist/esm/`.
- **Deviation from standard:** the house npm-package contract calls for dual ESM + CJS output with real
  `.d.ts` for each. This package ships ESM only.
- **Root cause:** the build was never set up to emit a second CJS target.
- **Suggested fix:** add a CJS output (a second `tsc` pass or a bundler such as `tsup`), emit it as `.cjs`
  because `"type": "module"` makes `.js` ESM, then add a `require` condition to each `exports` subpath and set
  `main` to the CJS entry. Adding an entry-point condition is additive, so it is a **minor**, not a major.
- **Owner decision needed:** whether to add the CJS half at all. The package targets browsers, where ESM is
  the norm, so ESM-only may be a deliberate and acceptable choice — in which case close this issue and keep
  the constraint documented in the README (it is, under Requirements and Limitations).
- **Reporter:** package-standardisation pass, 2026-07-25.
- **Interim state:** documented honestly in the README rather than silently omitted.

---

### ISSUE-002 — `engines.node` floor of `>=24.13.0` is unusually high for a browser library

- **Symptom:** consumers on Node 20/22 LTS get an engine warning (or a hard failure under `engine-strict`)
  when installing, even though the package runs in the browser and never executes on their Node version at
  runtime.
- **Affected version:** `3.3.0`.
- **Where:** `package.json` `engines.node`, matching `.nvmrc` (`24.13.0`).
- **Root cause:** the floor records the maintainer's own toolchain rather than the minimum a consumer needs.
  Node is used here for the build and for the `unified-tracking-setup` CLI; neither is exercised by an app that
  simply imports the package into a browser bundle.
- **Suggested fix:** lower the declared floor to the oldest Node that can actually run the CLI and the build
  (Node 20 LTS is the likely answer) and verify by running both there. Note the direction matters: **lowering**
  an engines floor is safe, **raising** it is a major.
- **Owner decision needed:** confirm the intended minimum before changing a published constraint.
- **Reporter:** package-standardisation pass, 2026-07-25.

---

### ISSUE-003 — Vendor SDK CDN versions are hard-pinned and drifting out of date

- **Symptom:** every provider injects a `<script>` at a version literal baked into the source, so consumers
  silently get an old vendor SDK and cannot upgrade without a new release of this package. Several are well
  behind: Sentry `7.99.0` (Sentry 8/9 are current), Firebase `10.7.2`, Rollbar `2.25.2`, Amplitude `2.3.8`,
  DataDog RUM `v4`.
- **Affected version:** `3.3.0`.
- **Where:** `src/providers/**/*.provider.ts` — search for `script.src =`.
- **Root cause:** the version is a string literal in each provider with no configuration hook.
- **Consequences:** consumers cannot pick up a vendor's security or bug fixes; a vendor retiring an old CDN
  path breaks that provider with no code change on our side. The strategy is also uneven — some providers pin
  a version while AppCenter, LogRocket, Raygun and PostHog fetch a floating `latest`, which is the opposite
  risk (a vendor's breaking change arrives unannounced).
- **Suggested fix:** allow a per-provider `sdkUrl` / `sdkVersion` override in that provider's config so a
  consumer can move without waiting for a release, and refresh the pinned defaults. Then choose one policy —
  pinned-with-override is the safer default — and apply it to all 16 providers.
- **Reporter:** package-standardisation pass, 2026-07-25.

---

### ISSUE-004 — Native iOS/Android SDK bridges are scaffolding and do not forward events

- **Symptom:** in a Capacitor app, tracking works (through the WebView's JS layer) but no event reaches a
  platform-native vendor SDK. A consumer expecting native Firebase/Sentry delivery gets browser-SDK delivery.
- **Affected version:** all published 3.x.
- **Where:** `ios/Sources/`, `android/src/main/`. Native sources exist on the branch carrying
  `// NOTE(unverified)` markers and have not been build-verified (no Xcode / Android Studio / CocoaPods /
  Gradle in the dev environment). Firebase Crashlytics native is a deliberate stub, since the
  `@capacitor-firebase/crashlytics` wrapper is banned fleet-wide — Sentry is the supported path.
- **Status:** known and already tracked in `CHANGELOG.md` under `[Unreleased]`; recorded here so the queue is
  complete.
- **Suggested fix:** build-verify the native targets on a machine with the toolchains, then wire the
  `ProviderManager` fan-out on both platforms and drop the `NOTE(unverified)` markers.
- **Blocked on:** a native build environment (owner-side).
- **Reporter:** package-standardisation pass, 2026-07-25.
- **Interim state:** stated in the README's `[!IMPORTANT]` callout, Platform Support table and Limitations, so
  no consumer can mistake the current behaviour.

---

### ISSUE-005 — Build output is nested at `dist/esm/src/…`

- **Symptom:** every published entry point resolves through a redundant path segment —
  `dist/esm/src/index.js` rather than `dist/index.js`.
- **Affected version:** `3.3.0`.
- **Where:** `tsconfig.json` sets `"rootDir": "./"` with `"outDir": "dist/esm"`, so the `src/` segment is
  preserved in the output tree.
- **Impact:** cosmetic today — all subpaths resolve and are verified — but it makes the `exports` map harder to
  read and would collide with a future CJS target (ISSUE-001).
- **Suggested fix:** set `"rootDir": "./src"` and update `exports`, `main`, `module`, `types` and
  `sideEffects` to the flattened paths. **Do this together with ISSUE-001, not separately** — it rewrites every
  published path, so it should happen once.
- **Caution:** changing published file paths is invisible to consumers who import the package name or a
  declared subpath, but breaks anyone deep-importing a file path directly. Ship it in a minor at most, and
  verify by installing the packed tarball.
- **Reporter:** package-standardisation pass, 2026-07-25.
