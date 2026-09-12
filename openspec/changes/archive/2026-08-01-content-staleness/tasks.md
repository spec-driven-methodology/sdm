## 1. Basis fingerprint + schema

- [x] 1.1 Add core helpers `hashSkillContent` / `hashLevelContent` (stable JSON + truncated SHA-256) and unit tests for stability / topic-change
- [x] 1.2 Extend Zod `QuestionSchema` with optional `meta.basis` (`skills` map, optional `level`, `capturedAt`); ensure loaders accept questions without `meta`
- [x] 1.3 Shared types for `ContentBasis` reusable by questions and export `meta.basis`

## 2. Impact artifacts (v2)

- [x] 2.1 Extend `SkillImpactDocument` to `sdm.skill.impact/v2` with `questions[]` and `exports[]`; implement collectors (library questions by skill/downstream; scan `exports/**/*.json` for profile/level/skill refs)
- [x] 2.2 Update CLI `skill impact` terminal + `--json` for new fields; bump schema constant
- [x] 2.3 Core/CLI tests: impact lists questions and export paths; unknown skill still `SKILL_NOT_FOUND`

## 3. Write-path stamping

- [x] 3.1 On successful `question add`, persist `meta.basis` for target skill + `capturedAt`
- [x] 3.2 On `export test`, add `meta.basis` (skills + level + `capturedAt`) without changing wire `schemaVersion`
- [x] 3.3 On `export course` / learning, add `meta.basis` for scoped skills (+ level when present)
- [x] 3.4 Unit tests: add/export success includes matching current hashes; failed add writes nothing

## 4. content stale command

- [x] 4.1 Implement `runContentStale` → document `sdm.content.stale/v1` (`stale` / `unknown` or unified reasons, `workItems`); scope `--skill` and `--profile`/`--level`; default non-transitive for downstream questions
- [x] 4.2 CLI `sdm content stale` with `--json` and SdmError codes
- [x] 4.3 Core tests: mismatch, missing_basis, fresh empty mismatches, SKILL_NOT_FOUND

## 5. MCP + about + suggest

- [x] 5.1 Register MCP `content_stale`; extend `skill_impact` payload expectations/tests for v2 fields
- [x] 5.2 About capabilities: `content stale` / `content_stale` in CLI/MCP lists
- [x] 5.3 `suggest`: `review-stale-content` lever when basis mismatches exist for focus; rank above primary export-test; tests

## 6. Agent docs

- [x] 6.1 Update `agents/explore-ontology` for impact artifacts; add portable skill or section for stale loop (impact → stale → HITL → rewrite/regenerate)
- [x] 6.2 Update `AGENTS.md` tool/command tables; `guide-suggest` skill if levers change
- [x] 6.3 README command table + CHANGELOG `[Unreleased]` (RU); note schemaVersion vs basis; optional `openspec/config.yaml` baseline list when archiving

## 7. Verify

- [x] 7.1 `npm run verify` in `specra/`
- [x] 7.2 Playground smoke `--json`: `skill impact` shows questions/exports → edit skill topics → `content stale` lists mismatches → `question add` / re-export stamps fresh basis → stale clean; `suggest` shows stale lever when dirty
