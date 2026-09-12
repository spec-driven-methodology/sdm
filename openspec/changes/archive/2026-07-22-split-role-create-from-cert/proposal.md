## Why

`sdm cert create` today creates a profile and a certification level in one command. That mixes responsibilities: a certification binds requirements to an existing profile/level, while the **profile** is a separate domain entity. Greenfield users and agents expect «create profile → add skills → attach level cert», not «cert invents the profile». Splitting the surface improves UX, SOLID boundaries, and agent-first planning (HITL can confirm profile before writing levels).

**Vocabulary:** Specra domain term is **Profile** (not Role). See open change `rename-role-to-profile`. This change MUST ship as `profile create`, never as `role create`.

## What Changes

- Add **`sdm profile create`** (core + CLI + MCP) to write `certifications/profiles/<id>.yaml` with id/title (and optional empty `levels`).
- **BREAKING:** `sdm cert create` SHALL require an existing profile; it creates/updates the **level** (requirements, threshold) and appends the level id to the profile’s `levels` list — it MUST NOT invent a new profile when the profile file is missing.
- Drop inventing profile via `--role-title` / title-only create; title comes from `profile create`.
- Allow a profile file with **zero levels** after `profile create`.
- Update portable skills (`bootstrap-profile-pack` / methodology bootstrap), `AGENTS.md`, README, MCP, CHANGELOG.
- Stable `--json` + `SdmError` codes: e.g. `PROFILE_EXISTS`, `PROFILE_NOT_FOUND`.

## Non-goals

- Introducing or keeping a parallel `role create` command.
- Interactive TTY wizards.
- Changing how skills attach (levels reference skills via requirements).
- Candidate testing UI.
- Full filesystem migration of legacy `roles/` (owned by `rename-role-to-profile`; this change assumes Profile paths/names).

## Capabilities

### New Capabilities

- `profile-write`: Create (and optionally force-overwrite) certification profiles via `profile create` / MCP `profile_create`, independent of level certification. *(Replaces earlier draft name `role-write`.)*

### Modified Capabilities

- `cert-write`: Narrow `cert create` to level certification against an existing profile.
- `bootstrap-methodology`: Greenfield loop `profile create` → `skill add` → `cert create` → `question add` → coverage.
- `bootstrap-role-pack` / `bootstrap-profile-pack`: Plan/execute includes explicit profile step before cert.
- `mcp-server`: Expose `profile_create`; adjust `cert_create`.
- `core-tests`: Cover `createProfile` and updated `createCertification`.

## Impact

- Depends on / lands with `rename-role-to-profile` for paths and flag names (`--profile`, `profiles/`).
- `@spec-driven-methodology/core`, `@spec-driven-methodology/cli`, `@spec-driven-methodology/mcp`, agents, docs.
- Agent-first: `profile create` vs `cert create` with `--json` for plan → confirm → execute.
