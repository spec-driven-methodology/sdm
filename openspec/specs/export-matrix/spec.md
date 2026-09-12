# export-matrix

## Purpose

Export a profile competency matrix (levels × skills) for HR and other methodology consumers.

## Requirements

### Requirement: Assemble profile competency matrix
The system SHALL assemble a competency matrix for a profile by loading every level listed in the profile’s `levels` array and emitting one cell per requirement (`skill`, `level`, `depth`, `weight`).

#### Scenario: Matrix for example java-developer
- **WHEN** the user runs `sdm export matrix --profile java-developer` in a project where all listed levels exist
- **THEN** the export includes cells for each requirement of each loaded level
- **AND** the document identifies the profile id and title

#### Scenario: Missing level file
- **WHEN** a level id listed on the profile has no matching file under `certifications/levels`
- **THEN** the system reports an error and exits non-zero

#### Scenario: Profile missing
- **WHEN** the profile file cannot be loaded
- **THEN** the system reports a SdmError and exits non-zero

### Requirement: Matrix export formats
The system SHALL emit a versioned matrix document with `schemaVersion` equal to `sdm.export.matrix/v1`. Default format SHALL be CSV with columns `skill,level,depth,weight`. JSON format SHALL include `profile`, `title`, `levels`, and a `cells` array of the same long-form rows.

#### Scenario: Default CSV to stdout
- **WHEN** `sdm export matrix --profile <profile>` succeeds without `--format`
- **THEN** stdout is CSV text with header `skill,level,depth,weight`

#### Scenario: JSON format
- **WHEN** `sdm export matrix --profile <profile> --format json` succeeds
- **THEN** stdout is JSON with `schemaVersion` `sdm.export.matrix/v1` and a `cells` array

#### Scenario: Invalid format
- **WHEN** `--format` is not `csv` or `json`
- **THEN** the system fails with code `EXPORT_FORMAT_INVALID` and a non-zero exit code

### Requirement: Agent envelope for matrix export
The system SHALL support `--json` that wraps the consumer document in `{ ok: true, format, document }` on success and `{ ok: false, code, message }` on failure.

#### Scenario: Agent success envelope
- **WHEN** `sdm export matrix --profile <profile> --json` succeeds
- **THEN** stdout JSON has `ok: true`, `format`, and `document` (object for json format; `{ csv: string }` for csv)

#### Scenario: Agent failure envelope
- **WHEN** matrix export fails with `--json`
- **THEN** stdout JSON has `ok: false`, a stable `code`, and `message`
- **AND** exit code is non-zero
