## Why

При пилоте на работе (GigaCode/MCP + CLI) сложно разобрать «что агент вызывал и почему упало». Нужен файл журнала действий Specra с ротацией: команды/tools, запрос, результат, ошибки — чтобы снять log и проанализировать UX/баги без пересказа из чата.

## What Changes

- Модуль журнала в `@spec-driven-methodology/core` (или тонкий shared logger): запись NDJSON/строк в `.sdm/logs/`.
- `sdm.log` — общий поток; `error.log` — ошибки (дубль из общего потока при `level=error` / failed exit).
- Ротация по размеру (и опционально по суткам): keep N файлов.
- Интеграция: CLI после каждой команды; MCP после каждого tool call.
- Поля записи: `ts`, `source` (`cli`|`mcp`), `action`, `args` (redacted), `ok`, `code?`, `durationMs`, `summary` (короткий результат без огромных payload).
- Opt-out: `SDM_LOG=0` / config `logging.enabled: false` (default **on** в methodology project).
- Docs (RU): CHANGELOG, краткий раздел в README/GETTING_STARTED; `.gitignore` для logs если ещё нет.
- Тесты: запись в temp project, ротация, redaction secrets-like keys.

## Capabilities

### New Capabilities

- `action-logging`: файловый журнал действий CLI/MCP с ротацией и error-файлом

### Modified Capabilities

- (нет изменения доменных требований coverage/export; только observability)

## Impact

- `@spec-driven-methodology/core` — logger + config
- `@spec-driven-methodology/cli` — wrap command actions
- `@spec-driven-methodology/mcp` — wrap tool handlers
- `.gitignore`, docs/CHANGELOG

## Non-goals

- Centralized remote logging / OpenTelemetry export
- Полный dump больших export JSON в log (только summary / truncated)
- UI для просмотра логов
- Логирование содержимого вопросов с PII-фильтрацией сверх простых redact keys (`token`, `password`, `authorization`, …)
