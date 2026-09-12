## Context

`meta.basis` (content-staleness) уже штампует hashes skills/level на export. Потребителям нужен отдельный **slot id** (identity) и **content revision** (basis без timestamp).

## Goals / Non-Goals

**Goals:**

- Deterministic `id` from export identity payload (profile/level/scope/filters/format — not shuffle)
- `meta.revision` = sha16(stable JSON of basis.skills + basis.level)
- Agent docs: upsert by `id`, skip/replace when revision unchanged/changed

**Non-goals:** publications registry, publish CLI, schema v2 bump, CSV columns.

## Decisions

1. **`id` slug algorithm**
   - Prefix: `test-{profile}-{level}` or `course-{profile}-{level}-{format}-{depth}` when profile+level present; skill-only scopes use `course-skill-{id}-...`.
   - Full identity payload hashed; if payload equals canonical default (no filters/adaptive/team/extra scope), return prefix only.
   - Otherwise `{prefix}-{sha16(payload)}` (max readable prefix 80 chars).

2. **`meta.revision`**
   - Reuse `stableStringify` + sha16 from content-basis pattern.
   - Exclude `capturedAt` so identical content → same revision.

3. **Shuffle / optionShuffle excluded from `id`** — presentation-only.

4. **Backward compat** — old JSON without `id`/`revision` still loads; next export adds fields.

## Risks

| Risk | Mitigation |
|------|------------|
| Long ids | Hash suffix only when non-default variants |
| Consumers ignore new fields | Document in skills + CHANGELOG |
