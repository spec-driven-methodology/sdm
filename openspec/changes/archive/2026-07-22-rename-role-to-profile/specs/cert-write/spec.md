## MODIFIED Requirements

### Requirement: Create certification role and level
The system SHALL provide a non-interactive command `sdm cert create` that writes certification artifacts using the **Profile** term: flags `--profile` (and profile title only if still required by current invent/upsert behavior), level files with YAML key `profile`, and profile files under `certifications/profiles/`. Public help and `--json` payloads MUST NOT use Role as the entity name.

#### Scenario: Create certification with profile flag
- **WHEN** an agent runs `sdm cert create --profile qa-engineer --profile-title "QA" --level qa-middle --level-title "Middle QA" --requirement java-core:0.5:1.0` and skill `java-core` exists
- **THEN** the system writes/updates `certifications/profiles/qa-engineer.yaml` listing level `qa-middle`
- **AND** writes `certifications/levels/qa-middle.yaml` with `profile: qa-engineer` and requirements

#### Scenario: JSON uses profile fields
- **WHEN** `cert create` succeeds with `--json`
- **THEN** stdout JSON includes profile identity under a `profile` field (not `role`)

## ADDED Requirements

### Requirement: No Role flags on cert create
`sdm cert create` MUST reject or omit public `--role` / `--role-title` flags after this change; agents SHALL use `--profile` / `--profile-title` (or omit title when sibling `profile create` lands).

#### Scenario: Legacy role flag not documented as supported
- **WHEN** an agent follows current product docs for cert create
- **THEN** examples use `--profile` and do not instruct `--role`
