## Why

Product version is duplicated across root/`packages/*/package.json`, stale workspace dep pins (`0.1.7`), lockfile drift, README hardcodes, and separate CLI/MCP readers — agents and UIs can report different versions. Separately, Cursor’s MCP sidebar shows the `mcp.json` **key**, not MCP `title`, so lowercase `sdm` looks wrong next to branded **Specra**.

## What Changes

- Establish **one product version SSOT**: root `specra/package.json` `version`.
- Runtime (`sdm --version`, MCP `initialize` version/title/description, `about`) MUST resolve that root version via a shared `@spec-driven-methodology/core` helper (not each package’s own `package.json`).
- Add sync + check tooling so bump keeps root, workspaces, internal deps, and lockfile aligned; wire into `/ship --bump` / release hygiene.
- Soften or remove hardcoded product version strings in README (point to CHANGELOG / `sdm --version`).
- **BREAKING (install key default):** default MCP host install key becomes `Specra` (was `sdm`) so Cursor/GigaCode sidebars show the brand. Protocol `name` stays `sdm`; `title` remains `Specra`. `--name` still overrides. Re-install migrates/merges under the new key; document leftover lowercase key cleanup.
- MCP identity already (or will) expose `title: Specra`, description with tagline + `vX.Y.Z`, version from SSOT.

## Capabilities

### New Capabilities

- `product-version`: SSOT for product semver, sync/check scripts, runtime readers, docs policy for version display.

### Modified Capabilities

- `mcp-host-install`: default `mcpServers` key `Specra`; scenarios and connect-mcp guidance updated.
- `mcp-server`: initialize identity (title/description/version) bound to product SSOT.
- `about-sdm`: clarify version MUST equal root package.json via shared helper (same SSOT as CLI/MCP).
- `release`: bump MUST sync all workspace package versions + lockfile; no divergent hardcodes in CLI/MCP source.

## Impact

- `@spec-driven-methodology/core` (version helper), `@spec-driven-methodology/cli`, `@spec-driven-methodology/mcp`
- `scripts/` + root `package.json` scripts; `/ship` bump steps (workspace command docs)
- Tests for version parity and MCP install key
- `README`, `CHANGELOG`, `agents/connect-mcp`, GETTING_STARTED if install examples cite `sdm` key
- Existing `.cursor/mcp.json` / gigacode entries with key `sdm` need re-install or rename

## Non-goals

- Unifying `agents/*/SKILL.md` `metadata.version` (skill versions, not product)
- Changing methodology `sdm.yaml` / init schema `version: "0.1"`
- Publishing to npm registries or changing public package names
- MCP HTTP transport; new MCP tools
- Automatic migration deleting old `mcpServers.sdm` without user/agent action (document + optional merge only)
