## Context

Author-preview player already shuffles **question order**. Option-order and length cues remain: libraries often put the correct choice first and make it the longest string. Export writes options in YAML order; audit does not score these smells. CHANGELOG lists `export test --shuffle-options` as planned.

Stakeholders: methodology authors / agents (library quality), author-preview consumers (player), CI (audit).

## Goals / Non-Goals

**Goals:**

- Runtime: permute choice `options` at export and/or player session start with remapped `correct`
- Detect position and length bias in `sdm audit --json`
- Project-level `distractorQuality` policy (`off` | `soft` | `strict`) with length-band rules
- Agent guidance so new questions do not reproduce the smell

**Non-Goals:**

- Auto-rewrite distractor text inside core
- Embedding-based plausibility gate in v1
- Tying quality to cert `threshold`
- Proctoring / candidate LMS

## Decisions

1. **Shared shuffle primitive in `@spec-driven-methodology/core`**
   - Pure helper: Fisher–Yates over options + remap 1-based `correct` (number | number[]).
   - Export path: optional `--seed` → deterministic PRNG (e.g. mulberry32); without seed → non-deterministic (document in meta).
   - Player: `Math.random()` on session copy (same stance as question shuffle); no seed in player v1.
   - **Why not only player?** Consumers of exported JSON (other UIs) need export-time shuffle too.

2. **Export flag surface**
   - CLI: `--shuffle-options` / `--seed <int>`; MCP: `shuffleOptions`, `seed`.
   - When enabled, apply per choice question (`single_choice` | `multi_choice`); leave `open`/`code` untouched.
   - `meta.optionShuffle`: `{ enabled: true, seed?: number }` when flag set; omit when off (backward compatible).
   - Library YAML never rewritten by export.

3. **Player session option**
   - Checkbox «Перетасовывать варианты» default off; `localStorage` key `sdm.player.shuffleOptions`.
   - Independent of question-order shuffle; both may be on.
   - On **Начать**: deep-copy questions, shuffle each choice question’s options + correct; never mutate library entry in `localStorage`.

4. **`distractorQuality` in `sdm.yaml`**
   - Extend `SdmConfigSchema`:
     ```yaml
     quality:
       distractorQuality: off | soft | strict  # default off
       # optional knobs with defaults:
       # lengthBandRatio: 0.5   # distractor len ∈ [ratio, 1/ratio] × correctLen
       # positionBiasThreshold: 0.6  # fraction of choice Q with min(correct)==1
       # minChoiceSample: 5
     ```
   - **Not** on cert threshold — orthogonal concerns.
   - Soft for junior-ish packs: leave `off`/`soft`; middle+ methodologies set `soft` or `strict` explicitly.

5. **Length-band metric (v1)**
   - Applies only to choice questions with ≥2 options.
   - Let `C` = length of the (primary) correct option; for `multi_choice` use max length among correct options.
   - A distractor fails the band if `len < C * ratio` or `len > C / ratio` with default `ratio = 0.5` (i.e. within half…double of correct).
   - Question fails length quality if **any** distractor fails the band **or** correct is uniquely longest and `C >= 1.3 * secondLongest` (outlier cue).
   - Audit lists failing question ids (capped sample in text view; full ids in JSON).

6. **Position bias metric**
   - Among choice questions, share where the minimum 1-based correct index is `1`.
   - Finding when `sample >= minChoiceSample` and `share >= positionBiasThreshold` (default 0.6).
   - Recommendation: shuffle at export/player **and** vary `correct` position when authoring.

7. **Policy enforcement**
   | Mode | Audit | `question add` |
   |------|-------|----------------|
   | `off` | No bias findings (or only if we always emit low-priority — prefer **no** findings) | No length check |
   | `soft` | Emit findings + recommendations | Warn in `--json` payload optional field; **still writes** |
   | `strict` | Same findings, priority high | Reject with `DISTRACTOR_QUALITY` before write |

   Default `off` keeps existing projects green.

8. **Agent surface**
   - Update `agents/generate-questions/SKILL.md` (+ bootstrap pack notes): match distractor length/plausibility; set `quality.distractorQuality` when hardening a pack.
   - No new CLI command for rewrite — agent edits via `question add --force` after audit.

### Alternatives considered

| Option | Why not |
|--------|---------|
| Only player shuffle | Leaves JSON consumers and length cue unaddressed |
| Gate on threshold ≥ 0.7 | Couples pass score to item writing; confusing for agents |
| Hard reject always | Breaks bootstrap / examples; default must stay `off` |
| Embedding similarity for distractors | Heavy; deferred |

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Seeded shuffle still leaks length cue | Audit + quality policy; shuffle is necessary but not sufficient |
| Strict blocks bootstrap seed drafts | Default `off`; document enable after first pass |
| Length band too strict for short technical terms | Tunable `lengthBandRatio`; multi_choice uses max correct length |
| Export shuffle surprises CI golden files | Opt-in flag; meta records seed for repro |
| Player shuffle + Prev/Next | Session-local copy only; same as question shuffle |

## Migration Plan

1. Ship schema default `quality.distractorQuality: off` (omit key = off).
2. Implement helper + export flags + player option + audit.
3. Docs/CHANGELOG: remove «Запланировано» shuffle-options; document quality knobs.
4. Authors of biased packs: `audit --json` → agent rewrite → optional `soft`/`strict`.

Rollback: flags default off; omit `quality` in yaml — no behavior change.

## Open Questions

- None blocking: soft warn-on-add can be deferred to audit-only if CLI warn noise is undesirable — prefer audit-only for soft in v1, strict reject on add.
