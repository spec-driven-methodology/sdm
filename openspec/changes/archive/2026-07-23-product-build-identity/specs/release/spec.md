## MODIFIED Requirements

### Requirement: Release bump syncs workspace versions from SSOT

When cutting a Specra release that changes product identity, the process SHALL set the root `package.json` `version` (stable `MAJOR.MINOR.PATCH` or prerelease `MAJOR.MINOR.PATCH-<stage>.<build>`) and run the version sync so all `packages/*/package.json` versions match, the lockfile reflects the bump, and internal workspace dependency pins do not retain a stale older identity. CLI/MCP sources MUST NOT require a separate hardcoded version edit for the cut. Intentional release cuts SHOULD use the documented bump scripts (stage/major/minor/patch/stable) rather than hand-editing four package files.

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
