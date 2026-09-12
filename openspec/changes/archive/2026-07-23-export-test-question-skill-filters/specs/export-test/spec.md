## ADDED Requirements

### Requirement: Export test skill filter

The system SHALL accept an optional skill filter on `sdm export test` via repeatable `--include-skill <id>` **or** repeatable `--exclude-skill <id>` (not both). When neither is set, all effective level requirement skills remain eligible (backward compatible). Skill filtering SHALL apply after resolving the effective level (including optional `--team`) and before adaptive sampling. Only skills that appear on the effective level requirements are valid filter targets; unknown skill ids SHALL fail with SdmError code `EXPORT_SKILL_UNKNOWN`. Combining include and exclude skill flags SHALL fail with `EXPORT_SKILL_FILTER_CONFLICT`. After a skill filter is applied, `document.requirements` SHALL contain only the remaining skills from the effective level, with weights renormalized to sum to 1 when needed, and `meta.skillFilter` SHALL be `{ mode: "include" | "exclude", skills: [...] }` for the requested list. When renormalization adjusts any weight, `meta.weightsNormalized` SHALL be `true`; otherwise that field MAY be omitted or `false`. `meta.questionCount` SHALL equal the length of `document.questions` after all filters.

#### Scenario: Include skills only

- **WHEN** an agent runs `sdm export test --profile ai-qa --level ai-qa-middle --include-skill ai-quality --include-skill ai-security --json`
- **AND** the level requires additional skills beyond those two
- **THEN** every `document.questions[].skill` is `ai-quality` or `ai-security`
- **AND** `document.requirements` contains only those skills (among the include list present on the level)
- **AND** requirement weights sum to 1
- **AND** `meta.skillFilter` equals `{ "mode": "include", "skills": ["ai-quality", "ai-security"] }` (order MAY match request order)

#### Scenario: Exclude skills

- **WHEN** export runs with `--exclude-skill skill-authoring --exclude-skill mcp-authoring`
- **THEN** no exported question has skill `skill-authoring` or `mcp-authoring`
- **AND** those skills are absent from `document.requirements`
- **AND** `meta.skillFilter.mode` is `exclude`

#### Scenario: Skill include and exclude conflict

- **WHEN** both `--include-skill` and `--exclude-skill` are provided
- **THEN** the command fails with SdmError code `EXPORT_SKILL_FILTER_CONFLICT` and non-zero exit
- **AND** no success consumer document is emitted

#### Scenario: Unknown skill on level

- **WHEN** `--include-skill not-on-level` is provided and that skill is not in effective level requirements
- **THEN** the command fails with SdmError code `EXPORT_SKILL_UNKNOWN`

#### Scenario: Default export unchanged by skill filter

- **WHEN** export runs without include/exclude skill flags
- **THEN** `meta.skillFilter` is omitted
- **AND** requirements match the effective level without filter-driven renormalization

### Requirement: Export test question id allowlist

The system SHALL accept an optional question-id allowlist on `sdm export test` via repeatable `--include-question <id>`. When unset, no id allowlist is applied (backward compatible). The allowlist SHALL apply after skill filter, adaptive sampling (if any), and type filter. Only questions that remain in the candidate set after prior steps may be selected. If any requested id is not present in that candidate set, the command SHALL fail with SdmError code `EXPORT_QUESTION_NOT_FOUND` and MUST NOT silently omit unknown ids. When the allowlist is applied successfully, `meta.questionFilter` SHALL be `{ mode: "include", ids: [...] }` listing the requested ids, and `document.questions` SHALL contain exactly the allowlisted candidates (sorted by skill then id as usual). `meta.questionCount` SHALL equal the length of `document.questions`.

#### Scenario: Include specific question ids

- **WHEN** an agent runs `sdm export test --profile ai-qa --level ai-qa-middle --include-question q-ai-quality-005 --include-question q-ai-quality-006 --json`
- **AND** those questions exist for required skills on the level
- **THEN** `document.questions` contains exactly those two questions (by id)
- **AND** `meta.questionFilter` equals `{ "mode": "include", "ids": ["q-ai-quality-005", "q-ai-quality-006"] }` (order MAY match request order)
- **AND** `meta.questionCount` is `2`

#### Scenario: Unknown question id fails

- **WHEN** `--include-question does-not-exist` is provided
- **THEN** the command fails with SdmError code `EXPORT_QUESTION_NOT_FOUND`
- **AND** exit code is non-zero

#### Scenario: Id filtered out by prior type filter fails

- **WHEN** question `q-open-1` exists but export uses `--exclude-type open --include-question q-open-1`
- **THEN** the command fails with SdmError code `EXPORT_QUESTION_NOT_FOUND`

#### Scenario: Default export unchanged by question filter

- **WHEN** export runs without `--include-question`
- **THEN** `meta.questionFilter` is omitted

### Requirement: Export filter pipeline and empty subset

The system SHALL apply export filters in this order: effective level (+ optional team) → candidate questions by requirements → skill filter (if any) → adaptive sampling (if `--adaptive`) → type filter (if any) → question-id allowlist (if any). When a skill filter and/or question-id allowlist is applied and the resulting `questions` array is empty, the command SHALL fail with SdmError code `EXPORT_FILTER_EMPTY`. Type-only filters that leave some skills without questions SHALL continue to succeed with those skills listed in `meta.skillsMissingQuestions` (existing behavior).

#### Scenario: Skill filter empties entire package

- **WHEN** `--include-skill` selects a required skill that has zero library questions
- **THEN** the command fails with SdmError code `EXPORT_FILTER_EMPTY`

#### Scenario: Type-only empty skill still succeeds

- **WHEN** export uses only `--exclude-type open` and one required skill has only `open` questions
- **THEN** export still succeeds
- **AND** that skill id appears in `meta.skillsMissingQuestions`
