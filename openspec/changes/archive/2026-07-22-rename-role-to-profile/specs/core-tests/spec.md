## ADDED Requirements

### Requirement: Core tests cover profile naming
Automated `@spec-driven-methodology/core` tests SHALL use Profile APIs/paths (`profiles/`, `profile` YAML key) for certification fixtures and MUST NOT require the legacy `roles/` path for new fixtures.

#### Scenario: Temp fixtures use profiles directory
- **WHEN** the core test suite creates certification fixtures
- **THEN** profile files are written under `certifications/profiles/`
