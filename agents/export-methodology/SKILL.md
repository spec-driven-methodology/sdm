---
name: sdm-export-methodology
description: >-
  Export SDM methodology for external consumers via `export test`
  (optional --adaptive), `export matrix`, `export mermaid`, and
  `export confluence`. For expert interview kit (HTML for interviewer) use
  ../export-kit/SKILL.md. For learning packs use ../export-course/SKILL.md.
  Use when handing off assessment/docs packages (not LMS courses).
license: Apache-2.0
compatibility: Requires SDM CLI (`sdm`) on PATH; run inside a methodology project (sdm.yaml).
metadata:
  author: sdm
  version: "0.4.0"
---

# Export methodology for consumers

Work in a **methodology project**. Prefer `--json` for agents. Default stdout (without `--json`) is the raw consumer document for pipes.

If the human is unsure whether to export yet, call [`../guide-suggest/SKILL.md`](../guide-suggest/SKILL.md) (`suggest`) first — it surfaces export/player levers from project state.

## Inputs

Ask if missing:

- Profile id (`--profile`)
- For test / mermaid / confluence with coverage: level id (`--level`)
- Optional team overlay (`--team`)
- Format if not default (test → `json`, matrix → `csv`)
- Optional question-type / skill / question-id filters (see below) when the human mentions prefs

## Export filters (agent contract)

Do **not** pipe through `jq`, Node post-filters, or hand-edit JSON to drop types/skills/ids. Use SDM flags / MCP args.

| Human intent (examples) | Agent call |
|-------------------------|------------|
| «без текстовых / без свободного ответа» | `--exclude-type open` / `excludeTypes: ["open"]` |
| «только одиночный выбор» | `--include-type single_choice` |
| «только с выбором (single+multi)» | `--include-type single_choice --include-type multi_choice` |
| «только skill X / QA-skills без общих» | `--include-skill …` / `includeSkills` (or `--exclude-skill`) |
| «только эти вопросы / эти id» | `--include-question <id>` / `includeQuestions` |

Domain type for short text is **`open`** (not `text`). Valid types: `single_choice`, `multi_choice`, `open`, `code`. Do not combine include and exclude on the same dimension (type or skill). Pipeline: skill → adaptive → type → question id.

## Steps

1. **Confirm project** — `sdm doctor`
2. **Optional coverage** — `sdm cert coverage --profile … --level … [--team …] --json`
3. **Export test package**
   ```bash
   sdm export test --profile "<profile>" --level "<level>" --json
   # without open (text) questions:
   sdm export test --profile "<profile>" --level "<level>" --exclude-type open --json
   # skill subset / exact question ids:
   sdm export test --profile "<profile>" --level "<level>" --include-skill ai-quality --json
   sdm export test --profile "<profile>" --level "<level>" --include-question q-ai-quality-005 --json
   # adaptive sample (seeded):
   sdm export test --profile "<profile>" --level "<level>" --adaptive --seed 42 --per-skill 3 --json
   ```
   Optional author smoke: `sdm player sync` if `player/` is missing; write JSON under `exports/`, open `player/index.html`, load the file. Preview only — answers are in the export.
   Skill/question filters that empty the package fail with `EXPORT_FILTER_EMPTY` / `EXPORT_QUESTION_NOT_FOUND`. Type-only filters that leave a skill empty still succeed with `meta.skillsMissingQuestions`.
4. **Export competency matrix**
   ```bash
   sdm export matrix --profile "<profile>" --format json --json
   ```
5. **Export Mermaid graph** (single diagram)
   ```bash
   sdm export mermaid --profile "<profile>" --level "<level>" --json
   ```
6. **Export Confluence page** (coverage + mermaid + matrix in one Markdown)
   ```bash
   sdm export confluence --profile "<profile>" --level "<level>" --json
   # or pipe Markdown:
   sdm export confluence --profile "<profile>" --level "<level>" > confluence-page.md
   ```

## Guardrails

- Do not hand-edit YAML to “build” an export — use these commands
- Schema versions: `sdm.export.test/v1`, `sdm.export.matrix/v1`, `sdm.export.mermaid/v1`, `sdm.export.confluence/v1`
- **Consumer upsert:** use document `id` as stable slot key; compare `meta.revision` (or `meta.basis` hashes) to decide replace vs skip; wire `schemaVersion` is format id only
- Learning / course packs: [`../export-course/SKILL.md`](../export-course/SKILL.md) (`sdm.export.course/v1`)
- Expert interview kit (open/code probes, HTML render): [`../export-kit/SKILL.md`](../export-kit/SKILL.md) (`sdm.export.kit/v1`) — not `export test`, not learner cheatsheet
- Export includes answer keys in PoC; treat output as sensitive methodology data
- MCP tools: `export_test` (optional `includeTypes` / `excludeTypes`), `export_matrix`, `export_mermaid`, `export_confluence`, `export_kit`
