## MODIFIED Requirements

### Requirement: Core write and coverage APIs have automated tests

The repository SHALL provide an automated test suite for `@spec-driven-methodology/core` that exercises `parseRequirementTriple`, `createRole`, `addSkill`, `linkSkill`, `addQuestion`, `createCertification`, and `computeCoverage` against temporary methodology project directories (not checked-in playground data).

#### Scenario: Happy-path writers and coverage

- **WHEN** the core test suite runs
- **THEN** it MUST create a temp project, successfully call `createRole`, `addSkill` / `linkSkill`, `addQuestion`, and `createCertification` with synthetic data (role created before certification), and assert `computeCoverage` / `parseRequirementTriple` results match expected status or parsed values

#### Scenario: Invalid requirement triple fails fast

- **WHEN** a test invokes `parseRequirementTriple` with a malformed string
- **THEN** the call MUST throw a `SdmError` with code `VALIDATION_FAILED` and MUST NOT write certification files

#### Scenario: Certification without role fails

- **WHEN** a test calls `createCertification` for a role that was not created
- **THEN** the call MUST throw a `SdmError` with code `ROLE_NOT_FOUND` and MUST NOT write a level file

#### Scenario: Fixtures are ephemeral

- **WHEN** tests need a methodology project
- **THEN** they MUST use an OS temporary directory (or equivalent) and MUST NOT require or commit files from workspace `playground/`
