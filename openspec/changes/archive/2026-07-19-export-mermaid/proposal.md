## Why

JSON/CSV export hands packages to systems; humans still paste graphs into Confluence. `export mermaid` is the next consumer handoff — a coverage-colored skill graph from an existing role/level (idea.md §5.2), already listed under Запланировано.

## What Changes

- Core assembler + CLI: `sdm export mermaid --role … --level … [--coverage] [--json]`
- Mermaid flowchart (skills + `depends_on` edges) colored by coverage status when `--coverage` (default on)
- Markdown document with fenced `mermaid` block for Confluence paste (`schemaVersion: sdm.export.mermaid/v1`)
- MCP tool `export_mermaid`; docs/CHANGELOG; unit tests

## Non-goals

- Full `export confluence` page layout / adaptive / per-candidate
- Percentage thresholds (110%/90%) — PoC maps existing coverage statuses (ok/thin/missing)
- teams/ CRUD; MCP HTTP; changing methodology YAML schemas

## Capabilities

### New Capabilities

- `export-mermaid`: assemble a Mermaid skill-coverage diagram for a role+level

### Modified Capabilities

- `mcp-server`: add `export_mermaid` tool

## Impact

- `@spec-driven-methodology/core`, `@spec-driven-methodology/cli`, `@spec-driven-methodology/mcp`, CHANGELOG/README/AGENTS; agent-first via `--json` / SdmError codes
