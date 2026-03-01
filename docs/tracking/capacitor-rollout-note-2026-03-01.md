# Capacitor/Capawesome/Trapeze rollout note (2026-03-01)

- Project: `unified-tracking`
- Scope assessment: Capacitor plugin/library repository (native Android/iOS plugin already implemented in root package).
- Result:
  - Capacitor: already implemented at package/plugin level (`android/`, `ios/`, `capacitor` metadata).
  - Capawesome: not applicable for this package-level plugin rollout.
  - Trapeze (`apps-config.yaml`): not applicable for this package-level plugin rollout.

## Additional maintenance fixes completed

- Updated lint ignore list to exclude `examples/**` from root TS project parser scope.
- Updated prettier script to skip unsupported Swift parser path in this environment.

## Verification

Commands executed:

```bash
yarn type-check
yarn lint
yarn build
yarn test
```

Outcome:

- Typecheck: pass
- Lint: pass (warnings only)
- Build: pass (docgen warning handled by existing script fallback)
- Tests: fail (14 failed, 232 passed, 2 skipped) in current repository state
