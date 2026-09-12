## ADDED Requirements

### Requirement: Assemble certification test package
The system SHALL assemble a consumer test package for a certification role and level by selecting every question in `library/questions` whose `skill` matches a `requirement.skill` of that level, sorted by skill then question id.

#### Scenario: Export includes required-skill questions
- **WHEN** the user runs `sdm export test --role java-developer --level middle` in a project with example methodology
- **THEN** the export document includes questions for skills required by the middle level that have library entries
- **AND** questions are ordered by skill ascending, then id ascending

#### Scenario: Skills with zero questions do not fail export
- **WHEN** a required skill has zero matching questions
- **THEN** the export still succeeds with exit code 0
- **AND** that skill id appears in `meta.skillsMissingQuestions`

#### Scenario: Level or role missing
- **WHEN** the role or level cannot be loaded
- **THEN** the system reports a SdmError and exits non-zero

### Requirement: Test export document shape and formats
The system SHALL emit a versioned test document with `schemaVersion` equal to `sdm.export.test/v1`, including role, level, title, threshold, requirements, questions, and meta counts. Default format SHALL be JSON. CSV format SHALL flatten questions to rows with columns `id,skill,difficulty,type,text,options,correct,explanation`.

#### Scenario: Default JSON to stdout
- **WHEN** `sdm export test --role <role> --level <level>` succeeds without `--format`
- **THEN** stdout is a JSON document with `schemaVersion` `sdm.export.test/v1` and a `questions` array

#### Scenario: CSV format
- **WHEN** `sdm export test --role <role> --level <level> --format csv` succeeds
- **THEN** stdout is CSV text with a header row and one data row per exported question

#### Scenario: Invalid format
- **WHEN** `--format` is not `json` or `csv`
- **THEN** the system fails with code `EXPORT_FORMAT_INVALID` and a non-zero exit code

### Requirement: Agent envelope for test export
The system SHALL support `--json` that wraps the consumer document in `{ ok: true, format, document }` on success and `{ ok: false, code, message }` on failure.

#### Scenario: Agent success envelope
- **WHEN** `sdm export test --role <role> --level <level> --json` succeeds
- **THEN** stdout JSON has `ok: true`, `format` matching the chosen format, and `document` containing the export payload (object for json; `{ csv: string }` for csv)

#### Scenario: Agent failure envelope
- **WHEN** export fails with `--json`
- **THEN** stdout JSON has `ok: false`, a stable `code`, and `message`
- **AND** exit code is non-zero
