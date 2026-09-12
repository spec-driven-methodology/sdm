# library-terms

## Purpose

Glossary terms in `library/terms/` as SSOT for kit/course glossary (distinct from skill descriptions).

## Requirements

### Requirement: Term schema and loader

The system SHALL store terms as YAML under `library/terms/<id>.yaml` with fields `id`, `term`, `definition`, optional `aliases`, optional `skills`, and `kind` (`concept` | `product`).

#### Scenario: Load terms from project

- **WHEN** valid term YAML files exist under `library/terms/`
- **THEN** `loadTerms` returns parsed terms sorted by id

### Requirement: Term write path

The system SHALL provide `sdm term add` and MCP `term_add` to create terms with skill FK validation and optional `--force` overwrite.

#### Scenario: Add term linked to skill

- **WHEN** `term add mcp --term MCP --definition … --skill ai-llm-basics` succeeds
- **THEN** `library/terms/mcp.yaml` exists and `term list` includes it

### Requirement: Content basis includes terms

Kit export `meta.basis` SHALL include optional `terms` map (id → content hash) when terms exist in the project.

#### Scenario: Basis revision changes when term edits

- **WHEN** a term definition changes and kit is re-exported
- **THEN** `meta.revision` changes
