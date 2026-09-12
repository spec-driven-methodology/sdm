## Context

Specra 0.4.1 уже умеет `mcp install --hosts gigacode` → `~/.gigacode/settings.json`. Не хватает одного документа «с нуля на рабочей машине» с **GigaCode как основным** сценарием (пользовательский приоритет).

Репозиторий: GitVerse `kotler/specra`, Apache-2.0, Node ≥20.19, npm workspaces. Пакеты пока не в npm — установка = clone + build + `npm link`.

## Goals / Non-Goals

**Goals:**

- Один файл `GETTING_STARTED.md` с копируемым happy-path под GigaCode.
- README / connect-mcp / AGENTS согласованы: GigaCode first, Cursor optional.
- Smoke-чеклист: `doctor`, список MCP tools, опционально `cert gaps --json` на examples.
- Русский user-facing текст.

**Non-Goals:**

- Новый код хостов; npm publish; логирование; CI publish pipeline.

## Decisions

1. **GigaCode-first narrative**
   - Primary path в GETTING_STARTED и в начале MCP-секции README.
   - Cursor — секция «Другие хосты» / secondary в connect-mcp.
   - Пометить GigaCode как experimental (неофициальный CLI; path `~/.gigacode/settings.json`, override `--gigacode-home` / `--config`).

2. **Документ в корне `specra/GETTING_STARTED.md`**
   - Рядом с README; ссылка из README и AGENTS.
   - Alternative: `docs/` — отвергнуто: product repo должен быть самодостаточен при clone.

3. **Структура GETTING_STARTED**
   1. Требования (Node, git, GigaCode CLI доступен)
   2. Clone + install/build/link
   3. Methodology project (`init --with-examples`)
   4. Подключение MCP к GigaCode (`mcp config --host gigacode`, `mcp install --hosts gigacode`)
   5. Reload /mcp в GigaCode
   6. Smoke: tool `doctor` или CLI `sdm doctor --json`
   7. Troubleshooting: `MCP_NOT_FOUND`, `HOSTS_REQUIRED`, неверный project root, settings path
   8. Кратко: Cursor как альтернатива + ссылка на `mcp hosts`

4. **Нет новых CLI команд** в этом change (достаточно существующих). Опционально позже: `sdm doctor` hint «run getting started».

5. **Примеры только synthetic** — `init --with-examples`, без PII.

## Risks / Trade-offs

- [GigaCode path drift] → явные overrides в доке; experimental badge.
- [Корпоративный proxy/npm] → упомянуть `npm install` failures; не решать в Specra.
- [Абсолютные пути после move clone] → переустановить MCP через `mcp install` после relocate.

## Migration Plan

Docs-only; после apply — verify не ломается; ship в Unreleased или с ближайшим patch.

## Open Questions

- Нужен ли отдельный skill `agents/getting-started/`? **Default: нет** — хватит GETTING_STARTED + connect-mcp GigaCode-first; skill можно добавить по feedback пилота.
