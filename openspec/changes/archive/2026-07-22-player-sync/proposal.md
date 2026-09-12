## Why

`player/` копируется только при первом `sdm init`. Уже существующие methodology-проекты не получают плеер, а `init --force` опасен: перезаписывает scaffold (`sdm.yaml`, README, AGENTS…). Нужна узкая команда, которая ставит/обновляет только `player/`.

## What Changes

- CLI domain op **`sdm player sync`**: копирует template `player/` в текущий methodology-проект.
- Без `--force`: создаёт отсутствующие файлы, существующие пропускает.
- С `--force`: перезаписывает **только** файлы под `player/`, не трогая ontology/library/certifications/sdm.yaml.
- `--json` для агентов; стабильные коды ошибок (`NOT_A_PROJECT`, …).
- Docs/CHANGELOG; опционально MCP tool `player_sync` (тонкий mirror).

## Capabilities

### New Capabilities

- `player-sync`: install/update export-test player assets in an existing project

### Modified Capabilities

- `export-test-player`: document `player sync` as the upgrade path for existing projects (alongside init for new ones)

## Impact

- `@spec-driven-methodology/core` sync helper + reuse init copy logic
- `@spec-driven-methodology/cli` `player sync`; MCP optional
- README / AGENTS / CHANGELOG / player README

## Non-goals

- Full project upgrade / migration of methodology YAML
- Version pinning / diff UI for player files
- Making Specra an LMS
