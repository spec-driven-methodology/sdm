## ADDED Requirements

### Requirement: Release bump syncs workspace versions from SSOT

When cutting a Specra release that changes product semver, the process SHALL set the root `package.json` `version` and run the version sync so all `packages/*/package.json` versions match, the lockfile reflects the bump, and internal workspace dependency pins do not retain a stale older semver. CLI/MCP sources MUST NOT require a separate hardcoded version edit for the cut.

#### Scenario: Post-bump packages and lock agree

- **WHEN** a release bump to a new semver is completed via the documented sync path
- **THEN** root and each workspace `package.json` `version` equal that semver
- **AND** `version:check` (or verify) passes

#### Scenario: No manual CLI/MCP version string edit

- **WHEN** only package.json SSOT/sync is updated for a bump
- **THEN** `sdm --version` and MCP initialize `version` report the new semver after build without editing version literals in CLI/MCP source
