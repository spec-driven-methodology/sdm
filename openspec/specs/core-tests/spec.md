# core-tests

## Purpose

Automated regression tests and npm scripts that verify `@spec-driven-methodology/core` write/coverage APIs and provide a single verify entrypoint for developers.

## Requirements

### Requirement: Core write and coverage APIs have automated tests

The repository SHALL provide an automated test suite for `@spec-driven-methodology/core` that exercises `parseRequirementTriple`, `addSkill`, `linkSkill`, `addQuestion`, `createCertification`, and `computeCoverage` against temporary methodology project directories (not checked-in playground data).

#### Scenario: Happy-path writers and coverage

- **WHEN** the core test suite runs
- **THEN** it MUST create a temp project, successfully call `addSkill` / `linkSkill`, `addQuestion`, and `createCertification` with synthetic data, and assert `computeCoverage` / `parseRequirementTriple` results match expected status or parsed values

#### Scenario: Invalid requirement triple fails fast

- **WHEN** a test invokes `parseRequirementTriple` with a malformed string
- **THEN** the call MUST throw a `SdmError` with code `VALIDATION_FAILED` and MUST NOT write certification files

#### Scenario: Fixtures are ephemeral

- **WHEN** tests need a methodology project
- **THEN** they MUST use an OS temporary directory (or equivalent) and MUST NOT require or commit files from workspace `playground/`

### Requirement: npm test and verify scripts

The Specra monorepo root SHALL expose `npm test` (runs `@spec-driven-methodology/core` tests) and a single `npm run verify` script that runs build, typecheck, and tests in sequence.

#### Scenario: Developer runs verify

- **WHEN** a developer runs `npm run verify` from the Specra repo root after installing dependencies
- **THEN** the command MUST fail if build, typecheck, or the core test suite fails, and MUST succeed only when all three pass

#### Scenario: npm test is wired

- **WHEN** a developer runs `npm test` from the Specra repo root
- **THEN** the `@spec-driven-methodology/core` automated suite MUST execute and exit non-zero on assertion or runtime failure
