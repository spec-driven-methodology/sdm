## Why

Agents and methodologists cannot predict what `format=concept` produces; educational export is framed as “course” even when the user wants a short howto, notes, or cheatsheet. We need hard genre contracts and a command that means “learning materials,” with `course` as one format among several.

## What Changes

- Rename primary CLI/MCP surface to `export learning` / `export_learning`; keep `export course` / `export_course` as aliases.
- Tighten `format` to `howto` | `notes` | `cheatsheet` | `course` with Russian agent labels (Инструкция / Конспект / Шпаргалка / Курс).
- **BREAKING (soft):** `concept` is no longer a canonical value; accepted as deprecated alias → `notes` with warning `FORMAT_CONCEPT_DEPRECATED`.
- Echo `meta.layout`: `single_doc` (howto/notes/cheatsheet) vs `modular_course` (course); shape lesson stubs accordingly.
- Soft warning `PROSE_LOCALE_MIXED` when non-empty lesson bodies mix scripts (code fences excluded).
- Update `suggest` levers, portable `export-course` skill contracts, AGENTS/README/CHANGELOG for format×depth and workflow (propose format → plan-only → HITL prose → preview).

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `export-course`: format enum, CLI/MCP rename+alias, layout/stubs, locale warning, agent-facing labels
- `guide-suggest`: levers and commandHint for four formats via `export learning`
- `player-course-reader`: docs/command naming only; same `sdm.export.course/v1` schema

## Impact

- `@spec-driven-methodology/core` (`export-course`, `suggest`, `about`), CLI, MCP tools/tests
- Agents: `agents/export-course/`, `guide-suggest`, `AGENTS.md`, README, CHANGELOG, player README
- Consumers of `--format concept` must migrate to `notes` (alias still works)
- Schema version unchanged (`sdm.export.course/v1`)

## Non-goals

- LMS / progress / CMS `library/lessons/`
- Markdown export consumer format
- Schema bump to `sdm.export.learning/v1`
- Removing `export course` alias in this change
