---
name: close-staleness
description: >
  After ontology edits, find questions/exports with outdated meta.basis via
  `skill impact` + `content stale`, then HITL review / rewrite / regenerate.
  Use when the human asks what became stale after changing a skill, or
  suggest shows review-stale-content.
---

# Close staleness (content basis)

## When to use

- Skill / level / requirements changed and derived content may be outdated
- Suggest lever «Check stale content»
- Distinguishing **coverage gaps** (missing questions) from **stale** (content exists but basis mismatch)

Wire `schemaVersion` (e.g. `sdm.export.test/v1`) is **not** content freshness — use `meta.basis`.

## Tool contract

Prefer `--json` or MCP `skill_impact` / `content_stale`. Do not hand-edit YAML when a command exists.

```bash
sdm skill impact --skill "<id>" --json
sdm content stale --skill "<id>" --json
# or level scope:
sdm content stale --profile "<profile>" --level "<level>" --json
```

## Loop

1. `sdm doctor`
2. `skill impact --skill … --json` — structural radius (downstream, levels, questions, exports)
3. `content stale --skill … --json` — `stale[]` + `workItems` (`review` / `regenerate`)
4. HITL: confirm what to rewrite vs regenerate vs leave
5. Rewrite questions → `question add` / validate (new writes stamp fresh `meta.basis`)
6. Regenerate exports → `export test` / `export learning` / `export kit` (stamps `meta.basis`)
7. Re-run `content stale` until no `skill_basis_mismatch` / `level_basis_mismatch`
8. Optional: `suggest --profile … --level … --json`

Default: `--skill S` does **not** mark questions bound only to downstream skills.