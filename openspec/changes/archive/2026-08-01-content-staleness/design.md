## Context

Today `runSkillImpact` walks reverse `depends_on` and lists affected profiles/levels. It does not list questions or exports. Domain YAML (`Skill`, `Question`, `Level`) has no revision/hash. Export/course documents carry wire `schemaVersion` (format id) and light `meta`, not a content basis. Coverage/gaps/`workItems` answer «чего не хватает», not «что устарело после правки спеки».

Stakeholders: methodology agents (MCP/CLI), CI, human reviewers. Constraints: logic in `@spec-driven-methodology/core`, thin CLI/MCP, deterministic `--json`, stable `SdmError` codes, no LLM in core, no auto-delete of library content.

## Goals / Non-Goals

**Goals:**

- Expand impact to artifact refs (questions + exports) for a skill’s blast radius.
- Stamp `meta.basis` (skill/level content hashes) on write paths for questions and key exports.
- Ship `content stale` that compares stamped basis vs current hashes and emits stale rows + agent `workItems`.
- Keep wire `schemaVersion` distinct from content basis.
- Wire suggest + docs/skills for the review loop; backward compatible for unstamped content (`unknown`).

**Non-Goals:**

- Project-wide semver «X1/X2» as sole mechanism; auto-rewrite/delete; item lifecycle; LMS; core LLM; forced migration of existing YAML; default transitive stale of all downstream banks.

## Decisions

1. **Basis fingerprint, not manual skill semver**
   - Canonical hash: SHA-256 truncated (16 hex, same spirit as corpus `contentHash`) over a stable JSON of semantic skill fields: `id`, `name`, `description`, `category`, sorted `topics`, sorted `depends_on`, sorted `related_to`.
   - Level hash: `level`, `profile`, `threshold`, sorted requirements (`skill`, `depth`, `weight`).
   - Rejected: human-bumped `rev: N` only (agents forget); full skill snapshot embedded in every question (YAML bloat).

2. **`meta.basis` shape (Zod-optional on Question; export meta extension)**
   ```ts
   meta.basis = {
     skills?: Record<string, string>; // skillId → hash
     level?: { id: string; hash: string };
     capturedAt: string; // ISO
   }
   ```
   - Wire `schemaVersion` unchanged (`sdm.export.test/v1`, …).
   - Question schema: optional `meta` object; unknown keys stripped or allowed via passthrough only on `meta` if needed for forward compat — prefer strict Zod with known fields.

3. **Impact schema bump to `sdm.skill.impact/v2`**
   - Add `questions: Array<{ id: string; skill: string }>` for questions whose `skill` is in `{skill} ∪ downstreamSkills` (direct skill always; downstream included for structural radius).
   - Add `exports: Array<{ path: string; kind: string; schemaVersion?: string; profile?: string; level?: string; skills?: string[] }>` by scanning project `exports/` (and known export dirs) for JSON with matching skill/profile/level refs.
   - Keep `downstreamSkills` / `profiles` / `levels`.
   - Rejected: new command only for artifacts (agents already call `skill impact`); silent additive fields without schema bump (breaks strict consumers — bump version).

4. **`content stale` as separate domain op**
   - CLI: `sdm content stale [--skill <id>] [--profile … --level …] [--json]`
   - MCP: `content_stale`
   - Document schema `sdm.content.stale/v1`:
     - `changed[]` (optional focus entities)
     - `stale[]`: `{ kind, id|path, reason, severity, action }`
     - `unknown[]`: artifacts without basis (or omit into `stale` with reason `missing_basis`)
     - `workItems[]`: agent queue `{ kind, id|path, skill?, action, reason }`
   - Reasons: `skill_basis_mismatch`, `level_basis_mismatch`, `missing_basis`.
   - Actions: `review` (questions), `regenerate` (exports), `review_weights` (level touched structurally — advisory via impact, optional).
   - Scope: `--skill` → that skill’s questions + exports referencing it; profile/level → level hash + requirements’ skills.
   - Default **not** transitive for questions of downstream skills; impact already shows structural downstream. Optional later `--transitive`.

5. **Write-path stamping**
   - `question add` (success): set `meta.basis.skills[skill]=hash(skill)`, `capturedAt`.
   - `export test` / `export learning|course`: set `meta.basis` with hashes for scoped skills + level when present.
   - Do not rewrite existing files on read. Optional follow-up: `content stamp --backfill` (explicit only; default backfill = `unknown`).

6. **Cosmetic vs semantic (v1 pragmatic)**
   - v1: all listed semantic fields in hash → any change marks mismatch (simple, deterministic).
   - Document that typo-only edits will flag review; follow-up may split cosmetic fields or `--invalidate soft|hard` on skill patch.
   - Rejected for v1: NLP “meaning change” detection.

7. **Suggest integration**
   - When focus skill/level has non-empty stale (mismatch or missing_basis count above 0 for mismatch; missing_basis may be lower priority), add suggestion id e.g. `review-stale-content` with Russian lever, ranked near quality-harden (before primary export push when mismatches exist).

8. **Agent surface**
   - Update `explore-ontology` (impact artifacts) + new or extended skill `close-staleness` / section in AGENTS: impact → stale → HITL → rewrite/regenerate → re-stamp.
   - MCP tool list / about capabilities include `content stale` / `content_stale`.

9. **Errors**
   - Reuse `SKILL_NOT_FOUND`, profile/level not found codes.
   - New: none required for empty stale (success + empty arrays). Invalid project → existing project-root errors.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Mass `unknown` on old projects | Expected; suggest stamp on next write; optional backfill later |
| Typo edits flood stale | Document; follow-up cosmetic split / invalidate flags |
| Export scan false positives | Match on structured fields (profile/level/skills in JSON), not raw string grep only |
| impact/v2 breaks old agents | Document bump; keep field names additive where possible |
| confuses schemaVersion vs basis | Specs + README callout; different field names |
| Performance on large libraries | Hash is cheap; export dir walk bounded; reuse loaders |

## Migration Plan

1. Ship optional `meta` on questions; old YAML loads unchanged.
2. New writes get basis automatically.
3. `content stale` reports `missing_basis` for unstamped; never fails CI unless we add opt-in gate later (not in this change).
4. Consumers of impact JSON: read `schemaVersion`; tolerate v2 fields.
5. Rollback: ignore `meta.basis`; remove command — no data loss.

## Open Questions

- Exact export directory set: only `exports/` at project root, or also nested player copies? (Propose: project `exports/**/*.json` only.)
- Should `question validate` success refresh basis without rewrite of other fields? (Propose: no — stamp only on persist/`question add`.)
- Include `export matrix` / mermaid / confluence in stamp+stale v1? (Propose: scan all export JSON for impact; stamp on test + course/learning first; matrix stamp if same meta pattern is cheap.)
