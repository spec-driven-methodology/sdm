---
name: sdm-bootstrap-profile-pack
description: >-
  HITL pack: propose a profile/level foundation plan (skills, cert, seed questions),
  wait for explicit user confirm, then execute SDM CLI/MCP until a usable base
  exists. Use when the user says «create a profile foundation», «bootstrap Go junior»,
  «pack for a new specialization», or wants a greenfield profile with approval before writes.
license: Apache-2.0
compatibility: Requires SDM CLI (`sdm`) on PATH; methodology project (sdm.yaml).
metadata:
  author: sdm
  version: "0.5.0"
---

# Bootstrap profile pack (HITL)

Work in a **methodology project**. Prefer `--json` (or MCP tools). Do **not** hand-edit YAML when a command exists.

**When to use:** new **profile**/level foundation with **one confirmation gate** before any writes. Prefer [`../intent-loop/SKILL.md`](../intent-loop/SKILL.md) when the human’s intent is incomplete (needs clarifying questions).

**When not to use:**

- Incomplete NL intent from a non-developer → start at [`../intent-loop/SKILL.md`](../intent-loop/SKILL.md)
- Profile/level already exists and you only close gaps → [`../close-coverage/SKILL.md`](../close-coverage/SKILL.md)
- Low-level loop without plan/HITL → [`../bootstrap-methodology/SKILL.md`](../bootstrap-methodology/SKILL.md)
- Only drafts for one skill → [`../generate-questions/SKILL.md`](../generate-questions/SKILL.md)

SDM does **not** call an LLM. You (the agent) propose skills/questions; SDM validates and stores.

---

## Phase A — Build plan (no writes)

1. `sdm doctor` (or MCP `doctor`). If not a project: `sdm init` / `init --with-examples` **only** if the user asked to create a project.
2. Collect or infer:
   - `profile.id` / `profile.title` (e.g. `go-developer` / `Go Developer`)
   - `level.id` / `level.title` (e.g. `junior` / `Junior`)
   - Suggested skills (ids, names, category, short desc, optional topics)
   - Optional `depends_on` / `related_to` links
   - Requirement triples `skill:depth:weight` for the level
   - `questionsPerSkill` (default **3** — path toward coverage `ok`)
   - `difficultyMin` / `difficultyMax` (default `0.2` / `0.5` for junior; raise for middle/senior)
   - `exportTest` (default `false`; set `true` if user wants a test package at the end)
3. Present the plan to the human as JSON (or equivalent structured markdown) using this shape:

```json
{
  "schema": "sdm.bootstrap.profile-pack/v1",
  "profile": { "id": "go-developer", "title": "Go Developer" },
  "level": { "id": "junior", "title": "Junior" },
  "skills": [
    {
      "id": "go-basics",
      "name": "Go basics",
      "category": "language",
      "description": "…",
      "topics": ["syntax", "modules"]
    }
  ],
  "links": [
    { "id": "go-http", "dependsOn": ["go-basics"], "relatedTo": [] }
  ],
  "requirements": [
    { "skill": "go-basics", "depth": 0.5, "weight": 0.4 }
  ],
  "seed": {
    "questionsPerSkill": 3,
    "difficultyMin": 0.2,
    "difficultyMax": 0.5,
    "type": "single_choice",
    "typeMix": "single"
  },
  "exportTest": false,
  "notes": "Optional caveats for the human"
}
```

4. **STOP.** Ask for explicit confirmation (e.g. «confirm the plan» / `confirm` / `apply`).  
   - If the user edits the plan → update JSON and ask again.  
   - **MUST NOT** run `profile create`, `skill add`, `skill link`, `cert create`, `question add`, or other write ops before confirm.  
   - Read-only (`doctor`, `question list`, `cert gaps` on existing data) is allowed.

---

## Phase B — Execute (only after confirm)

Use CLI or MCP equivalents. Abort on unexpected errors; do not `--force` without a new explicit approval.

### B0. Profile

```bash
sdm profile create "<profile.id>" --title "<profile.title>" --json
```

Or MCP `profile_create`. Profile must exist **before** `cert create`.

### B1. Skills

For each skill in `plan.skills`:

```bash
sdm skill add "<id>" --name "<name>" --category "<category>" --desc "<description>" \
  [--topic "<topic>" ...] --json
```

- On `SKILL_EXISTS`: skip that skill (or ask before `--force`).
- Then apply `plan.links` with `sdm skill link … --json`.

### B2. Certification level

```bash
sdm cert create \
  --profile "<profile.id>" \
  --level "<level.id>" --level-title "<level.title>" \
  --requirement "<skill>:<depth>:<weight>" \
  --json
```

Repeat `--requirement` for every entry in `plan.requirements`. Profile and skills must already exist.  
Prefer plan weights that already sum to **1**; otherwise create normalizes once and JSON reports `weightsNormalized`.  
**depth** = how deep the skill must be known; **weight** = exam share. Later adds: `cert patch --add-requirement … --from …` or `cert reweight` — never silent redistribute.

### B3. Seed questions (generate → fill → add)

For each required skill, repeat `questionsPerSkill` times (or one `generate --count N` then N adds):

```bash
sdm question generate --to-skill "<skill>" --count <N> \
  --difficulty-min <min> --difficulty-max <max> \
  --profile "<profile.id>" --level "<level.id>" \
  [--mix <seed.typeMix>] --json
```

- Default `seed.typeMix` is `single` (all `single_choice`). If the plan has `typeMix: mixed` or `full`, pass `--mix` accordingly (do **not** also pass `--type`).
- Use `context.agentPrompt`, `drafts[]`, `typeMix`, `existingTexts`, `gap.uncoveredTopics` / `missingDifficultyBand`.
- **You** replace placeholders per draft `type`: choice → `options`/`correct`; `open` → short answer + `--expected`.
- Persist each filled draft with that draft’s type (example for single_choice):

```bash
sdm question add --to-skill "<skill>" --type single_choice --difficulty <d> \
  --text "…" --option "…" --option "…" --correct <1-based> \
  [--topic "…"] --json
```

`question generate` does **not** write files.

### B4. Verify

```bash
sdm cert gaps --profile "<profile.id>" --level "<level.id>" --json
sdm cert coverage --profile "<profile.id>" --level "<level.id>" --json
```

Report `hasMissing` / `hasThin` honestly. Non-zero exit on gaps is expected if still thin.

### B5. Optional export

If `exportTest: true`:

```bash
sdm export test --profile "<profile.id>" --level "<level.id>" --format json --json
```

Hand the document / path to the human for the external testing system.

---

## Phase C — Handoff

Tell the human:

- What was created (skills, profile/level, question ids)
- Coverage snapshot
- Next intents: close remaining gaps ([`../close-coverage/SKILL.md`](../close-coverage/SKILL.md)), more generate ([`../generate-questions/SKILL.md`](../generate-questions/SKILL.md)), audit, export ([`../export-methodology/SKILL.md`](../export-methodology/SKILL.md)), or NL edits («add skill X», «raise depth»)

Further work: human prompts in natural language → you call the matching SDM commands/skills. No second pack required.

---

## Guardrails

- Never write before explicit plan confirmation
- Never hand-edit methodology YAML when a command exists
- Never claim `question generate` persisted questions
- Never overwrite with `--force` without a new user approval
- Keep order: **profile create** → skills → cert create → questions → verify → optional export