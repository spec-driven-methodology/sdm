# export-kit

## Purpose

Deterministic expert interview kit export from methodology profile+level: skill cards, open/code probes, glossary, checklist. HTML is a consumer render, not SSOT.

## Requirements

### Requirement: Kit export document schema

The system SHALL export a kit document with `schemaVersion` equal to `sdm.export.kit/v1` including deterministic `id`, `profile`, `level`, `title`, ordered `modules`, `glossary`, `checklist`, quality `warnings`, and `meta` with `moduleOrder`, `basis`, and `revision`.

#### Scenario: Level-scoped kit

- **WHEN** kit export runs for an existing profile and level with requirements and library questions
- **THEN** each required skill appears as a module ordered by depends_on topology when acyclic
- **AND** probes include only questions with type `open` or `code` for that skill

#### Scenario: Choice questions excluded

- **WHEN** a skill has single_choice questions but no open/code questions
- **THEN** that skill's module has an empty probes array
- **AND** warnings include `KIT_NO_PROBE_QUESTION` for that skill

### Requirement: Kit package identity

Kit export SHALL set `id` to `kit-{profile}-{level}` slug form and `meta.revision` from content basis hashes without `capturedAt`.

#### Scenario: Stable id

- **WHEN** kit export runs for profile `qa-manual` level `junior`
- **THEN** `id` equals `kit-qa-manual-junior`

### Requirement: Kit HTML render

The system SHALL provide deterministic self-contained HTML from a kit document with inline CSS, escaping user-controlled text, and footer showing `meta.revision`.

#### Scenario: HTML from kit JSON

- **WHEN** `export kit --format html` succeeds
- **THEN** stdout is HTML containing the profile, level, module titles, and probe texts from the document

### Requirement: Strict kit export

When `--strict` is set, kit export SHALL fail with `KIT_EXPORT_BLOCKED` if critical kit-readiness warnings exist.

#### Scenario: Strict blocks thin kit

- **WHEN** a required skill has no probe questions and export runs with `--strict`
- **THEN** the command fails before writing output

### Requirement: Agent-first CLI and MCP

The system SHALL expose `sdm export kit` and MCP tool `export_kit` with `--json` envelope matching other export commands.

#### Scenario: MCP export_kit

- **WHEN** MCP `export_kit` is called with valid profile and level
- **THEN** the response includes `document` with `schemaVersion` `sdm.export.kit/v1`
