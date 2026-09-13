# project-root

## Purpose

Locate the SDM methodology project root from the working directory.

## Requirements

### Requirement: Discover methodology project root
The system SHALL locate the methodology project root by walking upward from the current working directory until a file named `sdm.yaml` is found.

#### Scenario: Root found in cwd
- **WHEN** the user runs a SDM command from a directory that contains `sdm.yaml`
- **THEN** the system uses that directory as the project root

#### Scenario: Root found in ancestor
- **WHEN** the user runs a SDM command from a subdirectory of a methodology project
- **THEN** the system finds the nearest ancestor directory containing `sdm.yaml` and uses it as the project root

#### Scenario: Root not found
- **WHEN** no ancestor directory contains `sdm.yaml`
- **THEN** the system reports an error and exits with a non-zero status code
