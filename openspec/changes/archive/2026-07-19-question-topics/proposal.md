## Why

Coverage gaps and AI generation need topic hints (idea.md §4.3). Questions and skills currently have no `topics` field, so gaps cannot report uncovered themes.

## What Changes

- Optional `topics: string[]` on Question and Skill Zod schemas
- `question add --topic <t>` (repeatable)
- MCP `question_add` accepts optional `topics` array
- Docs + tests; backward compatible

## Non-goals

- Depth-aware coverage math (follow-up `coverage-depth`)
- Auto-inferring topics from text

## Capabilities

### New Capabilities
- (none — schema extension under question-add / skill-write)

### Modified Capabilities
- `question-add`: optional topics on write
- `skill-write`: optional topics on skill add

## Impact

- schemas.ts, question-add, skill-write, CLI, MCP
