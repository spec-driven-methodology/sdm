## ADDED Requirements

### Requirement: Semantic duplicates in audit
When `search.provider` is `lancedb` and a semantic index exists, `sdm audit` SHALL include `library.semanticDuplicates` from index similarity.

#### Scenario: Semantic duplicates attached
- **WHEN** audit runs with an existing index and near-duplicate question texts
- **THEN** the audit document may list `semanticDuplicates` in addition to lexical duplicates
