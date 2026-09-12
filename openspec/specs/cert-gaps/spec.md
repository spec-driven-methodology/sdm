# cert-gaps

## Purpose

Report certification coverage gaps (missing/thin skills) for agent workflows.
## Requirements
### Requirement: Report certification gaps

The system SHALL provide `sdm cert gaps --profile --level` that returns only skills with coverage status `missing` or `thin`, with `--json` for agents.

#### Scenario: Gaps exclude ok skills

- **WHEN** a level has one ok skill and one missing skill
- **THEN** `cert gaps --json` MUST include the missing skill in `gaps` and MUST NOT include the ok skill in `gaps`

### Requirement: Gaps include depth and topic hints
The system SHALL include depth and topic gap fields on gap skill entries.

#### Scenario: Gap payload fields
- **WHEN** `cert gaps --json` returns a thin skill due to depth
- **THEN** the skill object includes `achievedDepth`, `depthRatio`, and may include `missingDifficultyBand` and `uncoveredTopics`

### Requirement: Gaps expose workItems for agent quality loop

When `quality.coverageMode` is `blueprint`, `sdm cert gaps --json` (and MCP `cert_gaps`) SHALL include a top-level `workItems` array derived from blueprint gap reasons. Agents MUST be able to drive `question generate` from these items without inventing uncovered topics or difficulty bands.

#### Scenario: Thin skill yields work items

- **WHEN** gaps are computed in blueprint mode for a level with a thin skill that has uncovered topics
- **THEN** `workItems` contains at least one item with that `skill` and a `topic` or equivalent targeting field
- **AND** `gaps` still lists the thin/missing skills as today

#### Scenario: All ok yields empty work items

- **WHEN** blueprint mode is on and every required skill is `ok`
- **THEN** `gaps` is empty and `workItems` is empty

