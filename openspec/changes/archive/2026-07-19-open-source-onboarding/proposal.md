## Why

Нужен короткий путь «скачал Specra на работе → подключил к GigaCode → проверил MCP», без знания внутренней кухни Cursor-стенда. Сейчас установка размазана по README; GigaCode упомянут вторично. Онбординг должен вести **сначала через GigaCode**, Cursor — дополнительный хост.

## What Changes

- `GETTING_STARTED.md` (русский): clone GitVerse → Node ≥20.19 → build/link → methodology (`init --with-examples`) → **`mcp install --hosts gigacode`** → reload → smoke `doctor` / tool list.
- README: ссылка и краткий «быстрый старт (GigaCode)» сверху MCP-секции; Cursor — ниже как альтернатива.
- `agents/connect-mcp/`: GigaCode-first шаги; Cursor secondary.
- `AGENTS.md`: указатель на getting started для нового окружения.
- CHANGELOG `[Unreleased]` (русский).
- Без npm publish / без реальных methodology-данных (только synthetic `--with-examples`).

## Capabilities

### New Capabilities

- `getting-started`: документированный OSS-онбординг с акцентом на GigaCode + MCP smoke

### Modified Capabilities

- (нет изменения runtime-контрактов; `mcp-host-install` уже покрывает `gigacode`)

## Impact

- Docs: `GETTING_STARTED.md`, `README.md`, `AGENTS.md`, `agents/connect-mcp/SKILL.md`, `CHANGELOG.md`
- Код CLI/core не обязателен (разве что мелкий help-текст `mcp hosts` / install)

## Non-goals

- Публикация в npm registry
- Action logging (отдельный change)
- Новые MCP-хосты кроме уже существующих
- Полный пилот methodology на реальных данных
- Официальная поддержка/дистрибуция GigaCode CLI (документируем experimental path)
