## MODIFIED Requirements

### Requirement: MCP initialize identity uses product branding and SSOT version

The `@spec-driven-methodology/mcp` stdio server SHALL advertise MCP initialize `serverInfo` with:

- `name`: logical id `sdm`
- `title`: `Specra`
- `description`: human string that includes `Methodology-as-Specs Framework` and the full product identity from SSOT (e.g. with a `v` prefix), including stage and build when present
- `version`: equal to the product identity SSOT (root `package.json` via `@spec-driven-methodology/core` helper), including stage and build when present

#### Scenario: Initialize reports Specra title and current version

- **WHEN** an MCP host completes initialize with the Specra server
- **THEN** `serverInfo.title` is `Specra`, `serverInfo.name` is `sdm`, and `serverInfo.version` equals root package version (e.g. `0.8.0-alpha.143`)

#### Scenario: Description includes tagline and full identity

- **WHEN** an MCP host reads `serverInfo.description`
- **THEN** it contains `Methodology-as-Specs Framework` and the same identity string as `serverInfo.version`

#### Scenario: Rebuild changes advertised identity under prerelease

- **WHEN** product identity was `0.8.0-alpha.5`, a build that increments the build number completes, and the MCP server is restarted
- **THEN** `serverInfo.version` equals the new identity (e.g. `0.8.0-alpha.6`) so hosts can distinguish the updated build
