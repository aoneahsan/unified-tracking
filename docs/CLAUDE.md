# docs/ - Documentation Rules

**Last Updated**: `2026-04-03`

## Documentation Structure

```
docs/
  api/                    # Generated API reference
    classes/              # Base class documentation
    constants/            # Error, event, provider constants
    interfaces/           # Configuration, core, event, provider interfaces
    types/                # Core, event, provider types
    react/                # React hooks and provider docs
  tracking/               # Release/rollout tracking notes
  setup-guide.md          # Getting started guide
  api-reference.md        # API documentation entry point
  react-integration.md    # React hooks & context guide
  native-implementation.md # iOS/Android native code guide
  migration-guide.md      # Version migration guide
  ios-static-framework-fix.md # iOS-specific fix
```

## Update Rules

- When adding a new provider: update `api/` docs and relevant guides
- When changing React hooks: update `react-integration.md`
- When changing native code: update `native-implementation.md`
- When releasing a new version: update `migration-guide.md` if breaking changes
- API docs under `api/` are generated — regenerate with `yarn build:docgen`

## API Doc Generation

```bash
yarn build:docgen   # Clean + docgen + tsc + rollup
```

The `docgen` step is NOT part of default `yarn build` (it was removed due to fragility). Run `build:docgen` explicitly when updating API docs.

## Quality Standards

- All docs must reflect the actual current state of the package
- Never describe planned/unimplemented features as available
- Include code examples for all public APIs
- Keep migration guide updated for every breaking change

## CLAUDE.md + AGENTS.md Sync Rule

Rules in this file MUST stay in sync with `docs/AGENTS.md`. Update both when changing either.
