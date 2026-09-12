## 1. Core formats, layout, locale

- [x] 1.1 Update `COURSE_FORMATS` to `howto|notes|cheatsheet|course`; parse `concept` → `notes` + `FORMAT_CONCEPT_DEPRECATED`
- [x] 1.2 Add `meta.layout` (`single_doc` | `modular_course`) and shape lesson stubs by format
- [x] 1.3 Add soft `PROSE_LOCALE_MIXED` warning for non-empty bodies (strip code fences)
- [x] 1.4 Extend core unit tests for format/layout/deprecation/locale

## 2. CLI / MCP / about

- [x] 2.1 Add CLI `export learning` with shared handler; keep `export course` alias
- [x] 2.2 Add MCP `export_learning`; keep `export_course` delegating to same logic
- [x] 2.3 Update `about` capabilities / MCP tool list
- [x] 2.4 Update MCP tests for new tool + format enum

## 3. Suggest, agents, docs

- [x] 3.1 Update `suggest` course levers + `commandHint` → `export learning`
- [x] 3.2 Rewrite `agents/export-course/SKILL.md` format contracts + locale + workflow; mirror workspace skill
- [x] 3.3 Update `guide-suggest`, `AGENTS.md`, README, player README, CHANGELOG

## 4. Verify

- [x] 4.1 `npm run verify` in `specra/`
- [x] 4.2 Smoke `export learning` / alias `export course` with `--json` in a methodology project
