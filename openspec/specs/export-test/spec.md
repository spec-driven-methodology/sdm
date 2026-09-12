# export-test

## Purpose

Assemble a consumer-ready assessment test package for a certification profile and level (questions + requirements metadata).
## Requirements
### Requirement: Assemble certification test package
The system SHALL assemble a consumer test package for a certification profile and level by selecting every question in `library/questions` whose `skill` matches a `requirement.skill` of that level, sorted by skill then question id.

#### Scenario: Export includes required-skill questions
- **WHEN** the user runs `sdm export test --profile java-developer --level middle` in a project with example methodology
- **THEN** the export document includes questions for skills required by the middle level that have library entries
- **AND** questions are ordered by skill ascending, then id ascending

#### Scenario: Skills with zero questions do not fail export
- **WHEN** a required skill has zero matching questions
- **THEN** the export still succeeds with exit code 0
- **AND** that skill id appears in `meta.skillsMissingQuestions`

#### Scenario: Level or profile missing
- **WHEN** the profile or level cannot be loaded
- **THEN** the system reports a SdmError and exits non-zero

### Requirement: Test export document shape and formats
The system SHALL emit a versioned test document with `schemaVersion` equal to `sdm.export.test/v1`, including a deterministic package `id`, profile, level, title, threshold, requirements, questions, and meta counts including `meta.revision`. Each exported question SHALL include fields from the library question, and SHALL include `expected` when present on the source question. Default format SHALL be JSON. CSV format SHALL flatten questions to rows with columns `id,skill,difficulty,type,text,options,correct,explanation,expected` and MUST NOT include the package `id` column.

#### Scenario: Default JSON includes package id and revision
- **WHEN** `sdm export test --profile <profile> --level <level>` succeeds without filters
- **THEN** stdout JSON includes `id` matching `test-{profile}-{level}` slug form
- **AND** `meta.revision` is a non-empty 16-character hex string derived from `meta.basis` skills/level hashes without `capturedAt`

#### Scenario: Filter variant changes package id
- **WHEN** the same profile and level are exported twice, once default and once with `--include-skill <id>`
- **THEN** the two documents have different `id` values

#### Scenario: Skill content change changes revision not id
- **WHEN** a test export is produced, a required skill's semantic fields change, and export is run again with the same flags
- **THEN** both documents share the same `id`
- **AND** the second `meta.revision` differs from the first

#### Scenario: Default JSON to stdout
- **WHEN** `sdm export test --profile <profile> --level <level>` succeeds without `--format`
- **THEN** stdout is a JSON document with `schemaVersion` `sdm.export.test/v1` and a `questions` array

#### Scenario: JSON includes expected when set
- **WHEN** a library question of type `open` has `expected` and is included in the export
- **THEN** the corresponding object in `questions` includes the same `expected` value

#### Scenario: CSV format
- **WHEN** `sdm export test --profile <profile> --level <level> --format csv` succeeds
- **THEN** stdout is CSV text with a header row including an `expected` column and one data row per exported question

#### Scenario: Invalid format
- **WHEN** `--format` is not `json` or `csv`
- **THEN** the system fails with code `EXPORT_FORMAT_INVALID` and a non-zero exit code

### Requirement: Consumer upsert contract for test packages
Export test JSON intended for external systems SHALL treat `id` as the stable upsert slot key and `meta.revision` as the content fingerprint for that slot. External consumers SHOULD upsert by `id` and replace content when `meta.revision` changes while `id` is unchanged. Option shuffle flags MUST NOT affect `id`.

#### Scenario: Shuffle does not change package id
- **WHEN** export runs with and without `--shuffle-options` for the same profile, level, and filters
- **THEN** both documents have the same `id`

### Requirement: Agent envelope for test export
The system SHALL support `--json` that wraps the consumer document in `{ ok: true, format, document }` on success and `{ ok: false, code, message }` on failure.

#### Scenario: Agent success envelope
- **WHEN** `sdm export test --profile <profile> --level <level> --json` succeeds
- **THEN** stdout JSON has `ok: true`, `format` matching the chosen format, and `document` containing the export payload (object for json; `{ csv: string }` for csv)

#### Scenario: Agent failure envelope
- **WHEN** export fails with `--json`
- **THEN** stdout JSON has `ok: false`, a stable `code`, and `message`
- **AND** exit code is non-zero

### Requirement: export-test available
The system SHALL expose export-test as specified in the product plan.

#### Scenario: Command succeeds
- **WHEN** the corresponding CLI command runs with valid inputs
- **THEN** it returns success JSON with ok: true when --json is set

### Requirement: Export test type filter

The system SHALL accept an optional question-type filter on `sdm export test` via repeatable `--include-type <type>` **or** repeatable `--exclude-type <type>` (not both). Allowed type values are the question schema enum: `single_choice`, `multi_choice`, `open`, `code`. When neither flag is set, all types remain included (backward compatible). Filtering SHALL apply after skill selection and after adaptive sampling when `--adaptive` is set. `meta.questionCount` SHALL equal the filtered `questions` length. When a filter is applied, `meta.typeFilter` SHALL be present with `mode` (`include` | `exclude`) and `types` (the requested type list). When no filter is applied, `meta.typeFilter` SHALL be omitted.

