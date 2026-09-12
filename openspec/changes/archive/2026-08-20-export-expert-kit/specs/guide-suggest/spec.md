## ADDED Requirements

### Requirement: Suggest export kit lever

`suggest` SHALL offer an action to export expert kit when profile/level focus is set and library has content, with commandHint `export kit --profile … --level …`.

#### Scenario: Kit suggestion when no kit export present

- **WHEN** suggest runs for a profile/level with questions but no kit JSON in exports/
- **THEN** suggestions include export kit with skill `export-kit`
