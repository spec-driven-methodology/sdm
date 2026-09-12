## MODIFIED Requirements

### Requirement: Core about payload is project-independent

`@spec-driven-methodology/core` SHALL expose a function that returns a JSON-serializable about payload with at least: `ok: true`, `version` (full product identity string from SSOT, including stage and build when present), `positioning` (`what`, `whatNot`, `model`), `capabilities` (`cli`, `mcp`, `skills`), `nextSteps`, and `pointers`. Building the payload MUST NOT require a methodology project directory (`sdm.yaml`).

#### Scenario: About without project root

- **WHEN** about is invoked from a directory that is not a SDM methodology project
- **THEN** the payload still returns `ok: true` with version and positioning

#### Scenario: Version matches package identity

- **WHEN** about builds the payload and root `package.json` version is `0.8.0-alpha.143`
- **THEN** `version` MUST equal `0.8.0-alpha.143`
