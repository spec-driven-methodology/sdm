## Why

Авторы уже экспортируют learning packs (`sdm.export.course/v1`), но static player принимает только `sdm.export.test/v1` и падает с ошибкой schemaVersion. Нужен тот же author-preview контур для курсов: библиотека, листание уроков, переключение Тесты/Курсы — без превращения Specra в LMS.

## What Changes

- Dual parse в player: `sdm.export.test/v1` и `sdm.export.course/v1` по `schemaVersion`.
- Вкладки на load screen: **Тесты** | **Курсы**; отдельные library bucket / localStorage для курсов.
- Course reader: modules → lessons (title + markdown body), prev/next; stub при пустом body.
- Practice handoff: список `practiceQuestionIds`; «Пройти практику» только если id есть в загруженном test pack (фильтрованная test-сессия).
- `discoverExports()` классифицирует JSON по schema, не смешивает типы в ошибке валидации.
- Docs: player README + CHANGELOG; sync через `player sync`.

## Capabilities

### New Capabilities

- `player-course-reader`: author-preview course library, lesson navigation, practice handoff to test session

### Modified Capabilities

- `export-test-player`: shipped player template accepts course packs and exposes Тесты/Курсы modes
- `player-export-library`: library UX covers typed entries (test vs course) with separate persistence
- `export-course`: clarify that static player MAY preview course packs; still not an LMS runtime

## Impact

- Template `packages/core/templates/methodology/player/*` (+ `player sync` / init)
- Docs/CHANGELOG; no change to course/test export schemas or CLI/MCP contracts
- Agent-first: agents still produce packs via `export course` / `export test`; player only previews JSON locally

## Non-goals

- Learner progress, completion, accounts, SCORM, video
- Embedding full question payloads into course JSON
- CMS / editing lesson prose in the player
- Merging test+course into one document schema
- Secure exam / candidate-facing LMS
