## MODIFIED Requirements

### Requirement: Player loads sdm.export.course/v1 documents

The static player SHALL accept JSON documents with `schemaVersion` equal to `sdm.export.course/v1` via the same load surfaces as tests (file picker, drag-and-drop, and `exports/` discovery when available). A valid course document MUST be added to the course library. Documents that are neither `sdm.export.test/v1` nor `sdm.export.course/v1` MUST be rejected with an error that names the unsupported version and the two supported versions. The player MUST NOT require a network backend to read a loaded course pack. Author docs MAY refer to packs produced by `export learning` (alias `export course`).

#### Scenario: Load valid course JSON

- **WHEN** the author selects a valid learning-export JSON file (`sdm.export.course/v1`, from `export learning` or alias `export course`)
- **THEN** the player adds it to the course library
- **AND** does not treat it as a test package

#### Scenario: Reject unknown schemaVersion

- **WHEN** the selected file is JSON with a `schemaVersion` that is not `sdm.export.test/v1` or `sdm.export.course/v1`
- **THEN** the player shows an error naming the unsupported version and the expected versions
- **AND** previously loaded library entries remain available
