## 1. Agent skills install (CLI)

- [x] 1.1 Add `packages/cli/src/agent-hosts.ts`: host registry (cursor/gigacode), path helpers, `installAgentSkills`
- [x] 1.2 Add `resolveAgentsRoot` (monorepo / SDM_HOME / `--agents-root`)
- [x] 1.3 Wire `sdm agent hosts` and `sdm agent install` in CLI with `--json`
- [x] 1.4 Unit tests for install (temp dirs, skip/force, AGENTS_NOT_FOUND)

## 2. MCP multi-project

- [x] 2.1 `buildMcpConfig` / `installMcpHosts`: set `SDM_PROJECT_ROOT` only when `--project` explicit
- [x] 2.2 MCP `resolveStartDir(project?)` + optional `project` on domain tools
- [x] 2.3 Update mcp-hosts tests; add MCP test for doctor with `project` arg

## 3. Docs

- [x] 3.1 Update `agents/connect-mcp`, `agents/README`, `AGENTS.md`, GETTING_STARTED
- [x] 3.2 CHANGELOG `[Unreleased]`
- [x] 3.3 `npm run verify`
