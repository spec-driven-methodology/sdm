## Why

Agents already parse full `cert coverage --json`. Domain read ops `question list` and `cert gaps` remove manual filtering and match the agent-first surface in idea.md.

## What Changes

- `sdm question list [--skill] [--json]`
- `sdm cert gaps --role … --level … [--json]` (missing + thin only)
- Core helpers + tests; agent docs prefer gaps where useful

## Non-goals

- Topic-level gap NLP, question generate, MCP

## Capabilities

### New Capabilities

- `question-list`: list library questions with optional skill filter and JSON
- `cert-gaps`: report non-ok coverage skills for a role/level

### Modified Capabilities

- (none)

## Impact

- `@spec-driven-methodology/core`, `@spec-driven-methodology/cli`, agents, CHANGELOG/README
