## Why

Onboarding splits MCP and portable skills into two manual steps; people finish `mcp install` (or only `init`) and skip `agent install`, so hosts lack `intent-loop` / `close-coverage` while MCP tools exist. Stale `SDM_PROJECT_ROOT` (e.g. bound to `playground`) silently steers tools at the wrong methodology. GETTING_STARTED already documents the pair, but product surfaces (`init` templates, post-install next steps, MCP workflow) do not force or remind the coupling — so the guide is easy to half-complete.

## What Changes

- Couple host wiring: successful `mcp install` for selected hosts SHALL also install portable skills into those hosts by default (opt-out flag), with `--json` reporting both MCP and skills outcomes.
- `sdm init` post-success messaging and generated `README.md` / `AGENTS.md` SHALL document host wire next steps (`mcp install` + skills / coupled command) — not only “load intent-loop”.
- Reaffirm multi-project default: omit `SDM_PROJECT_ROOT` unless explicit `--project`; docs and skills MUST NOT present baked project as the happy path.
- Align `GETTING_STARTED.md`, README MCP section, `connect-mcp`, and related agent pointers so the checklist is mcp **and** skills, then smoke `doctor` with per-call `project`.
- Agent-first: one domain op / one JSON result for “wire this host”, stable exit codes when skills half-fail.

## Capabilities

### New Capabilities

- _(none)_

### Modified Capabilities

- `mcp-host-install`: default install also mirrors portable skills for the same hosts (opt-out); JSON includes skills result; clearing stale `SDM_PROJECT_ROOT` when `--project` omitted; `connect-mcp` skill updated.
- `agent-skills-install`: standalone `agent install` remains; shared host-root rules with coupled `mcp install`.
- `getting-started`: checklist requires skills + doctor; primary path without mandatory `--project`; `init` templates / Next messaging mention host wire.

## Impact

- CLI: `packages/cli` (`mcp install`, possibly shared helper with `agent install`), tests.
- Templates: `packages/core` `init` README/AGENTS + console next steps.
- Docs/skills: `GETTING_STARTED.md`, `README.md`, `AGENTS.md`, `agents/connect-mcp/SKILL.md`, optionally `explain-sdm` / `about` nextSteps, `CHANGELOG.md`.
- Local IDE configs outside the git tree are not committed; verify in temp dirs / playground.

## Non-goals

- Auto-detecting which methodology folder is “current” and baking it into MCP env.
- Running `mcp install` / `agent install` automatically inside every `sdm init` (methodology dir ≠ IDE workspace root).
- Changing MCP tool schemas or inventing a new testing UI.
- Replacing portable skills source of truth under `agents/` with Cursor-only copies.
