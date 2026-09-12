## Context

`export test` already selects questions by level requirements, optional `--team`, `--adaptive`, and type filters (`--include-type` / `--exclude-type`) with `meta.typeFilter`. Agents need skill subsets and exact question-id packs without post-processing JSON. Logic lives in `@spec-driven-methodology/core`; CLI/MCP are thin.

## Goals / Non-Goals

**Goals:**

- Deterministic skill include/exclude and question-id allowlist on `export test` + MCP `export_test`.
- Honest `meta` + `questionCount`; narrowed `requirements` when skill include applies.
- Stable SdmError codes; agent docs forbid hand-slicing when flags exist.

**Non-Goals:**

- `--exclude-question` MVP; profile-private questions; teams CRUD; player redesign; changing adaptive algorithm itself.

## Decisions

1. **Filter pipeline order**  
   Resolve level (+ team) → collect candidates by required skills → **skill filter** → **adaptive** (if set) → **type filter** → **question-id allowlist**.  
   Rationale: skill filter shrinks the universe before sampling; type filter matches today’s “after adaptive” rule; id allowlist is the final precise cut.  
   Alternative considered: id filter before adaptive — rejected (adaptive would rarely see the allowlisted set).

2. **Skill filter CLI/MCP**  
   - CLI: repeatable `--include-skill <id>` **or** `--exclude-skill <id>` (not both).  
   - MCP: `includeSkills` / `excludeSkills` string arrays.  
   - Codes: `EXPORT_SKILL_FILTER_CONFLICT`, `EXPORT_SKILL_UNKNOWN` (id not on effective level requirements).  
   - On **include**: `document.requirements` KEEP only included skills that were on the level; **renormalize weights to sum 1** once; set `meta.weightsNormalized: true` when adjustment occurred (same spirit as cert create). On **exclude**: drop excluded skills from requirements the same way.  
   - `meta.skillFilter: { mode, skills }` when any skill filter applied.

3. **Question-id allowlist**  
   - CLI: repeatable `--include-question <id>`; MCP: `includeQuestions: string[]`.  
   - After other filters, keep only listed ids.  
   - If any requested id is **absent from the pre-id-filter candidate set**, fail with `EXPORT_QUESTION_NOT_FOUND` (deterministic; no silent skip).  
   - If allowlist empties the package (should not happen if all ids found), fail with `EXPORT_FILTER_EMPTY`.  
   - `meta.questionFilter: { mode: "include", ids: [...] }`.

4. **Empty after skill/type filters**  
   Align with type-filter behavior: export **succeeds** with zero questions for a skill listed in `meta.skillsMissingQuestions`, unless the **entire** `questions` array is empty **and** a skill or question filter was applied → then fail `EXPORT_FILTER_EMPTY` (agents must not ship empty “success” packs for explicit subsets).  
   Alternative: always succeed with `[]` — rejected for agent-first subset intents.

5. **No Zod change to library YAML**  
   Filters are export-options only; methodology schemas unchanged.

6. **Docs**  
   `export-methodology` + `intent-loop`: map NL («только skill X», «без skill Y», «только вопросы id…») to flags; explicitly forbid jq/node slice when filters exist.

## Risks / Trade-offs

- [Weight renormalize on skill filter surprises humans] → Document in meta + agent skill; only when skill filter applied.  
- [Unknown question id hard-fail feels strict] → Prefer fail over silent drop for CI/agents.  
- [MCP schema drift vs CLI] → Same validation helper in core; MCP tests mirror type-filter tests.

## Migration Plan

- Backward compatible: no new flags → identical output (no new meta keys).  
- Ship behind normal release; update CHANGELOG `[Unreleased]`.  
- No data migration.

## Open Questions

- None for MVP (exclude-question deferred).
