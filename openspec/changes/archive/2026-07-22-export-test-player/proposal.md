## Why

`export test` отдаёт пакет `sdm.export.test/v1`, но методолог не может быстро «прогнать» его руками: нет дефолтного reference-плеера. Параллельно тип `open` нельзя однозначно автопроверить — в схеме нет эталонного текста. Нужен author-preview player и поле expected для коротких текстовых ответов.

## What Changes

- Статический **export test player** (HTML + CSS + JS): загрузка JSON, листание, ответ/проверка, skip, финальная статистика (в т.ч. по skills / requirements / threshold). Без сохранения сессии.
- Player копируется в methodology-проект при `sdm init` как `player/`.
- Опциональное поле **`expected`** на вопросах типа `open` (строка или список допустимых ответов) + запись через `question add`, прокидывание в `export test`.
- Документация: player = preview для автора/демо, не LMS и не защищённый экзамен (ответы в JSON намеренно).

## Capabilities

### New Capabilities

- `export-test-player`: reference-плеер пакета `export test`; init кладёт `player/` в проект
- `question-expected-answer`: эталонный текст для `open` (`expected`), автопроверка в плеере

### Modified Capabilities

- `export-test`: документ/CSV включают `expected`, если задан
- `question-add`: `--expected` для `open`; валидация Zod

## Impact

- `@spec-driven-methodology/core`: schema, `question add`, export assemblers, `init` templates
- `@spec-driven-methodology/cli` / MCP: флаги/аргументы `expected`
- Templates: `packages/core/templates/methodology/player/`
- Docs: README, CHANGELOG, AGENTS / export skill (кратко)
- Agent-first: запись `expected` через CLI/`--json`; плеер — human preview после `export test`

## Non-goals

- LMS, аккаунты, сохранение/выгрузка результатов, античит
- Редактор кода и runtime-валидация `code` (criteria только для ручного/агентского разбора)
- Встраивание плеера в MCP/CLI как сервер
- Новый schemaVersion export (остаёмся на `sdm.export.test/v1` с аддитивным полем)
- Matching / ordering / true-false как отдельные типы (true/false = `single_choice`)
