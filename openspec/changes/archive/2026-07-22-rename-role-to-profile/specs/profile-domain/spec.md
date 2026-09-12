## ADDED Requirements

### Requirement: Profile is the canonical assessment track entity
The product SHALL use the term **Profile** (not Role) for the certification track entity that groups levels and is referenced by levels, teams, coverage, gaps, and exports. User-facing docs and agent skills MUST explain Profile as the competency/assessment profile for methodologists.

#### Scenario: Glossary in agent docs
- **WHEN** an agent reads `AGENTS.md`
- **THEN** it describes creating a **profile** (e.g. Java backend Middle) and MUST NOT present Role as a Specra entity name

### Requirement: On-disk profile layout
New writes SHALL store profiles under `certifications/profiles/<id>.yaml` with YAML key `profile` (plus `title` and `levels`). Level and team documents that reference a profile SHALL use YAML key `profile`.

#### Scenario: Profile file location
- **WHEN** the system creates a profile `java-backend`
- **THEN** it writes `certifications/profiles/java-backend.yaml` containing `profile: java-backend`

### Requirement: Legacy role layout read compatibility
During the transition window the system MAY load legacy `certifications/roles/*.yaml` and YAML key `role` as profiles. Writers MUST NOT create new files under `certifications/roles/`.

#### Scenario: Legacy role file loads as profile
- **WHEN** a methodology project still has `certifications/roles/java-developer.yaml` with key `role`
- **THEN** profile-scoped commands can resolve that id as a profile
- **AND** a subsequent write of that profile uses `certifications/profiles/` and key `profile`

### Requirement: Doctor reports legacy role paths
`sdm doctor` SHALL warn when legacy `certifications/roles/` is present so humans/agents can migrate.

#### Scenario: Doctor warns on roles directory
- **WHEN** `certifications/roles/` exists and contains YAML
- **THEN** doctor output includes a clear migration warning mentioning profiles
