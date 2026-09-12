## ADDED Requirements

### Requirement: About version uses shared product-version helper

Building the about payload MUST obtain `version` through the same `@spec-driven-methodology/core` product-version helper used by CLI `--version` and MCP initialize (root package.json SSOT). About MUST NOT read a divergent package path for product version.

#### Scenario: About matches CLI version string

- **WHEN** an agent runs `sdm about --json` and `sdm --version` in the same Specra install
- **THEN** `about.version` equals the CLI version string
