## ADDED Requirements

### Requirement: Init layout documents studio beside player

When Methodology Studio ships, `sdm init` generated project `README.md` (layout section) SHALL list `studio/` as the authoring preview/shell for intent-loop view/action documents, distinct from `player/` (export preview). The guide path MAY mention Studio as optional visual review; it MUST NOT present Studio as an LMS or as a replacement for the agent executor.

#### Scenario: New project README mentions studio

- **WHEN** a user runs `sdm init` in an empty directory after studio templates ship
- **THEN** the created `README.md` layout lists `studio/` in addition to `player/`
