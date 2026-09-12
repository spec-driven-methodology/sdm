## Context

Agent-first loop today: `cert_gaps` → `question_generate` → LLM fill → `question_add` → gaps green → `suggest`/export.

Success is soft: `MIN_OK_QUESTIONS` (3) + `depthRatio ≥ 0.9` from `max(difficulty)`. Uncovered topics do not fail status. Distractor policy defaults to `off`. There is no dry-run validate before write. `suggest` prefers export once count/depth look ok.

Stakeholders: methodology agents (MCP), CI, human reviewers of agent output. Constraint: no LLM inside `@spec-driven-methodology/core`; deterministic `--json` contracts and stable `SdmError` codes.

## Goals / Non-Goals

**Goals:**

- Raise the quality ceiling of agent-authored banks via core gates and richer briefs (not by editing generated prose in-repo).
- Shared validation pipeline for add + validate + (aligned) audit findings.
- Blueprint-aware coverage/gaps with actionable `workItems` for agents.
- Portable skills document the canonical quality loop.
- Backward compatible defaults (`legacy` / soft); opt-in high bar (`blueprint` + `strict`).

**Non-Goals:**

- Item lifecycle (draft/approved/retired), LMS, psychometrics/IRT, core LLM, real LanceDB embeddings, `export course`, multi-tenant RBAC.

## Decisions

1. **Extend `quality` in `sdm.yaml` (Zod `QualityConfigSchema`)**
   - `coverageMode: legacy | blueprint` — default `legacy`.
   - `writeGate: off | soft | strict` — unifies/extends write-path enforcement; `distractorQuality` remains supported (mapped or nested under writeGate rules).
   - `skillGate: off | soft | strict` — min description / topics on `skill add`.
   - Blueprint knobs: `minQuestions`, topic coverage ratio, type diversity, difficulty-band rules relative to required depth; `nearDupThreshold`; `requireExplanation`.
   - Alternative rejected: always-on blueprint (breaks existing green packs).

2. **Blueprint classifier + work items**
   - Under `blueprint`, skill is `ok` only if all enabled rules pass; else `thin`/`missing` with `reasons[]` and `workItems[]`: `{ skill, topic?, type?, difficultyMin, difficultyMax, reason }`.
   - `cert gaps --json` / MCP expose `workItems` when blueprint mode is on.
   - `legacy` keeps current count + max-difficulty heuristics unchanged.

3. **Shared `validateQuestionDraft`**
   - Returns `{ ok, errors[], findings[] }` with stable codes.
   - Errors (structural always; policy errors when writeGate/distractor strict): schema/type invariants, topics not in skill.topics, near-dup above threshold, distractor length/position, missing explanation when required.
   - Findings (advisory): softer heuristics for rewrite guidance.
   - `question validate` = dry-run, never writes; `question add` calls the same pipeline.
   - Alternative rejected: `question add --validate-only` only — separate MCP tool is clearer for agents.

4. **Near-dup v1**
   - Same-skill lexical/Jaccard (reuse audit) + optional token index; config threshold; code `QUESTION_NEAR_DUPLICATE`.
   - Embeddings / LanceDB = follow-up.

5. **Richer `question generate`**
   - Prefer one draft per `workItem` (up to `count`); else uncovered topics × difficulty spread × type mix.
   - Per-draft: `mustCoverTopic?`, `type`, `difficulty`, `avoidNearIds[]`, `relatedSkillIds[]`, enriched `instructions` / `agentPrompt`.

6. **`suggest` quality phase**
   - If blueprint thin/missing or audit/validate-class findings remain → harden suggestions outrank primary export push (gap-close already outranks; extend to quality reasons).

7. **Skill gate**
   - `skillGate soft`: warn in JSON; `strict`: reject empty/short description or fewer than N topics (default N=3). Feeds better generate context.

8. **Agent loop (skills)**
   ```
   gaps(workItems) → generate(briefs) → validate → rewrite → add → gaps/audit → suggest
   ```
   Update `generate-questions`, `close-coverage`, `guide-suggest`, `AGENTS.md`.

9. **MCP**
   - New tool `question_validate`; extend payloads on gaps/coverage/generate/add/suggest; thin CLI over core.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Existing projects go thin overnight | Default `coverageMode: legacy` |
| Agents stuck in rewrite loops | Clear findings codes; skill rewrite guidance; soft mode for demos |
| Topic gate too strict for sparse skills | Editable topics; `--force` / soft writeGate |
| Blueprint knobs overload | Sensible defaults; document in README/CHANGELOG |
| Dual distractorQuality vs writeGate confusion | Design mapping table in impl; prefer writeGate as umbrella, keep distractorQuality alias |

## Migration Plan

1. Ship with defaults = current behavior (legacy + writeGate off / distractor off).
2. Document opt-in for high-quality agent packs: `coverageMode: blueprint`, `writeGate: strict`, `skillGate: strict`.
3. Optionally comment example `quality:` block in init templates (no forced rewrite of existing `sdm.yaml`).
4. Rollback: unset new knobs / set `legacy` + `off`.

## Open Questions

- Default for **new** `sdm init` projects: keep `legacy` or ship `blueprint` + `soft`?
- Exact default `minTopicsCoveredRatio` when skill has topics (propose `1.0` for strict topic closure).
- Whether `writeGate: strict` implies distractor strict even if `distractorQuality: off` (propose: writeGate strict enables distractor rules unless explicitly overridden).
