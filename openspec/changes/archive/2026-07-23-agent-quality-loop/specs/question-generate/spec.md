## ADDED Requirements

### Requirement: Per-draft briefs for agent fill

`sdm question generate --json` SHALL attach per-draft brief fields that constrain agent authorship. Each draft MUST include `type` and `difficulty`, and MAY include `mustCoverTopic`, `avoidNearIds`, `relatedSkillIds`, and draft-specific `instructions`. The top-level `context.agentPrompt` MUST mention these constraints when present.

#### Scenario: Draft includes mustCoverTopic from uncovered topics

- **WHEN** generate runs with `--profile` and `--level` for a skill that has uncovered topics
- **THEN** at least one returned draft includes `mustCoverTopic` set to one of those uncovered topics (when count allows)

### Requirement: Work-item-driven draft assignment

When blueprint `workItems` exist for the target skill (profile/level provided), generate MUST map drafts to those work items up to `--count`, assigning matching topic/type/difficulty band fields on each stub.

#### Scenario: Work items drive draft targets

- **WHEN** blueprint mode yields work items for skill S with a specific topic T and difficulty band, and generate runs for S with profile/level and count ≥ 1
- **THEN** at least one draft targets topic T (via `mustCoverTopic` or equivalent) within the requested difficulty band
