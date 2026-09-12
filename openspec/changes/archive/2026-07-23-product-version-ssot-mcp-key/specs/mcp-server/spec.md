## ADDED Requirements

### Requirement: MCP initialize identity uses product branding and SSOT version

The `@spec-driven-methodology/mcp` stdio server SHALL advertise MCP initialize `serverInfo` with:

- `name`: logical id `sdm`
- `title`: `Specra`
- `description`: human string that includes `Spec-based Resource Assessment Framework` and the product version (e.g. with a `v` prefix)
- `version`: equal to the product version SSOT (root `package.json` via `@spec-driven-methodology/core` helper)

#### Scenario: Initialize reports Specra title and current version

- **WHEN** an MCP host completes initialize with the Specra server
- **THEN** `serverInfo.title` is `Specra`, `serverInfo.name` is `sdm`, and `serverInfo.version` equals root package version

#### Scenario: Description includes tagline and version

- **WHEN** an MCP host reads `serverInfo.description`
- **THEN** it contains `Spec-based Resource Assessment Framework` and the same semver as `serverInfo.version`
