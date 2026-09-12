## Why

Core graph APIs exist, but agents and humans still lack domain ops to inspect the ontology: terminal coverage tree (idea §5.1) and change-impact analysis (`skill impact`). Without CLI/MCP, the graph stays an internal detail.

## What Changes

- `sdm skill graph --role --level [--coverage] [--json]` — tree + bars for required skills
- `sdm skill impact --skill [--json]` — downstream skills, roles, levels
- MCP tools `skill_graph`, `skill_impact`
- Portable skill `agents/explore-ontology/`
- Docs: README, AGENTS, CHANGELOG

## Non-goals

- Depth-aware coverage math (follow-up `coverage-depth`)
- Mermaid changes (already shipped)
- Writing/editing graph edges (already `skill link`)

## Capabilities

### New Capabilities
- `skill-graph-cli`: CLI/MCP presentation of graph + impact

### Modified Capabilities
- `skill-graph`: add run APIs for role/level graph view and impact analysis
- `mcp-server`: register `skill_graph` and `skill_impact`

## Impact

- `@spec-driven-methodology/core` run helpers; `@spec-driven-methodology/cli`; `@spec-driven-methodology/mcp`; agents/docs
