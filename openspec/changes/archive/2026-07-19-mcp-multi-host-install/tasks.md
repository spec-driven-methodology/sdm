## 1. Host registry + merge

- [x] 1.1 Вынести shared `mergeMcpServersJson(path, serverName, mcpServer)` и registry (`cursor`, `gigacode`) в `packages/cli/src/mcp-hosts/` (или расширить `mcp-config.ts`)
- [x] 1.2 Реализовать `listHosts`, `resolveHosts(csv|all)`, `installMcpHosts({ hosts, projectDir, cursorRoot, configOverride, gigacodeHome })`
- [x] 1.3 Сохранить `installCursorMcp` / `--cursor` как thin wrappers над registry
- [x] 1.4 Unit-тесты: cursor temp dir, gigacode с подменённым HOME, unknown host, multi-host

## 2. CLI surface

- [x] 2.1 `sdm mcp hosts [--json]`
- [x] 2.2 `sdm mcp config --host <id> [--json]` (+ recommended path)
- [x] 2.3 `sdm mcp install --hosts <csv>|all` + aliases `--cursor`; `--config`, `--gigacode-home`, `--cursor-root`, `--project`; `HOSTS_REQUIRED` / `UNKNOWN_HOST`
- [x] 2.4 Опциональный TTY fallback выбора hosts (без новых тяжёлых deps)

## 3. Docs + verify

- [x] 3.1 Обновить `agents/connect-mcp/`, AGENTS.md, README (русский): multi-host, gigacode experimental
- [x] 3.2 CHANGELOG `[Unreleased]` на русском
- [x] 3.3 `npm run verify` + smoke: `mcp hosts --json`, install cursor в temp, install gigacode в temp HOME
