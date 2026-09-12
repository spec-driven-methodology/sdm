---
name: sdm-bootstrap-methodology
description: >-
  Bootstrap a SDM methodology slice from scratch: add ontology skills, create
  a certification profile/level, seed questions, then verify with cert coverage JSON.
  Use when a methodologist asks to set up a new profile/level, add skills and a cert,
  or run the greenfield loop profile create → skill add → cert create → question add → coverage.
license: Apache-2.0
compatibility: Requires SDM CLI (`sdm`) on PATH; run inside a methodology project (sdm.yaml).
metadata:
  author: sdm
  version: "0.1.0"
---

# Bootstrap methodology (greenfield loop)

Work in a **methodology project** (directory containing `sdm.yaml`). Prefer `--json` for all SDM calls. Do **not** hand-edit YAML under `ontology/`, `library/`, or `certifications/` when CLI commands exist.

**When to use this skill:** create skills + cert + seed questions, then check coverage.

**When not to use:** profile/level already exists and the human only wants to close gaps → use [`../close-coverage/SKILL.md`](../close-coverage/SKILL.md).

## Inputs

Ask if missing:

- Profile id + title (e.g. `platform-engineer` / `Platform Engineer`)
- Level id + title (e.g. `middle` / `Middle`)
- One or more skill ids + display names (e.g. `docker` / `Docker`)
- For each skill on the level: `depth` and `weight` in `0..1` (requirement triples `skill:depth:weight`)

Optional:

- How many questions per skill to seed now (default: **1** to prove the loop)
- Note: coverage status `ok` needs at least `minOkQuestions` (default **3**) questions per required skill — after a thin seed, continue with close-coverage

## Steps

1. **Confirm project**
   ```bash
   sdm doctor
   ```
   If not a SDM project: `cd` to the methodology root, or create one with `sdm init` (only when the user asked to create a project). Re-run `doctor`.

2. **Create profile**
   ```bash
   sdm profile create "<profile-id>" --title "<Profile Title>" --json
   ```

3. **Add skills** (one command per skill; must exist before cert requirements)
   ```bash
   sdm skill add "<skill-id>" --name "<Skill Name>" --category "<category>" --desc "<short desc>" --json
   ```
   - Require `ok: true` (or successful JSON) before continuing.
   - On `SKILL_EXISTS`, skip or use `--force` only with explicit user approval.
   - Optional links after skills exist:
     ```bash
     sdm skill link "<skill-id>" --depends-on "<a>,<b>" --related-to "<x>" --json
     ```

4. **Create certification level**
   ```bash
   sdm cert create \
     --profile "<profile-id>" \
     --level "<level-id>" --level-title "<Level Title>" \
     --requirement "<skill-id>:<depth>:<weight>" \
     --json
   ```
   - Repeat `--requirement` for each skill on the level.
   - Skills in requirements MUST already exist (`SKILL_NOT_FOUND` otherwise).
   - On `LEVEL_EXISTS` / validation errors: fix args or ask before `--force`.

5. **Seed questions** (one command per question)
   ```bash
   sdm question add --to-skill "<skill-id>" --type single_choice --difficulty 0.3 \
     --text "<question text>" \
     --option "<opt1>" --option "<opt2>" --option "<opt3>" --option "<opt4>" \
     --correct <1-based-index> \
     --explanation "<short explanation>" \
     --json
   ```
   - Prefer `single_choice` unless the user asks otherwise; `--correct` is **1-based**.
   - On `SKILL_NOT_FOUND` / `VALIDATION_FAILED`: fix via CLI — do not write library YAML by hand.
   - Default seed is 1 question per required skill unless the user wants deeper coverage now.

6. **Check coverage / gaps**
   ```bash
   sdm cert gaps --profile "<profile-id>" --level "<level-id>" --json
   ```
   Parse JSON:
   - `ok`, `hasMissing`, `gaps[]` with `skill`, `status` (`missing` | `thin`), `questionCount`
   - Exit code may be non-zero when `hasMissing` is true — still use the JSON body.
   - Do not claim “green/ok” unless `gaps` is empty (all required skills reached `ok`).
   - Optional full table: `sdm cert coverage --profile … --level … --json`.

7. **Handoff**
   - If any skill remains in `gaps`, continue with [`../close-coverage/SKILL.md`](../close-coverage/SKILL.md) for the same profile/level.
   - Do not invent a second gap-closing procedure here.

## Output to the human

Short report:

- Skills created (ids/paths from JSON)
- Profile/level created (paths from `cert create` JSON)
- Questions seeded (ids/paths)
- Coverage snapshot (`hasMissing`, per-skill status)
- Suggested next intent (usually: close-coverage until `ok`)

## Guardrails

- Never hand-edit methodology YAML when `skill add`, `cert create`, or `question add` exists.
- Never invent skill ids that were not added (or already present) in ontology.
- Never overwrite existing skill/level/question files without `--force` and user approval.
- Keep the step order: profile create → skills → cert create → questions → coverage.
