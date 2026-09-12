## ADDED Requirements

### Requirement: Generate context uses profile flag
When providing certification context to `question generate`, the CLI/MCP SHALL accept `--profile` (not `--role`) together with `--level`.

#### Scenario: Generate with profile context
- **WHEN** generate runs with `--profile` and `--level` for a thin skill
- **THEN** the returned context includes depth/topic gap fields for that profile/level
