# SDM — Obsidian Integration

SDM integration with **Obsidian** lets a methodologist work with methodology
(**skills, questions, profiles, levels, exports**) through an AI agent without
leaving the vault — using existing Obsidian ecosystem plugins.

**Form factor:** not a separate SDM Obsidian plugin, but a combination of existing
components + a lightweight setup script that configures everything for the user.

```
Obsidian vault
├── Cortex (MCP-server, port 27182)   — access to vault files
├── OpenCode plugin (terminal)         — runs the agent inside Obsidian
├── AGENTS.md                          — SDM workflow for the agent
└── opencode.json                      — MCP config (SDM + Cortex)

External MCP clients (alternative to OpenCode in Obsidian):
  MultiTool, Claude Desktop, Cursor — connect to the same servers
```

## Components

| Component | Role | Source |
|---|---|---|
| **Cortex** | MCP server **inside Obsidian**: the agent reads/writes vault files | Community Plugins (search "Cortex") |
| **OpenCode plugin** | Embeds OpenCode CLI in the Obsidian sidebar | Community Plugins (search "OpenCode") |
| **SDM MCP** | Methodology: skills, questions, profiles, export | SDM (standalone) |
| **opencode.json** | Connects SDM + Cortex in one client | Created by setup script |
| **AGENTS.md** | Agent instructions: workflow, read/write routing | Created by setup script |

## Installation

### 1. Requirements

- **Obsidian** 1.5.0+ (desktop)
- **Node.js** ≥ 20.19
- **SDM** built and **`sdm-mcp`** in PATH (`npm run link:cli`)
- **OpenCode CLI** (`npm install -g opencode-ai` / `brew install opencode`)

### 2. Install Obsidian plugins

> **Important: don't confuse the plugins.** The Community Plugins list has two similar plugins:
> - **Cortex** (author DoktorDaveJoos) — MCP server inside Obsidian, port 27182. **This is the one we need.**
>   No dedicated UI, no Codex requirement.
> - **Cortex Chat** (different author) — AI chat in the Obsidian sidebar with its own UI (`_cortex/` folder).
>   **Not needed by SDM.** It has Codex as an optional local fallback, but we don't require it.

1. **Cortex** — Settings → Community plugins → Browse → "Cortex" (author DoktorDaveJoos) → Install → Enable
2. **OpenCode** (optional, for working inside Obsidian) — Browse → "OpenCode" → Install → Enable

Cortex automatically starts the MCP server on port `27182` when Obsidian launches.

### 3. Run the setup script

```bash
# from the vault root
./scripts/obsidian-setup.sh

# or specify the vault explicitly
./scripts/obsidian-setup.sh /path/to/vault

# preview without writing
./scripts/obsidian-setup.sh --dry-run /path/to/vault
```

The script:

1. Checks dependencies: `node`, `sdm-mcp`, `opencode`
2. Finds the vault (walk-up to `.obsidian/`)
3. Finds SDM projects in the vault (`sdm.yaml` files)
4. Creates `opencode.json` with **SDM + Cortex** MCP
5. Places `AGENTS.md` in the vault root
6. Checks that Cortex port `27182` is free / in use

### 4. Restart OpenCode

After installation:
- OpenCode in Obsidian: restart the plugin or reload Obsidian
- OpenCode CLI: restart the session

Verification: ask the agent `list_folders` (Cortex) and `doctor` (SDM).

## Uninstall / rollback

If something went wrong, or you need to remove the integration (including for repeated "install → remove → reinstall" testing), use the cleanup:

```bash
# from vault root — remove everything the setup created (with backup)
./scripts/obsidian-setup.sh --undo

# same, but without creating a backup
./scripts/obsidian-cleanup.sh --purge
```

What is removed:

