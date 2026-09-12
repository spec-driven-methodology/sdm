## ADDED Requirements

### Requirement: Kit exports in artifact scan

`scanExportArtifacts` SHALL classify `sdm.export.kit/v1` as kind `export_kit` and include `meta.basis` for stale comparison.

#### Scenario: Kit basis mismatch

- **WHEN** a kit export JSON has stale skill basis hashes
- **AND** `content stale` runs for that profile/level
- **THEN** the export appears in stale with action `regenerate`
