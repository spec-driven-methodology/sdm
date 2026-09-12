## Context

`runCertCoverage` already returns structured data. CLI only needs a `--json` branch mirroring `question add` error/success shape.

## Goals / Non-Goals

**Goals:** Stable JSON for success and SdmError failures; keep text default; preserve exit codes.

**Non-Goals:** Schema versioning beyond a simple `ok` field; changing heuristics.

## Decisions

1. **Success shape**
   ```json
   {
     "ok": true,
     "projectRoot": "...",
     "role": "java-developer",
     "level": "middle",
     "title": "...",
     "minOkQuestions": 3,
     "hasMissing": false,
     "skills": [{ "skill", "depth", "weight", "questionCount", "status", "statusSymbol" }],
     "warnings": [{ "path", "message" }]
   }
   ```

2. **Failure shape** — reuse CLI `emitError(..., true)` → `{ ok: false, code, message }` on stdout.

3. **Exit codes unchanged** — non-zero when `hasMissing` or on error.

## Risks / Trade-offs

- [Agents ignore exit code and only read JSON] → include `hasMissing` and `ok` in payload.

## Migration Plan

Rebuild, verify in playground with `--json`.

## Open Questions

None.
