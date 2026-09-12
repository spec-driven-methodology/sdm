## Why

Choice-вопросы в реальных методологиях часто «читаются» без знания: верный вариант почти всегда первый и/или самый длинный (на ai-automation middle: ~100% позиция 1, ~78% longest). Shuffle вопросов уже есть; shuffle вариантов — follow-up из CHANGELOG / `player-shuffle-questions`, не реализован. Нужны runtime mitigation и явная политика качества дистракторов, чтобы агенты и audit закрывали smell в библиотеке.

## What Changes

- `export test --shuffle-options` (+ optional `--seed`) — перестановка `options` с пересчётом `correct` (single/multi); meta о факте shuffle
- Опция плеера «перетасовывать варианты» (отдельно от shuffle вопросов), persist `localStorage`, на каждый **Начать**
- Audit findings: position bias (`correct === 1` rate) и length outlier (верный заметно длиннее дистракторов)
- Quality-параметр дистракторов (`distractorQuality`: `off` | `soft` | `strict`) — не связан с cert `threshold`
- Soft: warning/recommendation в audit; strict: gate (reject/flag на `question add` или non-zero audit policy — детали в design)
- Portable agent guidance: писать дистракторы сравнимой длины и правдоподобия

## Capabilities

### New Capabilities

- `distractor-quality`: политика и метрики качества вариантов (length band / plausibility guidance), уровни `off|soft|strict`, контракт для audit и agent skills; без привязки к threshold

### Modified Capabilities

- `export-test`: `--shuffle-options` / `--seed`, корректный remap `correct`, meta
- `player-session-ux`: session option shuffle вариантов ответа
- `methodology-audit`: findings position bias и length outlier; рекомендации чинить библиотеку / соблюдать distractorQuality
- `question-add`: при `strict` — отказ или стабильная ошибка, если варианты нарушают length band (если policy включена в проекте)

## Non-goals

- LMS / прокторинг / анализ кандидатов
- Авто-rewriting текста дистракторов моделью внутри ядра Specra
- Привязка качества вариантов к `threshold` (0.7 и т.п.)
- Изменение семантики shuffle вопросов
- Semantic similarity embeddings как обязательный gate в v1 (достаточно length band + agent guidance)

## Impact

- `@spec-driven-methodology/core`: export assembly, audit findings, optional question-add validation, shared shuffle helper
- `@spec-driven-methodology/cli` / MCP: flags `shuffleOptions` / `seed` на export test; audit JSON shape
- `packages/core/templates/methodology/player/`: UI + session shuffle options
- `agents/generate-questions` (и близкие skills), `AGENTS.md`, `CHANGELOG`, player README
- Agent-first: `--json` envelopes, стабильные коды ошибок при strict reject
