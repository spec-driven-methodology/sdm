## ADDED Requirements

### Requirement: Export mermaid uses profile
`sdm export mermaid` SHALL take `--profile` and document fields SHALL use `profile`.

#### Scenario: Mermaid by profile
- **WHEN** an agent runs `sdm export mermaid --profile java-developer --level middle --json`
- **THEN** the document includes profile identity and Mermaid source for required skills
