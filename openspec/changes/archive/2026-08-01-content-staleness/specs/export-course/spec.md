## ADDED Requirements

### Requirement: Stamp content basis on course/learning export meta

When assembling a course/learning export document, `meta` SHALL include a `basis` object with current hashes for scoped skills (module skill ids), optional `basis.level` when profile/level scope applies, and ISO `capturedAt`. Wire `schemaVersion` MUST remain the course export format id, distinct from content basis.

#### Scenario: Level-scoped course export includes basis

- **WHEN** an agent exports a course/learning pack for a profile and level successfully
- **THEN** `document.meta.basis` includes `capturedAt`, skill hashes for module skills, and a level hash when level scope is present

#### Scenario: Skill-scoped course export includes skill basis

- **WHEN** an agent exports a learning pack scoped to a single skill
- **THEN** `document.meta.basis.skills` includes that skill id with the current hash
