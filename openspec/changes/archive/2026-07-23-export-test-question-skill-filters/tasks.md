## 1. Core filter helpers

- [x] 1.1 Add SdmError codes: `EXPORT_SKILL_FILTER_CONFLICT`, `EXPORT_SKILL_UNKNOWN`, `EXPORT_QUESTION_NOT_FOUND`, `EXPORT_FILTER_EMPTY` (export from errors module if needed)
- [x] 1.2 Implement skill-filter resolve/apply + weight renormalize helper in `@spec-driven-methodology/core` (include/exclude mutual exclusion, unknown skill vs level requirements)
- [x] 1.3 Implement question-id allowlist helper (hard-fail on missing candidate ids)
- [x] 1.4 Wire pipeline in `assembleTestDocument` / export entry: skill → adaptive → type → question id; emit `meta.skillFilter`, `meta.questionFilter`, `meta.weightsNormalized`

## 2. CLI + MCP

- [x] 2.1 Add CLI flags `--include-skill`, `--exclude-skill`, `--include-question` on `export test`; pass through to core; keep `--json` envelopes
- [x] 2.2 Extend MCP `export_test` schema/handlers with `includeSkills`, `excludeSkills`, `includeQuestions`
- [x] 2.3 Unit tests in `@spec-driven-methodology/core` for pipeline order, conflicts, unknown skill/id, empty subset, renormalize
- [x] 2.4 MCP/CLI tests covering success + conflict codes (mirror type-filter tests)

## 3. Docs and agent skills

- [x] 3.1 Update `AGENTS.md`, `agents/export-methodology/SKILL.md`, `agents/intent-loop/SKILL.md` (NL → skill/question filters; forbid hand-slice)
- [x] 3.2 Update `README.md` command table / examples
- [x] 3.3 Add `CHANGELOG.md` `[Unreleased]` entry (Russian, Keep a Changelog)

## 4. Verify

- [x] 4.1 `npm run verify` in `specra/`
- [x] 4.2 Smoke in `ai-methodology` (or playground): full export; `--include-skill` QA trio; `--include-question` four new ids — CLI and/or MCP only, no Node slice
