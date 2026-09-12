## MODIFIED Requirements

### Requirement: Test export document shape and formats
The system SHALL emit a versioned test document with `schemaVersion` equal to `sdm.export.test/v1`, including profile, level, title, threshold, requirements, questions, and meta counts. Each exported question SHALL include fields from the library question, and SHALL include `expected` when present on the source question. Default format SHALL be JSON. CSV format SHALL flatten questions to rows with columns `id,skill,difficulty,type,text,options,correct,explanation,expected`.

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
