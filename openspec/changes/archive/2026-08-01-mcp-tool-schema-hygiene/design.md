## Context

MCP tools are registered in `packages/mcp/src/server.ts` via `server.tool(name, description, zodShape, handler)`. Cursor and other hosts surface JSON Schema `description` from Zod `.describe()`. Only `projectParam` and a minority of fields were described; ~119 params lacked descriptions.

## Goals / Non-Goals

**Goals:** every published input property has a non-empty description; thin tool strings improved; ABOUT↔TOOL_NAMES parity test; AGENTS Tools line complete; OpenSpec requirement + inventory refresh.

**Non-Goals:** new tools; handler coverage for all tools; MCP HTTP; `intent_validate_plan`; changing defaults or arg names.

## Decisions

1. **Shared Zod helpers** next to `projectParam` (`profileParam`, `levelParam`, `forceParam`, `teamParam`, …) for repeated fields — one description string, reused.
2. **EN short phrases** matching CLI option help (not essays); mutual exclusions called out where CLI already documents them (`mix` vs `type`, include/exclude filters).
3. **Schema hygiene test** walks registered tool Zod shapes (or listTools inputSchema) and asserts every property has `description`. Prefer a maintained map/export of shapes if SDK listTools is awkward in unit tests.
4. **SSOT test** `ABOUT_MCP_TOOLS` sorted ≡ `TOOL_NAMES` sorted (import from `@spec-driven-methodology/core` + local `TOOL_NAMES`).
5. **CLI-only surface** remains documented: `studio_serve`, `intent validate-plan`, `mcp`/`agent`/`completion` meta-CLI.

## Risks / Trade-offs

- Longer schema text increases token use for agents slightly — keep descriptions ≤1 short sentence.
- Reflection of Zod descriptions depends on MCP SDK Zod→JSON Schema; verify with a unit test that fails if a field is bare.

## Migration

None. After deploy: restart SDM MCP in host to refresh tool schemas.
