## Context

`export test` emits `sdm.export.test/v1` with questions (`single_choice` | `multi_choice` | `open` | `code`), `requirements`, and `threshold`. Authors have no local way to smoke-run the package. Open questions cannot be auto-scored: `correct` is only numeric indexes for choice types. Product boundary stays: Specra is not an LMS; the player is a **reference consumer** for author preview.

## Goals / Non-Goals

**Goals:**

- Ship a zero-build static player that loads an export JSON file in the browser.
- Support auto-check for `single_choice`, `multi_choice`, and `open` (via new `expected`).
- Show `code` with text + `validation.criteria` without auto-grade (unscored / skip path).
- End-of-run stats: answered / correct / skipped / %, per-skill, weighted score vs `threshold`.
- Copy `player/` into every `sdm init` project from core templates.
- Add optional `expected: string | string[]` on question schema; wire `question add` + export pass-through.

**Non-Goals:**

- Persist attempts, accounts, export of results
- Code editor / sandbox execution
- Fuzzy NLP grading (only normalized exact match for `expected`)
- Hosted player service or CLI HTTP server
- Breaking change to `schemaVersion`

## Decisions

1. **Player = static template in methodology project**
   - Path: `packages/core/templates/methodology/player/` → copied to `<project>/player/` on every `init` (not only `--with-examples`).
   - Files: `index.html`, `app.js`, `styles.css` (no bundler).
   - Alternative: workspace-root only demo — rejected (not portable to user projects).
   - Alternative: npm package `@spec-driven-methodology/player` — rejected for v1 (overkill).

2. **UX flow**
   ```
   load JSON → question N → answer | skip → … → finish → stats
   ```
   - Check immediately shows right/wrong + `explanation` when present (author preview).
   - Skip marks question as skipped (not wrong).
   - Finish available anytime (remaining = skipped) or after last question.

3. **Scoring**
   - Choice: compare selected index/indexes to `correct` (1-based, same as YAML).
   - Open: normalize user text and each `expected` entry (`trim` + collapse whitespace + lowercase); match if equal to any expected.
   - Code: never auto-correct; counts as unscored unless user skips (skipped) or marks done without score — **decision: code answers are unscored** (excluded from correct denominator) unless skipped.
   - Per-skill share = correct / (correct + incorrect) among scored answered for that skill; skipped excluded from skill share.
   - Weighted score = Σ (skillShare × weight) over requirements that have ≥1 scored answer; skills with only skips contribute 0 to that skill’s share. Pass if weighted ≥ `threshold`.
   - Alternative: include skips as wrong — rejected for author preview (noise while browsing).

4. **`expected` field**
   - Zod: `expected: z.union([z.string().min(1), z.array(z.string().min(1)).min(1)]).optional()`.
   - Meaningful for `type: open`; for other types MAY be ignored by player; `question add` SHALL reject `--expected` unless type is `open` (or warn-and-ignore — **reject** preferred for agent clarity).
   - Open without `expected`: player allows textarea but treats submit as unscored (same class as code) and still shows explanation if any.
   - CLI: repeatable `--expected <text>` or single; MCP mirror.
   - CSV export: add column `expected` (JSON-stringify arrays).

5. **No schemaVersion bump**
   - Additive optional field is backward compatible for consumers that ignore unknown keys; document in CHANGELOG/README.

6. **Docs boundary**
   - README + player README stub: “author preview / demo; answers embedded; not a secure exam.”
   - Optional one-liner in `export-methodology` skill: after export, open `player/`.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Authors confuse player with product LMS | Explicit copy in UI + docs; Non-goals |
| Exact-match `expected` too brittle | Document normalization; allow multiple expected strings |
| Init always copying player surprises minimalists | Tiny static assets; skip if present unless `--force` (same as other init files) |
| Existing open questions unscored in player | Acceptable; agents add `expected` when auto-check needed |
| File:// CORS / module quirks | Keep vanilla JS without ES modules fetch of local files; use `<input type=file>` only |

## Migration Plan

1. Ship schema + CLI/MCP + export column (additive).
2. Ship player templates + init copy.
3. Existing projects: copy `player/` manually or re-init with force for that tree; no data migration.
4. Rollback: remove template/copy; ignore `expected` in older clients.

## Open Questions

- None blocking: multi-expected via repeated `--expected` is enough for v1.
- Later (out of scope): optional `expected_normalize: strict|loose` flag.
