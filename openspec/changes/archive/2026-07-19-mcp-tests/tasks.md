## 1. Testable MCP surface

- [x] 1.1 Split `packages/mcp/src`: `server.ts` / handlers registration without stdio; `index.ts` only connects transport
- [x] 1.2 Export callable handlers (or `runTool`) returning current JSON content shape

## 2. Tests and scripts

- [x] 2.1 Add `tsx` + `test/**/*.test.ts` for doctor, question_list, cert_gaps, export_test (happy + failure)
- [x] 2.2 Wire `@spec-driven-methodology/mcp` `test` script; root `npm test` runs core then mcp
- [x] 2.3 `npm run verify` green

## 3. Specs and docs

- [x] 3.1 Keep delta specs coherent with implementation (tool list + import-safe)
- [x] 3.2 CHANGELOG `[Unreleased]` + README Development note if needed
