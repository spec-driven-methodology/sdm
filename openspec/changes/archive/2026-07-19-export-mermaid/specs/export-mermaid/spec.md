## ADDED Requirements

### Requirement: Assemble Mermaid skill graph for a certification level
The system SHALL assemble a Mermaid flowchart for a role and level whose nodes are the level’s requirement skills and whose edges are `depends_on` links where both endpoints are among those skills.

#### Scenario: Export for example middle java-developer
- **WHEN** the user runs `sdm export mermaid --role java-developer --level middle` in a project with example methodology
- **THEN** the export includes nodes for the middle level’s required skills
- **AND** stdout is Markdown containing a fenced `mermaid` code block

#### Scenario: Level or role missing
- **WHEN** the role or level cannot be loaded
- **THEN** the system reports a SdmError and exits non-zero

### Requirement: Coverage coloring
When coverage mode is enabled (default), the system SHALL color each node using the existing coverage status for that skill (`ok`, `thin`, `missing`). When coverage mode is disabled, nodes SHALL be emitted without coverage class styling.

#### Scenario: Default coverage colors
- **WHEN** `sdm export mermaid --role <role> --level <level>` succeeds with default flags
- **THEN** the Mermaid source includes class definitions or styles distinguishing ok / thin / missing skills present in the level

#### Scenario: Coverage disabled
- **WHEN** the user passes `--no-coverage`
- **THEN** the Mermaid source does not apply coverage status class colors

### Requirement: Versioned document and agent envelope
The system SHALL support a versioned document with `schemaVersion` equal to `sdm.export.mermaid/v1` including role, level, mermaid source, and markdown wrapper. `--json` SHALL wrap success as `{ ok: true, format, document }` and failure as `{ ok: false, code, message }`.

#### Scenario: Agent success envelope
- **WHEN** `sdm export mermaid --role <role> --level <level> --json` succeeds
- **THEN** stdout JSON has `ok: true` and `document.schemaVersion` `sdm.export.mermaid/v1`

#### Scenario: Agent failure envelope
- **WHEN** export fails with `--json`
- **THEN** stdout JSON has `ok: false`, a stable `code`, and `message`
- **AND** exit code is non-zero

### Requirement: Export succeeds despite missing coverage
The system SHALL exit with code 0 when the Mermaid document is assembled successfully even if one or more skills have zero questions.

#### Scenario: Missing skills do not fail mermaid export
- **WHEN** a required skill has zero questions and mermaid export succeeds structurally
- **THEN** the process exit code is 0
