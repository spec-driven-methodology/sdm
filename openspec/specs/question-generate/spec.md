# question-generate

## Purpose

Agent-facing draft shells and generation context for filling assessment questions without writing YAML directly.
## Requirements
### Requirement: Generate question drafts without writing files

The system SHALL provide `sdm question generate --to-skill` that returns generation context and draft stubs with `--json`, without writing library YAML.

#### Scenario: Drafts for existing skill

- **WHEN** an agent runs `sdm question generate --to-skill docker --count 2 --json`
- **THEN** the JSON MUST include `ok: true`, `context` with skill metadata and existing question texts, and `drafts` of length 2
- **AND** no new files MUST be created under `library/questions/`

#### Scenario: Missing skill fails

- **WHEN** generate is invoked for a skill not in ontology
- **THEN** the system MUST fail with `SKILL_NOT_FOUND`

### Requirement: Generate context includes depth gaps
The system SHALL include depth and topic gap fields in `question generate` context when profile/level are provided.

#### Scenario: Gap-aware prompt
- **WHEN** generate runs with `--profile` and `--level` for a thin skill
- **THEN** context.gap includes `achievedDepth` and `depthRatio`
- **AND** agentPrompt mentions uncovered topics when present

### Requirement: Generate drafts honor type-mix preset

The system SHALL accept an optional mix preset on `sdm question generate` (CLI flag such as `--mix`, and MCP equivalent) with values `single`, `mixed`, or `full`. When mix is omitted and `--type` is omitted, behavior SHALL remain equivalent to homogeneous `single_choice` (backward compatible). When `--mix` is set, each returned draft stub SHALL use the type from the type-mix assignment for its index, and the JSON payload SHALL include the effective `typeMix` and per-draft `type`. The command MUST still not write library YAML.

#### Scenario: Mixed generate returns varied stub types

- **WHEN** an agent runs `sdm question generate --to-skill docker --count 3 --mix mixed --json` for an existing skill
- **THEN** `ok` is true, `typeMix` is `mixed`, and the three drafts have types `single_choice`, `multi_choice`, and `open` respectively
- **AND** no new files are created under `library/questions/`

#### Scenario: Default remains single_choice

- **WHEN** an agent runs `sdm question generate --to-skill docker --count 2 --json` without `--mix` or `--type`
- **THEN** both drafts have `type` `single_choice`

#### Scenario: Homogeneous --type unchanged

- **WHEN** an agent runs `sdm question generate --to-skill docker --count 2 --type multi_choice --json`
- **THEN** both drafts have `type` `multi_choice`

### Requirement: Open drafts under mix include expected guidance

When a draft is assigned `type: open`, the stub and/or `agentPrompt` SHALL instruct the agent to supply a short answer and persist an unambiguous expected answer via `question add` (using `expected` when that field is available). Choice-type drafts SHALL continue to include options/correct placeholders.

#### Scenario: Open stub is not a choice shell

- **WHEN** generate runs with `--mix mixed` and count ≥ 3
- **THEN** the `open` draft does not require fake multiple-choice options as the persistence shape
- **AND** the agent-facing instructions mention filling a short textual answer (and `expected` when supported)

### Requirement: Per-draft briefs for agent fill

`sdm question generate --json` SHALL attach per-draft brief fields that constrain agent authorship. Each draft MUST include `type` and `difficulty`, and MAY include `mustCoverTopic`, `avoidNearIds`, `relatedSkillIds`, and draft-specific `instructions`. The top-level `context.agentPrompt` MUST mention these constraints when present.

#### Scenario: Draft includes mustCoverTopic from uncovered topics

- **WHEN** generate runs with `--profile` and `--level` for a skill that has uncovered topics
- **THEN** at least one returned draft includes `mustCoverTopic` set to one of those uncovered topics (when count allows)

### Requirement: Work-item-driven draft assignment

When blueprint `workItems` exist for the target skill (profile/level provided), generate MUST map drafts to those work items up to `--count`, assigning matching topic/type/difficulty band fields on each stub.

#### Scenario: Work items drive draft targets

- **WHEN** blueprint mode yields work items for skill S with a specific topic T and difficulty band, and generate runs for S with profile/level and count ≥ 1
- **THEN** at least one draft targets topic T (via `mustCoverTopic` or equivalent) within the requested difficulty band

