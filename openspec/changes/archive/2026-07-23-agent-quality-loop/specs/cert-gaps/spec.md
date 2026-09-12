## ADDED Requirements

### Requirement: Gaps expose workItems for agent quality loop

When `quality.coverageMode` is `blueprint`, `sdm cert gaps --json` (and MCP `cert_gaps`) SHALL include a top-level `workItems` array derived from blueprint gap reasons. Agents MUST be able to drive `question generate` from these items without inventing uncovered topics or difficulty bands.

#### Scenario: Thin skill yields work items

- **WHEN** gaps are computed in blueprint mode for a level with a thin skill that has uncovered topics
- **THEN** `workItems` contains at least one item with that `skill` and a `topic` or equivalent targeting field
- **AND** `gaps` still lists the thin/missing skills as today

#### Scenario: All ok yields empty work items

- **WHEN** blueprint mode is on and every required skill is `ok`
- **THEN** `gaps` is empty and `workItems` is empty
