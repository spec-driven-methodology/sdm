## MODIFIED Requirements

### Requirement: Course export document schema

The system SHALL export a learning pack document with `schemaVersion` equal to `sdm.export.course/v1` that includes a deterministic package `id`, profile, level (when scoped to a certification), content controls when provided, an ordered list of modules, teaching context or equivalent metadata sufficient for agent generation, quality warnings, and metadata including `meta.revision`. Each module SHALL reference a skill id and MAY include lesson stubs (including optional `body` markdown) and practice question identifiers from the methodology library.

#### Scenario: Schema version is stable for consumers

- **WHEN** a course export succeeds for a profile and level
- **THEN** the document includes `schemaVersion: "sdm.export.course/v1"` and a `modules` array (non-empty when skills apply, or empty with warnings when none apply)
- **AND** `id` is present as a non-empty slug
- **AND** `meta.revision` is a non-empty 16-character hex string from basis hashes without `capturedAt`

#### Scenario: Level course canonical id form

- **WHEN** course export runs for profile `qa-manual`, level `junior`, `format=course`, `depth=brief`, `locale=ru`
- **THEN** `id` equals `course-qa-manual-junior-course-brief-ru` (slug segments derived from those controls)

#### Scenario: Plan-only export may omit lesson bodies

- **WHEN** course export is requested in plan/brief mode
- **THEN** modules and lesson stubs are present with teaching context and warnings, and missing lesson bodies do not invalidate the document schema

### Requirement: Consumer upsert contract for learning packages

Export course/learning JSON intended for external systems SHALL treat `id` as the stable upsert slot key and `meta.revision` as the content fingerprint. External consumers SHOULD upsert by `id` and replace content when `meta.revision` changes. Scope mode (`meta.scope`) and content controls (`controls`) MUST affect `id` when they define a distinct delivery slot.

#### Scenario: Skill-scoped course has distinct id

- **WHEN** course export runs with `--skill` for one skill versus full profile+level course for the same skill's profile
- **THEN** the two documents have different `id` values
