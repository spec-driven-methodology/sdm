## ADDED Requirements

### Requirement: Reject depends_on cycles on link
The system SHALL refuse `skill link` when merging the requested `depends_on` edges would introduce a directed cycle in the ontology graph.

#### Scenario: Link creates cycle
- **WHEN** skill A already depends on B, and an agent runs `sdm skill link B --depends-on A`
- **THEN** the command fails with code `CYCLE_DETECTED`
- **AND** neither skill YAML is modified

#### Scenario: Link keeps DAG
- **WHEN** linking adds a `depends_on` edge that does not create a cycle
- **THEN** the skill file is updated as today (merge + dedupe)
