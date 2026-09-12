## 1. Schema: expected answers

- [x] 1.1 Add optional `expected: string | string[]` to `QuestionSchema` in `@spec-driven-methodology/core` with non-empty constraints
- [x] 1.2 Extend `AddQuestionInput` / `buildPayload` / type guards: allow `--expected` only for `open`; reject otherwise with `VALIDATION_FAILED`
- [x] 1.3 Unit tests: validate open+expected, reject empty expected, reject expected on choice types

## 2. CLI / MCP write path

- [x] 2.1 Add repeatable `--expected <text>` to `sdm question add`; pass through to core; keep `--json` envelope
- [x] 2.2 Mirror `expected` on MCP `question_add` Zod args + handler
- [x] 2.3 Smoke in playground/temp project: `question add --type open … --expected … --json` then re-read YAML

## 3. Export pass-through

- [x] 3.1 Ensure `export test` JSON includes `expected` when present on library questions
- [x] 3.2 Add `expected` column to CSV (`testDocumentToCsv`) and update export tests
- [x] 3.3 Playground smoke: export after adding open+expected; confirm field in JSON

## 4. Static player template

- [x] 4.1 Create `packages/core/templates/methodology/player/` (`index.html`, `styles.css`, `app.js`, short README with preview boundary)
- [x] 4.2 Implement load JSON, question UI (single/multi/open/code), check / skip / navigate, finish
- [x] 4.3 Implement end stats: aggregates, per-skill, weighted score vs `threshold` (per design)
- [x] 4.4 Wire `initMethodologyProject` to copy `player/` always (absent-or-force); add/adjust init test

## 5. Docs and verify

- [x] 5.1 CHANGELOG `[Unreleased]`: player via init, `expected` on open, export CSV column
- [x] 5.2 README / AGENTS / `export-methodology` skill: one-liner on opening `player/` after `export test`
- [x] 5.3 `npm run verify` in `specra/`; manual open `player/index.html` against a real export JSON
