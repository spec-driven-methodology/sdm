## ADDED Requirements

### Requirement: Typed libraries for tests and courses

The player SHALL maintain separate client-side libraries for validated `sdm.export.test/v1` packages and validated `sdm.export.course/v1` packages. Loading a course MUST NOT remove test library entries, and loading a test MUST NOT remove course library entries. Persistence in `localStorage` SHALL use distinct scoped keys (or an equivalent typed namespace) under the existing per-player-path scoping rules so tests and courses for the same project do not overwrite each other.

#### Scenario: Course load keeps test library

- **WHEN** the author has a test package in the test library
- **AND** loads a valid course package
- **THEN** the test library still lists the test package
- **AND** the course library lists the course package

#### Scenario: Reload restores both libraries

- **WHEN** the author has loaded at least one test and one course into their respective libraries
- **AND** reloads the player page (same player path)
- **THEN** both libraries still list their packages without re-selecting files

### Requirement: exports discovery classifies by schemaVersion

When the player discovers JSON files under `exports/` (HTTP), it SHALL classify each file by `schemaVersion` and offer it for the matching library (test vs course). Selecting a discovered course file MUST NOT fail solely because the player expected a test schema.

#### Scenario: Discovered course file loads as course

- **WHEN** `exports/` contains a valid `sdm.export.course/v1` JSON
- **AND** the author selects that entry from the discovery list
- **THEN** the player adds it to the course library without a test-schema validation error
