## ADDED Requirements

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
