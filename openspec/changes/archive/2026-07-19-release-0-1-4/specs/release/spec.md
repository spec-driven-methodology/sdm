## ADDED Requirements

### Requirement: Version 0.1.4 is cut from Unreleased

The Specra monorepo SHALL publish `0.1.4` with cert patch and MCP install/config notes moved from Unreleased and package versions set to `0.1.4`.

#### Scenario: Changelog and packages align for 0.1.4

- **WHEN** the 0.1.4 release cut is complete
- **THEN** `CHANGELOG.md` MUST contain `## [0.1.4]` with cert patch and MCP install notes
- **AND** root / core / cli / mcp package versions MUST be `0.1.4`
