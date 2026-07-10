# docs/ - Documentation Agent Instructions

**Last Updated**: `2026-05-27`

## Structure

```
docs/
  api/                    # Generated API reference (classes, constants, interfaces, types, react)
  tracking/               # Release/rollout notes
  setup-guide.md          # Getting started
  api-reference.md        # API entry point
  react-integration.md    # React guide
  native-implementation.md # iOS/Android guide
  migration-guide.md      # Version migration
```

## Update Rules

- New provider → update `api/` docs + relevant guides
- React hook changes → update `react-integration.md`
- Native code changes → update `native-implementation.md`
- New version with breaking changes → update `migration-guide.md`

## API Doc Generation

```bash
yarn build:docgen   # Explicit — NOT part of default build
```

## Quality Standards

- Docs must reflect actual current package state
- Never describe unimplemented features as available
- Include code examples for all public APIs

## CLAUDE.md + AGENTS.md Sync Rule

Rules in this file MUST stay in sync with `docs/CLAUDE.md`. Update both when changing either.


## Sub-agents & Skills — Main-Context-First (IRON-SOLID)
Default/built-in sub-agents (`general-purpose`, `Explore`, `Plan`, `claude`, `fork`, …) do NOT have
access to `/skills`, so delegating to them silently SKIPS the skills RULE #0 requires. Do all
skill-relevant work in the **MAIN context**; use a sub-agent ONLY when a **custom** agent exists in
`.claude/agents/` for that job; a default `Explore`/`Plan` agent is allowed ONLY for read-only,
no-skill search/exploration. When a relevant skill is missing, **install/enable it** rather than
proceeding skill-less. (Owner directive 2026-07-11; full text in `~/.claude/CLAUDE.md`.)
