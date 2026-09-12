## MODIFIED Requirements

### Requirement: Skill graph for role and level
The system SHALL provide `sdm skill graph --profile <profile> --level <level>` that shows required skills as a dependency-oriented tree with optional coverage indicators.

#### Scenario: Graph JSON for profile
- **WHEN** an agent runs `sdm skill graph --profile java-developer --level middle --json` in a valid project
- **THEN** stdout JSON describes the graph for that profile/level

## ADDED Requirements

### Requirement: Skill impact lists profiles
`sdm skill impact` JSON SHALL list affected **profiles** and levels (field names MUST NOT use Specra entity `roles`).

#### Scenario: Impact mentions profiles
- **WHEN** an agent runs `sdm skill impact --skill java-core --json`
- **THEN** the payload includes profile identities under a profiles-oriented field
