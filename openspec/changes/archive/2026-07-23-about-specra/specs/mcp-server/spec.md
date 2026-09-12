## ADDED Requirements

### Requirement: MCP tool about

The `@spec-driven-methodology/mcp` server SHALL expose tool `about` that returns JSON text with the same about payload as `sdm about --json` (`ok: true`, version, positioning, capabilities, nextSteps, pointers). The tool MUST NOT require a methodology project. Optional `project` MAY be accepted for schema uniformity but MUST NOT be required for success.

#### Scenario: about tool success without project

- **WHEN** a host calls `about` with no project argument
- **THEN** the tool result MUST contain JSON text with `ok: true`, a `version` string, and `positioning`

#### Scenario: about matches CLI contract

- **WHEN** a host calls `about` and separately runs `sdm about --json` from the same Specra install
- **THEN** both payloads share the same field set for version, positioning, capabilities, nextSteps, and pointers

### Requirement: Tool list includes about

When a host lists SDM MCP tools, the set MUST include `about`.

#### Scenario: about is listed

- **WHEN** a host lists SDM MCP tools
- **THEN** the set includes `about`
