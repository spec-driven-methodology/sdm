## ADDED Requirements

### Requirement: cert-teams available
The system SHALL expose cert-teams as specified in the product plan.

#### Scenario: Command succeeds
- **WHEN** the corresponding CLI command runs with valid inputs
- **THEN** it returns success JSON with ok: true when --json is set
