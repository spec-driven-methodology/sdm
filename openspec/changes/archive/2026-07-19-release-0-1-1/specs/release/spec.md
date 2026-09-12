## ADDED Requirements

### Requirement: Version 0.1.1 is cut from Unreleased

The Specra monorepo SHALL publish release metadata for version `0.1.1` by moving the prior Unreleased notes into a dated changelog section and setting package versions to `0.1.1`.

#### Scenario: Changelog and packages align

- **WHEN** the release cut is complete
- **THEN** `CHANGELOG.md` MUST contain `## [0.1.1]` with the former Unreleased additions
- **AND** root / `@spec-driven-methodology/core` / `@spec-driven-methodology/cli` `package.json` versions MUST be `0.1.1`
- **AND** `[Unreleased]` MUST not still claim those shipped items as unreleased
