## Why

Методолог хочет с нуля завести роль (например Go junior): агент предлагает основу, человек подтверждает (HITL), затем workflow команд наполняет ontology/cert/library. Сейчас `bootstrap-methodology` делает loop без явного plan→confirm гейта и без связки generate→fill→add.

## What Changes

- Portable skill `agents/bootstrap-role-pack/`: plan JSON → wait for explicit user confirm → execute CLI/MCP → verify gaps → optional export test.
- Обновить `AGENTS.md`, `agents/README.md`, `GETTING_STARTED.md`, `CHANGELOG` (русский).
- Указать, когда использовать pack vs `bootstrap-methodology` / `close-coverage`.
- Без нового оркестратора в core / без встроенного LLM.

## Capabilities

### New Capabilities

- `bootstrap-role-pack`: HITL plan-and-execute skill for greenfield role foundation

### Modified Capabilities

- (нет изменения runtime CLI-контрактов)

## Impact

- `agents/bootstrap-role-pack/SKILL.md`, agent entry docs, CHANGELOG
- Агенты GigaCode/Cursor следуют skill; команды те же (`skill add`, `cert create`, `question generate`/`add`, `cert gaps`, `export test`)

## Non-goals

- LLM внутри `@spec-driven-methodology/core`
- TTY-мастер как default
- Автозапуск без confirm
- Жёсткий встроенный каталог skills по языкам (агент предлагает, человек правит plan)
