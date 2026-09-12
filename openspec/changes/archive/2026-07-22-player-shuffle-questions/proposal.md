## Why

Author-preview player прогоняет вопросы в порядке JSON. При повторной сдаче («Начать» снова) порядок всегда одинаковый — слабый smoke-сценарий для автора и демо. Нужен opt-in shuffle порядка вопросов в сессии, без изменения файла экспорта.

## What Changes

- В «Параметры сессии» — чекбокс **«Перетасовывать вопросы»** (RU), default **выкл.**, preference в `localStorage` рядом с автопереходом/таймером.
- При **Начать** с включённой опцией — Fisher–Yates (или эквивалент) по массиву вопросов сессии; исходный `doc` не мутировать для отображения метаданных.
- Retake (бренд / «Главная» → снова **Начать**) даёт новый порядок, если опция включена.
- Docs / CHANGELOG / player README; обновление через `player sync --force`.

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `player-session-ux`: optional question-order shuffle as a session option
- `export-test-player`: shipped player template includes the shuffle control (via session UX)

## Impact

- Template only: `packages/core/templates/methodology/player/{index.html,app.js,styles.css,README.md}`
- Existing projects: `sdm player sync --force`
- No CLI/MCP/schemaVersion changes; agent-first path (`export test`) unchanged

## Non-goals

- Shuffle **вариантов ответа** (options) — отдельный follow-up (`export test --shuffle-options` и/или чекбокс в плеере)
- Выбор N / resampling вопросов в плеере
- Детерминированный seed в UI (не нужен для author preview)
- Persist порядка сессии на диск; серверный экзамен / античит
