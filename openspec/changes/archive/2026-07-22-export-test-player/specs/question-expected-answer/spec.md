## ADDED Requirements

### Requirement: Optional expected answers on open questions

The shared question schema SHALL accept an optional `expected` field as a non-empty string or a non-empty array of non-empty strings, representing acceptable short answers for unambiguous auto-check. The field is intended for `type: open`. Consumers (including the export-test player) SHALL treat a match as correct when the normalized author answer equals any normalized expected value (trim, collapse internal whitespace, case-fold).

#### Scenario: Open question with single expected string validates

- **WHEN** a question YAML has `type: open` and `expected: "Docker"`
- **THEN** Zod validation succeeds and the value is retained on read

#### Scenario: Open question with multiple expected strings validates

- **WHEN** a question YAML has `type: open` and `expected: ["mvcc", "MVCC"]`
- **THEN** Zod validation succeeds

#### Scenario: Empty expected rejected

- **WHEN** `expected` is an empty string or an empty array
- **THEN** validation fails and the question is not persisted

### Requirement: Expected ignored or rejected outside open write path

Writers (`question add` / MCP) SHALL only persist `expected` for `type: open`. Reading legacy questions without `expected` SHALL remain valid.

#### Scenario: Open without expected remains valid

- **WHEN** an existing `open` question has no `expected` field
- **THEN** the question still validates and loads
