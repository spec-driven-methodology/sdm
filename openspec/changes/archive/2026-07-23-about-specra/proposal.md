## Why

Agents often answer «что такое Specra / что умеет?» from incomplete context: `AGENTS.md` teaches CLI ops but not product positioning, MCP sessions may not see framework docs, and version/capability lists drift. Humans then hear Specra framed as an HR testing platform — which contradicts the product boundary. We need one canonical, machine-readable identity surface that agents call instead of inventing.

## What Changes

- Ship a short positioning canon in the framework (`ABOUT.md` or equivalent): what / what-not / agent-first model / product boundaries.
- Add thin CLI `sdm about [--json]` and MCP tool `about` (no methodology project required): version, positioning summary, shipped capabilities (CLI / MCP / portable skills), recommended next steps (`intent-loop`, `init`, `connect-mcp`).
- Narrative text comes from the canon; capability lists prefer the real registered surface over README copy-paste.
- Portable skill + `AGENTS.md` rule: WHEN the human asks what Specra is / can do / why → call `about` / `--json` and paraphrase; do not invent commands or YAML outside that payload.
- CHANGELOG `[Unreleased]` entry (no semver bump for this change alone).

## Non-goals

- Dumping all of `docs/idea.md` into the response.
- Merging with `doctor` (project health ≠ product identity).
- Interactive TTY wizard.
- Version bump / release cut solely for this feature.
- HR testing UI, candidate analytics, or expanding Specra into a test runner.

## Capabilities

### New Capabilities

- `about-sdm`: Canonical product identity + `sdm about` / MCP `about` contract + agent skill/AGENTS routing for «what is Specra» questions.

### Modified Capabilities

- `mcp-server`: Expose tool `about` with the same JSON payload as CLI `--json` (project optional / not required).

## Impact

- Agent-first: domain op with stable `--json` / MCP JSON; agents stop hallucinating positioning.
- `@spec-driven-methodology/core` about assembler; thin `@spec-driven-methodology/cli` command; `@spec-driven-methodology/mcp` tool registration + tests.
- Framework `ABOUT.md` (or equivalent), `agents/explain-sdm` (or similar), `AGENTS.md`, README one-liner, CHANGELOG.
- No methodology YAML schema changes; no `sdm.yaml` dependency for the happy path.
