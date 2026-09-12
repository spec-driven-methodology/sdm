## 1. Core mix resolver

- [x] 1.1 Add `@spec-driven-methodology/core` module `question-type-mix.ts`: presets `single` | `mixed` | `full`, `ACTIVE_MIX_TYPES`, `assignTypesForMix(preset, count)`, Zod parse helper, error codes `TYPE_MIX_INVALID` / `TYPE_MIX_CONFLICT`
- [x] 1.2 Unit tests for assignment order, wrap-around, unknown preset, and conflict helper
- [x] 1.3 Export public API from `packages/core/src/index.ts`

## 2. question generate + CLI/MCP

- [x] 2.1 Wire `--mix` into `questionGenerate` options; mutually exclusive with `--type`; default remains homogeneous `single_choice`
- [x] 2.2 Per-draft stub types from assignment; `open` stubs without fake options; choice stubs keep options/correct; include `typeMix` in `--json` / return value; update agentPrompt
- [x] 2.3 CLI `question generate --mix` + MCP `question_generate` arg; stable error codes on conflict/invalid
- [x] 2.4 Core/CLI tests for mixed generate JSON shape and default backward compatibility

## 3. Intent plan + bootstrap seed

- [x] 3.1 Extend `SeedPlanSchema` with optional `typeMix` (default `single`); validate unknown values; keep existing `seed.type` for homogeneous override when mix is `single`
- [x] 3.2 Unit tests for `intent validate-plan` with `typeMix`
- [x] 3.3 Update `agents/bootstrap-profile-pack/SKILL.md` (and role-pack stub if needed) to pass `--mix` from plan seed

## 4. Portable skills + audit

- [x] 4.1 Update `agents/generate-questions/SKILL.md`, `close-coverage/SKILL.md`, `intent-loop/SKILL.md`: when human asks for mix use `--mix mixed`/`full`; default `single`; do not invent deferred types
- [x] 4.2 Add mono-type advisory recommendation in `audit` (≥3 questions, one type per skill); tests
- [x] 4.3 Brief note in `AGENTS.md` on type-mix presets and deferred types catalog

## 5. Coordination, docs, verify

- [x] 5.1 Coordinate with in-progress `export-test-player` / `question-expected-answer`: open drafts mention `--expected` when field exists; do not implement matching/sorting/dropdown/code
- [x] 5.2 CHANGELOG `[Unreleased]` + README note for `question generate --mix`
- [x] 5.3 `npm run verify` in `specra/`
- [x] 5.4 Playground smoke: `question generate --to-skill <id> --count 3 --mix mixed --json` and confirm draft types; default generate still all `single_choice`
