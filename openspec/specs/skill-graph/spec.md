# skill-graph Specification

## Purpose
TBD - created by archiving change skill-graph-core. Update Purpose after archive.
## Requirements
### Requirement: Build in-memory skill dependency graph
The system SHALL provide a core API that loads all skills under `ontology/skills` and builds a directed dependency graph from each skill's `depends_on` list.

#### Scenario: Graph from valid ontology
- **WHEN** a methodology project has skills A→B and B→C via `depends_on`
- **THEN** the graph contains nodes A, B, C and directed edges A→B and B→C

#### Scenario: Empty ontology
- **WHEN** `ontology/skills` has no skill files
- **THEN** the graph contains zero nodes and zero edges

### Requirement: Detect depends_on cycles
The system SHALL detect directed cycles in the `depends_on` graph and expose cycle paths to callers.

#### Scenario: Acyclic graph
- **WHEN** `detectCycles` runs on a DAG
- **THEN** it returns an empty list of cycles

#### Scenario: Cyclic graph
- **WHEN** skills form a cycle A→B→A via `depends_on`
- **THEN** `detectCycles` returns at least one cycle path including those skill ids

### Requirement: Assert acyclic before persisting links
The system SHALL provide `assertAcyclicDepends` that throws `SdmError` with code `CYCLE_DETECTED` when the proposed graph would contain a cycle.

#### Scenario: Assert fails on cycle
- **WHEN** `assertAcyclicDepends` is called with a cyclic edge set
- **THEN** it throws with code `CYCLE_DETECTED`
- **AND** the error message includes a human-readable cycle path

### Requirement: Impact includes questions and export artifacts

`runSkillImpact` SHALL include, in addition to downstream skills and certifications, (1) questions whose `skill` is the target skill or any listed downstream skill, and (2) export JSON artifacts under the project `exports/` tree that reference the target skill, any affected skill, or an affected profile/level. The impact document schemaVersion MUST be `sdm.skill.impact/v2` (or newer) when these fields are present.

#### Scenario: Questions listed for impacted skills

- **WHEN** skill B depends on A and questions exist for A and B
- **AND** `runSkillImpact` runs for A
- **THEN** the document lists those question ids under a `questions` array with their skill ids

#### Scenario: Export artifact listed when profile/level hit

- **WHEN** a level requiring A (or a downstream of A) has a matching `exports/*.json` with that profile/level
- **AND** `runSkillImpact` runs for A
- **THEN** the document's `exports` array includes that file path and a kind/schema hint

### Requirement: Run APIs for graph view and impact

The system SHALL expose core functions `runSkillGraph` and `runSkillImpact` used by CLI and MCP.

#### Scenario: runSkillGraph returns coverage-aware nodes

- **WHEN** `runSkillGraph` is called with a valid profile and level
- **THEN** the result includes project root, nodes with skill id, depends_on children among the graph, and coverage fields when requested

#### Scenario: runSkillImpact walks reverse depends

- **WHEN** skill B depends on A and a level requires B
- **THEN** `runSkillImpact` for A lists B in downstreamSkills and that level under levels

#### Scenario: runSkillImpact returns artifact collections

- **WHEN** `runSkillImpact` runs for a skill that has library questions and/or export files in scope
- **THEN** the result document includes `questions` and `exports` arrays (possibly empty) and schema `sdm.skill.impact/v2` or newer

