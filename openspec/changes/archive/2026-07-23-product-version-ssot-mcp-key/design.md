## Context

Today product semver appears in four `package.json` files, stale workspace dependency pins (`@spec-driven-methodology/core` / `@spec-driven-methodology/mcp` still `0.1.7`), a lagging `package-lock.json`, README hardcodes, plus separate readers in CLI (`packages/cli/package.json`) and MCP (`packages/mcp/package.json`). `about` already reads the **root** package. Cursor’s MCP list uses the `mcp.json` map key (`sdm`), not MCP `title`, so branding stays lowercase unless the install key changes.

## Goals / Non-Goals

**Goals:**

- One SSOT: root `specra/package.json` `version`.
- Shared runtime helper in `@spec-driven-methodology/core` for CLI `--version`, MCP initialize, and `about`.
- Sync + check scripts; bump/ship uses them; verify fails on drift.
- Default MCP install key `Specra` for host UI; protocol `name` remains `sdm`.
- Docs: no drifting product version numbers in README; connect-mcp/GETTING_STARTED cite `Specra` key.

**Non-Goals:**

- Skill `metadata.version` / methodology schema version.
- Auto-delete of legacy `mcpServers.sdm` without explicit merge/reinstall.
- Separate `VERSION` file or settings YAML for product version.

## Decisions

1. **SSOT = root package.json (not VERSION file)**  
   - Aligns with npm, git tags, and existing `about` / OpenSpec `about-sdm`.  
   - Alternative rejected: `VERSION` file — extra sync surface with npm.

2. **`getProductVersion()` in `@spec-driven-methodology/core` via `resolveSpecraHome()`**  
   - CLI/MCP call the same helper; local `readCliVersion` / `readMcpPackageVersion` become thin wrappers or are removed.  
   - Workspace package `version` fields stay equal for publish/link consistency, but are **not** the runtime SSOT.

3. **Internal workspace deps: `"*"` (npm workspaces)**  
   - Stops forever-stale pins like `0.1.7`.  
   - Alternative: pin to same semver via sync script — more churn; `*` is enough while packages stay private/unpublished.

4. **Scripts: `version:sync` + `version:check`**  
   - `version:sync <ver?>`: write root + `packages/*/version`; refresh lock via `npm install`; optional README scrub is “remove hardcode” not generate.  
   - `version:check`: assert root === packages; no hardcoded `.version("x.y.z")` in src; fail in `verify` (or as verify dependency).  
   - `/ship --bump` updates root version then runs `version:sync`.

5. **MCP display: key `Specra` + protocol title/description/version**  
   - Default `serverName` in `buildMcpConfig` / install → `"SDM"`.  
   - Protocol: `name: "sdm"`, `title: "SDM"`, `description: "Spec-based Resource Assessment Framework · v{version}"`, `version` from SSOT.  
   - `--name` override unchanged.  
   - On install, if both `sdm` and `Specra` exist, prefer writing `Specra` and document removing the old key (optional: copy then delete lowercase when installing default).

6. **README policy**  
   - Drop “текущая версия **X.Y.Z**” / section title version; point to CHANGELOG and `sdm --version` / `about`.

## Risks / Trade-offs

- **[Risk] Existing hosts keep key `sdm`** → Mitigation: connect-mcp + CHANGELOG say re-run `mcp install`; optional install step migrates lowercase → `Specra` when using default name.  
- **[Risk] `*` deps confuse external consumers** → Mitigation: packages remain private workspace; no npm publish in scope.  
- **[Risk] resolveSpecraHome fails when MCP is copied without repo root** → Mitigation: keep fallback to nearest package root layout used by `about` today; tests cover linked monorepo.  
- **[Trade-off] Four package.json versions still exist** → Acceptable mirrors kept in sync by script; runtime ignores them for product version.

## Migration Plan

1. Land helper + check/sync; fix deps/lock; unify readers.  
2. Change default install key; update tests/specs/docs.  
3. Developers: `sdm mcp install --hosts cursor` (and gigacode) to refresh local configs; remove stale `mcpServers.sdm` if duplicated.  
4. Rollback: revert default `serverName` to `sdm` and re-install.

## Open Questions

- None blocking: prefer migrate-on-install (delete old `sdm` key when writing default `Specra`) — **yes** for default name only when old key points at SDM MCP entry.
