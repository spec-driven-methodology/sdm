## Why

Author-preview player уже прогоняет один JSON, но при нескольких экспортах неудобно выбирать пакет; после «Проверить» переход только руками; нет опционального лимита времени на сессию. Параллельно замечен bias качества вопросов (верный часто первый / самый длинный) — это проблема методологии/аудита, не выбора N в плеере.

## What Changes

- **Test picker** в плеере: выбор экспорта (file picker + опциональный список известных JSON, напр. из `exports/` когда доступно).
- **Toggle автодалее** после проверки ответа (~1 с), по умолчанию выкл.; UI на языке интерфейса (RU).
- **Опция «на время»**: суммарный лимит = f(число вопросов) или явный лимит; countdown; по истечении — автозавершение; досрочное «Завершить» всегда доступно. Выкл. по умолчанию.
- **Объём теста (N)** — не в плеере: автор задаёт через `export test` (`--adaptive` / будущие флаги). Плеер только прогоняет пакет.
- Зафиксировать follow-up (вне этого change или тонкий audit finding): shuffle/position bias и length bias правильного варианта.

## Capabilities

### New Capabilities

- `player-session-ux`: picker экспорта, автодалее, опциональный таймер сессии в static player

### Modified Capabilities

- `export-test-player`: сессионные опции и picker как часть shipped player UX
- (follow-up note only) `methodology-audit`: later — finding на position/length bias; **не** в scope реализации этого change

## Impact

- Template `packages/core/templates/methodology/player/*` (+ `player sync`)
- Docs/CHANGELOG; без изменения schemaVersion export (таймер — runtime опция плеера, не поле пакета в v1)
- Agent-first: объём по-прежнему через `export test --json`

## Non-goals

- Выбор N вопросов внутри плеера кандидатом/автором
- Серверный proctoring, античит, сохранение сессий
- Перемешивание options в плеере как единственный фикс bias (лучше на export/audit; MAY later)
- Полноценный i18n framework (остаёмся на RU UI как сейчас)
