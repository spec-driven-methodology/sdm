## 1. Core suggest assembler

- [x] 1.1 Implement `@spec-driven-methodology/core` `buildSuggest` + Zod payload (snapshot, focus, suggestions/levers); reuse gaps/coverage; detect `exports/` + `player/index.html`
- [x] 1.2 Priority rules + Russian levers (export types/volume; threshold distinct); codes `NOT_A_PROJECT`, `SUGGEST_FOCUS_REQUIRED` when needed
- [x] 1.3 Unit tests: questions→export suggestion; export without player→player; thin gaps rank above export; levers include «без текстовых» / threshold separation

## 2. CLI + MCP

- [x] 2.1 Add `sdm suggest [--profile] [--level] [--json]`
- [x] 2.2 Register MCP `suggest` (project/profile/level); update TOOL_NAMES + about registries
- [x] 2.3 MCP/CLI tests: listed; ok with temp project; fail outside project

## 3. Agent surface + docs

- [x] 3.1 Add `agents/guide-suggest/SKILL.md` (post-write / «что дальше?» → suggest; no MCP catalog)
- [x] 3.2 Update `AGENTS.md`, `agents/intent-loop/SKILL.md`, agents README; brief export-methodology cross-link if useful
- [x] 3.3 CHANGELOG `[Unreleased]` + README one-liner (no semver bump)

## 4. Verify

- [x] 4.1 `npm run verify` in `specra/`
- [x] 4.2 Smoke on `my-methodology` (or temp): `sdm suggest --profile … --level … --json` shows export/player-oriented actions when applicable
