## Context

Implemented depth-aware coverage in core.

## Goals / Non-Goals

**Goals:** depthRatio, uncoveredTopics, thin on depth fail.

**Non-Goals:** Runtime candidate stats.

## Decisions

1. achievedDepth = max(difficulty)
2. DEPTH_OK_RATIO = 0.9
3. Keep `depth` field as required depth for compat

## Risks / Trade-offs

- [BREAKING JSON] → documented in CHANGELOG 0.2.0
