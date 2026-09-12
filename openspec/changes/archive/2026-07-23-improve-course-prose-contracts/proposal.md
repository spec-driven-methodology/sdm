## Why

Авторский превью курса `format=course` сейчас выглядит как шаблонная инструкция: нет вводного блока «о курсе», у каждого урока одни и те же заголовки («Проблема / Модель / Пример / Ловушки»), «Якоря практики» дублируют блок практики в player, а в русской прозе и вопросах остаётся необъяснённый англоязычный жаргон. Это снижает ценность learning-пака для новичков и размывает контракт формата «Курс» vs «Инструкция». Нужно ужесточить контракты прозы и каркас экспорта/player, не превращая Specra в LMS и не вызывая LLM внутри ядра.

## What Changes

- Расширить контракт `format=course`: обязательные вводные артефакты (о курсе / как устроен / для кого / что не входит) + уроки с **свободной педагогической структурой**, а не копией howto-скелета.
- Добавить в `sdm.export.course/v1` поля для overview-модуля и глоссария/сносок терминов; stub export MAY генерировать intro-stub и term candidates из TeachingContext.
- Убрать из агентского контракта дублирование «Якоря практики» в `lessons[].body` (practice ids остаются в module / player).
- Ужесточить locale-правила в portable skills (`export-course`, и смежные для вопросов/howto): русская проза с объяснением терминов; латиница — только идентификаторы/API/code fences или термин + русское определение (сноска/глоссарий).
- Обновить player course reader: показать overview; сноски/глоссарий; не дублировать practice anchors из body.
- **Non-BREAKING** для существующих паков: новые поля optional; старые JSON продолжают открываться.

## Capabilities

### New Capabilities

- (нет) — изменения укладываются в существующие capabilities.

### Modified Capabilities

- `export-course`: overview stubs, glossary/footnotes shape, course prose contract ≠ howto template, practice-anchor duplication rule, stronger locale guidance for agents.
- `player-course-reader`: render overview + glossary/footnotes; lesson UI for course prose (not rigid howto sections).

## Non-goals

- LMS / прогресс / вызов LLM внутри Specra core.
- Автоматический «перевод» всей library вопросов задним числом.
- Замена `howto`/`notes`/`cheatsheet` одним шаблоном курса.
- Обязательный paired `export test` внутри course JSON.

## Impact

- `packages/core` course export schema + TeachingContext/stub builder
- `agents/export-course/SKILL.md` (+ mirrors), при необходимости `generate-questions` / AGENTS.md locale rules
- Static player course UI (`player` templates)
- CHANGELOG / README / CLI help for new optional fields
- Agent-first: план `--plan-only --json` отдаёт overview/glossary stubs и warnings; prose по-прежнему пишет агент после HITL
