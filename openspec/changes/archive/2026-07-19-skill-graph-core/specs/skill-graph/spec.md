## ADDED Requirements

### Requirement: Build in-memory skill dependency graph
The system SHALL provide a core API that loads all skills under `ontology/skills` and builds a directed dependency graph from each skill's `depends_on` list.

#### Scenario: Graph from valid ontology
- **WHEN** a methodology project has skills A→B and B→C via `depends_on`
- **THEN** the graph contains nodes A, B, C and directed edges A→B and B→C

#### Scenario: Empty ontology
- **WHEN** `ontology/skills` has no skill files
- **THEN** the graph contains zero nodes and zero edges

### Requirement: Detect depends_on cycles
The system SHALL detect directed cycles in the `depends_on` graph and expose cycle paths to callers.

#### Scenario: Acyclic graph
- **WHEN** `detectCycles` runs on a DAG
- **THEN** it returns an empty list of cycles

#### Scenario: Cyclic graph
- **WHEN** skills form a cycle A→B→A via `depends_on`
- **THEN** `detectCycles` returns at least one cycle path including those skill ids

### Requirement: Assert acyclic before persisting links
The system SHALL provide `assertAcyclicDepends` that throws `SdmError` with code `CYCLE_DETECTED` when the proposed graph would contain a cycle.

#### Scenario: Assert fails on cycle
- **WHEN** `assertAcyclicDepends` is called with a cyclic edge set
- **THEN** it throws with code `CYCLE_DETECTED`
- **AND** the error message includes a human-readable cycle path
