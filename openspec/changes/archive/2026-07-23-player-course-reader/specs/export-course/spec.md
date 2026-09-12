## ADDED Requirements

### Requirement: Static player may preview course packs

The system MAY ship a static author-preview player that reads `sdm.export.course/v1` documents for lesson browsing. That preview MUST NOT constitute an LMS: Specra still MUST NOT track learner progress, run enrolled courses as a product surface, or call an LLM to author lesson prose as part of course export. Practice in the player, when offered, SHALL resolve question ids against assessment library payloads (e.g. a loaded `export test` pack), not invent question content inside the course document.

#### Scenario: Preview does not imply LMS runtime

- **WHEN** an author opens a course export in the static player
- **THEN** the player may show modules and lessons for review
- **AND** no learner progress store or external LMS API call is required or performed by Specra core export

#### Scenario: Practice ids remain library references

- **WHEN** a course module lists practice question ids
- **THEN** those ids remain references to the assessment question library
- **AND** the course document is not required to embed full question payloads for player preview
