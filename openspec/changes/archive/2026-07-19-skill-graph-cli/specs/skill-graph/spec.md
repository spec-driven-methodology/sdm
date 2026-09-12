## ADDED Requirements

### Requirement: Run APIs for graph view and impact
The system SHALL expose core functions `runSkillGraph` and `runSkillImpact` used by CLI and MCP.

#### Scenario: runSkillGraph returns coverage-aware nodes
- **WHEN** `runSkillGraph` is called with a valid role and level
- **THEN** the result includes project root, nodes with skill id, depends_on children among the graph, and coverage fields when requested

#### Scenario: runSkillImpact walks reverse depends
- **WHEN** skill B depends on A and a level requires B
- **THEN** `runSkillImpact` for A lists B in downstreamSkills and that level under levels
