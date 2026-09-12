## Why

`question generate` must feed agents the depth/topic gap context from depth-aware coverage.

## What Changes

- Gap context includes achievedDepth, depthRatio, uncoveredTopics, missingDifficultyBand
- Agent prompt prioritizes difficulty band and uncovered topics
- Skill docs updated

## Non-goals

- LLM calls inside core

## Capabilities

### Modified Capabilities
- `question-generate`: richer gap context

## Impact

- question-generate.ts, agents/generate-questions
