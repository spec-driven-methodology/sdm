## ADDED Requirements

### Requirement: Version 0.1.7 is cut from Unreleased

The Specra monorepo SHALL publish `0.1.7` with export mermaid notes moved from Unreleased and package versions set to `0.1.7`.

#### Scenario: Changelog and packages align for 0.1.7

- **WHEN** the 0.1.7 release cut is complete
- **THEN** `CHANGELOG.md` MUST contain `## [0.1.7]` with export mermaid notes
- **AND** root / core / cli / mcp package versions MUST be `0.1.7`
