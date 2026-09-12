## 1. Contract & TeachingContext

- [x] 1.1 Зафиксировать Zod/TS типы: `sdm.export.course/v1` (modules, lessons stubs/body, practiceQuestionIds, controls, warnings, meta) и TeachingContext / plan payload
- [x] 1.2 Реализовать сборку TeachingContext из scope: profile/level, skill, topic, `--from-questions`; graph edges + question anchors
- [x] 1.3 Реализовать learning-readiness warnings (description/topics/graph/practice/explanation) с стабильными кодами
- [x] 1.4 Зафиксировать enums controls: `depth` (brief|standard|detailed), `format` (howto|concept|cheatsheet); валидация + SdmError на invalid
- [x] 1.5 Unit-тесты TeachingContext + warnings + controls echo (без LLM)

## 2. Export course core

- [x] 2.1 Реализовать `exportCourse` в `@spec-driven-methodology/core`: modules + topo order (`depends_on`) + practice ids + echo controls + warnings
- [x] 2.2 Режимы scope: full level, `--from-gaps`, `--skill`, `--topic`, `--from-questions`; `--plan-only` / brief без обязательных bodies
- [x] 2.3 Unit-тесты export (skeleton, gaps, single skill, from-questions, cycle fallback warning, invalid profile/level)

## 3. CLI / MCP

- [x] 3.1 Команда `sdm export course … --json` (+ flags depth/format/scope/plan-only); тонкий CLI
- [x] 3.2 MCP tool `export_course` (и brief/plan args parity, если обновляем shipped tool set)
- [x] 3.3 Smoke: playground или `ai-methodology` — brief howto по topic/question vs detailed; проверить schemaVersion, controls, warnings, practice ids

## 4. Agents & docs

- [x] 4.1 Portable skill `agents/export-course/`: clarify controls → show brief+warnings → HITL → optional skill enrichment → generate prose → export; ссылка из `AGENTS.md`
- [x] 4.2 README / CHANGELOG (RU): граница «не LMS», pipeline brief→generate→export, аналогия с `export test`; убрать статус «реализация отложена» из Unreleased при ship
- [x] 4.3 `npm run verify`

## 5. Archive gate

- [x] 5.1 Закрыть open questions в design (strict-context fail vs warn; brief schema vs meta; markdown format; MCP split)
- [x] 5.2 Archive change → main spec `export-course` + baseline в `openspec/config.yaml`
