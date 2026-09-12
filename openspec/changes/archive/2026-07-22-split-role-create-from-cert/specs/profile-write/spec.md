## ADDED Requirements

### Requirement: Create certification profile
The system SHALL provide a non-interactive command `sdm profile create` that writes a profile file under `certifications/profiles`, validated by the shared profile schema, without creating a level certification.

#### Scenario: Create profile with empty levels
- **WHEN** an agent runs `sdm profile create java-developer --title "Java Developer" --json` in a methodology project and the profile file does not exist
- **THEN** the system writes `certifications/profiles/java-developer.yaml` with `profile`, `title`, and `levels: []` (or equivalent empty list)
- **AND** no file is created under `certifications/levels/`

#### Scenario: Refuse profile overwrite without force
- **WHEN** the profile file already exists and `--force` is not set
- **THEN** the system fails with stable error code `PROFILE_EXISTS`
- **AND** the existing profile file is unchanged

#### Scenario: Force overwrite profile
- **WHEN** the profile file exists and `profile create` is run with `--force`
- **THEN** the profile file is replaced with the new title and `levels` reset per implementation contract (empty list unless documented otherwise)

### Requirement: Profile schema allows empty levels
The shared `Profile` schema SHALL accept a profile document whose `levels` array is empty so that a profile can exist before any level certification is created.

#### Scenario: Parse profile with no levels
- **WHEN** a profile YAML has `levels: []`
- **THEN** Zod/schema validation succeeds

### Requirement: Machine-readable profile create output
The system SHALL support `--json` on `sdm profile create` for agents and CI.

#### Scenario: JSON success
- **WHEN** `profile create` succeeds with `--json`
- **THEN** stdout contains JSON with `ok: true`, profile payload, and file path

#### Scenario: JSON failure
- **WHEN** `profile create` fails with `--json`
- **THEN** output contains JSON with `ok: false`, stable `code`, and `message`
- **AND** the process exit code is non-zero
