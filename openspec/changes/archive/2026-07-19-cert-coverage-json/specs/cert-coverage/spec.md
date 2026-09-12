## ADDED Requirements

### Requirement: Machine-readable coverage output
The system SHALL support `--json` on `sdm cert coverage` for agents and CI.

#### Scenario: JSON success
- **WHEN** `sdm cert coverage --role <role> --level <level> --json` succeeds
- **THEN** stdout contains JSON with `ok: true`, skill coverage entries (including status and questionCount), and `hasMissing`

#### Scenario: JSON failure
- **WHEN** coverage fails (e.g. project root or level not found) with `--json`
- **THEN** output contains JSON with `ok: false`, a stable error `code`, and `message`
- **AND** the process exit code is non-zero

#### Scenario: JSON preserves fail-on-missing
- **WHEN** coverage succeeds structurally but at least one skill is missing (0 questions) and `--json` is set
- **THEN** JSON includes `hasMissing: true`
- **AND** the process exit code is non-zero
