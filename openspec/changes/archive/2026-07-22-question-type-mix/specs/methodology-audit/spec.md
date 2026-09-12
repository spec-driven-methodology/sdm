## ADDED Requirements

### Requirement: Audit advises mono-type libraries

When a methodology audit runs, the system SHALL detect skills that have at least three questions and all of those questions share the same `type`. For each such skill the audit document SHALL include a non-blocking recommendation (priority low or medium) suggesting diversifying via `question generate --mix mixed` (or equivalent intent). This finding MUST NOT change certification coverage status (`ok` / `thin` / `missing`).

#### Scenario: Mono-type skill gets recommendation

- **WHEN** skill `docker` has three or more questions all of type `single_choice`
- **AND** an agent runs `sdm audit --json`
- **THEN** `recommendations` includes a message identifying type mono-culture for that skill (or library-wide mono-type pattern)
- **AND** coverage fields, when present, are computed as before without a new failing status for type diversity

#### Scenario: Diverse types skip mono-type recommendation

- **WHEN** a skill has questions of at least two different types
- **THEN** the audit MUST NOT emit a mono-type diversity recommendation for that skill
