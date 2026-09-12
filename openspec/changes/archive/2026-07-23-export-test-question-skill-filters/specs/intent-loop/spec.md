## ADDED Requirements

### Requirement: Export intents map skill and question subsets to export_test filters

When the human’s intent is to export a test package and they specify a skill subset or specific question ids in natural language (e.g. «только skill ai-quality», «без skill-authoring и mcp», «только QA-skills без общих», «только эти четыре вопроса», listing question ids), the `intent-loop` (and/or delegated `export-methodology`) skill SHALL map those preferences to MCP `export_test` / CLI `export test` skill-filter and/or `--include-question` / `includeQuestions` arguments — not to `jq`, Node post-filters, hand-edited export JSON, or instructing the human to pass raw flags. The agent MUST NOT invent a second export document by slicing a full package when Specra filters exist. The agent MUST confirm profile, level, and filter intent before running the export when the workflow requires confirmation; for a pure export handoff after an existing profile/level, the skill MAY proceed after a short confirmation of the filter set.

#### Scenario: Human asks for QA-only skills export

- **WHEN** the human says approximately «выгрузи тест ai-qa только по quality/security/ethics без общих skills»
- **THEN** the agent calls `export_test` (or CLI equivalent) with an include-skills filter for those skill ids
- **AND** does not post-process a full export JSON with a custom script to drop skills

#### Scenario: Human asks for specific question ids

- **WHEN** the human asks to export only named question ids (e.g. `q-ai-quality-005` … `008`)
- **THEN** the agent calls `export_test` with `includeQuestions` / `--include-question` for those ids
- **AND** does not hand-build a package by copying objects out of another export file

#### Scenario: Combined type and skill filters

- **WHEN** the human asks for a skill-subset export without open/text questions
- **THEN** the agent combines skill filter args with type filter args on the same `export_test` call
