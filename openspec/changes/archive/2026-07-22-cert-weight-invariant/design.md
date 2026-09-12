## Context

Level requirements store `depth` (required mastery) and `weight` (share of final assessment). Zod and CLI parse each weight in `0..1`, but neither `cert create` nor `cert patch` enforces `sum(weights) ≈ 1`. Coverage ignores weight. Product docs describe weight as score share; agents adding skills (e.g. Kubernetes) risk sum drift or silent redistribution.

Stakeholders: methodology authors (NL intent), AI agents (CLI/MCP), scoring consumers (export). Constraint: agent-first, HITL plans, no hand-edit YAML when a command exists.

## Goals / Non-Goals

**Goals:**

- Persist weights as **normalized shares** with invariant `sum ≈ 1`.
- One-time normalize on create (relative or absolute input → shares in YAML + JSON).
- Explicit transfer/rebalance for post-create changes; never silent renormalize on add.
- Stable error codes and `--json` before/after diffs for agents.
- Audit warning for legacy levels that violate the invariant.

**Non-Goals:**

- Runtime candidate scoring inside Specra.
- Auto equal-split / proportional steal without `--from` / reweight.
- Changing coverage/depth heuristics.
- Hard migration rewrite of all existing YAML on upgrade.

## Decisions

### D1. Invariant: shares in YAML, ε = 1e-6

**Choice:** After every successful create/patch/reweight write, `abs(sum(weights) - 1) ≤ 1e-6`. Persist rounded shares (e.g. 4–6 decimal places) that still satisfy the check.

**Alternatives:** Relative-only storage + normalize at export (rejected: YAML lies about exam %). Soft warn forever (rejected: agents keep writing bad sums).

### D2. Create: normalize once, never silently later

**Choice:** `cert create` accepts current triples. If sum ≠ 1 but all weights > 0, **normalize proportionally** and persist shares; JSON includes `weightsNormalized: true` and final `requirements`. If any weight is 0 with others non-zero, still normalize over positive weights (zeros stay 0) or fail if sum is 0 (`WEIGHT_SUM_INVALID`).

**Flag:** `--no-normalize-weights` fails when sum ≠ 1 (strict authors / CI). Default = normalize on create only.

**Alternatives:** Always require pre-normalized input (harsh for agents); always relative ranks as separate schema (bigger breaking change).

### D3. Patch add: transfer required, no auto-renormalize

**Choice:** Extend `cert patch`:

```bash
sdm cert patch --level middle \
  --add-requirement kubernetes:0.4:0.10 \
  --from docker:0.05 --from spring:0.05 --json
```

Semantics: add (or fail if exists) the new requirement; subtract listed amounts from donors; then assert invariant. Without `--from` (or equivalent MCP args), if post-add sum ≠ 1 → `WEIGHT_TRANSFER_REQUIRED`.

`--set-requirement` that changes only depth keeps weight; changing weight must leave sum=1 or be done via `cert reweight`.

`--remove-requirement`: leftover weights must still sum to 1 **or** caller must pass `--redistribute-removed` / use `cert reweight --set …`. Prefer: remove fails with `WEIGHT_SUM_INVALID` unless `--from` is unused and instead `--absorb-into <skill>` or reweight. Simpler v1: **remove requires accompanying reweight** or `--absorb-into skill` that receives the removed weight.

**Alternatives:** Silent proportional shrink of all others (rejected by product). Allow sum≠1 after patch (rejected).

### D4. New command `cert reweight`

```bash
# Transfer
sdm cert reweight --level middle \
  --skill kubernetes --delta 0.05 --from docker --json

# Full map replace
sdm cert reweight --level middle \
  --set java-core=0.35 --set spring=0.25 --set sql=0.20 \
  --set docker=0.10 --set kubernetes=0.10 --json
```

- Transfer: target skill must already be on the level; delta > 0; donors must have enough weight.
- `--set` map: must cover **all** current requirement skills exactly once; sum=1.
- JSON: `{ ok, level, before, after, transfers[] }`.

Core module: `packages/core/src/cert-reweight.ts` (+ shared `packages/core/src/weights.ts` for sum/normalize/assert).

### D5. Depth vs weight in agent skills

Document in portable skills: «усилить сложность» → depth via patch/set; «важнее в оценке» → reweight/transfer. Intent-loop clarify slots for add-skill: `weight` + `from[]`.

### D6. Audit, not doctor-blocking

**Choice:** `audit` adds finding `weightSumInvalid` per level (sum, delta). Doctor may mention in text later; not required for this change. Existing bad levels remain readable by coverage.

### D7. Zod schema

Keep per-requirement `weight` in `0..1`. Do **not** put sum check in Zod level parse (would break loading legacy). Enforce on write paths + audit.

### D8. Error codes

| Code | When |
|------|------|
| `WEIGHT_SUM_INVALID` | sum=0 on create; post-write sum ≠ 1; `--set` map invalid |
| `WEIGHT_TRANSFER_REQUIRED` | add without balancing transfer |
| `WEIGHT_DONOR_INSUFFICIENT` | donor weight < requested take |
| `WEIGHT_SKILL_NOT_ON_LEVEL` | reweight target/donor missing |

## Risks / Trade-offs

- [Breaking for agents that add weight without transfer] → Clear error + skill docs; playground examples updated.
- [Floating-point drift] → ε + round-trip normalize helper after arithmetic.
- [Remove-requirement awkwardness] → v1 absorb-into or force reweight; document.
- [Legacy levels warn-only] → consumers may still see sum≠1 until authors fix via reweight.

## Migration Plan

1. Ship helpers + create normalize + patch transfer + reweight + audit.
2. Update examples/templates so shipped demos already sum to 1.
3. Authors fix legacy with `cert reweight --set …` when touching a level.
4. Rollback: revert package versions; YAML remains valid under old looser rules.

## Open Questions

- Exact decimal rounding policy for persisted weights (propose 6 dp).
- Whether `--absorb-into` on remove ships in v1 or only `cert reweight --set`.
- Whether `doctor` gets a soft warning in the same change or follow-up.
