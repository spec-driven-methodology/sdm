## Why

Agents can add questions only to skills that already exist in ontology. Creating and wiring skills today means hand-editing YAML — which breaks the agent-first contract. We need domain write operations for the skill graph: add a skill, then link dependencies.

## What Changes

- `sdm skill add <id> --name <name> [--category] [--desc] [--json] [--force]`
- `sdm skill link <id> --depends-on a,b [--related-to x,y] [--json]`
- Core writers validate with `SkillSchema`, refuse unknown dependency targets, refuse overwrite without `--force`
- Stable `SdmError` codes + `--json` success/failure (same pattern as `question add`)

## Non-goals

- `skill graph` / `skill impact` visualization
- Deleting skills or rewriting unrelated fields interactively
- Cycle detection beyond a simple self-dependency reject (full DAG cycle check can follow)
- MCP / portable skill doc updates beyond a short note in tasks if needed

## Capabilities

### New Capabilities

- `skill-write`: create skills and update `depends_on` / `related_to` links in ontology

### Modified Capabilities

- (none)

## Impact

- `@spec-driven-methodology/core`: `addSkill`, `linkSkill` (+ reuse `skillExists` / loaders)
- `@spec-driven-methodology/cli`: `skill add`, `skill link`
- Agent loop: add skill → link → question add → coverage
- Why one change (not two): link is useless without add; both touch the same YAML surface and error model — one propose/apply keeps the ontology write path coherent
