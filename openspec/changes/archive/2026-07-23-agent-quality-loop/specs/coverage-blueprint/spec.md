## ADDED Requirements

### Requirement: Coverage mode configuration

The system SHALL accept `quality.coverageMode` in `sdm.yaml` with values `legacy` or `blueprint`, defaulting to `legacy` when omitted. Zod MUST validate the config on load. Additional blueprint knobs (minimum questions, topic coverage ratio, type diversity, difficulty-band rules) MUST be optional with documented defaults.

#### Scenario: Default coverage mode is legacy

- **WHEN** a project’s `sdm.yaml` omits `quality.coverageMode`
- **THEN** coverage classification behaves as `legacy` (existing count + max-difficulty heuristics)

#### Scenario: Blueprint mode configured

- **WHEN** `quality.coverageMode` is `blueprint`
- **THEN** coverage and gaps consumers classify skills using blueprint rules in addition to (or refining) count/depth checks

### Requirement: Blueprint skill status rules

When `coverageMode` is `blueprint`, the system SHALL mark a required skill `ok` only when all enabled blueprint rules pass for that skill (including minimum question count, depth/difficulty-band expectations, topic coverage when the skill defines topics, and type-diversity knobs when enabled). Failure of any enabled rule SHALL yield `thin` or `missing` as appropriate, with machine-readable `reasons`.

#### Scenario: Enough questions but uncovered topics stay thin

- **WHEN** blueprint mode is on, a skill defines topics, question count meets the minimum, depth ratio would pass legacy rules, and at least one skill topic has no matching question topic
- **THEN** the skill status is `thin` (not `ok`)
- **AND** reasons include an uncovered-topic reason

#### Scenario: Legacy ignores topic failure for status

- **WHEN** coverageMode is `legacy` and a skill has uncovered topics but meets count and depthRatio heuristics
- **THEN** the skill status remains `ok` as under current heuristics

### Requirement: Gap work items for agents

When `coverageMode` is `blueprint`, coverage/gaps JSON SHALL include a `workItems` array. Each work item MUST include at least `skill` and `reason`, and MAY include `topic`, `type`, `difficultyMin`, and `difficultyMax` so an agent can target `question generate` / `question add` without inventing a plan.

#### Scenario: Work items present in gaps JSON

- **WHEN** an agent runs `cert gaps --json` for a level under blueprint mode with at least one thin skill due to an uncovered topic
- **THEN** the payload includes `workItems` with an entry referencing that skill and topic (when applicable)

#### Scenario: Legacy mode omits or empties workItems

- **WHEN** coverageMode is `legacy`
- **THEN** gaps JSON either omits `workItems` or returns an empty `workItems` array (documented), without changing legacy `gaps` skill rows
