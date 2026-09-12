## Why

Коллеги собирают HTML-шпаргалки для интервьюеров вручную. Specra хранит эталон (ontology + library + certifications), но не отдаёт **expert interview kit** как детерминированный рендер: карточки навыков, пробы (open/code), глоссарий, чеклист. `export learning --format cheatsheet` — учебная проза для обучаемого, не kit эксперта.

## What Changes

- Новый документ **`sdm.export.kit/v1`**: profile+level → modules, probes, glossary, checklist, warnings, `id`, `meta.revision`, `meta.basis`.
- **`sdm export kit`** (JSON | HTML), MCP **`export_kit`**.
- Детерминированный **self-contained HTML** (inline CSS) из kit JSON — потребитель, не SSOT.
- Player: вкладка **Шпаргалки** (author preview kit JSON).
- Portable skill **`export-kit`**, suggest lever, `content stale` / export-artifacts для kit.
- Kit-readiness warnings; `--strict` блокирует экспорт при критических предупреждениях.

## Capabilities

### New Capabilities

- `export-kit`: schema, CLI/MCP, HTML render, warnings

### Modified Capabilities

- `mcp-server`: tool `export_kit`
- `player-export-library`: kit tab + library
- `content-staleness`: kit exports in stale scan (via export-artifacts kind)
- `guide-suggest`: export kit suggestion

## Impact

- `@spec-driven-methodology/core`: `export-kit.ts`, `export-kit-html.ts`, `export-package-identity.ts`, `export-artifacts.ts`, `suggest.ts`, `index.ts`
- CLI, MCP, player templates, agents, docs

## Non-goals

- Изменение `SkillSchema` / `QuestionSchema` (v1 kit uses existing fields)
- Наполнение methodology-проектов контентом коллег
- HR candidate runner / scoring session storage
- LLM prose in kit body
