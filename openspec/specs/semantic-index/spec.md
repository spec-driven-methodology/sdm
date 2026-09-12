# semantic-index Specification

## Purpose
TBD - created by archiving change semantic-index. Update Purpose after archive.
## Requirements
### Requirement: Rebuild semantic index
The system SHALL provide `sdm index rebuild` that writes a local index when `search.provider` is `lancedb`.

#### Scenario: Rebuild success
- **WHEN** provider is lancedb and rebuild runs
- **THEN** `.sdm/index/methodology.json` is written with skills and questions

#### Scenario: Search disabled
- **WHEN** provider is none
- **THEN** rebuild fails with `SEARCH_DISABLED`

### Requirement: Search index
The system SHALL provide `sdm search <query>` returning ranked hits.

#### Scenario: Search hits
- **WHEN** index exists and query matches document text
- **THEN** JSON output includes hits with scores

