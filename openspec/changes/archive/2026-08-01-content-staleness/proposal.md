## Why

После правки навыка (например сужения `java-core`) `skill impact` показывает зависимые навыки и уровни, но не вопросы, экспорты и learning, собранные от старого состояния. Coverage/gaps ловят дыры, а не «контент есть, но устарел». Агенту нужен доменный сигнал stale + список на ревью (`--json`, `workItems`), иначе методология расходится с производными артефактами молча.

## What Changes

- **Impact artifacts:** `skill impact` включает связанные вопросы и export-документы (test/learning/matrix/…), не только downstream skills / profiles / levels.
- **Content basis:** при записи вопросов и экспортов штамп `meta.basis` (hash значимых полей навыков/уровня), без путаницы с wire `schemaVersion`.
- **`content stale`:** доменная команда/MCP сравнивает сохранённый basis с текущим hash и возвращает stale-список + `workItems` (severity: review / regenerate).
- **Suggest / skills:** после правок онтологии — рычаг «проверь stale», portable skill/док для agent loop.
- Backward-compatible: артефакты без basis → статус `unknown` (не silent green).

## Capabilities

### New Capabilities

- `content-staleness`: basis fingerprint, stamp on write paths, `content stale` CLI/MCP + workItems; distinct from coverage gaps

### Modified Capabilities

- `skill-graph`: impact document includes questions and export artifact refs
- `skill-graph-cli`: CLI/JSON surface for expanded impact
- `question-add`: stamp `meta.basis` for target skill on successful add
- `export-test`: stamp basis (skills + level) on export document meta
- `export-course`: stamp basis on learning/course export meta
- `guide-suggest`: quality/staleness lever when stale items exist for focus
- `mcp-server`: `content_stale`; extend `skill_impact` payload; about/tools list
- `about-sdm`: surface new capability in about payload where applicable

## Impact

- `@spec-driven-methodology/core`: hash helpers, Zod `meta.basis`, impact expansion, `runContentStale`, write-path stamps
- `@spec-driven-methodology/cli` + `@spec-driven-methodology/mcp`: `content stale` / `content_stale`, impact JSON
- Tests, README/AGENTS/CHANGELOG, portable skill (explore-ontology or close-staleness)
- Existing methodology YAML: optional `meta` on questions; no forced rewrite

## Non-goals

- Global project «schema X1/X2» as sole invalidation mechanism
- Auto-delete or auto-rewrite of stale content
- Full item lifecycle (draft/approved/retired)
- LMS / candidate attempts / psychometrics
- LLM inside `@spec-driven-methodology/core`
- Transitive auto-stale of all downstream question banks by default (opt-in `--transitive` only if shipped)
- Migrating historical exports in playground/user repos
