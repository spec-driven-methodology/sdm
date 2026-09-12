## Why

Requirement `weight` is documented as the share of the final assessment score, but Specra today only validates each weight in `0..1` and never checks that weights on a level sum to ~1. Agents can `--add-requirement` with a new weight and silently leave sum ≠ 1, or be tempted to “renormalize under the hood” and steal share from carefully set skills. Agent-first workflows need an explicit, reviewable weight model: shares in YAML, no silent redistributes, domain ops for transfer/rebalance.

## What Changes

- Treat level `weight` values as **score shares** with invariant `sum(weights) ≈ 1` (small ε).
- On `cert create`: accept absolute shares or relative weights; **normalize once** into shares that sum to 1; return the persisted shares in `--json` (visible in agent plans).
- On `cert patch --add-requirement`: **MUST NOT** auto-renormalize. Adding weight requires an explicit source (`--from` / transfer), or the write fails with a stable error when the post-write sum ≠ 1.
- New domain command `cert reweight`: transfer delta from donor skill(s), or set a full weight map; always enforce the invariant; `--json` with before/after diff.
- `audit` (and optionally `doctor` text) warn when an existing level violates the invariant.
- MCP mirrors: `cert_reweight`; extend `cert_patch` / `cert_create` args; document agent skills (intent-loop / bootstrap) so NL “усилить” maps to depth vs weight correctly.

## Non-goals

- Computing candidate pass/fail scores inside Specra (still a methodology store; weights are the contract for consumers).
- Silent equal-split or proportional renormalize on add without an explicit transfer plan.
- Changing `depth` semantics or coverage heuristics.
- Forcing migration rewrite of all existing levels on upgrade (warn first; fail only on new writes that would leave sum ≠ 1).
- Interactive TTY weight wizards as the primary UX.

## Capabilities

### New Capabilities

- `cert-reweight`: Domain op to transfer weight between skills or replace the full weight map on a level, with invariant enforcement and machine-readable before/after diff.

### Modified Capabilities

- `cert-write`: Persist normalized shares on create; enforce sum≈1; expose normalized requirements in JSON.
- `cert-patch`: Explicit weight transfer when adding; forbid silent renormalize; fail with stable codes when post-patch sum ≠ 1 (unless using reweight / transfer flags).
- `methodology-audit`: Report levels whose requirement weights do not sum to ~1.
- `mcp-server`: Expose `cert_reweight` and extended create/patch weight args.

## Impact

- `@spec-driven-methodology/core`: weight-sum helpers, create/patch/reweight write paths, audit findings, error codes (e.g. `WEIGHT_SUM_INVALID`, `WEIGHT_TRANSFER_REQUIRED`).
- `@spec-driven-methodology/cli`: `cert reweight`, flags on create/patch.
- `@spec-driven-methodology/mcp`: tool schemas.
- Docs: `CHANGELOG`, `README`, `AGENTS.md`, portable skills (`intent-loop`, `bootstrap-profile-pack`) — clarify depth vs weight and HITL weight diffs.
- Agent-first: incomplete “add kubernetes” without “from whom” is a clarify/plan gate, not a silent write.
