---
name: SDM
tagline: "Spec-Driven Methodology"
what: >-
  SDM — a methodology-as-specs framework: skill ontology → content library →
  profiles/thresholds → coverage audit and export. A single competency skeleton
  (canonical / single source of truth) for assessment and learning.
whatNot:
  - Not a candidate testing platform or HR UI
  - Not an LMS; does not administer tests or analyze candidate answers as a primary product
  - Not a full agent harness / orchestrator — CLI/MCP expose the canonical, not a model runtime
  - Not a replacement for OpenSpec for code development
model: >-
  Agent-first: competency owners (HR, recruiters, methodologists, analysts,
  domain experts; contexts — university, bootcamp, onboarding)
  formulate intent and review; the AI agent with a model calls CLI/MCP (`--json`);
  SDM is the canonical in YAML + Zod (files in git) and a rule framework, not
  manual CRUD and not a hidden methodology database.
---

# SDM — Overview

**SDM** is a **methodology-as-specs** framework: skill ontology → content
library → profiles/thresholds → coverage audit and export. A single competency
skeleton (**canonical** / single source of truth) for assessment and learning.
It is not a test administration system or LMS.

## What it is

- **What:** a methodology-as-specs framework (ontology → library → profiles/thresholds → coverage and export)
- **Why:** one competency canonical for **assessment** and **learning**; export to agents and external systems (surfaces: test, learning, matrix, …)
- **Who:** competency owners — HR, recruiters, methodologists, analysts, domain experts (contexts: university, bootcamp, onboarding)
- Skill ontology (`ontology/`)
- Question library and learning content on the same graph (`library/`, `export learning`, `export kit`)
- Profiles / levels / thresholds (`certifications/`)
- Coverage, gaps, summary `quality report` (●○○), detailed audit, content staleness (`content stale` / `meta.basis`), export for agents and consumers
- Export test / learning JSON for agents; Methodology Studio removed (obsidian-sdm)

### Specs · Framework · Agent

| Part | Role |
|-------|------|
| **Specs** | Canonical in repository files (git), not a hidden database |
| **Framework** | Boundaries and "how": schema, operations, coverage, quality |
| **Agent + model** | Execution; CLI/MCP are the agent's hands within the framework |

Result quality depends on specs × agent × model; the framework limits harm.

## What it is not

- Not an HR testing platform or LMS
- Not a full agent harness / orchestrator (no model orchestration; CLI/MCP provide access to the canonical)
- Not a candidate UI (static `player/` is an author preview, not an exam)
- Not a place for "manual flag typing" as the primary UX — the main path is through an agent

How SDM differs from "just an agent with a model": [methodology/why-sdm.md](https://github.com/spec-driven-methodology/methodology/blob/main/why-sdm.md)

## How to work

1. Ask the agent in methodology language ("foundation for a Java Middle backend profile").
2. The agent runs intent-loop → plan → confirm → CLI/MCP.
3. Verify results via `doctor`, `cert coverage`, summary `quality report` (●○○ matrix; for raw `.md` — `--sources`), `content stale` after ontology edits, detailed `audit`, then export test or learning.

**Single-point control:** edit a skill or requirement → `impact` / coverage → rebuild artifacts for surfaces; one bank — different profile slices; validation before export.

Details for agents: `AGENTS.md`, `agents/*/SKILL.md`. Version capabilities: `CHANGELOG.md`.
For "what is SDM?" questions, the agent calls `sdm about --json` / MCP `about`.