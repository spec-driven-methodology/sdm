## Context

Specra already scaffolds methodology projects (`sdm init`) and has Zod schemas for skills, questions, roles, and levels in `@spec-driven-methodology/core`. Playground with `--with-examples` provides a fixture: middle java-developer requires docker, but no docker questions exist. There is no command yet that reads the project and reports coverage gaps.

## Goals / Non-Goals

**Goals:**
- Implement `sdm cert coverage --role <role> --level <level>`
- Resolve methodology project root from cwd
- Load/validate level (+ optional role filter) and question library via Zod
- Apply simple count-based coverage heuristics with named constants
- Emit a clear CLI report and CI-friendly exit codes

**Non-Goals:**
- Ideal mathematical coverage vs `depth`
- Difficulty-aware sampling, AI generation, export, MCP, vector search
- Writing/updating YAML (CRUD)

## Decisions

1. **Project root via upward walk for `sdm.yaml`**
   - Rationale: matches `git`/`npm` mental model; works from subdirs.
   - Alternative: require running only from project root — rejected as brittle.

2. **Logic in `@spec-driven-methodology/core`, thin CLI wrapper in `@spec-driven-methodology/cli`**
   - Rationale: coverage is reusable later (MCP/API); CLI only parses flags and prints.
   - Alternative: all logic in CLI — rejected.

3. **Level resolution**
   - Load `certifications/levels/<level>.yaml` (or any `*.yaml` whose `level` field matches).
   - If `--role` is provided and level YAML has `role`, require equality; if level has no `role`, still allow when role file lists the level.
   - For PoC: prefer exact file `certifications/levels/<level>.yaml` validated with `LevelSchema`; if `role` present in YAML and CLI `--role` differs → error.

4. **Question inventory**
   - Scan `library/questions/**/*.yaml`, parse with `QuestionSchema`, group counts by `skill`.
   - Skip invalid files with a warning line (do not abort entire run unless zero valid questions and level has requirements — still report zeros).

5. **Heuristics (explicit constants in core)**
   - `MIN_OK_QUESTIONS = 3`
   - `0` → `missing` (❌)
   - `1..MIN_OK_QUESTIONS-1` → `thin` (⚠️)
   - `>= MIN_OK_QUESTIONS` → `ok` (✅)
   - `depth`/`weight` are displayed but do not alter status in this change.
   - Alternative: scale threshold by depth — deferred; too opaque for PoC.

6. **Exit code**
   - Non-zero only when any skill is `missing` (0 questions).
   - `thin` is warning-only (exit 0 if no missing).

7. **YAML / Zod**
   - Reuse existing `LevelSchema`, `QuestionSchema`, `RoleSchema` from `@spec-driven-methodology/core`.
   - Add small loader helpers; no schema breaking changes expected.

## Risks / Trade-offs

- [File naming drift] → Mitigation: match by `level` field inside YAML if filename differs.
- [Invalid question YAML silently skews counts] → Mitigation: warn per file; continue.
- [Threshold=3 feels arbitrary] → Mitigation: named constant + comment; revisit when depth-aware coverage lands.
- [Role/level coupling ambiguity] → Mitigation: document PoC rule in CLI help; tighten later.

## Migration Plan

- No migration: new command only.
- Rebuild + `npm link -w @spec-driven-methodology/cli`, verify in playground.

## Open Questions

- None blocking for PoC. Future: should `thin` fail CI via `--strict` flag?
