## ADDED Requirements

### Requirement: Kit tab in export player

The player SHALL support a third home mode **Шпаргалки** for `sdm.export.kit/v1` documents with a separate localStorage library scoped per project path.

#### Scenario: Load kit JSON

- **WHEN** the author loads a valid kit export on the Шпаргалки tab
- **THEN** the player renders modules, probes, checklist, and glossary without mutating methodology YAML
