# sdm

SDM methodology project (knowledge base).

## Layout

- `ontology/` — skill graph
- `library/` — questions bound to skills
- `certifications/` — profiles, levels, thresholds
- \`player/\` — author preview for \`export test\` / learning JSON (not a secure exam)
- \`.sdm/\` — local config, cache, optional vector index

## Host setup (once per IDE workspace)

Creating this methodology folder does **not** install SDM into your agent host.
From the SDM install, wire the host (MCP + portable skills by default):

```bash
sdm mcp install --hosts cursor --cursor-root <ide-workspace-root> --json
sdm mcp install --hosts multitool --json      # MultiTool / OpenCode
sdm mcp install --hosts gigacode --json       # GigaCode (experimental)
# Opt out of skills only: add --no-skills
```

Claude Desktop is not a supported `--hosts` target; wire SDM manually if you use it.

Do **not** pass `--project` unless you want a single default methodology.
Prefer per-call tool arg `project` = this directory. Guide: SDM `GETTING_STARTED.md`, skill `connect-mcp`.

## Next steps

After host wire + reload, open your AI agent and describe an intent, for example:

> I want a foundation for a Java Developer profile, Middle level, backend focus.

The agent should load SDM skill **intent-loop** (clarify → plan → confirm → execute).
You do not need to type CLI flags — CLI is for the agent.

For agents: see `AGENTS.md` and portable skills (`intent-loop`, …) after `mcp install`.

Why SDM, not just an agent with a model: [docs/WHY_SDM.md](docs/WHY_SDM.md)
