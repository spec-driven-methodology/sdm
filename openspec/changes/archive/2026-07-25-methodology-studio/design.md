## Context

`player/` is a static author-preview for export JSON (`player sync` / init). Methodology authoring stays agent-first (intent-loop → plan → CLI/MCP). Owners still lack a non-chat visual shell to review plans and emit confirm/reject. Workspace goals: `../docs/goals-methodology-studio.md` (slice A only).

## Goals / Non-Goals

**Goals:**

- Separate `studio/` template + sync/init, styled like player.
- View/action JSON contracts; fixture UI for clarifications + plan + confirm/reject.
- Actions emitted only (download / localStorage / downloadable JSON) — never write methodology YAML from the browser.
- CLI `studio sync --json` mirroring `player sync`.

**Non-Goals:**

- Live file bridge, `studio serve`, MCP tools, export-form, coverage UI (later slices).
- Chat UI, LMS/HR candidate surfaces, question generation inside Studio.

## Decisions

1. **Separate directory `studio/`, not a player tab**  
   Keeps preview vs authoring product boundary clear. Same scaffold pattern as player.

2. **Mirror `player-sync` for `studio-sync`**  
   Reuse copy-tree + `NOT_A_PROJECT` / template-missing errors (`STUDIO_TEMPLATE_MISSING`). Init calls `copyStudioTemplateInto` beside player. No MCP in slice A (about CLI lists `studio sync` only).

3. **Copy player CSS (fork), do not share a build-time partial**  
   Templates stay zero-build static files; slight drift acceptable. Studio pages use Russian chrome («Студия методологии»).

4. **Contracts as documented JSON (+ optional Zod in core later)**  
   - `sdm.studio.view/v1`: `{ schemaVersion, phases[], ... }` with phase kinds `clarifications` | `plan` | `progress` | `result` | `suggest` (slice A implements clarifications + plan).  
   - `sdm.studio.action/v1`: `{ schemaVersion, type, values?, planId?, at }`.  
   Options are `{ id, label, value }[]` from the view — never hardcoded domain enums in JS.  
   Fixture ships under `studio/fixtures/demo-view.json`. Emit: download `last-action.json` + show JSON panel.

5. **Intent plan payload**  
   Plan phase MAY embed or reference `sdm.intent.plan/v1` object; Studio renders skills/links/requirements/seed from that shape when present.

6. **Terminology**  
   If coverage status appears in fixture copy: «не покрыто» / «слабо покрыто» / «пробел» — not «дыра».

## Risks / Trade-offs

- [Static-only feels incomplete] → Document that executor is external; slice B adds bridge.  
- [CSS fork drifts from player] → Accept for PoC; optional shared extract later.  
- [Agents ignore action JSON] → README documents action schema for intent-loop handoff.

## Migration Plan

- New projects: init creates `studio/`.  
- Existing: `sdm studio sync` (or `--force`).  
- Rollback: delete `studio/` or revert sync; no YAML migration.

## Open Questions

Resolved for slice A: file/fixture protocol only; no MCP; CSS copy OK.
