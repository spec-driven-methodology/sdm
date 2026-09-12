## ADDED Requirements

### Requirement: Product version single source of truth

The Specra monorepo SHALL treat the root package `package.json` field `version` (package name `sdm`) as the sole product semver source of truth. `@spec-driven-methodology/core` SHALL expose a function that returns that string by resolving the Specra package root (same resolution family as `about` / `resolveSpecraHome`). CLI `sdm --version`, MCP server initialize `version`, and `about` payload `version` MUST all equal that value.

#### Scenario: Runtime surfaces agree

- **WHEN** an agent reads product version via `sdm --version`, MCP initialize `serverInfo.version`, and `sdm about --json`
- **THEN** all three MUST equal the root `package.json` `version`

#### Scenario: Helper does not use workspace package versions as SSOT

- **WHEN** `packages/cli/package.json` or `packages/mcp/package.json` temporarily differ from the root version
- **THEN** the shared product-version helper MUST still return the root version (parity check scripts MAY fail separately)

### Requirement: Workspace package versions stay aligned

Root and each workspace package under `packages/*/package.json` SHALL carry the same `version` string after a version sync. The repository SHALL provide a non-interactive sync script (or npm script) that writes that version to root and all workspace packages and refreshes the lockfile as needed. A check script (or verify step) SHALL fail when those versions diverge.

#### Scenario: Check fails on drift

- **WHEN** root `version` is `0.6.0` and `@spec-driven-methodology/cli` `version` is `0.5.0`
- **THEN** `version:check` (or equivalent verify step) MUST exit non-zero

#### Scenario: Sync aligns packages

- **WHEN** an agent or release process runs version sync for a target semver
- **THEN** root and all `packages/*/package.json` `version` fields equal that semver

### Requirement: No hardcoded product version in CLI or MCP source

CLI and MCP TypeScript sources MUST NOT embed a literal product semver string for Commander `.version()` or MCP `createServer` initialize identity. Product version MUST be loaded via the shared core helper (or thin wrappers that call it).

#### Scenario: Source has no literal product semver for identity

- **WHEN** a maintainer searches CLI/MCP `src` for hardcoded product identity versions
- **THEN** there is no Commander `.version("x.y.z")` and no MCP `createServer` default version literal that bypasses the helper

### Requirement: README does not hardcode current product version

User-facing `README.md` MUST NOT claim a specific current product semver in prose that can drift (e.g. «текущая версия **X.Y.Z**»). It SHALL point readers to `CHANGELOG.md` and/or `sdm --version` / `about` for the current version.

#### Scenario: README has no stale version badge prose

- **WHEN** a release bumps package versions
- **THEN** README does not require a manual product-version number edit to stay truthful
