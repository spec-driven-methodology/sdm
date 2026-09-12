## Why

Agents need Specra domain ops without shelling out to CLI. MCP stdio exposes the same `@spec-driven-methodology/core` operations as tools.

## What Changes

- New package `@spec-driven-methodology/mcp` with stdio MCP server (`sdm-mcp`)
- Tools: doctor, init, skill_add, skill_link, cert_create, cert_coverage, cert_gaps, question_add, question_list
- Docs: README/AGENTS how to connect; CHANGELOG; root build includes mcp

## Non-goals

- HTTP MCP, generate, export test/matrix
- Replacing portable SKILL.md playbooks

## Capabilities

### New Capabilities

- `mcp-server`: stdio MCP server wrapping Specra core domain ops as tools

### Modified Capabilities

- (none)

## Impact

- New workspace package; agent hosts spawn `node packages/mcp/dist/index.js` with cwd = methodology project (or `SDM_PROJECT_ROOT`)
