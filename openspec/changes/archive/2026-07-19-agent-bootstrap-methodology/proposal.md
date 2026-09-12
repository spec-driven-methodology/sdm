## Why

CLI now supports the full greenfield loop (`skill add` → `cert create` → `question add` → `cert coverage --json`), but portable agent docs only teach gap-closing (`close-coverage`). Agents and humans lack a single skill for bootstrapping a role/level from empty ontology through first coverage check.

## What Changes

- New portable skill `agents/bootstrap-methodology/SKILL.md`: end-to-end agent scenario with `--json` at each step
- Index updates: `AGENTS.md`, `agents/README.md` (when to use bootstrap vs close-coverage)
- Light cross-link in `close-coverage`: if role/level/skills missing, point to bootstrap (or `skill add` / `cert create`)
- CHANGELOG / README agents table entry

## Non-goals

- New CLI commands or schema changes
- Expanding `close-coverage` into a mega-skill that also owns bootstrap (kept separate by intent)
- Interactive TTY wizards, AI `question generate`, MCP packaging
- Cursor-only copies under workspace `.cursor/skills/`

## Capabilities

### New Capabilities

- `bootstrap-methodology`: portable agent skill documenting the greenfield loop skill add → cert create → question add → coverage --json

### Modified Capabilities

- (none — CLI contracts unchanged; this is agent UX documentation)

## Impact

- `agents/bootstrap-methodology/`, `AGENTS.md`, `agents/README.md`, minor note in `close-coverage`
- Agent-first: one skillable playbook for the full domain op chain with JSON contracts
- Docs: CHANGELOG `[Unreleased]`, README agents table if present
