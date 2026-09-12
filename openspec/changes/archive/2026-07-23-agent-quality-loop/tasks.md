## 1. Quality config + shared validate

- [x] 1.1 Extend `QualityConfigSchema` (`coverageMode`, `writeGate`, `skillGate`, blueprint knobs, nearDupThreshold, requireExplanation) with Zod defaults and unit tests
- [x] 1.2 Implement shared `validateQuestionDraft` (structural + topics membership + near-dup + distractor rules + optional explanation) returning `errors[]` / `findings[]` with stable codes
- [x] 1.3 Wire pipeline into `question add` (`writeGate` off/soft/strict; `--json` warnings on soft); preserve legacy distractorQuality behavior

## 2. Blueprint coverage and gaps

- [x] 2.1 Implement blueprint classifier (`reasons`, status rules for topics/bands/types) behind `coverageMode: blueprint`; keep `legacy` identical
- [x] 2.2 Emit `workItems` from coverage/gaps; expose in `cert coverage` / `cert gaps` `--json`
- [x] 2.3 Core unit tests: legacy green stays green; blueprint thin on uncovered topics

## 3. question validate CLI + MCP

- [x] 3.1 Add CLI `question validate` with `--json` (no writes)
- [x] 3.2 Register MCP tool `question_validate` + mcp package tests
- [x] 3.3 Smoke: invalid topic / near-dup / short distractors under strict vs soft

## 4. Richer question generate

- [x] 4.1 Attach per-draft brief fields (`mustCoverTopic`, `avoidNearIds`, `relatedSkillIds`, instructions)
- [x] 4.2 Prefer work-item-driven draft assignment when profile/level + blueprint workItems exist
- [x] 4.3 MCP `question_generate` schema/docs parity + core tests

## 5. Suggest + skill gate

- [x] 5.1 Update `suggest` ranking: quality harden / close gaps before primary export when workItems or quality findings remain
- [x] 5.2 Implement `skillGate` soft/strict on `skill add` (`--json` warnings / reject)
- [x] 5.3 Optional commented `quality:` example in init template docs (no forced migration)

## 6. Audit alignment + agent docs

- [x] 6.1 Align audit near-dup / distractor findings codes with validate pipeline where overlapping
- [x] 6.2 Update portable skills (`generate-questions`, `close-coverage`, `guide-suggest`) and `AGENTS.md` with agent quality loop: gaps → generate → validate → rewrite → add → suggest
- [x] 6.3 README + CHANGELOG `[Unreleased]` (Russian Keep a Changelog); document opt-in blueprint/strict

## 7. Verify

- [x] 7.1 `npm run verify` (build + typecheck + test)
- [x] 7.2 Playground smoke with `--json`: enable blueprint+strict → gaps workItems → generate → validate fail → rewrite → add → suggest harden/export
