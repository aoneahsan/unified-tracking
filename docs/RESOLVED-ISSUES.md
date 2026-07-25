# Resolved issues — unified-tracking

History. Entries move here from `REPORTED-ISSUES.md` when fixed, with the date and the fixing version.
Nothing is ever deleted.

**Last Updated:** 2026-07-25

---

### ISSUE-R001 — `unified-tracking-setup` CLI crashed on every invocation

- **Resolved:** 2026-07-25 — fixed in the tree, **pending release** (unreleased at the time of writing).
- **Symptom:** running the documented `unified-tracking-setup` command died immediately with
  `ReferenceError: require is not defined in ES module scope, you can use import instead`.
- **Affected:** every 3.x release, i.e. the CLI has never worked as published in the 3.x line.
- **Root cause:** `bin/setup.js` is written in CommonJS, but `"type": "module"` in `package.json` makes Node
  parse any `.js` file as ESM. Node's own error message named the fix.
- **Why it was not caught:** neither `typecheck`, `lint` nor `build` executes the CLI — the file is plain JS
  outside the TypeScript project — so all three gates were green while the binary was dead. It was found by
  running the command.
- **Fix:** renamed `bin/setup.js` → `bin/setup.cjs` and repointed `bin` in `package.json`. The **command name
  is unchanged**, so no published entry point was renamed or removed.
- **Verified:** executed the renamed CLI; it now starts and reaches the provider-selection prompt.

---

### ISSUE-R002 — `CHANGELOG.md` was missing from the published tarball

- **Resolved:** 2026-07-25 — fixed in the tree, pending release.
- **Symptom:** no installed copy of the package contained any release history.
- **Root cause:** `files` is an allowlist and did not name `CHANGELOG.md`. npm auto-includes `README` and
  `LICENSE` regardless of `files`, but **not** the changelog — an easy and invisible omission.
- **Fix:** added `CHANGELOG.md` to `files`, and named `README.md` and `LICENSE` explicitly alongside it.
- **Verified:** `npm pack --dry-run --json` now lists `CHANGELOG.md` in the tarball.

---

### ISSUE-R003 — `yarn lint` could never pass (two competing prettier configs)

- **Resolved:** 2026-07-25 — fixed in the tree, pending release.
- **Symptom:** `yarn lint` exited non-zero with `No parser could be inferred` for all 13
  `android/**/*.java` files.
- **Root cause:** the package carried **both** a `prettier` key in `package.json` (`@ionic/prettier-config`)
  and a `.prettierrc` that registered `prettier-plugin-java`. The `package.json` key wins prettier's config
  resolution, so `.prettierrc` was dead config and the Java plugin never loaded.
- **Fix:** consolidated into a single `prettier.config.mjs` that spreads the Ionic config and registers the
  plugin; deleted `.prettierrc` and the `package.json` key. Added a `.prettierignore` so the gate covers
  package source rather than internal maintainer records. Formatted the 13 Java files — import order and
  lambda parentheses only, proven to be a semantic no-op.
- **Verified:** `yarn lint` exits 0 with `All matched files use Prettier code style!`.

---

### ISSUE-R004 — README documented an import that does not exist

- **Resolved:** 2026-07-25 — fixed in the tree, pending release.
- **Symptom:** the README instructed `import { UnifiedTracking } from 'unified-tracking/capacitor';`. That
  subpath exports only `UnifiedTrackingCapacitorPlugin` and `registerCapacitorPlugin`, so the imported binding
  was `undefined`.
- **Fix:** the README's Capacitor example now uses `registerCapacitorPlugin()`, matching the real export.
- **Verified:** enumerated the subpath's runtime exports from the built output.

---

### ISSUE-R005 — `funding` pointed at GitHub Sponsors

- **Resolved:** 2026-07-25 — fixed in the tree, pending release.
- **Symptom:** `package.json` declared `{"type":"github","url":"https://github.com/sponsors/aoneahsan"}`,
  which is not a supported support channel for this fleet.
- **Fix:** replaced with
  `https://aoneahsan.com/payment?project-id=unified-tracking&project-identifier=unified-tracking`.

---

### ISSUE-R006 — `sideEffects` was undeclared, risking dropped providers

- **Resolved:** 2026-07-25 — fixed in the tree, pending release.
- **Symptom:** no `sideEffects` field, so bundlers could not tree-shake the package; and a naive later fix of
  `sideEffects: false` would have been actively dangerous.
- **Root cause / why `false` would be wrong:** provider modules self-register with the `ProviderRegistry` via
  the `@RegisterProvider` decorator **as an import-time side effect**. A blanket `false` permits a bundler to
  drop a provider module it believes unused, which would silently disable a configured provider in a
  consumer's production build only.
- **Fix:** declared the honest array form scoping the side effect to
  `./dist/esm/src/providers/**/*.provider.js`, keeping tree-shaking for the rest of the package.
