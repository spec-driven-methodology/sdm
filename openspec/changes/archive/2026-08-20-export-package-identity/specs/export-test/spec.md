## MODIFIED Requirements

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
