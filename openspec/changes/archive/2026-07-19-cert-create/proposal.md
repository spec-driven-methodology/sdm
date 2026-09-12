## Why

Agents can build ontology and questions, then run `cert coverage`, but new roles/levels still require hand-edited YAML. Closing the certification write path keeps the agent-first loop inside Specra commands.

## What Changes

- `sdm cert create` — domain command that writes (or upserts) a role and a level with requirements
- Validate with `RoleSchema` / `LevelSchema`; every `requirement.skill` must exist in ontology
- `--json` success/failure envelope (same pattern as `skill` / `question`)
- `--force` to overwrite an existing level file; role levels list is merged (union) when role already exists

## Non-goals

- Editing/removing individual requirements without recreate
- Team overrides (`certifications/teams/`)
- Changing coverage heuristics
- MCP packaging

## Capabilities

### New Capabilities

- `cert-write`: create certification role + level specs via CLI

### Modified Capabilities

- (none — `cert-coverage` consumes the same YAML shape)

## Impact

- `@spec-driven-methodology/core`: `createCertification` (or `addRole` + `addLevel`) writers
- `@spec-driven-methodology/cli`: `cert create` under existing `cert` command group
- Agent loop: skill add → cert create → question add → coverage
- Follow-up doc: CHANGELOG `[Unreleased]` after implement/archive
