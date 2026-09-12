## 1. Product version SSOT (core)

- [x] 1.1 Add `@spec-driven-methodology/core` `getProductVersion()` (via `resolveSpecraHome` / root `package.json`); export from package index
- [x] 1.2 Refactor `about` to use `getProductVersion()`; keep existing about tests green
- [x] 1.3 Point CLI `--version` and MCP `createServer` identity at the helper (title `Specra`, description tagline + `v{version}`); remove per-package version readers as SSOT
- [x] 1.4 Add core/cli/mcp tests: about / `--version` / MCP `serverInfo.version` match root package.json

## 2. Sync / check tooling

- [x] 2.1 Add `scripts/sync-version.mjs` (+ npm `version:sync`) writing root + `packages/*/version`, set internal `@spec-driven-methodology/*` deps to `*`, refresh lockfile
- [x] 2.2 Add `scripts/check-version.mjs` (+ npm `version:check`); wire into `npm run verify`
- [x] 2.3 Run sync once to clear stale `0.1.7` pins / lockfile drift; ensure check passes
- [x] 2.4 Document bump path in workspace `/ship` (set root version → `version:sync`; no CLI/MCP hardcode edits)

## 3. MCP install key `Specra`

- [x] 3.1 Change default `serverName` to `Specra` in `mcp-config` / install; migrate legacy `sdm` → `Specra` on default install
- [x] 3.2 Update CLI mcp-hosts tests and any fixtures expecting `mcpServers.sdm`
- [x] 3.3 Update `agents/connect-mcp/SKILL.md` (+ AGENTS/GETTING_STARTED examples if they cite the key) for sidebar key vs title

## 4. Docs and verify

- [x] 4.1 Remove README product-version hardcodes; point to CHANGELOG / `sdm --version`
- [x] 4.2 CHANGELOG `[Unreleased]`: SSOT version + default MCP key `Specra` (**BREAKING** for install key)
- [x] 4.3 `npm run verify`; smoke: `sdm --version`, `sdm about --json`, `mcp install --hosts cursor` in temp dir → `mcpServers.Specra`; playground/doctor unchanged
