## Why

Agents can add questions with `--json`, but `cert coverage` only prints text — agents must scrape human output to find gaps. Machine-readable coverage closes the agent loop: coverage → question add → coverage.

## What Changes

- Add `--json` to `sdm cert coverage`
- Success JSON: project root, role, level, skills[], hasMissing, minOkQuestions, warnings
- Failure JSON: `{ ok: false, code, message }` (same pattern as `question add`)
- Text report remains the default (no **BREAKING** change)

## Non-goals

- New coverage heuristics
- `cert gaps` command
- MCP / Cursor skills packaging

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `cert-coverage`: add machine-readable `--json` output for agents/CI

## Impact

- `@spec-driven-methodology/cli` coverage command only (core already returns structured `CoverageResult`)
- Agent-first chaining with `question add --json`
