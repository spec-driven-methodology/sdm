## ADDED Requirements

### Requirement: Generate context includes depth gaps
The system SHALL include depth and topic gap fields in `question generate` context when role/level are provided.

#### Scenario: Gap-aware prompt
- **WHEN** generate runs with `--role` and `--level` for a thin skill
- **THEN** context.gap includes `achievedDepth` and `depthRatio`
- **AND** agentPrompt mentions uncovered topics when present
