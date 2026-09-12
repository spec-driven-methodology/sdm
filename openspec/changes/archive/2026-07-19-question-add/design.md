## Context

Agent-first model: humans state intent; agents call Specra tools. We have `cert coverage` (read-only) and Zod `QuestionSchema`, but no write path. Playground examples leave docker uncovered — the natural demo for add → re-coverage.

## Goals / Non-Goals

**Goals:**
- Deterministic `question add --to-skill` suitable for agents
- Validate and write YAML via core (no schema bypass)
- `--json` for machine consumers; text summary for transcripts
- Stable error codes (`PROJECT_ROOT_NOT_FOUND`, `SKILL_NOT_FOUND`, `VALIDATION_FAILED`, `QUESTION_EXISTS`)

**Non-Goals:**
- Interactive prompts, AI generation, MCP packaging, edit/delete

## Decisions

1. **CLI shape (domain, not CRUD)**
   - `sdm question add --to-skill <id> --type <type> --difficulty <0..1> --text <string>`
   - For `single_choice` / `multi_choice`: `--option` repeatable + `--correct <index>` (0-based or 1-based — **1-based to match existing example YAML `correct: 2`**)
   - Optional `--id`; if omitted, generate `q-<skillShort>-<nnn>` unique in library
   - Optional `--explanation`, `--code-template` for `code` type
   - Alternative: subcommand per type — rejected; one command + type flag is enough for agents

2. **Skill binding**
   - `--to-skill` required; written as `skill` field
   - If `ontology/skills/<id>.yaml` missing → error `SKILL_NOT_FOUND` (strict: agents should not invent skills silently)
   - Alternative: warn-only — rejected for PoC clarity

3. **Persistence**
   - Path: `library/questions/<id>.yaml` via existing `writeYamlFile`
   - Refuse overwrite unless `--force` (`QUESTION_EXISTS`)
   - Validate full object with `QuestionSchema` before write

4. **Agent output**
   - Default: human-readable lines (id, path, skill)
   - `--json`: `{ ok, question, path, skill }` or `{ ok: false, code, message }`
   - Exit 0 on success; non-zero on SdmError

5. **Also add `--json` to `cert coverage`?**
   - Out of scope for this change unless trivial; prefer follow-up so agents can chain. Note as open follow-up.
   - This change focuses on write path only.

6. **Package split**
   - `addQuestion(projectRoot, input)` in `@spec-driven-methodology/core`
   - CLI parses flags and prints

## Risks / Trade-offs

- [Incomplete choice options] → Zod + explicit CLI validation before write
- [Id collisions across skills] → scan library ids; bump suffix
- [1-based correct vs JS 0-based] → document in help; match existing YAML examples
- [Agents pass huge text] → fine; no size limit in PoC

## Migration Plan

- New command only; rebuild + link; playground add docker question; re-run coverage

## Open Questions

- None blocking. Follow-up: `--json` on `cert coverage` for agent chaining.
