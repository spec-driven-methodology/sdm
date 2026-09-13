# product-version

## Purpose

Единый источник правды для продуктовой identity SDM (root `package.json`: stable `X.Y.Z` или `X.Y.Z-(alpha|beta|rc).N`), runtime readers и sync/check/bump при сборке и релизе.

## Requirements

### Requirement: Product version single source of truth

The SDM monorepo SHALL treat the root package `package.json` field `version` (package name `sdm`) as the sole product identity source of truth. That value MAY be stable `MAJOR.MINOR.PATCH` or prerelease `MAJOR.MINOR.PATCH-<stage>.<build>` as defined by this capability. `@spec-driven-methodology/core` SHALL expose a function that returns that string by resolving the SDM package root (same resolution family as `about` / `resolveSdmHome`). CLI `sdm --version`, MCP server initialize `version`, and `about` payload `version` MUST all equal that value.

#### Scenario: Runtime surfaces agree

- **WHEN** an agent reads product version via `sdm --version`, MCP initialize `serverInfo.version`, and `sdm about --json`
- **THEN** all three MUST equal the root `package.json` `version` (including stage and build when present)

#### Scenario: Helper does not use workspace package versions as SSOT

- **WHEN** `packages/cli/package.json` or `packages/mcp/package.json` temporarily differ from the root version
- **THEN** the shared product-version helper MUST still return the root version (parity check scripts MAY fail separately)

### Requirement: Workspace package versions stay aligned

Root and each workspace package under `packages/*/package.json` SHALL carry the same `version` string after a version sync, including prerelease stage and build when present. The repository SHALL provide a non-interactive sync script (or npm script) that writes that version to root and all workspace packages and refreshes the lockfile as needed. A check script (or verify step) SHALL fail when those versions diverge.

#### Scenario: Check fails on drift

- **WHEN** root `version` is `0.8.0-alpha.10` and `@spec-driven-methodology/cli` `version` is `0.8.0-alpha.9`
- **THEN** `version:check` (or equivalent verify step) MUST exit non-zero

#### Scenario: Sync aligns packages

- **WHEN** an agent or release process runs version sync for a target identity `0.8.0-alpha.11`
- **THEN** root and all `packages/*/package.json` `version` fields equal that identity

### Requirement: Product identity includes optional stage and build number

The product version SSOT string SHALL match either stable semver `MAJOR.MINOR.PATCH` or prerelease form `MAJOR.MINOR.PATCH-<stage>.<build>` where `<stage>` is one of `alpha`, `beta`, `rc` and `<build>` is a positive integer (example: `0.8.0-alpha.143`). The build integer identifies successive local/product builds within a stage and MUST NOT require a date component. Runtime helpers (`getProductVersion` and surfaces that consume it) MUST return this full string unchanged.

#### Scenario: Prerelease identity is accepted as SSOT

- **WHEN** root `package.json` `version` is `0.8.0-alpha.143`
- **THEN** `getProductVersion()` returns exactly `0.8.0-alpha.143`
- **AND** `version:sync` / `version:check` treat that string as the aligned product identity

#### Scenario: Stable identity remains valid

- **WHEN** root `package.json` `version` is `0.8.0`
- **THEN** `getProductVersion()` returns exactly `0.8.0`

### Requirement: Non-interactive bump scripts for stage and build

The repository SHALL provide non-interactive npm scripts (or equivalent) that update the SSOT identity and sync workspace packages: at least print current version, increment build/prerelease number within the current stage, bump major/minor/patch (resetting build to `1` when a stage is present), set stage to `alpha` / `beta` / `rc` (build `1`), and strip prerelease for stable. Agents MUST be able to invoke these without TTY prompts.

#### Scenario: Build increment

- **WHEN** current identity is `0.8.0-alpha.143` and the build-bump script runs
- **THEN** root and workspace package versions become `0.8.0-alpha.144`
- **AND** `version:check` passes

#### Scenario: Stage switch resets build

- **WHEN** current identity is `0.8.0-alpha.12` and the beta-stage script runs
- **THEN** product identity becomes `0.8.0-beta.1`

### Requirement: Build auto-increments on compile for prerelease identities

When the product identity is in prerelease form, the default package `build` path SHALL increment the build number (and sync workspaces) before or as part of compilation, unless an explicit opt-out environment variable `SDM_NO_BUMP_BUILD=1` is set. When the identity is stable (no prerelease), the build path MUST NOT mutate the version.

#### Scenario: Prerelease build bumps identity

- **WHEN** root version is `0.8.0-alpha.5` and `npm run build` runs without `SDM_NO_BUMP_BUILD`
- **THEN** after the build step the SSOT version is `0.8.0-alpha.6` (or higher by exactly one from the pre-build value)

#### Scenario: Opt-out leaves version unchanged

- **WHEN** root version is `0.8.0-alpha.5` and `npm run build` runs with `SDM_NO_BUMP_BUILD=1`
- **THEN** the SSOT version remains `0.8.0-alpha.5`

#### Scenario: Stable build does not mutate version

- **WHEN** root version is `0.8.0` and `npm run build` runs
- **THEN** the SSOT version remains `0.8.0`

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
