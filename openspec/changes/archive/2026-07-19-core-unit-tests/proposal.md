## Why

Release hygiene already expects `npm test` before commit/push, but `@spec-driven-methodology/core` has no suite — regressions in write/coverage APIs (the contract agents and CLI rely on) can ship unnoticed. We need a minimal automated safety net now, before more surface accumulates.

## What Changes

- Automated unit/integration tests for `@spec-driven-methodology/core` covering: `parseRequirementTriple`, `addSkill` / `linkSkill`, `addQuestion`, `createCertification`, `computeCoverage`
- Temp-dir fixtures via `sdm`-style project layout in OS temp (no playground or personal YAML in git)
- Root and package scripts: `npm test` runs the suite
- Unified developer script (e.g. `npm run verify`) that runs build + typecheck + tests in one command
- Hygiene / README note so the documented gate matches reality

## Non-goals

- Full CLI e2e / Playwright-style agent loop tests
- Coverage % quotas or CI SaaS wiring (GitVerse CI can come later)
- Snapshotting playground methodology into the repo
- Testing every Zod edge case or loader warning path in v1
- Changing public CLI flags or methodology schemas

## Capabilities

### New Capabilities

- `core-tests`: automated regression tests and npm scripts that verify core write/coverage APIs and provide a single verify entrypoint for developers/agents

### Modified Capabilities

- (none — product domain requirements unchanged; this adds engineering verification)

## Impact

- `@spec-driven-methodology/core`: test runner + fixtures under `packages/core` (devDependency)
- Root `package.json`: `test`, `verify` (build → typecheck → test)
- Docs: CHANGELOG / README / hygiene comment so `npm test` / `npm run verify` are real
- Agent-first: protects the same core ops CLI agents call (`--json` paths stay stable when writers don’t regress)
