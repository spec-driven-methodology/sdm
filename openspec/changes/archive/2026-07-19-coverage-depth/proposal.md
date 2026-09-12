## Why

Coverage used only question counts; required `depth` was decorative. Changing depth did not affect pass/fail (idea.md §10.3).

## What Changes

- **BREAKING** coverage JSON: `achievedDepth`, `depthRatio`, `uncoveredTopics`, `missingDifficultyBand`, `hasThin`
- Status considers count AND depthRatio ≥ 0.9
- cert coverage/gaps/mermaid/generate consume new fields

## Non-goals

- Candidate answer analytics
- Semantic duplicates

## Capabilities

### New Capabilities
- (none)

### Modified Capabilities
- `cert-coverage`: depth-aware status
- `cert-gaps`: expose depth/topic gap fields
- `question-generate`: (follow-up change)

## Impact

- coverage.ts and dependents; agent JSON consumers
