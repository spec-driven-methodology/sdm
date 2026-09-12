## ADDED Requirements

### Requirement: Gaps include depth and topic hints
The system SHALL include depth and topic gap fields on gap skill entries.

#### Scenario: Gap payload fields
- **WHEN** `cert gaps --json` returns a thin skill due to depth
- **THEN** the skill object includes `achievedDepth`, `depthRatio`, and may include `missingDifficultyBand` and `uncoveredTopics`
