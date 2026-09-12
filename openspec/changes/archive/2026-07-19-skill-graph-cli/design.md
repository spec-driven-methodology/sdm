## Context

`skill-graph-core` provides `buildSkillGraph` / cycle detection. Mermaid export already colors by count-based coverage. Agents need JSON-first domain ops matching idea.md §4.1 / §5.1.

## Goals / Non-Goals

**Goals:** Role/level terminal graph with optional coverage bars; impact fan-out; MCP parity.

**Non-Goals:** Depth/difficulty in coverage status; rewriting mermaid.

## Decisions

1. **Reuse `computeCoverage` + `depends_on` tree** — for each required skill, print children from ontology depends_on that are also in the closure of requirements (or all dependents of required roots).
2. **Coverage bars** — `achieved/required` display uses questionCount/minOk as ratio for now (count heuristic); depth comes later.
3. **Impact** — BFS over reverse depends_on edges from target; scan all roles/levels for requirements mentioning affected skills.
4. **Schema** — JSON: `sdm.skill.graph/v1` and `sdm.skill.impact/v1`.

## Risks / Trade-offs

- [Bar semantics change with coverage-depth] → documented as count-based until Wave B.

## Migration Plan

Additive commands only.
