## Why

Skill edges (`depends_on` / `related_to`) are written today, but Specra never builds or validates the ontology as a graph. Agents cannot detect dependency cycles until coverage/export break in surprising ways. Core graph APIs unblocks CLI impact/graph and honest methodology audits.

## What Changes

- Load all ontology skills into an in-memory directed dependency graph
- Detect cycles on `depends_on`; reject `skill link` that would introduce a cycle (`CYCLE_DETECTED`)
- Export core APIs: `loadAllSkills`, `buildSkillGraph`, `detectCycles`, `assertAcyclicDepends`
- Unit tests for DAG success and cycle rejection

## Non-goals

- CLI `skill graph` / `skill impact` (follow-up `skill-graph-cli`)
- Mermaid / coverage visualization changes
- `related_to` cycle enforcement (related is non-hierarchical)

## Capabilities

### New Capabilities
- `skill-graph`: in-memory skill dependency graph build + cycle detection

### Modified Capabilities
- `skill-write`: `skill link` MUST reject links that create a `depends_on` cycle

## Impact

- `@spec-driven-methodology/core`: new module + `linkSkill` hook
- Agents/CI: stable `CYCLE_DETECTED` error code with `--json`
