## Why

`sdm mcp install --cursor` привязывает подключение MCP к одному хосту, хотя Specra agent-first и должен работать с любым агентом (как OpenSpec выбирает tools). Нужен общий install по идентификатору хоста; сразу добавить `gigacode` (CLI, `mcpServers` в settings — официально ещё не в списке OpenSpec, но уже используется).

## What Changes

- Реестр MCP-хостов с адаптерами merge конфига (общий payload `command`/`args`/`env`).
- CLI: `sdm mcp install --hosts <ids>` (и `mcp config --host <id>`); `--cursor` остаётся алиасом для `cursor`.
- Хост `cursor`: как сейчас — merge в `<root>/.cursor/mcp.json`.
- Хост `gigacode`: merge в `~/.gigacode/settings.json` (override через `--config` / `--gigacode-root`).
- `sdm mcp hosts [--json]` — список поддерживаемых хостов для агентов.
- Обновить `agents/connect-mcp/`, README, AGENTS, CHANGELOG (русский user-facing текст).
- Опциональный TTY multi-select, если нет `--hosts` и stdin — TTY; иначе агентам нужен `--hosts` (не default UX).

## Capabilities

### New Capabilities

- `mcp-host-install`: реестр хостов, install/config по host id, gigacode + cursor adapters

### Modified Capabilities

- (нет отдельных main specs на Cursor-only install; поведение было только в CLI/docs)

## Impact

- `packages/cli/src/mcp-config.ts`, `packages/cli/src/index.ts`
- Portable skill `agents/connect-mcp/`, README / AGENTS / CHANGELOG
- Тесты CLI/core вокруг merge JSON (temp dirs / mock home)

## Non-goals

- Установка portable skills/slash-команд в IDE (это зона OpenSpec, не SDM MCP)
- MCP HTTP transport
- Полный каталог всех IDE (claude-desktop, vscode, …) в первом cut — только `cursor` + `gigacode`; реестр расширяемый
- Официальная публикация/дистрибуция GigaCode CLI
