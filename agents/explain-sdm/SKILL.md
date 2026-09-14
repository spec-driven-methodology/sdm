---
name: sdm-explain-sdm
description: >-
  Answer «what is SDM / what can it do / what it is not» from the canonical
  about payload. Use when the human asks what SDM is, its capabilities,
  positioning, or why to use it — before inventing an HR/testing-platform story.
license: Apache-2.0
compatibility: Requires SDM CLI (`sdm about --json`) or MCP tool `about`.
metadata:
  author: sdm
  version: "0.7.0"
---

# Explain SDM (product identity)

## When

Human asks any of:

- «what is SDM?» / «what is SDM?»
- «what can it do?» / capabilities / feature list
- «why?» / how to position / vs testing platforms / LMS

Do **not** answer from memory alone. Do **not** frame SDM as an HR testing UI, LMS, primary candidate test runner, or full agent harness/orchestrator.

## Positioning (paraphrase from `about`, do not invent)

**EN tagline** (from `tagline`): Spec-Driven Methodology  
(Historical name note only: Spec + RA = Resource Assessment — not the live tagline.)

Two levels (must stay consistent with `ABOUT.md` / `positioning.what`):

| Level | Formula |
|-------|---------|
| **What** | SDM — a methodology-as-specs framework: skills ontology → content library → profiles/thresholds → coverage audit and export. One skeleton (**canon** / single source of truth) for assessment and learning |
| **Why / anchor** | One competency skeleton for **assessment** and **learning**; export to external systems (surfaces) and agents |

**System picture:** specs in git · framework (schema/ops/coverage/quality) · agent+model (CLI/MCP = hands). Quality ≈ specs × agent × model.

**Audience:** competency owners — HR, recruiters, methodologists, analysts, domain experts (`positioning.model`). University / bootcamp / onboarding are **contexts**, not a different product type.

## Steps

1. Call MCP tool `about` **or** run:

   ```bash
   sdm about --json
   ```

   No methodology project is required.

2. Paraphrase for the human using `positioning.what`, `positioning.whatNot`, `positioning.model`, `version`, and `nextSteps`. Prefer the two-level table above when summarizing; mention the canon and harness boundary when relevant.
3. Optionally list a few relevant `capabilities` (CLI/MCP/skills). Prefer pointing to `nextSteps` (`intent-loop`, `init`, `connect-mcp`) over dumping every command.
4. Do **not** invent CLI flags, MCP tools, or YAML layouts that are absent from the payload. For methodology work after the identity answer, route to `intent-loop` / other skills in `AGENTS.md`.

## Anti-patterns

- Describing SDM as an «employee testing platform» or «LMS»
- Framing SDM as a full agent harness / multi-model orchestrator
- Narrowing audience to only «methodologist» when the human asks who it is for — use competency owners
- Mixing with `doctor` (project health ≠ product identity)
- Hand-editing methodology YAML to «show what SDM is»