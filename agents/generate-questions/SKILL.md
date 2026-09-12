---
name: sdm-generate-questions
description: >-
  Fill SDM coverage gaps by generating draft question shells via
  `question generate`, completing them with an LLM, then persisting with
  `question add`. Use when a methodologist asks to generate questions for a
  skill, close thin/missing coverage with AI drafts, or expand the library.
license: Apache-2.0
compatibility: Requires SDM CLI (`sdm`) on PATH; run inside a methodology project (sdm.yaml).
metadata:
  author: sdm
  version: "0.1.4"
---

# Generate questions for a skill

Work in a **methodology project**. Prefer `--json`. SDM does **not** call an external LLM — it returns context + draft shells; **you** fill content, then validate → add.

**Agent quality loop:** `cert gaps` (workItems) → `question generate` → fill → `question validate` → rewrite → `question add` → gaps/suggest.

## Inputs

Ask if missing:

- `--to-skill` (skill id)
- How many drafts (`--count`, default 3)
- Optional: `--profile` / `--level` to attach gap status
- Optional: difficulty range (`--difficulty-min` / `--difficulty-max`)
- Optional: type mix — default homogeneous `single_choice`; if the human wants diversity, use `--mix mixed` (or `full`)

## Type mix

| Preset | Draft types |
|--------|-------------|
| (default / `--mix single`) | all `single_choice` |
| `--mix mixed` | rotates `single_choice`, `multi_choice`, `open` |
| `--mix full` | same active set as `mixed` today |

Do **not** pass `--type` together with `--mix`. Do **not** invent deferred types (`matching`, `sorting`, `dropdown_answer`) or code auto-validators.

## Steps

1. **Confirm project** — `sdm doctor`
2. **Gaps / workItems** — `sdm cert gaps --profile … --level … --json` (prefer `workItems[]` when `coverageMode: blueprint`)
3. **Generate shells**
   ```bash
   sdm question generate --to-skill "<skill>" --count 3 \
     --difficulty-min 0.3 --difficulty-max 0.6 \
     --profile "<profile>" --level "<level>" \
     [--mix mixed] --json
   ```
   Use `context.agentPrompt`, `typeMix`, and `drafts[]` (honor `mustCoverTopic` / `avoidNearIds`). Do **not** write YAML.
4. **Fill drafts** — replace placeholders per `draft.type`: choice → `options`/`correct`; `open` → short answer + `--expected`. Avoid duplicating `context.existingTexts`. Prefer `draft.mustCoverTopic` / `context.gap.uncoveredTopics` and `missingDifficultyBand`; pass `--topic` on validate/add.
   - For choice types: write **distractors of comparable length and surface plausibility** to the correct option (not joke shorts when the correct answer is a full sentence). Vary `correct` position (do not always put the right answer first).
   - **Locale / terms:** match the methodology language (usually Russian). Prefer Russian stems in `text` / `options`. If an English term is unavoidable (e.g. LLM), explain it in `explanation` on first use — do not leave bare jargon as the only teaching. Same spirit as [`export-course`](../export-course/SKILL.md) locale rules.
5. **Validate (dry-run)** — before write:
   ```bash
   sdm question validate --to-skill "<skill>" --type … --difficulty … --text "…" \
     [--option … --correct …] [--topic …] [--expected …] --json
   ```
   On `ok: false`, rewrite using `errors[]` / `findings[]` (do not persist yet).
6. **Persist** — one `sdm question add … [--topic …] [--expected …] --json` per filled draft. With `quality.writeGate: strict` (or `distractorQuality: strict`), policy failures reject the write (`TOPIC_NOT_ON_SKILL`, `QUESTION_NEAR_DUPLICATE`, `DISTRACTOR_QUALITY`, …). Soft mode may return `warnings`.
7. **Re-check** — `sdm cert gaps … --json`; `sdm suggest --json`; optionally `sdm audit --json`.

## Guardrails

- Never hand-edit `library/` when `question add` exists
- Never claim files were written by `question generate` (it only returns drafts)
- Default is `single_choice` / `--mix single` unless the user asks for a mix; `--correct` is **1-based**
- Length/position cues make tests trivially passable — treat distractor parity as part of draft quality