#### Scenario: Exclude open questions

- **WHEN** an agent runs `sdm export test --profile java-developer --level middle --exclude-type open --json`
- **AND** the library contains `open` and choice questions for required skills
- **THEN** `document.questions` contains no item with `type` `open`
- **AND** `meta.typeFilter` equals `{ "mode": "exclude", "types": ["open"] }`
- **AND** `meta.questionCount` equals the length of `document.questions`

#### Scenario: Include only single_choice

- **WHEN** export runs with `--include-type single_choice` only
- **THEN** every exported question has `type` `single_choice`
- **AND** `meta.typeFilter.mode` is `include`

#### Scenario: Default export unchanged

- **WHEN** export runs without include/exclude type flags
- **THEN** questions of all present library types for required skills may appear
- **AND** `meta.typeFilter` is omitted

#### Scenario: Include and exclude conflict

- **WHEN** both `--include-type` and `--exclude-type` are provided
- **THEN** the command fails with SdmError code `EXPORT_TYPE_FILTER_CONFLICT` and non-zero exit
- **AND** no consumer document is emitted as success

#### Scenario: Invalid type name

- **WHEN** `--exclude-type text` (or any non-enum value) is provided
- **THEN** the command fails with SdmError code `EXPORT_TYPE_INVALID`
- **AND** the error message SHALL mention valid type names (including `open` for short text)

#### Scenario: Filter empties a skill in the package

- **WHEN** a required skill has only `open` questions and export uses `--exclude-type open`
- **THEN** export still succeeds
- **AND** that skill id appears in `meta.skillsMissingQuestions`

### Requirement: Optional shuffle of choice options on export

The system SHALL accept optional `--shuffle-options` on `sdm export test` (MCP: `shuffleOptions`). When set, for each exported `single_choice` or `multi_choice` question the system SHALL apply a uniform random permutation to `options` and remap 1-based `correct` (number or array) to the new indices. Questions of type `open` or `code` MUST remain unchanged. Library YAML MUST NOT be modified. When `--shuffle-options` is omitted, option order MUST match the library (backward compatible).

#### Scenario: Shuffle remaps single_choice correct

- **WHEN** an agent runs `sdm export test --profile <p> --level <l> --shuffle-options --json`
- **AND** a `single_choice` question has options `[A,B,C,D]` with `correct: 1`
- **THEN** the exported question’s `options` are a permutation of `[A,B,C,D]`
- **AND** `correct` is the 1-based index of `A` in the permuted list

#### Scenario: Shuffle remaps multi_choice correct set

- **WHEN** export runs with `--shuffle-options` and a `multi_choice` question has `correct: [1, 3]`
- **THEN** exported `correct` lists the new 1-based indices of the same option texts (as a set)

#### Scenario: Default export keeps library order

- **WHEN** export runs without `--shuffle-options`
- **THEN** each choice question’s `options` and `correct` match the library file order and indices

### Requirement: Optional seed for option shuffle

The system SHALL reuse the existing `--seed <integer>` (also used for adaptive sampling) when `--shuffle-options` is set: option permutation SHALL be deterministic for the same input document and seed. When shuffle is enabled, `meta.optionShuffle` SHALL be present as `{ enabled: true, seed: <number> }`. When shuffle is disabled, `meta.optionShuffle` SHALL be omitted. Passing `--seed` without `--shuffle-options` MUST remain valid (adaptive / default seed behavior).

#### Scenario: Same seed reproduces permutation

- **WHEN** export with `--shuffle-options --seed 42` is run twice on the same project state
- **THEN** both documents have identical `questions[].options` and `questions[].correct` for choice items
- **AND** `meta.optionShuffle` equals `{ "enabled": true, "seed": 42 }`

#### Scenario: Seed without shuffle remains valid

- **WHEN** an agent passes `--seed 1` without `--shuffle-options` (e.g. with `--adaptive`)
- **THEN** the command does not fail solely because seed was provided



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

### Requirement: Stamp content basis on test export meta

When assembling a test export document, `meta` SHALL include a `basis` object with current content hashes for skills represented in the export requirements (and/or selected questions), the level hash under `basis.level`, and ISO `capturedAt`. Wire `schemaVersion` MUST remain `sdm.export.test/v1` (format identity), distinct from content basis.

#### Scenario: Successful export includes basis

- **WHEN** an agent runs `sdm export test --profile P --level L --json` successfully
- **THEN** `document.meta.basis` includes `capturedAt`, `level.id` equal to L with a non-empty hash, and at least one entry in `basis.skills` for a requirement skill present in the document

#### Scenario: Basis does not replace schemaVersion

- **WHEN** a test export document is produced
- **THEN** `schemaVersion` is still `sdm.export.test/v1` and content freshness is expressed only via `meta.basis`
