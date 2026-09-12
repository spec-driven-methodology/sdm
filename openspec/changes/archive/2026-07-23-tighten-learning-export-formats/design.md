## Context

`export course` ships `sdm.export.course/v1` with controls `depth` + `format` (`howto|concept|cheatsheet`). Agents treat `concept` as a vague primer; the command name implies every pack is a course. Player and schema already depend on `sdm.export.course/v1`.

## Goals / Non-Goals

**Goals:**

- Predictable genres: `howto` / `notes` / `cheatsheet` / `course` with Russian labels in agent surfaces.
- Primary CLI/MCP: `export learning` / `export_learning`; aliases `export course` / `export_course`.
- `meta.layout` + stub shaping: `single_doc` vs `modular_course`.
- Soft locale-mix warning on non-empty lesson bodies; skill locale rules for agent prose.
- Suggest levers and skill contracts so agents propose format+depth before plan-only.

**Non-Goals:**

- Schema rename to `sdm.export.learning/v1`
- Removing course aliases
- LMS / CMS lessons / markdown consumer format
- Hard-fail on locale mix

## Decisions

1. **Command rename, schema stay**  
   Canonical: `export learning`. Document schema remains `sdm.export.course/v1` so player needs no parser change. Alternatives considered: rename schema now (breaks player); keep only `export course` (fails product language).

2. **Format enum**  
   Canonical: `howto|notes|cheatsheet|course`. `concept` → normalize to `notes` + warning `FORMAT_CONCEPT_DEPRECATED`. Invalid values → `COURSE_FORMAT_INVALID`.

3. **Layout**  
   - `course` → `meta.layout: modular_course`, lesson stubs per topic (current `buildLessonStubs`).  
   - `howto|notes|cheatsheet` → `meta.layout: single_doc`, **one** lesson stub per module (title = skill name or scoped topic).  
   TeachingContext and practice ids unchanged.

4. **Locale mix**  
   Heuristic on prose outside fenced code: if body has both Cyrillic and Latin word-like tokens → soft `PROSE_LOCALE_MIXED`. No fail. Skill enforces language for generation.

5. **Suggest / skill**  
   Keep skill path `agents/export-course/` (install churn). Levers map Russian phrases to `--format` + `export learning` commandHint. Default depth/format for hints: howto+standard unless phrase says otherwise.

6. **CLI/MCP implementation**  
   Shared handler in CLI for `learning` and `course`. MCP: register `export_learning` with same schema; `export_course` remains and delegates.

## Risks / Trade-offs

- [Risk] Callers hard-coded to `concept` → Mitigation: deprecated alias + warning, clear error text listing new enum.  
- [Risk] Locale heuristic false positives (API names in Russian prose) → Mitigation: soft warn only; exclude code fences; skill guidance for identifiers.  
- [Risk] Dual MCP tool names → Mitigation: both listed in about/AGENTS; same payload.

## Migration Plan

1. Ship format parse + layout + warnings.  
2. Add `export learning` / `export_learning`; keep aliases.  
3. Update docs/skills/suggest/CHANGELOG.  
4. Consumers: replace `--format concept` with `--format notes`.  
5. Schema bump deferred.

## Open Questions

- None for this change (schema rename deferred).
