## ADDED Requirements

### Requirement: Export intents map type preferences to export_test filter

When the human’s intent is to export a test package and they specify question-type preferences in natural language (e.g. «без текстовых», «без open», «только с выбором ответа», «без свободного ввода»), the `intent-loop` (and/or delegated `export-methodology`) skill SHALL map those preferences to MCP `export_test` / CLI `export test` type-filter arguments — not to `jq`, hand-edited JSON, or instructing the human to pass flags. Short-text / free-form answers map to domain type `open`. The agent MUST confirm the plan (profile, level, filter) before running the export write/pipe when the workflow requires confirmation; for a pure export handoff after an existing profile/level, the skill MAY proceed after a short confirmation of the filter.

#### Scenario: Human asks for export without text questions

- **WHEN** the human says approximately «сделай экспорт теста Middle без текстовых вопросов»
- **THEN** the agent calls `export_test` (or CLI equivalent) with `excludeTypes: ["open"]` / `--exclude-type open`
- **AND** does not instruct the human to run a `jq` filter pipeline

#### Scenario: Human asks only for multiple choice style

- **WHEN** the human asks for an export with only single- and multi-select questions
- **THEN** the agent uses include filter `single_choice` and `multi_choice` (or exclude `open` and `code` as appropriate to the stated intent)
