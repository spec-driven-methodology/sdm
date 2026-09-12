## 1. Core logger

- [x] 1.1 Добавить `action-log.ts` в `@spec-driven-methodology/core`: resolve log dir, NDJSON append, redact/truncate, size rotation
- [x] 1.2 Опциональный `logging` в schema/`sdm.yaml` + `SDM_LOG=0` disable; default enabled в methodology project
- [x] 1.3 Экспорт API из `@spec-driven-methodology/core`; unit-тесты (temp dir): success line, error duplicate, rotation, redact, disable

## 2. CLI + MCP wiring

- [x] 2.1 Хелпер `runLogged` / обёртки в `@spec-driven-methodology/cli` для доменных команд (не `--help`)
- [x] 2.2 Единый wrap tool handlers в `@spec-driven-methodology/mcp` (`source: mcp`); stdout чистый
- [x] 2.3 `.gitignore`: `.sdm/logs/`

## 3. Docs + verify

- [x] 3.1 CHANGELOG `[Unreleased]` (русский); краткий блок в README и/или GETTING_STARTED (где лежат логи, disable)
- [x] 3.2 `npm run verify` + smoke: команда в temp methodology → строка в `sdm.log`; ошибка → `error.log`
