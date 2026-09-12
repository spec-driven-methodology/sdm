## 1. MCP schema descriptions

- [x] 1.1 Add shared Zod param helpers (`profileParam`, `levelParam`, `forceParam`, `teamParam`, …) next to `projectParam` in `packages/mcp/src/server.ts`
- [x] 1.2 Apply `.describe()` to every `registerTools` input property (question_*, cert_*, export_*, skill_*, suggest/audit, init, search, …)
- [x] 1.3 Enrich thin tool-level description strings (skill_add, search, cert_coverage, question_add/generate, export_test, …)

## 2. Tests

- [x] 2.1 Assert `ABOUT_MCP_TOOLS` sorted ≡ `TOOL_NAMES` sorted
- [x] 2.2 Assert every tool input schema property has non-empty `description`

## 3. Docs and OpenSpec closeout

- [x] 3.1 Update `AGENTS.md` Tools line with `player_sync` + studio bridge tools
- [x] 3.2 Sync main specs on archive; CHANGELOG Unreleased (RU); GETTING_STARTED/connect-mcp only if drift
- [x] 3.3 `npm run verify` green
