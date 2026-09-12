## Why

Agents can read gaps but still invent question content without Specra context. `question generate` returns structured context + draft shells so any LLM can fill text, then persist via `question add` — no vendor LLM in core, no YAML hand-edit.

## What Changes

- Core `generateQuestions` + CLI `question generate --json`
- MCP `question_generate`; portable skill `agents/generate-questions`
- Tests; docs

## Non-goals

- Built-in OpenAI/etc. calls, auto-write without agent fill, cert patch, MCP HTTP

## Capabilities

### New Capabilities

- `question-generate`: agent-facing draft shells and generation context for a skill

### Modified Capabilities

- (none)

## Impact

- `@spec-driven-methodology/core`, `@spec-driven-methodology/cli`, `@spec-driven-methodology/mcp`, `agents/`, CHANGELOG/README/AGENTS