| Artifact | Behavior |
|---|---|
| `opencode.json` | Always removed; backup `opencode.json.bak.<timestamp>` if not `--purge` |
| `AGENTS.md` | Removed **only** if created by the setup script (header `# AI agents — SDM`). If it was your file — skipped with a warning |
| Global MCP configs (Claude Desktop, Cursor, Windsurf) | **Not touched** — only a warning is shown |

**Safety:** the script does not delete:
- SDM projects (`sdm.yaml`, `ontology/`, `library/`, `certifications/`) — that's your content
- Obsidian plugins (Cortex, OpenCode) — removed via Settings → Community plugins
- Anything outside the vault

Verification after rollback: files `opencode.json` and `AGENTS.md` are absent.

## Multi-project

A vault can contain **multiple** SDM projects:

```
vault/
├── java-backend/     ← sdm.yaml (name: java-backend)
├── qa-automation/    ← sdm.yaml (name: qa-automation)
└── some-notes/       ← not SDM
```

In this case `opencode.json` does **not** set `SDM_PROJECT_ROOT`. The agent:

1. Calls `list_projects(workspaceDir: "<vault-root>")` — lists all projects
2. Calls `locate_project(dir: "<path>")` — finds which project a path belongs to
3. Passes `project: "<root>"` to **all** SDM MCP tools

Rule: **vault reading — through Cortex; methodology writing — through SDM, always with `project`.**

## opencode.json format

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "sdm": {
      "type": "local",
      "command": ["sdm-mcp"]
    },
    "cortex": {
      "type": "remote",
      "url": "http://127.0.0.1:27182/mcp"
    }
  },
  "model": {
    "provider": "openai-compatible",
    "name": "deepseek-chat",
    "baseURL": "https://api.deepseek.com/v1"
  }
}
```

### Models

The SDM agent works through OpenCode. The model is configured in `opencode.json`:

| Provider | `provider` | `name` | `baseURL` |
|---|---|---|---|
| DeepSeek | `openai-compatible` | `deepseek-chat` | `https://api.deepseek.com/v1` |
| Ollama (local) | `openai-compatible` | `llama3.1` | `http://localhost:11434/v1` |
| OpenAI | `openai` | `gpt-4o` | — |
| OpenRouter | `openai-compatible` | `deepseek/deepseek-chat` | `https://openrouter.ai/api/v1` |

API key is set via environment variable (`DEEPSEEK_API_KEY`, `OPENAI_API_KEY`, etc.).

## AGENTS.md format

The setup script places `AGENTS.md` in the vault with SDM workflow:

- **Data model (vault ↔ SDM)** — path-to-domain mapping table
- **Multi-project workflow** — discovery (`list_projects` / `locate_project`), "always `project`" rule
- **Read vs. write routing** — table: reading via Cortex, writing via SDM
- **Common workflows** — typical requests and corresponding MCP tools

## Workflow (as a user)

1. Open Obsidian, open the OpenCode panel / terminal
2. Describe your intent: "I want a foundation for a Java Developer profile, Middle level, backend focus"
3. The agent: `locate_project` → `profile_create` → ... → result

Vault reading (notes, documents, existing YAML) — through Cortex.
Methodology writing (skills, questions, profiles, export) — through SDM MCP.

## Troubleshooting

| Symptom | Cause | Solution |
|---|---|---|
| `list_folders` doesn't work | Cortex is not running | Open Obsidian, enable the Cortex plugin |
| `doctor` doesn't work | `sdm-mcp` not in PATH | `npm run link:cli` in the SDM repository |
| Port `27182` is busy | Another MCP plugin (e.g. `aaronsb/obsidian-mcp-plugin`) | Change the port in Cortex settings or remove the conflicting plugin |
| Agent doesn't see SDM MCP | OpenCode was not restarted | Restart OpenCode / Obsidian |
| `PROJECT_ROOT_NOT_FOUND` | `project` was not passed in multi-project mode | Use `locate_project` → pass `project` |
| Model doesn't respond | No API key | Set `DEEPSEEK_API_KEY` / `OPENAI_API_KEY` |