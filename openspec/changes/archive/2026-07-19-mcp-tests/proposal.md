## Why

`@spec-driven-methodology/mcp` is the agent path, but it has zero automated tests and `npm test` only runs `@spec-driven-methodology/core`. Regressions in tool wiring, error envelopes, or `SDM_PROJECT_ROOT` can ship unnoticed. Harden MCP now before more surface accumulates; defer teams/ cert CRUD.

## What Changes

- Refactor MCP so tool handlers are testable without starting stdio transport on import
- Automated tests for representative tools (doctor, question_list, cert_gaps, export_test) on temp methodology projects
- Root `npm test` / `verify` include `@spec-driven-methodology/mcp`
- Sync `mcp-server` main-spec tool list with shipped tools (`cert_patch`, `question_generate`, export, …)
- CHANGELOG / README note

## Non-goals

- MCP HTTP transport; full tool matrix / exhaustive Zod cases
- CLI process e2e; teams/ cert CRUD
- Changing tool JSON contracts except fixing documented drift in specs

## Capabilities

### New Capabilities

- `mcp-tests`: automated regression tests and npm scripts verifying MCP tool handlers against temp projects

### Modified Capabilities

- `mcp-server`: document full shipped tool set; require testable registration without stdio side effects on import

## Impact

- `@spec-driven-methodology/mcp` (src split + test suite + tsx), root `package.json` test/verify, openspec `mcp-server`, CHANGELOG/README
- Agent-first: same domain ops stay stable under `verify`
