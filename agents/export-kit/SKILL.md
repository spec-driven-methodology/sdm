---
name: sdm-export-kit
description: >-
  Export expert interview kit from profile+level: skill cards, open/code probes,
  glossary, checklist. Use when the human asks for шпаргалку эксперта, interview
  kit, HTML for interviewer like colleague cheat sheet — NOT export learning
  --format cheatsheet (that is learner prose for courses). HTML is render only;
  SSOT is methodology YAML. MCP export_kit with format html returns html field.
license: Apache-2.0
compatibility: Requires SDM CLI (`sdm`) on PATH or MCP `export_kit`; run inside a methodology project.
metadata:
  author: sdm
  version: "0.2.0"
---

# Export expert interview kit

Work in a **methodology project**. Prefer MCP `export_kit` or CLI with `--json`.

Kit is for **competency owners / interviewers** — not candidate testing, not LMS.

## When to use (disambiguation)

| Human asks | Use | Do NOT use |
|------------|-----|------------|
| Шпаргалка для эксперта / интервьюера / HR на интервью | **`export kit`** | `export learning --format cheatsheet` |
| HTML как у коллег (одна страница для интервью) | **`export kit --format html`** | hand-edit `reference/index.html` |
| Учебный конспект / шпаргалка **для обучаемого** | `export learning` | `export kit` |
| Тест кандидата (single/multi choice) | `export test` | `export kit` |

Schema: `sdm.export.kit/v1`. Stable slot id: `kit-{profile}-{level}`.

## MCP (preferred for agents)

```json
{
  "tool": "export_kit",
  "arguments": {
    "project": "<methodology-root>",
    "profile": "<profile>",
    "level": "<level>",
    "format": "json"
  }
}
```

**JSON contract** (player / CI / stale checks):

- Response: `{ ok, format, document, warnings, loadWarnings, projectRoot }`
- `document.schemaVersion` = `sdm.export.kit/v1`

**HTML render** — set `"format": "html"`:

- Response adds **`html`** string (self-contained page, inline CSS)
- Write to disk (do not treat as SSOT):

  ```bash
  # path convention
  exports/kit-<profile>-<level>.html
  ```

  Agent steps after MCP:
  1. Parse JSON response; require `ok === true` and non-empty `html`
  2. `mkdir -p exports` if needed
  3. Write `html` to `exports/kit-{profile}-{level}.html` (UTF-8)
  4. Optionally write `document` to `exports/kit-{profile}-{level}.json` for player / stale

Optional: `"strict": true` — fail when `KIT_NO_PROBE_QUESTION`, `KIT_EXPLANATION_MISSING`, or `KIT_SKILL_DESCRIPTION_EMPTY`.

## CLI

1. Confirm project: `sdm doctor --json`
2. Optional coverage: `sdm cert gaps --profile <p> --level <l> --json`
3. **Kit JSON** (contract for player / CI):

   ```bash
   sdm export kit --profile <profile> --level <level> --json
   ```

   Save document if needed:

   ```bash
   sdm export kit --profile <profile> --level <level> --json \
     | jq -r '.document' > exports/kit-<profile>-<level>.json
   ```

4. **Self-contained HTML** (consumer render, not SSOT):

   ```bash
   sdm export kit --profile <profile> --level <level> --format html \
     --out exports/kit-<profile>-<level>.html
   ```

   `--out` creates parent directories (unlike shell `>`). Alternative redirect (dir must exist):

   ```bash
   mkdir -p exports
   sdm export kit --profile <profile> --level <level> --format html \
     > exports/kit-<profile>-<level>.html
   ```

   Convention: **`exports/`** at methodology project root (not `agents/exports/` unless you create it).

   ```bash
   sdm export kit --profile <profile> --level <level> --format html --json
   # → { ok, format: "html", document, html, warnings, ... }
   ```

5. **Author preview** in player (tab **Шпаргалки**):

   ```bash
   sdm player sync --force --json
   # open player/index.html → tab Шпаргалки → load exports/kit-*.json
   ```

6. If warnings (`KIT_NO_PROBE_QUESTION`, `KIT_EXPLANATION_MISSING`): add open/code questions with `explanation` via `question add` / `generate-questions`, then re-export.
7. `--strict` fails export until critical warnings are fixed.
8. After ontology edits: `content stale --profile … --level … --json` → regenerate kit (same commands).

## Guardrails

- Do not hand-edit exported HTML as source of truth — fix YAML and re-export.
- Do not put `single_choice` / `multi_choice` into kit; they belong in `export test`.
- SDM is not an HR test runner; kit is author preview / interviewer surface.
- Regenerate on basis mismatch; do not patch old HTML in place.
