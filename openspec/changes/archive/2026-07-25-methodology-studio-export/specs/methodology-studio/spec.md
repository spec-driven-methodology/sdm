## ADDED Requirements

### Requirement: Studio renders export-form phase

When a loaded view contains an `export-form` phase, the Studio SHALL render its fields according to each field’s `widget` (`multi`, `boolean`, `number`, `text`) using labels/options from the document, and SHALL expose a Russian submit action that emits `export_test` as specified by studio-export-form.

#### Scenario: Export form visible with plan

- **WHEN** a view includes both `plan` and `export-form` phases
- **THEN** the author can reach the export-form UI after or alongside plan review without leaving Studio
