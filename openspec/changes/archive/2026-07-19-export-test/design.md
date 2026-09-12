## Context

Coverage/CRUD/MCP exist; methodology stays in YAML. Consumers still need a pipeable package (`docs/idea.md` §6.2–6.3). This change adds read-only assemblers — no new methodology YAML fields.

## Goals / Non-Goals

**Goals:**

- Deterministic `export test` (role+level → questions + requirements) and `export matrix` (role → levels×skills)
- Formats: test default JSON (+ CSV); matrix default CSV (+ JSON)
- Agent envelope via `--json`; SdmError codes; MCP tools; unit tests + playground smoke

**Non-Goals:**

- Adaptive/`--seed` sampling, candidate history, Confluence/Mermaid, HTTP MCP
- Changing Question/Level Zod schemas; running or scoring tests inside Specra

## Decisions

1. **Command surface**
   ```bash
   sdm export test --role <id> --level <id> [--format json|csv] [--json]
   sdm export matrix --role <id> [--format csv|json] [--json]
   ```
   - Logic in `@spec-driven-methodology/core`; thin CLI.
   - Alternative: single `export --kind test|matrix` — rejected; domain verbs match idea.md.

2. **Test assembly (PoC)**
   - Reuse `findProjectRoot`, `loadRole`/`loadLevel`/`assertRoleLevelMatch`, `loadQuestions`.
   - Include every library question whose `skill` is in the level’s `requirements` (no sampling).
   - Sort by `skill` asc, then `id` asc (stable for diffs/CI).
   - Include full question objects (options/correct/explanation) — consumers grade; redaction later if needed.
   - Document shape `schemaVersion: "sdm.export.test/v1"` with `role`, `level`, `title`, `threshold`, `requirements`, `questions`, `meta.questionCount`, `meta.skillsMissingQuestions[]`.
   - Export succeeds with exit 0 even if some skills have 0 questions (delivery ≠ audit); list those skills in meta. Fail only on structural errors (`PROJECT_ROOT_NOT_FOUND`, level/role missing, validation).

3. **Matrix assembly**
   - Load role → each level id in `role.levels` → level YAML (skip missing with warning, or fail if none load — **fail if any listed level file missing** for PoC clarity).
   - Long-form rows: `{ skill, level, depth, weight }` for every requirement across levels (CSV natural).
   - JSON: `schemaVersion: "sdm.export.matrix/v1"`, `role`, `title`, `levels[]`, `cells[]` (same long-form).
   - Default `--format csv` for matrix; `json` for test.

4. **Stdout contract**
   - Default: raw consumer document (JSON string or CSV text) for pipes (`> out.json`).
   - `--json`: agent envelope `{ ok: true, format, document }` where `document` is the object (JSON formats) or `{ "csv": "<text>" }` (CSV formats). Errors: `{ ok: false, code, message }`.
   - MCP tools always return the envelope payload (same as `--json` success body).

5. **CSV columns**
   - Test CSV: `id,skill,difficulty,type,text,options,correct,explanation` (`options`/`correct` JSON-encoded in cell).
   - Matrix CSV: `skill,level,depth,weight`.

6. **Errors**
   - Reuse existing codes where possible; add `EXPORT_FORMAT_INVALID` for bad `--format`.
   - No YAML writes; no Zod changes to on-disk methodology.

7. **MCP / agents**
   - Tools `export_test`, `export_matrix` calling core.
   - Short portable skill `agents/export-methodology/` + AGENTS.md pointer.

## Risks / Trade-offs

- [Full answer keys in export] → Accept for PoC; document; optional omit flag later
- [All questions, no sampling] → Large payloads; sampling/adaptive is follow-up
- [Level id uniqueness] → Same PoC constraint as cert-write (filename = level id)

## Migration Plan

Ship commands only; rebuild workspaces; smoke in playground with examples role/level. No data migration.

## Open Questions

None blocking. Follow-ups: `--seed` sampling, `--omit-answers`, Confluence export.
