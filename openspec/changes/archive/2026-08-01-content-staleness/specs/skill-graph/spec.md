## ADDED Requirements

### Requirement: Impact includes questions and export artifacts

`runSkillImpact` SHALL include, in addition to downstream skills and certifications, (1) questions whose `skill` is the target skill or any listed downstream skill, and (2) export JSON artifacts under the project `exports/` tree that reference the target skill, any affected skill, or an affected profile/level. The impact document schemaVersion MUST be `sdm.skill.impact/v2` (or newer) when these fields are present.

#### Scenario: Questions listed for impacted skills

- **WHEN** skill B depends on A and questions exist for A and B
- **AND** `runSkillImpact` runs for A
- **THEN** the document lists those question ids under a `questions` array with their skill ids

#### Scenario: Export artifact listed when profile/level hit

- **WHEN** a level requiring A (or a downstream of A) has a matching `exports/*.json` with that profile/level
- **AND** `runSkillImpact` runs for A
- **THEN** the document’s `exports` array includes that file path and a kind/schema hint

## MODIFIED Requirements

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
