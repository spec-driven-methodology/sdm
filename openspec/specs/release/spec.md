# release

## Purpose

Release cut metadata for SDM SemVer versions (changelog sections and package versions).
## Requirements
### Requirement: Version 0.1.1 is cut from Unreleased

The SDM monorepo SHALL publish release metadata for version `0.1.1` by moving the prior Unreleased notes into a dated changelog section and setting package versions to `0.1.1`.

#### Scenario: Changelog and packages align

- **WHEN** the release cut is complete
- **THEN** `CHANGELOG.md` MUST contain `## [0.1.1]` with the former Unreleased additions
- **AND** root / `@spec-driven-methodology/core` / `@spec-driven-methodology/cli` `package.json` versions MUST be `0.1.1`
- **AND** `[Unreleased]` MUST not still claim those shipped items as unreleased

### Requirement: Version 0.1.2 is cut from Unreleased

The SDM monorepo SHALL publish release metadata for version `0.1.2` including question list, cert gaps, and MCP stdio notes moved out of Unreleased, with package versions set to `0.1.2`.

#### Scenario: Changelog and packages align for 0.1.2

- **WHEN** the 0.1.2 release cut is complete
- **THEN** `CHANGELOG.md` MUST contain `## [0.1.2]` with list/gaps/MCP additions
- **AND** root / core / cli / mcp package versions MUST be `0.1.2`

### Requirement: Version 0.1.3 is cut from Unreleased

The SDM monorepo SHALL publish `0.1.3` with question generate notes moved from Unreleased and package versions set to `0.1.3`.

#### Scenario: Changelog and packages align for 0.1.3

- **WHEN** the 0.1.3 release cut is complete
- **THEN** `CHANGELOG.md` MUST contain `## [0.1.3]` with generate notes
- **AND** root / core / cli / mcp package versions MUST be `0.1.3`

### Requirement: Version 0.1.4 is cut from Unreleased

The SDM monorepo SHALL publish `0.1.4` with cert patch and MCP install/config notes moved from Unreleased and package versions set to `0.1.4`.

#### Scenario: Changelog and packages align for 0.1.4

- **WHEN** the 0.1.4 release cut is complete
- **THEN** `CHANGELOG.md` MUST contain `## [0.1.4]` with cert patch and MCP install notes
- **AND** root / core / cli / mcp package versions MUST be `0.1.4`

### Requirement: Version 0.1.5 is cut from Unreleased

The SDM monorepo SHALL publish `0.1.5` with export test/matrix notes moved from Unreleased and package versions set to `0.1.5`.

#### Scenario: Changelog and packages align for 0.1.5

- **WHEN** the 0.1.5 release cut is complete
- **THEN** `CHANGELOG.md` MUST contain `## [0.1.5]` with export test/matrix notes
- **AND** root / core / cli / mcp package versions MUST be `0.1.5`

### Requirement: Version 0.1.6 is cut from Unreleased

The SDM monorepo SHALL publish `0.1.6` with MCP test / import-safe server notes moved from Unreleased and package versions set to `0.1.6`.

#### Scenario: Changelog and packages align for 0.1.6

- **WHEN** the 0.1.6 release cut is complete
- **THEN** `CHANGELOG.md` MUST contain `## [0.1.6]` with MCP test notes
- **AND** root / core / cli / mcp package versions MUST be `0.1.6`

### Requirement: Version 0.1.7 is cut from Unreleased

The SDM monorepo SHALL publish `0.1.7` with export mermaid notes moved from Unreleased and package versions set to `0.1.7`.

#### Scenario: Changelog and packages align for 0.1.7

- **WHEN** the 0.1.7 release cut is complete
- **THEN** `CHANGELOG.md` MUST contain `## [0.1.7]` with export mermaid notes
- **AND** root / core / cli / mcp package versions MUST be `0.1.7`

### Requirement: Release 0.2.0
The project SHALL publish version 0.2.0 reflecting skill graph and depth-aware coverage.

#### Scenario: Version alignment
- **WHEN** the release is cut
- **THEN** root and workspace package.json versions are 0.2.0
- **AND** CHANGELOG has a `[0.2.0]` section

### Requirement: Release 0.4.0
The project SHALL publish version 0.4.0 for the product-complete methodology core.

#### Scenario: Version alignment
- **WHEN** the release is cut
- **THEN** workspace package versions are 0.4.0

### Requirement: Release bump syncs workspace versions from SSOT

When cutting a SDM release that changes product identity, the process SHALL set the root `package.json` `version` (stable `MAJOR.MINOR.PATCH` or prerelease `MAJOR.MINOR.PATCH-<stage>.<build>`) and run the version sync so all `packages/*/package.json` versions match, the lockfile reflects the bump, and internal workspace dependency pins do not retain a stale older identity. CLI/MCP sources MUST NOT require a separate hardcoded version edit for the cut. Intentional release cuts SHOULD use the documented bump scripts (stage/major/minor/patch/stable) rather than hand-editing four package files.

#### Scenario: Post-bump packages and lock agree

- **WHEN** a release bump to a new identity is completed via the documented sync path
- **THEN** root and each workspace `package.json` `version` equal that identity
- **AND** `version:check` (or verify) passes

#### Scenario: No manual CLI/MCP version string edit

- **WHEN** only package.json SSOT/sync is updated for a bump
- **THEN** `sdm --version` and MCP initialize `version` report the new identity after build without editing version literals in CLI/MCP source

#### Scenario: Stable cut strips prerelease

- **WHEN** the stable bump path is used from `0.9.0-rc.3`
- **THEN** product identity becomes `0.9.0` across root and workspace packages

