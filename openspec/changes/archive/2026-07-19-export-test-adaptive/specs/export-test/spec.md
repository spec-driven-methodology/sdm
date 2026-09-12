## ADDED Requirements

### Requirement: export-test available
The system SHALL expose export-test as specified in the product plan.

#### Scenario: Command succeeds
- **WHEN** the corresponding CLI command runs with valid inputs
- **THEN** it returns success JSON with ok: true when --json is set
