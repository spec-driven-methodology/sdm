## Why

Agents must recreate a level with `--force` to change requirements. A domain `cert patch` lets them add/remove/upsert requirement triples on an existing level without full overwrite.

## What Changes

- Core `patchCertification` / `patchLevelRequirements`
- CLI: `sdm cert patch --level … [--add-requirement] [--set-requirement] [--remove-requirement] [--threshold] [--title] [--description] [--json]`
- MCP tool `cert_patch`
- Tests + docs; update CHANGELOG Unreleased

## Non-goals

- teams/, delete role/level, MCP HTTP, interactive TTY

## Capabilities

### New Capabilities

- `cert-patch`: patch existing certification level requirements and metadata

### Modified Capabilities

- (none — create unchanged)

## Impact

- `@spec-driven-methodology/core`, `@spec-driven-methodology/cli`, `@spec-driven-methodology/mcp`, agents cheat sheet
