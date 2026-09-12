## ADDED Requirements

### Requirement: Version 0.1.2 is cut from Unreleased

The Specra monorepo SHALL publish release metadata for version `0.1.2` including question list, cert gaps, and MCP stdio notes moved out of Unreleased, with package versions set to `0.1.2`.

#### Scenario: Changelog and packages align

- **WHEN** the release cut is complete
- **THEN** `CHANGELOG.md` MUST contain `## [0.1.2]` with list/gaps/MCP additions
- **AND** root / core / cli / mcp package versions MUST be `0.1.2`
