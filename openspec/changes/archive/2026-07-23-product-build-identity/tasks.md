## 1. Version scripts and SSOT parsing

- [x] 1.1 Add `scripts/bump-version.mjs` (or equivalent) with non-interactive modes: show, build/prerelease, major, minor, patch, alpha, beta, rc, stable
- [x] 1.2 Widen `sync-version.mjs` / `check-version.mjs` to accept `X.Y.Z` and `X.Y.Z-(alpha|beta|rc).N` only; reject invalid identities
- [x] 1.3 Wire root `package.json` npm scripts: `version`, `version:build`, `version:prerelease`, `version:major|minor|patch`, `version:alpha|beta|rc|stable`
- [x] 1.4 Migrate current product identity `0.8.0` → `0.8.0-alpha.1` via sync across workspaces + lockfile

## 2. Build auto-bump

- [x] 2.1 Hook `version:build` into the default `build` script path when identity is prerelease
- [x] 2.2 Honor `SPECRA_NO_BUMP_BUILD=1` to skip mutation; ensure stable identities never auto-bump
- [x] 2.3 Decide verify CI behavior (document: use opt-out in CI if clean tree required) and adjust `verify` if needed

## 3. Runtime surfaces and tests

- [x] 3.1 Confirm CLI `--version`, `about`, and MCP `createServer` already read SSOT (no hardcoded literals); fix any gaps
- [x] 3.2 Extend unit/integration tests: prerelease parity across CLI/about/MCP identity; bump + sync; auto-bump / opt-out / stable no-op
- [x] 3.3 Smoke in playground or linked CLI: rebuild → `sdm --version` and MCP initialize / `about` show incremented `0.8.0-alpha.N`

## 4. Docs and changelog

- [x] 4.1 Add short VERSIONING note (or README section) describing format, scripts, auto-build, and `SPECRA_NO_BUMP_BUILD`
- [x] 4.2 Update CHANGELOG `[Unreleased]` (Russian) for identity/build visibility
- [x] 4.3 Touch AGENTS / ship guidance only if bump commands become part of release `/ship` flow
