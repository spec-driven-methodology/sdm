## Why

Audit and write ops already keep methodology consistent; consumers (testing systems, HR, agents) still cannot pull a stable package without hand-reading YAML. `export test` / `export matrix` close that gap — the next external contract after coverage/CRUD, already listed under Запланировано in CHANGELOG.

## What Changes

- Core assemblers + CLI: `sdm export test --role … --level … [--format json|csv] [--json]` and `sdm export matrix --role … [--format csv|json] [--json]`
- Stable consumer payload shapes (schema version in output); deterministic assembly (no LLM)
- MCP tools `export_test`, `export_matrix`; portable skill pointer; docs/CHANGELOG/README

## Non-goals

- Adaptive sampling (`--adaptive`), per-candidate history, Confluence/Mermaid export
- HTTP MCP / REST API; Specra running the test itself
- Difficulty-aware sampling beyond simple filters; answer-key redaction policies beyond a basic flag if needed later

## Capabilities

### New Capabilities

- `export-test`: assemble a role+level assessment package (questions + requirements metadata) for external consumers
- `export-matrix`: export a role competency matrix (levels × skills) as CSV/JSON

### Modified Capabilities

- `mcp-server`: add tools wrapping the new export domain ops

## Impact

- `@spec-driven-methodology/core` (new export modules + public API), `@spec-driven-methodology/cli` (`export` command group), `@spec-driven-methodology/mcp`
- `agents/`, `AGENTS.md`, README, CHANGELOG; agent-first via `--json` / SdmError codes and stdout suitable for pipes (`> file.json`)
