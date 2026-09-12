## ADDED Requirements

### Requirement: Depth-aware coverage status
The system SHALL compute `achievedDepth` as the maximum question difficulty for each required skill and mark the skill `thin` when `depthRatio` is below 0.9 even if question count meets the minimum.

#### Scenario: Enough questions but shallow difficulty
- **WHEN** a skill requires depth 0.8 and has ≥3 questions all at difficulty 0.4
- **THEN** coverage status for that skill is `thin`
- **AND** the result includes `achievedDepth` and `depthRatio` fields
