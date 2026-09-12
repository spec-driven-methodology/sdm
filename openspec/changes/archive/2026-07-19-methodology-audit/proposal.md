## Why

Methodology authors need one deterministic quality check that joins ontology health, question-library hygiene, and optional certification coverage. Today this information requires several commands and leaves duplicate questions easy to miss.

## What Changes

- Add `sdm audit` and matching MCP `audit` tool with text and JSON output.
- Report isolated and unused skills, Jaccard lexical duplicate questions, optional role/level coverage, and prioritized recommendations.
- Provide a portable agent workflow for reviewing and acting on audit findings.

## Capabilities

### New Capabilities
- `methodology-audit`: deterministic project-quality audit for agents and CI.

### Modified Capabilities

None.

## Impact

Adds core audit APIs, CLI/MCP surfaces, tests, end-user agent documentation, README, and CHANGELOG. The command is non-interactive and exposes a stable JSON envelope; validation and project errors retain existing `SdmError` codes.

## Non-goals

This change does not modify methodology files, run candidate tests, or require embeddings/network access.
