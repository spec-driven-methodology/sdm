## Context

Today `createCertification` invents a role/profile YAML when missing. Greenfield UX wants: **profile first**, then skills, then level cert. Domain vocabulary is **Profile** (`rename-role-to-profile`); this change must not ship `role create`.

## Goals / Non-Goals

**Goals:**

- First-class `profile create` (CLI + core + MCP).
- `cert create` assumes profile exists; writes level + appends to `profile.levels`.
- Empty `levels: []` valid after profile create.
- Agent skills teach the new order; `--json` + stable errors.

**Non-Goals:**

- Any public `role` command or `--role` flag (owned by rename change — eliminate).
- Separate `level create` command name (keep `cert create`).
- Soft-compat that still invents profiles from titles.

## Decisions

1. **Command `profile create`** — matches `certifications/profiles/` and YAML `profile:`.  
2. **`ProfileSchema.levels` allows `[]`**.  
3. **`createProfile(projectRoot, { profile, title, force? })`** → `PROFILE_EXISTS` without force.  
4. **`createCertification` requires existing profile** → `PROFILE_NOT_FOUND` if missing; no invent.  
5. **CLI**  
   ```bash
   sdm profile create <id> --title "…" [--force] --json
   sdm cert create --profile <id> --level <id> --level-title "…" \
     --requirement skill:depth:weight ... [--threshold] [--force] --json
   ```  
6. **MCP** `profile_create`; `cert_create` uses `profile`.  
7. **Skills** order: doctor → profile create → skill add → cert create → questions → coverage.  
8. **Apply with `rename-role-to-profile`** so users never see `role create`.

## Risks / Trade-offs

- **[BREAKING]** → CHANGELOG + skills in same release.  
- **[Empty profile + coverage]** → still needs a level — OK.  
- **[Ordering vs rename]** → do not merge `role create` then rename; ship Profile names only.

## Migration Plan

1. Land Profile schemas/paths (rename change) + `createProfile` + narrowed `createCertification`.  
2. CLI/MCP/skills/docs same release.  
3. Callers: `profile create` before `cert create`.

## Open Questions

- None blocking.
