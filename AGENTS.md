# AI agents — SDM methodology workspace

This is an **SDM methodology project** (`sdm.yaml`).

## Human UX (methodologists)

Humans describe **intent** in natural language. Example:

> I want a foundation for a Java Developer profile, Middle level, backend focus.

Load skill **intent-loop** (clarify → plan → confirm → execute → result).
Domain entity: **Profile**, not Role.

## Data model (vault ↔ SDM)

| Vault path | SDM domain |
|---|---|
| `ontology/*.yaml` | Skills (skill graph) |
| `library/questions/*.yaml` | Questions |
| `library/terms/*.yaml` | Terms |
| `certifications/profiles/*.yaml` | Profiles |
| `certifications/levels/*.yaml` | Levels |
| `exports/*.json` | Export artifacts (tests, courses, cheat sheets) |

## Host wire (IDE)

`sdm init` alone does not install MCP/skills into the IDE.
Use `sdm mcp install --hosts <cursor|gigacode>` (portable skills installed by default; `--no-skills` to skip).
Omit `--project` for multi-project; pass tool arg `project` with the methodology root.
See SDM `GETTING_STARTED.md` and skill `connect-mcp`.

## Multi-project workflow

This vault / workspace may contain **multiple** SDM projects.
SDM MCP runs without `SDM_PROJECT_ROOT` — the agent selects a project on each call.

### Discovery

- `list_projects(workspaceDir: "<vault-root>")` — scan for all sdm.yaml files
- `locate_project(dir: "<current-directory>")` — find which project a path belongs to

### Rule

**Always pass `project` (root path) to every SDM MCP tool that modifies methodology.**
The project root is the directory containing `sdm.yaml`, returned by `locate_project` / `list_projects`.

### Read vs. write routing

| Operation | MCP server | Specifies project via |
|---|---|---|
| **Read vault files** (YAML, .md) | `cortex` / filesystem | Vault path |
| **List SDM projects** | `sdm` `list_projects`, `locate_project` | `workspaceDir` / `dir` |
| **Create/edit methodology** | `sdm` `skill_add`, `question_add`, `cert_create` ... | **Always** `project` |
| **Coverage / gaps** | `sdm` `cert_coverage`, `cert_gaps` | **Always** `project` |
| **Export** | `sdm` `export_test`, `export_course` ... | **Always** `project` |
| **Sync artifacts** | `sdm` `player_sync` | **Always** `project` |

## Obsidian integration

Install **Cortex** + **OpenCode** plugin from Obsidian Community Plugins.
Cortex runs an MCP server inside Obsidian (port 27182) — read/search vault notes.
Run `scripts/obsidian-setup.sh` from vault root to create `opencode.json` + `AGENTS.md`.
See `docs/obsidian-integration.md` for details.

## How agents operate

- Prefer SDM MCP tools, or CLI with `--json`.
- Do not hand-edit YAML when a SDM command exists.
- Portable skills: SDM repo `AGENTS.md` + `agents/*/SKILL.md` (mirrored via `mcp install` / `agent install`).
- Primary: **intent-loop**. Gaps: **close-coverage**.

## Agent appendix (CLI)

```bash
sdm doctor
sdm intent validate-plan --file plan.json --json
sdm profile create <profile-id> --title "..." --json
```