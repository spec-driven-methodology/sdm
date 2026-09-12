## Context

`createCertification` refuses existing levels without `--force`. Patch is the agent-friendly edit path.

## Goals / Non-Goals

**Goals:** merge/upsert/remove requirements by skill id; optional title/description/threshold; `--json`.

**Non-Goals:** deleting levels, rewriting role files beyond ensuring level stays listed.

## Decisions

1. CLI flags: `--add-requirement` (fail if skill already present), `--set-requirement` (upsert), `--remove-requirement <skill>` (by id).
2. At least one patch op or metadata change required.
3. Skills in add/set must exist in ontology; validate before write.
4. If level.role set, optional `--role` must match (or assert consistency).

## Risks / Trade-offs

- [Empty requirements after removes] → allow empty array only if explicit removes left zero? Prefer require ≥1 requirement remaining (VALIDATION_FAILED).

## Migration Plan

New command only.

## Open Questions

- None.
