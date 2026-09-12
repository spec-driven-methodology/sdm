## Why

Local Specra builds often stay on the same semver (e.g. `0.8.0`) while code changes a lot. `sdm --version`, `about`, and Cursor’s MCP sidebar (`serverInfo.version` / description) then cannot tell whether the linked CLI/MCP is the current build or a stale one.

## What Changes

- Extend product identity beyond bare `MAJOR.MINOR.PATCH` to a **display/runtime version** of the form `MAJOR.MINOR.PATCH-<stage>.<build>` (example: `0.8.0-alpha.143`), where `<build>` is a monotonically increasing integer (no required date).
- Keep root `package.json` `version` as SSOT for that full string; sync/check continue to align workspace packages.
- Surface the same string in `sdm --version`, `sdm about` / MCP `about` (`version`), and MCP initialize (`serverInfo.version` + description `· v…`).
- Add non-interactive bump helpers (at least: show current, bump build/prerelease number, set stage alpha/beta/rc/stable) so agents and `/ship` can update identity without hand-editing four `package.json` files.
- Auto-increment build on `npm run build` (or a dedicated pre-build hook) so each compile produces a new identity when the stage is a prerelease; document the stable-release rule (no auto bump of build on stable unless explicitly requested).

## Capabilities

### New Capabilities

- _(none — extend existing product-version / surfaces)_

### Modified Capabilities

- `product-version`: SSOT becomes full identity `X.Y.Z[-stage.N]`; build counter + stage bump scripts; runtime helper returns that string; verify/check stay green when packages match.
- `mcp-server`: initialize `version` / description MUST show the full identity (so Cursor Installed MCP Servers reflects build).
- `about-sdm`: `version` field MUST equal the same full identity as CLI/MCP.
- `release`: release/bump path documents stage + build rules; sync accepts prerelease form.

## Impact

- Root + workspace `package.json` version strings; `scripts/sync-version.mjs` / `check-version.mjs` (+ new bump scripts)
- `@spec-driven-methodology/core` `getProductVersion` / about payload
- `@spec-driven-methodology/cli` `--version`; `@spec-driven-methodology/mcp` `createServer` identity
- Tests for version parity; CHANGELOG / short VERSIONING note (or README pointer); `/ship` guidance if bump steps change
- Cursor/GigaCode: after rebuild + MCP restart, sidebar shows new `v0.8.0-alpha.N`

## Non-goals

- Separate TraitBuddy-style `build.json` with `YYYYMMDD-NNN` (date optional; not required)
- Publishing to npm registries or changing package names
- Methodology `sdm.yaml` / init schema `version`
- Portable skill `metadata.version` fields
- Changing MCP protocol `name` / install key / tool catalog
- Replacing Keep a Changelog with build-number changelog entries for every local compile
