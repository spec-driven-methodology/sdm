## Context

`skill link` merges `depends_on` / `related_to` into YAML. There is no project-wide graph, and cycles beyond self-dep are allowed. Mermaid export already walks requirements + depends_on ad hoc.

## Goals / Non-Goals

**Goals:**
- Shared core graph built from all ontology skills
- Cycle detection on directed `depends_on` edges
- Reject cyclic `skill link` with `CYCLE_DETECTED`

**Non-Goals:**
- CLI presentation (`skill graph` / `impact`)
- Enforcing acyclicity on `related_to`
- Adding graphology dependency (simple adjacency + DFS is enough for PoC scale)

## Decisions

1. **Adjacency map, not graphology** — ontology sizes are small; avoid new runtime dep. Structure: `Map<id, Skill>` + `dependsEdges: Map<id, string[]>`.
2. **Cycle check only on depends_on** — `related_to` stays informational.
3. **Check after merge preview** — `linkSkill` builds proposed depends_on, runs `detectCycles` on full graph with proposed edges, then writes.
4. **Error code `CYCLE_DETECTED`** — message includes one cycle path for agents.

## Risks / Trade-offs

- [Existing cyclic projects] → link still fails on new edges that deepen cycles; doctor/graph CLI later can report existing cycles without blocking reads.
- [related_to ignored for cycles] → documented; intentional.

## Migration Plan

No YAML migration. Archive after verify + tests.
