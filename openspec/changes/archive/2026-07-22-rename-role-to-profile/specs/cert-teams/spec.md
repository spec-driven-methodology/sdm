## ADDED Requirements

### Requirement: Team documents reference profile
Team YAML SHALL use field `profile` (not `role`) to bind overlays to a certification profile. CLI/MCP team resolution SHALL accept profile identity consistently with profile-domain.

#### Scenario: Team bound to profile
- **WHEN** a team file declares `profile: java-developer` and a level override
- **THEN** coverage/export with `--profile java-developer --team <id>` applies that overlay
