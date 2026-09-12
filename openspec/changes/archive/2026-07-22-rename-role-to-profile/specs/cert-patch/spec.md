## ADDED Requirements

### Requirement: Cert patch profile consistency uses profile
Optional consistency checks on `sdm cert patch` SHALL use `--profile` (not `--role`) against the level’s `profile` field.

#### Scenario: Patch with profile check
- **WHEN** an agent runs `cert patch --level middle --profile java-developer --add-requirement … --json` and the level belongs to that profile
- **THEN** the patch succeeds
- **AND** a mismatched `--profile` fails with a stable validation/mismatch code
