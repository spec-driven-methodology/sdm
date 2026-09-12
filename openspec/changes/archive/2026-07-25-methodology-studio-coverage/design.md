## Context

Parents: methodology-studio, studio-bridge, studio-export-form. Gaps via `runCertGaps`; next steps via `buildSuggest`. Studio remains display/dispatch only.

## Goals / Non-Goals

**Goals:** coverage phase UI; close_gap / suggest_lever actions; `studio push-coverage`; RU labels.

**Non-Goals:** In-UI generation/writes; MCP; full suggest rewrite.

## Decisions

1. **coverage phase** in `sdm.studio.view/v1`:
   ```json
   {
     "kind": "coverage",
     "id": "gaps",
     "title": "Покрытие",
     "profile": "…", "level": "…",
     "summary": { "missing": 1, "thin": 2, "ok": 3 },
     "skills": [
       { "id": "docker", "name": "Docker", "status": "missing",
         "questionCount": 0, "depthRatio": 0 }
     ],
     "suggestions": [ /* subset of suggest payload suggestions */ ]
   }
   ```

2. **UI labels (fixed map for known statuses):** `missing`→«не покрыто», `thin`→«слабо покрыто», `ok`→«покрыто»; section title uses «пробелы» when missing+thin>0.

3. **Actions:**
   - `close_gap`: `{ skill, profile?, level? }`
   - `suggest_lever`: `{ suggestionId, phrase, mapsTo, skill? }`

4. **`studio push-coverage`:** calls `runCertGaps` + `buildSuggest`, writes a full view doc (single coverage phase + optional export-form stub omitted) to bridge current-view.json. Validates as studio view. Does not modify methodology YAML.

5. **Fixture:** add coverage phase with mixed statuses for offline demo (no live project needed).

## Risks

- [Stale coverage in view] → Agent re-runs push-coverage after writes.  
- [Suggest «дыры» in levers] → Studio shows suggestion.label as provided; push-coverage MAY rewrite close-gaps label to «Закрыть пробелы покрытия» when building view.

## Migration

`studio sync --force`; new CLI command.
