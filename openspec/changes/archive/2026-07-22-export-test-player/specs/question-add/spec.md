## ADDED Requirements

### Requirement: Optional expected for open questions on add

`sdm question add` SHALL accept one or more `--expected <text>` flags when `--type open` and SHALL persist them as `expected` on the question file after Zod validation. When `--expected` is supplied with a non-`open` type, the command SHALL fail with a stable validation error and MUST NOT write a file. MCP `question_add` SHALL accept the same `expected` value shape.

#### Scenario: Add open question with expected

- **WHEN** an agent runs `sdm question add --to-skill docker --type open --difficulty 0.3 --text "…" --expected "image" --expected "Image" --json`
- **THEN** the written YAML includes `expected` containing both values
- **AND** the `--json` success payload includes the question with `expected`

#### Scenario: Reject expected on single_choice

- **WHEN** `question add` is run with `--type single_choice` and at least one `--expected`
- **THEN** the command fails with a validation error
- **AND** no question file is written

#### Scenario: MCP question_add with expected

- **WHEN** a host calls `question_add` with `type: open` and `expected` set to a string or string array
- **THEN** the tool returns success and the library file contains `expected`
