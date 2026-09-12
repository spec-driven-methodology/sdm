## MODIFIED Requirements

### Requirement: Export test picker before session

The player SHALL allow the author to choose a `sdm.export.test/v1` JSON via the existing file picker/drag-and-drop and SHALL, when feasible (e.g. HTTP context with a discoverable `exports/` directory), present a list of candidate JSON files to load with one click. When listing is unavailable, the player SHALL still work with manual file selection only. Successful picks SHALL add the document to the player export library (see `player-export-library`) rather than replacing the only in-memory package. The load screen SHALL present the library of loaded packages so the author can select which one to start.

#### Scenario: Manual file selection still works

- **WHEN** the author picks a valid export JSON via the file input
- **THEN** the player adds the document to the library and can start a session from the selected entry

#### Scenario: Listed export loads when available

- **WHEN** the player successfully discovers at least one JSON under an exports folder
- **AND** the author clicks one listed file
- **THEN** that document is added to the library and available for session start

#### Scenario: Multiple manual loads accumulate

- **WHEN** the author picks two different valid export files in sequence
- **THEN** both appear in the loaded-packages library on the load screen
