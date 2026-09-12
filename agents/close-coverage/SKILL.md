---
name: sdm-close-coverage
description: >-
  Close SDM certification coverage gaps by reading cert coverage JSON and
  adding validated questions for missing/thin skills. Use when a methodologist
  asks to improve coverage for a profile/level, fill gaps, or fix red/missing skills.
license: Apache-2.0
compatibility: Requires SDM CLI (`sdm`) on PATH; run inside a methodology project (sdm.yaml).
metadata:
  author: sdm
  version: "0.1.0"
---

# Close certification coverage

Work in a **methodology project** (directory containing `sdm.yaml`). Prefer `--json` for all SDM calls. Do **not** hand-edit YAML under `library/` or `ontology/` when CLI commands exist.

**Prerequisites:** profile, level, and required ontology skills must already exist. If the human needs a new profile/level or missing skills first — switch to [`../bootstrap-methodology/SKILL.md`](../bootstrap-methodology/SKILL.md) (`profile create` → `skill add` → `cert create` → seed questions → coverage), then return here to close remaining gaps.

## Inputs

Ask if missing:

- `--profile` (e.g. `java-developer`)
- `--level` (e.g. `middle`)

Optional: which skills to prioritize; otherwise handle all `missing`, then `thin`.

## Steps

1. **Confirm project**
   ```bash
   sdm doctor
   ```
   If not a SDM project, stop and tell the user to `cd` into the methodology root or run `sdm init`.

2. **Read gaps (preferred) or full coverage**
   ```bash
   sdm cert gaps --profile "<profile>" --level "<level>" --json
   ```
   Parse JSON:
   - `ok`, `hasMissing`, `gaps[]` with `skill`, `status` (`missing` | `thin`), `questionCount`, `reasons`, `uncoveredTopics`
   - `workItems[]` when `coverageMode: blueprint` — prefer these as the agent work queue (topic/difficulty targets)
   - Exit code may be non-zero when `hasMissing` is true — still use the JSON body.
   - If profile/level is not found, or skills needed for the cert are absent from ontology: stop and use [`../bootstrap-methodology/SKILL.md`](../bootstrap-methodology/SKILL.md) before retrying gap fills.
   - Optional: `sdm cert coverage … --json` for the full skill table including `ok`.

3. **Plan adds**
   - Priority 1: skills with `status: "missing"` (0 questions)
   - Priority 2: skills with `status: "thin"` (below `minOkQuestions`)
   - For each target skill, draft 1–N questions appropriate to the skill (language of the existing library; keep difficulty roughly 0.3–0.6 for thin/missing PoC fills)
   - Optional inventory: `sdm question list --skill "<skill>" --json`
   - Optional AI drafts: follow [`../generate-questions/SKILL.md`](../generate-questions/SKILL.md) (`question generate` → fill → `question validate` → `question add`)
   - If the human asks for type diversity, generate with `--mix mixed` (not `--type` + `--mix`)

4. **Add questions (one command per question)**
   ```bash
   sdm question add --to-skill "<skill>" --type single_choice --difficulty 0.3 \
     --text "<question text>" \
     --option "<opt1>" --option "<opt2>" --option "<opt3>" --option "<opt4>" \
     --correct <1-based-index> \
     --explanation "<short explanation>" \
     --json
   ```
   - Require `ok: true` in JSON; on `SKILL_NOT_FOUND` / `VALIDATION_FAILED`, fix args and retry — do not write files manually.
   - `--correct` is **1-based** (matches library YAML).
   - For `open`, use `--expected` for auto-checkable short answers; for `code`, omit options/correct as appropriate.
   - Prefer `single_choice` / `--mix single` unless the user asks for a mix. Do not invent matching/sorting/dropdown types.

5. **Re-check**
   ```bash
   sdm cert gaps --profile "<profile>" --level "<level>" --json
   ```
   Confirm previously `missing` skills are no longer in `gaps` as `missing`. Summarize remaining `thin` skills for the user.

## Output to the human

Short report:

- Skills fixed (was → now)
- Files created (ids/paths from JSON)
- Remaining gaps (`thin` / still `missing`)
- Suggested next intent (e.g. deepen thin skills, or add ontology skills if needed)

## Guardrails

- Never invent skills that are not in `ontology/skills/` — `question add` will fail with `SKILL_NOT_FOUND`.
- Never overwrite existing question ids without explicit `--force` and user approval.
- Do not claim coverage is “green/ok” unless JSON shows `status: "ok"` (threshold is `minOkQuestions`, default 3).
