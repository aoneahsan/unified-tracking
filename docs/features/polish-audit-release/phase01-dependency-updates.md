# Phase 01 — Dependency Updates

**Goal:** Bring every dependency to its latest _stable_ npm version (patch/minor/major), fix any breakage, and correct `peerDependencies`. Verify build + typecheck + test + lint all pass.

**Skills:** `nodejs-best-practices` (deps/architecture), `eslint-prettier-config` (lint config), `vitest` (if test env breaks).

## Outdated snapshot (npm outdated @ 2026-05-26)

| Package                          | Installed | Latest  | Bump       | Risk                                              |
| -------------------------------- | --------- | ------- | ---------- | ------------------------------------------------- |
| @capacitor/android               | 8.3.3     | 8.3.4   | patch      | low                                               |
| @capacitor/core                  | 8.3.3     | 8.3.4   | patch      | low                                               |
| @capacitor/ios                   | 8.3.3     | 8.3.4   | patch      | low                                               |
| @types/node                      | 25.7.0    | 25.9.1  | minor      | low                                               |
| @types/react                     | 19.2.14   | 19.2.15 | patch      | low                                               |
| @typescript-eslint/eslint-plugin | 8.59.3    | 8.60.0  | minor      | low                                               |
| @typescript-eslint/parser        | 8.59.3    | 8.60.0  | minor      | low                                               |
| @vitest/coverage-v8              | 4.1.6     | 4.1.7   | patch      | low                                               |
| rollup                           | 4.60.3    | 4.60.4  | patch      | low                                               |
| vitest                           | 4.1.6     | 4.1.7   | patch      | low                                               |
| prettier-plugin-java             | 2.8.1     | 2.9.5   | minor      | low                                               |
| esbuild                          | 0.27.7    | 0.28.0  | minor(0.x) | med — build transform                             |
| @types/jsdom                     | 27.0.0    | 28.0.3  | **MAJOR**  | low (types only)                                  |
| jsdom                            | 28.1.0    | 29.1.1  | **MAJOR**  | med — test DOM env                                |
| lint-staged                      | 16.4.0    | 17.0.5  | **MAJOR**  | low — pre-commit only                             |
| eslint                           | 9.39.4    | 10.4.0  | **MAJOR**  | **HIGH — @ionic/eslint-config@0.4.0 peer compat** |
| typescript                       | 5.9.3     | 6.0.3   | **MAJOR**  | **HIGH — new strictness / removed deprecations**  |

> `react` shows MISSING in `npm outdated` — it is an _optional_ peerDependency, not installed for the lib build (types come from `@types/react`). Not a defect.

## Sub-tasks

### 1.1 — Safe batch (patch + minor)

`@capacitor/{core,android,ios}`, `@types/node`, `@types/react`, `@typescript-eslint/{eslint-plugin,parser}`, `@vitest/coverage-v8`, `vitest`, `rollup`, `prettier-plugin-java`.

- Update version specs in `package.json`, `yarn install`, then `yarn type-check && yarn build && yarn test && yarn lint`.

### 1.2 — esbuild 0.28 (minor in 0.x = breaking-ish)

- Bump, rebuild, confirm Rollup `rollup-plugin-esbuild` still transforms TS cleanly.

### 1.3 — TypeScript 6.0 (MAJOR)

- Bump alone, run `yarn type-check` + `yarn build`. Fix any newly-surfaced type errors / removed-flag warnings in `tsconfig.json`. Document each fix.

### 1.4 — ESLint 10 (MAJOR) — highest risk

- Check `@ionic/eslint-config` + `@ionic/prettier-config` + `@typescript-eslint` compatibility with ESLint 10.
- Inspect `eslint.config.js` (flat) and the vestigial `eslintConfig` block in `package.json` (eslintrc-style — ESLint 10 drops eslintrc; remove it).
- If `@ionic/eslint-config@0.4.0` blocks ESLint 10: try newer @ionic config; else migrate the flat config off the preset (inline equivalent rules) OR hold eslint at 9.x with a **documented blocker** in the tracker. Latest-stable is the goal but a broken lint pipeline is not acceptable.

### 1.5 — jsdom 29 + @types/jsdom 28 (MAJOR)

- Bump together (keep them aligned). Run `yarn test` — confirm jsdom test env still works (localStorage/matchMedia mocks in `src/test-setup.ts`).

### 1.6 — lint-staged 17 (MAJOR)

- Bump, confirm `.lintstagedrc.json` + husky pre-commit still run.

### 1.7 — peerDependencies fix

- `@capacitor/core` peer is `^7.4.3` but package builds/tests on Capacitor 8. Widen to `>=7.0.0` (or `^7.4.3 || ^8.0.0`). Keep `react: >=19.0.0`.

### 1.8 — Final verification gate

- `yarn type-check` ✓ · `yarn build` ✓ (0 warn/err) · `yarn test` ✓ · `yarn lint` ✓.
- Record results + any held-back packages in tracker `runHistory`.

## Strategy

Safe batch first (one verify). Then **each major separately** with a verify between, so a regression is attributable to a single package. Never leave the repo in a non-building state at end of a sub-task.
