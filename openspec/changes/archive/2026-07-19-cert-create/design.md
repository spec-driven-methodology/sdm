## Context

Role/level YAML already match `RoleSchema` / `LevelSchema`. Coverage reads them. Missing: agent-safe writers.

## Goals / Non-Goals

**Goals:** One non-interactive `cert create` that materializes role + level + requirements with Zod, `--json`, stable errors.

**Non-Goals:** Partial requirement patch API; teams/; weight-sum enforcement as hard fail (optional soft check later).

## Decisions

1. **Single command (not role-add + level-add for PoC)**
   ```bash
   sdm cert create \
     --role <id> --role-title <title> \
     --level <id> --level-title <title> \
     [--desc <level description>] \
     [--requirement <skill:depth:weight>]... \
     [--threshold 0.7] \
     [--force] [--json]
   ```
   - Rationale: matches product wording `cert create --role --level` and one agent step.
   - Alternative: separate `cert role add` / `cert level add` — defer; can split later if needed.

2. **Requirement flag format**
   - `--requirement java-core:0.8:0.4` (skill:depth:weight), repeatable
   - At least one `--requirement` required for PoC (empty level is rarely useful)
   - Each skill MUST exist → else `SKILL_NOT_FOUND`
   - Do not hard-fail if weights ≠ 1.0 (document; optional warning in text mode only)

3. **Role file semantics**
   - Path: `certifications/roles/<role>.yaml`
   - If missing: create with `levels: [<level>]`
   - If exists: merge `level` into `levels` (dedupe); update `title` only when `--force` or title currently empty — **simpler:** update title always from `--role-title` when provided (always required)
   - No `ROLE_EXISTS` block on merge; role upsert is normal

4. **Level file semantics**
   - Path: `certifications/levels/<level>.yaml`
   - Includes `role` field for coverage matching
   - If exists without `--force` → `LEVEL_EXISTS`
   - With `--force` → overwrite
   - **PoC constraint:** level ids are globally unique per methodology project (same as current examples: one `middle.yaml`). Nested `roles/<role>/levels/` layout is a later migration if needed.

5. **JSON shape**
   ```json
   { "ok": true, "action": "create", "role": {...}, "level": {...}, "paths": { "role": "...", "level": "..." } }
   ```
   Failure: `{ ok: false, code, message }`

6. **Errors**
   - `VALIDATION_FAILED` — bad requirement parse, missing required flags
   - `SKILL_NOT_FOUND` — requirement skill missing
   - `LEVEL_EXISTS` — level file present without force
   - `PROJECT_ROOT_NOT_FOUND` — existing

## Risks / Trade-offs

- [Ambiguous level ids across roles] → Mitigation: level YAML carries `role`; filename is level id (same as examples)
- [Weight sum drift] → Soft ignore for PoC

## Migration Plan

Rebuild; playground: create a small role/level (or force-overwrite middle with same data); run coverage.

## Open Questions

None blocking. Follow-up: `cert level add` only; weight-sum validation flag.
