## Why

Unreleased already contains cert create, core tests/`verify`, and bootstrap-methodology. Cutting **0.1.1** freezes that snapshot before the next product slices (list/gaps, MCP).

## What Changes

- Move `[Unreleased]` content into `## [0.1.1] - 2026-07-19`
- Bump package versions to `0.1.1` (root, `@spec-driven-methodology/core`, `@spec-driven-methodology/cli`)
- README version pointers; CHANGELOG compare links
- Git tag `v0.1.1` on the release commit (push deferred unless requested)

## Non-goals

- New CLI commands, MCP, question list / cert gaps
- Force-push or publishing to npm registry

## Capabilities

### New Capabilities

- (none — release cut only)

### Modified Capabilities

- (none)

## Impact

- Version metadata and docs only; runtime behavior unchanged from current master content
