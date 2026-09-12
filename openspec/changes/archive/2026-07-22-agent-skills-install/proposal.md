## Why

Методолог работает через агента (Cursor / GigaCode) по интенту, но portable skills живут только в `agents/` репозитория Specra и не попадают в IDE автоматически — агент в workspace разработки тянет OpenSpec. Параллельно `mcp install --project` ошибочно привязывает один MCP-экземпляр к одному methodology-каталогу, хотя проектов много.

## What Changes

- New CLI: `sdm agent hosts` / `sdm agent install --hosts <csv>|all` — зеркалирует `agents/*/SKILL.md` (+ `AGENTS.md` pointer) в host-specific skills dirs (Cursor, GigaCode).
- MCP: один server на хост; `SDM_PROJECT_ROOT` **не** пишется по умолчанию; `--project` — опциональный default override.
- MCP tools: optional `project` arg на доменных tools (absolute path к methodology); иначе env / cwd.
- Docs: connect-mcp, AGENTS, GETTING_STARTED, CHANGELOG.

## Capabilities

### New Capabilities

- `agent-skills-install`: registry of agent hosts + install/mirror of portable skills

### Modified Capabilities

- `mcp-host-install`: install does not require / default-bind a methodology project root
- `mcp-server`: tools accept optional `project` for multi-project use

## Impact

- `@spec-driven-methodology/cli`: new `agent-*` modules + CLI commands; mcp-config/hosts behavior
- `@spec-driven-methodology/mcp`: `project` on tools + resolveProjectDir
- Docs / portable skills (connect-mcp, agents/README)
- Tests for agent install + updated mcp install expectations
