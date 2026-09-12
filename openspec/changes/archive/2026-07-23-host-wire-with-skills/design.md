## Context

Today host setup is two CLI commands (`mcp install`, `agent install`) plus docs. Agents and humans often stop after MCP: tools appear, but Cursor/GigaCode never get mirrored `agents/*/SKILL.md` (`intent-loop`, …). Separately, older installs baked `SDM_PROJECT_ROOT` (e.g. `playground`), so tools default to the wrong methodology even when the chat is about another project.

`sdm init` creates a methodology tree and tells users to “load intent-loop”, but never says how to put that skill into the IDE. `GETTING_STARTED.md` already lists both installs for GigaCode, yet product surfaces do not enforce the couple — half-onboarding is the common failure mode.

Constraints: methodology dir ≠ IDE workspace root (Cursor `--cursor-root`); one MCP per host; portable skills SSOT remains `specra/agents/`; prefer `--json` / SdmError for agents.

## Goals / Non-Goals

**Goals:**

- One default wire path: `mcp install` also installs portable skills for the same hosts.
- Clear opt-out for CI/scripts that only want MCP config (`--no-skills`).
- Reinstall without `--project` clears stale `SDM_PROJECT_ROOT` (already true if entry is replaced; keep tested + documented).
- `init` console + generated README/AGENTS point at host wire (coupled command), not only NL intent.
- Docs/skills (`GETTING_STARTED`, README, `connect-mcp`, AGENTS) aligned: multi-project default, skills checklist, smoke with `project` arg.

**Non-Goals:**

- Auto-running MCP/skills install inside `init` (wrong root; wrong host).
- Auto-binding the “current” methodology into MCP env.
- New MCP tools for install (CLI remains the installer).
- Committing workspace `.cursor/skills` mirrors into the Specra git repo.

## Decisions

1. **Couple via `mcp install` default, not a third top-level command**  
   - After successful MCP merge for each selected host, call the same logic as `agent install` for those hosts (reuse `agent-hosts` helpers).  
   - Flag: `--no-skills` to skip (default = with skills).  
   - Alternative rejected: new `sdm host wire` — extra surface; agents already know `mcp install` / `connect-mcp`. Optional later alias only if needed.

2. **JSON shape**  
   - Keep existing MCP fields (`ok`, `hosts`, `installs`, `projectRoot`, …).  
   - Add `skills: { ok, skillIds, installs, skipped?, … } | null` (`null` when `--no-skills`).  
   - If MCP succeeds and skills fail: non-zero exit + SdmError (or `ok: false` with partial MCP paths listed) so agents do not assume skills are present. Prefer fail-loud over silent half-wire.

3. **`init` does not invoke install**  
   - Only messaging + templates: after `OK: SDM project…`, print copy-paste next steps for GigaCode and Cursor (mcp install without `--project`; note skills are included by default).  
   - Generated README/AGENTS: short “Host setup” section pointing at `GETTING_STARTED` / `connect-mcp` and the coupled command.

4. **Multi-project default stays**  
   - Happy path omits `--project`. Smoke: `doctor` with explicit `project`.  
   - Fix stale env by re-running `mcp install` without `--project` (replace server entry → no `env`).

5. **Docs chase (dependency list)**  
   - `GETTING_STARTED.md` (fix contradictory `--project` as primary), `README.md` MCP section, `AGENTS.md`, `agents/connect-mcp/SKILL.md`, `agents/README.md` if catalog text drifts, `about` nextSteps hint if it still implies separate-only installs, `CHANGELOG` Unreleased, init templates in `packages/core/src/init.ts`.

## Risks / Trade-offs

- **[Risk] Skills install fails after MCP written** → Mitigation: fail exit; JSON reports both; human re-runs `agent install` or `mcp install` again; document in skill.  
- **[Risk] `--force` semantics differ between MCP merge and skills skip** → Mitigation: pass through existing `agent install` `--force` if present; document that default skills skip-existing behavior matches standalone.  
- **[Risk] Cursor root wrong when agent runs from methodology cwd** → Mitigation: docs/skill keep requiring `--cursor-root` = IDE workspace; init messaging shows placeholder.  
- **[Trade-off] Slightly longer `mcp install`** → Acceptable; opt-out `--no-skills` for power users.

## Migration Plan

1. Implement CLI coupling + tests (temp dirs).  
2. Update init templates + docs/skills/CHANGELOG.  
3. Existing hosts: re-run `mcp install --hosts …` once (clears stale project env + refreshes skills). No YAML migration.  
4. Rollback: `--no-skills` restores previous MCP-only behavior.

## Open Questions

- None blocking: default-with-skills + `--no-skills` is the chosen contract unless apply reveals Commander naming conflict.
