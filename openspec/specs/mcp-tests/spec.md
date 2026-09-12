# mcp-tests

## Purpose

Automated regression tests for `@spec-driven-methodology/mcp` tool handlers and inclusion in root verify.

## Requirements

### Requirement: MCP package has an automated test suite
The repository SHALL ship automated tests for `@spec-driven-methodology/mcp` that exercise tool handlers against temporary methodology projects created under the OS temp directory (not playground fixtures).

#### Scenario: Representative tools succeed on a temp project
- **WHEN** the mcp test suite runs against a temp project with seeded skill/cert/question data
- **THEN** handlers for `doctor`, `question_list`, `cert_gaps`, and `export_test` each return JSON text with `ok: true` for the happy path

#### Scenario: Failure envelopes stay machine-readable
- **WHEN** a handler is invoked without a methodology project (or with a missing level for export)
- **THEN** the result JSON includes `ok: false` and a stable error `code`

### Requirement: Root verify includes MCP tests
Root `npm test` SHALL run both `@spec-driven-methodology/core` and `@spec-driven-methodology/mcp` test suites. `npm run verify` SHALL continue to run build, typecheck, and that combined test entrypoint.

#### Scenario: verify runs mcp tests
- **WHEN** a developer runs `npm run verify` at the repo root
- **THEN** `@spec-driven-methodology/mcp` tests execute as part of the test step
