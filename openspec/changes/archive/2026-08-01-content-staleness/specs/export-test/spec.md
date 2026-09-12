## ADDED Requirements

### Requirement: Stamp content basis on test export meta

When assembling a test export document, `meta` SHALL include a `basis` object with current content hashes for skills represented in the export requirements (and/or selected questions), the level hash under `basis.level`, and ISO `capturedAt`. Wire `schemaVersion` MUST remain `sdm.export.test/v1` (format identity), distinct from content basis.

#### Scenario: Successful export includes basis

- **WHEN** an agent runs `sdm export test --profile P --level L --json` successfully
- **THEN** `document.meta.basis` includes `capturedAt`, `level.id` equal to L with a non-empty hash, and at least one entry in `basis.skills` for a requirement skill present in the document

#### Scenario: Basis does not replace schemaVersion

- **WHEN** a test export document is produced
- **THEN** `schemaVersion` is still `sdm.export.test/v1` and content freshness is expressed only via `meta.basis`
