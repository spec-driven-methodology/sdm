## ADDED Requirements

### Requirement: Version 0.1.6 is cut from Unreleased

The Specra monorepo SHALL publish `0.1.6` with MCP test / import-safe server notes moved from Unreleased and package versions set to `0.1.6`.

#### Scenario: Changelog and packages align for 0.1.6

- **WHEN** the 0.1.6 release cut is complete
- **THEN** `CHANGELOG.md` MUST contain `## [0.1.6]` with MCP test notes
- **AND** root / core / cli / mcp package versions MUST be `0.1.6`
