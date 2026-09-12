## Context

`@spec-driven-methodology/mcp` wraps `@spec-driven-methodology/core` as stdio tools. All registration lives in `src/index.ts`, which connects transport at module load — untestable. Root `npm test` only runs core. Main `mcp-server` spec lists an outdated tool set.

## Goals / Non-Goals

**Goals:**

- Testable tool layer (handlers callable without stdio)
- Minimal suite: doctor, question_list, cert_gaps, export_test (happy + one failure each)
- `npm test` includes mcp; `verify` stays green
- Spec tool list matches shipped tools

**Non-Goals:**

- HTTP MCP; Playwright/agent-host e2e; testing every tool
- Changing public tool argument shapes

## Decisions

1. **Split modules**
   - `createServer()` / `registerTools(server)` in `server.ts` (or `tools.ts`) — no transport
   - `index.ts` only: create server + `StdioServerTransport` + connect
   - Alternative: spawn process + MCP client — heavier; defer

2. **Call handlers via exported registry (preferred for PoC)**
   - Export thin `runTool(name, args, ctx)` or per-tool functions that return the same `{ content, isError? }` shape as today
   - Tests invoke these with `SDM_PROJECT_ROOT` / `cwd` override pointing at temp project
   - Alternative: full MCP Client SDK in-process — more fidelity, more deps; revisit if needed

3. **Runner: same as core**
   - `node:test` + `tsx --test "test/**/*.test.ts"` in `@spec-driven-methodology/mcp`
   - Temp projects via `initMethodologyProject` (reuse pattern from core helper; may share a tiny helper or duplicate locally)

4. **Minimum cases**
   - `doctor`: ok on methodology root; not-a-project → `ok: false` / code
   - `question_list`: after seeding a question → `ok` + questions array
   - `cert_gaps`: role/level with missing skill → gaps present
   - `export_test`: role/level → `schemaVersion` + questions; missing level → SdmError code in envelope
   - Assert JSON text in `content[0].text` parses; stderr not used for payload

5. **npm scripts**
   - `@spec-driven-methodology/mcp`: `"test": "tsx --test \"test/**/*.test.ts\""` (+ tsx devDependency)
   - Root: `"test": "npm run test -w @spec-driven-methodology/core && npm run test -w @spec-driven-methodology/mcp"`

6. **Spec sync**
   - MODIFY mcp-server requirement listing tools to include: doctor, init, skill_add, skill_link, cert_create, cert_patch, cert_coverage, cert_gaps, question_add, question_list, question_generate, export_test, export_matrix
   - ADDED: handlers register without starting stdio on import

## Risks / Trade-offs

- [Tests miss transport bugs] → Accept for PoC; handlers carry domain contract
- [Duplicate temp helper] → Prefer copy-small from core or test-only shared util; no product dependency from mcp→core/test
- [Version string in McpServer] → Keep reading package version or hardcode alongside release bumps

## Migration Plan

Refactor → tests → wire npm test → docs. No user data migration. Bin `sdm-mcp` entry stays `dist/index.js`.

## Open Questions

None blocking.
