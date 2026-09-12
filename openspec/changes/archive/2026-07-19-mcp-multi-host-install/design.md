## Context

Сегодня `buildMcpConfig` / `installCursorMcp` в `@spec-driven-methodology/cli` пишут только `.cursor/mcp.json`. Payload stdio MCP универсален (`node` + absolute `@spec-driven-methodology/mcp` + `SDM_PROJECT_ROOT`), меняется лишь путь файла и иногда scope (workspace vs user home).

OpenSpec решает выбор агента через registry + `--tools`; Specra нужен тот же паттерн для **MCP merge**, не для skills.

GigaCode CLI (неофициальный/внутренний доступ) обычно следует схеме Gemini/Qwen: `~/.gigacode/settings.json` с top-level `mcpServers`.

## Goals / Non-Goals

**Goals:**

- Host registry: `id`, `title`, `configPath(opts)`, `merge(existing, server)`.
- CLI agent-first: `--hosts cursor,gigacode` / `all`; `mcp hosts --json`; `mcp config --host <id>`.
- Backward compat: `--cursor` ≡ `--hosts cursor`; `--cursor-root` для cursor.
- Shared merge helper for JSON files with `mcpServers` key (preserve other keys).

**Non-Goals:**

- Копирование `agents/**` в IDE folders.
- Реальные adapters для Claude Desktop / VS Code в этом change (только расширяемый реестр).
- Интерактив как основной путь (TTY — fallback).

## Decisions

1. **API shape как у OpenSpec `--tools`**
   - `--hosts <csv>|all` обязателен для non-TTY / агентов.
   - Unknown host → `UNKNOWN_HOST` + список известных id в сообщении.
   - Alternative: подкоманды `mcp install cursor` — отвергнуто: хуже для multi-select и агентов.

2. **Адаптеры в CLI, не в core**
   - Логика — setup DX CLI; core остаётся methodology. При росте — вынести в `packages/cli/src/mcp-hosts/`.

3. **GigaCode path**
   - Default: `join(homedir(), ".gigacode", "settings.json")`.
   - Overrides: `--config <file>` (любой host) или `--gigacode-home <dir>` → `<dir>/settings.json`.
   - Merge только `mcpServers.sdm` (или `--name`); остальные ключи settings не трогать.
   - Document as experimental / unofficial CLI surface in README (русский).

4. **Cursor path**
   - Unchanged: `<cursorRoot>/.cursor/mcp.json`; `--cursor-root`, `--project`.

5. **`mcp config`**
   - Печать snippet + `host` + recommended `path` без записи; `--host` default `cursor` for compat.
   - JSON: `{ ok, host, path, mcpServer, ... }`.

6. **TTY**
   - Если нет `--hosts` и `stdin.isTTY`: простой multi-select (или prompt с csv) по registry; иначе ошибка `HOSTS_REQUIRED`.
   - Не тянуть тяжёлый UI dependency — минимальный readline или reuse существующего prompt, если есть.

7. **Тесты**
   - Unit: merge в temp dir + `HOME` override для gigacode; unknown host; `--cursor` alias.

## Risks / Trade-offs

- [GigaCode schema drift] → документировать как PoC-адаптер; `--config` для нестандартного пути; лёгкий bump при смене path.
- [User-global gigacode vs project cursor] → разные scopes осознанны; JSON output всегда возвращает абсолютный `path`.
- [Breaking docs that say Cursor-only] → soft compat flags; update connect-mcp skill.

## Migration Plan

1. Implement registry + dual install.
2. Deprecate messaging: prefer `--hosts` in help text; keep `--cursor`.
3. Docs/CHANGELOG under Unreleased; no version bump until release cut.

## Open Questions

- Нужен ли сразу host `qwen` / `gemini` (тот же settings shape) как алиасы path? **Default: нет** — только `gigacode`, пока пользователь не попросит.
- Project-local `.gigacode/settings.json` vs user home? **Default: user home**; project override через `--config`.
