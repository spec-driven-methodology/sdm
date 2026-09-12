## ADDED Requirements

### Requirement: Standalone agent install remains supported

`sdm agent install --hosts …` SHALL remain a supported way to mirror portable skills without rewriting MCP host config. Docs and `connect-mcp` MAY recommend the coupled `mcp install` path as the primary wire, but MUST NOT remove or break standalone skills install.

#### Scenario: Skills-only refresh

- **WHEN** the user runs `sdm agent install --hosts cursor --cursor-root <dir> --json` after MCP is already configured
- **THEN** portable skills are mirrored under `<dir>/.cursor/skills/`
- **AND** the command does not require rewriting `.cursor/mcp.json`

### Requirement: Shared host roots with mcp install

When `mcp install` invokes skills install for the same `--hosts` selection, it SHALL use the same host root resolution as standalone `agent install` (`--cursor-root`, `--gigacode-home`, agents root / `SDM_HOME` / `--agents-root`).

#### Scenario: Same cursor-root for coupled install

- **WHEN** agent runs `sdm mcp install --hosts cursor --cursor-root <dir> --json` without `--no-skills`
- **THEN** skills land under `<dir>/.cursor/skills/` (same root rules as `agent install --hosts cursor --cursor-root <dir>`)
