# Package inventory — unified-tracking

The per-project dependency inventory required by the fleet packages rule. Keep it accurate on **every** add,
remove or upgrade.

**Last Updated:** 2026-07-25

## package.json units

One manifest owns the published name. The example app is a separate, unpublished unit with a distinct name —
verified 2026-07-25 that no second manifest claims `unified-tracking`, and that the build emits no
`dist/package.json`.

| Unit        | Path                              | Name                             | Published |
| ----------- | --------------------------------- | -------------------------------- | --------- |
| The package | `./package.json`                  | `unified-tracking`               | ✅ npm    |
| Example app | `examples/react-app/package.json` | `unified-tracking-react-example` | ❌ never  |

## Runtime dependencies

**None.** The package ships zero runtime dependencies by design; each provider fetches its vendor SDK from that
vendor's CDN at runtime. This is why there is a CSP requirement and why the package cannot be used in a
Manifest V3 browser extension.

## Peer dependencies

Both are **optional** — each is needed only for the matching entry point.

| Package           | Range                | Needed for                   | Why a peer                                                         |
| ----------------- | -------------------- | ---------------------------- | ------------------------------------------------------------------ |
| `@capacitor/core` | `^7.4.3 \|\| ^8.0.0` | `unified-tracking/capacitor` | The host app owns Capacitor; two copies break plugin registration. |
| `react`           | `>=19.0.0`           | `unified-tracking/react`     | The host app owns React; two copies break hooks.                   |

## Dev dependencies — what each is for

| Package                                                               | Purpose                                                                     |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `@capacitor/android`, `@capacitor/core`, `@capacitor/ios`             | Compile the plugin against the Capacitor surface.                           |
| `@capacitor/docgen`                                                   | Generates `dist/docs.json` from the plugin interface (`yarn build:docgen`). |
| `@ionic/prettier-config`                                              | Base formatting config, extended by `prettier.config.mjs`.                  |
| `@ionic/swiftlint-config`                                             | Swift lint config for `ios/`.                                               |
| `@types/node`, `@types/react`                                         | Type definitions for the build.                                             |
| `@typescript-eslint/*`, `eslint`, `eslint-config-prettier`, `globals` | Lint toolchain.                                                             |
| `esbuild`                                                             | Bundling utility used by tooling.                                           |
| `husky`, `lint-staged`                                                | Pre-commit hooks.                                                           |
| `prettier`, `prettier-plugin-java`                                    | Formatting for TS/JS/MD/JSON **and** the `android/` Java sources.           |
| `rimraf`                                                              | `yarn clean`.                                                               |
| `tslib`                                                               | TypeScript helper runtime for emitted code.                                 |
| `typescript`                                                          | The compiler — the build _is_ `tsc`.                                        |

## Intentional pins and constraints

| Constraint     | Value              | Why                                                                                                                                                                 |
| -------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `typescript`   | `^6.0.3`           | Fleet pin. TypeScript 7 (the native port) removes the JS compiler API that `typescript-eslint` and the Capacitor CLI depend on. Do not let `ncu -u` move this to 7. |
| `engines.node` | `>=24.13.0`        | Matches `.nvmrc`. Raising it again is a **major** — it can break installs for consumers who changed nothing.                                                        |
| `type`         | `module`           | The package is ESM only; there is no CommonJS build. The CLI is therefore `bin/setup.cjs`, not `.js`.                                                               |
| `sideEffects`  | array, not `false` | Provider modules self-register at import time. A blanket `false` lets a bundler drop a configured provider from a consumer's production build.                      |

## Published surface

`files` is an **allowlist** — there is no `.npmignore`, and there must never be one (a denylist ships whatever
it forgets). Verified against the extracted tarball on 2026-07-25: no `.env`, no keys, no `CLAUDE.md` /
`AGENTS.md`, no internal records.

| Entry point      | Subpath                         | Target                            |
| ---------------- | ------------------------------- | --------------------------------- |
| Main             | `unified-tracking`              | `dist/esm/src/index.js`           |
| React hooks      | `unified-tracking/react`        | `dist/esm/src/react/index.js`     |
| Capacitor plugin | `unified-tracking/capacitor`    | `dist/esm/src/capacitor/index.js` |
| Manifest         | `unified-tracking/package.json` | `package.json`                    |
| CLI              | `unified-tracking-setup`        | `bin/setup.cjs`                   |

## Verification

```bash
yarn typecheck && yarn lint && yarn build   # must all exit 0
npm pack --dry-run --json                   # inspect the real published file list
```
