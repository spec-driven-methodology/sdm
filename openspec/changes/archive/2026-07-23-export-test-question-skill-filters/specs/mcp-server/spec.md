## ADDED Requirements

### Requirement: export_test supports skill and question filters

The MCP tool `export_test` SHALL accept optional `includeSkills` and `excludeSkills` as arrays of skill id strings, and optional `includeQuestions` as an array of question id strings, with the same semantics, mutual exclusion, filter pipeline order, document `meta` fields, and SdmError codes as CLI `export test` (`EXPORT_SKILL_FILTER_CONFLICT`, `EXPORT_SKILL_UNKNOWN`, `EXPORT_QUESTION_NOT_FOUND`, `EXPORT_FILTER_EMPTY`). On success the returned `document` SHALL reflect the filtered package. These args MAY be combined with existing `includeTypes` / `excludeTypes` under the same pipeline rules as the CLI.

#### Scenario: export_test includeSkills

- **WHEN** a host calls `export_test` with `includeSkills: ["ai-quality"]` against a valid project and profile/level that requires that skill
- **THEN** the tool returns `ok: true` and every `document.questions[].skill` is `ai-quality`
- **AND** `document.meta.skillFilter.mode` is `include`

#### Scenario: export_test includeQuestions

- **WHEN** a host calls `export_test` with `includeQuestions: ["q-ai-quality-005"]` and that question is a valid candidate for the profile/level
- **THEN** the tool returns `ok: true` and `document.questions` contains exactly that question id
- **AND** `document.meta.questionFilter.mode` is `include`

#### Scenario: export_test skill filter conflict

- **WHEN** a host calls `export_test` with both non-empty `includeSkills` and `excludeSkills`
- **THEN** the tool returns `ok: false` with code `EXPORT_SKILL_FILTER_CONFLICT`
