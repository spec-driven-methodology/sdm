## Context

Ontology skills are YAML under `ontology/skills/` validated by `SkillSchema`. We already have `skillExists` / `loadSkill` for question-add. Missing: write path for agents.

## Goals / Non-Goals

**Goals:** Deterministic `skill add` + `skill link` with Zod, `--json`, stable errors.

**Non-Goals:** Graph viz, full cycle detection across the DAG, delete/rename.

## Decisions

1. **One change for add+link**
   - Shared file format, validation, JSON envelope, CLI parent `skill`.
   - Alternative: two changes — rejected; increases ceremony without isolation benefit.

2. **`skill add <id>`**
   - Writes `ontology/skills/<id>.yaml`
   - Required: positional `id`, `--name`
   - Optional: `--category`, `--desc` / `--description`, empty `depends_on`/`related_to` by default
   - `--force` overwrites; else `SKILL_EXISTS`
   - Default `name` from id only if we want — **no**: require `--name` for agent clarity

3. **`skill link <id>`**
   - Loads existing skill; errors `SKILL_NOT_FOUND` if missing
   - `--depends-on a,b` and/or `--related-to x,y` (comma-separated; at least one required)
   - **Merge semantics (PoC):** union with existing arrays (dedupe), do not replace entire list unless `--replace` — skip `--replace` for PoC, union-only
   - Every referenced id MUST exist in ontology → else `SKILL_NOT_FOUND` naming the missing dep
   - Reject self-dependency (`depends_on` includes self) → `VALIDATION_FAILED`
   - Full cycle detection: deferred (open follow-up)

4. **JSON shape**
   - Success: `{ ok: true, skill, path, action: "add"|"link" }`
   - Failure: `{ ok: false, code, message }` via shared CLI helper

5. **Package split**
   - Logic in `@spec-driven-methodology/core`; thin Commander wiring in `@spec-driven-methodology/cli`

## Risks / Trade-offs

- [Silent graph cycles] → Mitigation: document deferral; reject self-link only
- [Union vs replace for link] → Union is safer for agents adding deps incrementally

## Migration Plan

Rebuild, playground: add a new skill, link to java-core, add a question, coverage counts it if added to a cert (cert update out of scope — just verify files).

## Open Questions

- None blocking. Follow-up: cycle detection; `skill graph`.
