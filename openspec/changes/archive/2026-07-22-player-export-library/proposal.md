## Why

На экране «Загрузить JSON экспорта» второй загруженный файл затирает первый: в памяти остаётся один `doc`, после перезагрузки страницы пакет пропадает. Автор, сравнивающий несколько экспортов (уровни / фильтры типов), вынужден каждый раз заново выбирать файл.

## What Changes

- **Библиотека загруженных экспортов** в static player: несколько валидных `sdm.export.test/v1` одновременно, без замены предыдущих при новой загрузке.
- **Persist в `localStorage`**: содержимое JSON + метаданные (имя файла, title/profile/level) переживают reload браузера.
- **Управление библиотекой**: выбрать пакет для сессии («Начать»), удалить один запись из библиотеки и из `localStorage`.
- File picker / drag-and-drop / список `exports/` по-прежнему добавляют в библиотеку (не только «текущий единственный» документ).
- Документация player README + CHANGELOG; обновления через `sdm player sync`.

## Capabilities

### New Capabilities

- `player-export-library`: multi-export library, localStorage persist, select/remove

### Modified Capabilities

- `player-session-ux`: load screen показывает библиотеку загруженных пакетов, не один ready-card
- `export-test-player`: shipped player включает library UX как часть template

## Impact

- Template `packages/core/templates/methodology/player/*` (+ sync в существующие проекты)
- Docs/CHANGELOG; без изменения `schemaVersion` export и без CLI/MCP
- Agent-first: пакеты по-прежнему собирает `export test --json`; плеер только хранит уже экспортированные JSON локально для preview

## Non-goals

- Сохранение ответов / прогресса сессии в localStorage
- Синхронизация библиотеки между устройствами / сервером
- Квоты и compression strategy beyond graceful QuotaExceeded handling
- Объединение нескольких JSON в один прогон (один выбранный пакет = одна сессия)
- LMS / безопасный экзамен для кандидата
