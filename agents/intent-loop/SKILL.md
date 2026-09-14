---
name: sdm-intent-loop
description: >-
  OpenSpec-shaped methodology loop for non-developer humans: intake natural-language
  intent → clarify → structured plan → confirm → execute via SDM CLI/MCP → result.
  Use when the user describes what they want (e.g. «foundation of a Java Middle backend profile»)
  rather than naming CLI flags. Primary entry for greenfield and ambiguous intents.
license: Apache-2.0
compatibility: Requires SDM CLI on PATH and/or SDM MCP; methodology project (sdm.yaml).
metadata:
  author: sdm
  version: "0.1.0"
---

# Intent loop (primary human UX)

Work in a **methodology project**. Prefer MCP tools when available, else `sdm … --json`.  
Do **not** ask the human to type CLI flags. Do **not** hand-edit YAML when a command exists.

**Domain language:** assessment track entity is **Profile** (profile), not Role.  
Map `plan.profile.id` → CLI/MCP `--profile`. Never teach humans the word Role as a SDM entity.

**When to use:** human speaks intent; you run clarify → plan → confirm → execute → result.

**When not to use:** plan already confirmed and you only execute a known pack → load that pack directly; only closing gaps → [`../close-coverage/SKILL.md`](../close-coverage/SKILL.md); human only wants a corpus/summary ●○○ report on raw `.md` → [`../quality-report/SKILL.md`](../quality-report/SKILL.md) (`--sources`).

## Phases

### 1. Intake

- If the human brought a folder of raw `.md` (matrices/banks) or asks to score corpus readiness before bootstrap → run [`../quality-report/SKILL.md`](../quality-report/SKILL.md) (`quality report --sources …` / MCP `quality_report`) first, show verdict/●○○/glossary, HITL (what to keep/quarry/drop), **then** continue clarify → plan. Do **not** import the dump as-is.
- `doctor` (MCP or CLI) when a methodology project exists. Create project with `init` **only** if the user asked.
- Capture raw intent text.

### 2. Clarify (max **5** questions)

If slots for the chosen plan kind are missing, ask short questions. No writes.

For **profile-pack** (greenfield foundation), need at least:

| Slot | Example |
|------|---------|
| Profile id + title | `java-developer` / `Java Developer` |
| Level id + title | `middle` / `Middle` |
| Direction / category hint | `backend` |
| Seed depth | questions per skill (default **3**) |
| Export test pack? | default **no** |
| Weight shares | requirements `weight` must sum ≈ **1**; on create SDM may normalize once (show in plan). **depth** = required mastery; **weight** = share of final score — do not conflate «strengthen» |
| Add skill later | new weight needs explicit donors (`cert patch --from` / `cert reweight`) — never silent renormalize |

If the human already provided everything, skip or ask 0–1 confirmations only.  
If still incomplete after 5 questions, propose defaults in plan `notes` and continue to Plan.

### 3. Plan

Build structured JSON. Optional: `sdm intent validate-plan --file plan.json --json` (or stdin).

Greenfield shape (`kind: profile-pack`):

```json
{
  "schema": "sdm.intent.plan/v1",
  "kind": "profile-pack",
  "clarifications": [{ "q": "…", "a": "…" }],
  "profile": { "id": "java-developer", "title": "Java Developer" },
  "level": { "id": "middle", "title": "Middle" },
  "skills": [
    {
      "id": "java-core",
      "name": "Java Core",
      "category": "backend",
      "description": "…",
      "topics": []
    }
  ],
  "links": [],
  "requirements": [{ "skill": "java-core", "depth": 0.6, "weight": 0.4 }],
  "seed": {
    "questionsPerSkill": 3,
    "difficultyMin": 0.3,
    "difficultyMax": 0.7,
    "type": "single_choice",
    "typeMix": "single"
  },
  "exportTest": false,
  "notes": ""
}
```

`seed.typeMix`: `single` (default) | `mixed` | `full`. Use `mixed` when the human asks for a mix of question types (single/multi/short text). Do **not** invent deferred types (`matching`, `sorting`, `dropdown_answer`).

Other intents (no full pack JSON required): route after a short plan sentence + confirm —

| Intent | Next skill |
|--------|------------|
| Close gaps on existing profile/level | [`../close-coverage/SKILL.md`](../close-coverage/SKILL.md) |
| Export test/matrix (incl. «without text answers» → `--exclude-type open`) | [`../export-methodology/SKILL.md`](../export-methodology/SKILL.md) |
| Audit hygiene | [`../audit-methodology/SKILL.md`](../audit-methodology/SKILL.md) |
| Explore graph | [`../explore-ontology/SKILL.md`](../explore-ontology/SKILL.md) |

For export intents with type / skill / question-id preferences: map NL to `export test` / MCP `export_test` filters (`open` = short text; skill subset → `includeSkills` / `excludeSkills`; specific ids → `includeQuestions`). Do **not** ask the human to type flags, use `jq`, or post-filter export JSON with a custom script when SDM filters exist.

### 4. Confirm

**STOP.** Ask for explicit confirmation («confirm the plan» / `confirm` / `apply`).  
On edits → update plan → confirm again.  
**MUST NOT** write before confirm.

### 5. Execute

For `profile-pack`, follow [`../bootstrap-profile-pack/SKILL.md`](../bootstrap-profile-pack/SKILL.md) Phase B.
Map plan fields: `profile` ↔ pack's role fields until rename completes.  
Write gate includes profile/profile create when that command exists (`split-role-create-from-cert` / profile variant).

### 6. Result (human-facing)

Report in natural language / structured summary — **not** a flag tutorial:

1. What was created (profile, level, skills, question ids)
2. Coverage / gaps snapshot (`hasMissing` / `hasThin`)
3. **Next steps:** call MCP `suggest` / `sdm suggest --profile … --level … --json` (skill [`../guide-suggest/SKILL.md`](../guide-suggest/SKILL.md)) and offer 1–3 actions + levers (export, player, gaps). Do **not** list MCP tool names as the primary «what's next?». Same when the human only asks «what's next?» without a new concrete intent.

Optional machine envelope:

```json
{
  "schema": "sdm.intent.result/v1",
  "ok": true,
  "kind": "profile-pack",
  "profile": "java-developer",
  "level": "middle",
  "created": { "skills": [], "questions": [] },
  "gaps": { "hasMissing": false, "hasThin": true },
  "nextIntents": ["Close thin on sql"]
}
```

## Guardrails

- Humans never need CLI flags
- No writes before confirm
- Profile language for humans; no SDM entity named Role
- Prefer MCP; CLI `--json` equivalent is fine
- Cap clarify at 5 questions