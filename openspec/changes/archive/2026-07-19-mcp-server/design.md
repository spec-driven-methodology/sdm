## Context

CLI is the shell contract; MCP is the same ops for hosts that prefer tools over subprocess flags.

## Goals / Non-Goals

**Goals:** `@spec-driven-methodology/mcp` stdio server; tools call core; JSON text results; stderr logging only.

**Non-Goals:** Remote HTTP transport, AI generate.

## Decisions

1. Package `@spec-driven-methodology/mcp` / bin `sdm-mcp`, version aligned with monorepo `0.1.1`.
2. SDK `@modelcontextprotocol/sdk` + Zod; `McpServer` + `StdioServerTransport`.
3. Project root: `SDM_PROJECT_ROOT` or `process.cwd()`.
4. Errors return `{ ok: false, code, message }` in tool content with `isError`.
5. Root `build`/`typecheck`/`verify` include mcp workspace.

## Risks / Trade-offs

- [stdout pollution] → only console.error for logs
- [SDK API churn] → pin sdk; thin wrappers

## Migration Plan

Optional new package; CLI unchanged.

## Open Questions

- None.
