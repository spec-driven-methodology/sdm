## 1. Core weight helpers

- [x] 1.1 Add `packages/core/src/weights.ts`: `WEIGHT_SUM_EPSILON`, `sumWeights`, `assertWeightSum`, `normalizeWeights`, round-to-precision helper; export from package index
- [x] 1.2 Add SdmError codes: `WEIGHT_SUM_INVALID`, `WEIGHT_TRANSFER_REQUIRED`, `WEIGHT_DONOR_INSUFFICIENT`, `WEIGHT_SKILL_NOT_ON_LEVEL`
- [x] 1.3 Unit tests for normalize / assert / floating-point edge cases

## 2. cert create normalize

- [x] 2.1 Wire normalize-on-create into `cert-write` (default on); honor `--no-normalize-weights` for strict fail
- [x] 2.2 Include persisted requirements + `weightsNormalized` (or equivalent) in create `--json`
- [x] 2.3 Tests: relative/non-unit sum → shares; strict mode fails; zero-sum fails

## 3. cert patch transfer / absorb

- [x] 3.1 Extend `patchCertification` + CLI: `--from skill:amount` (repeatable), `--absorb-into` on remove
- [x] 3.2 Fail add without balancing transfer when post-sum ≠ 1 (`WEIGHT_TRANSFER_REQUIRED`); never silent renormalize
- [x] 3.3 Tests for add+from, insufficient donor, remove+absorb, remove without absorb

## 4. cert reweight

- [x] 4.1 Implement `packages/core/src/cert-reweight.ts` (transfer delta + full `--set` map)
- [x] 4.2 CLI `sdm cert reweight --level … [--skill --delta --from…] [--set skill=w…] [--json]`
- [x] 4.3 Core + CLI tests for transfer, set map, error codes, before/after JSON

## 5. Audit finding

- [x] 5.1 Add weight-sum findings to methodology audit document + recommendation pointing at `cert reweight`
- [x] 5.2 Test: drifted level appears; healthy levels do not

## 6. MCP

- [x] 6.1 Register `cert_reweight` tool; extend `cert_patch` / `cert_create` schemas for transfer / no-normalize flags
- [x] 6.2 MCP handler tests for reweight + patch-with-from happy paths

## 7. Docs, skills, verify

- [x] 7.1 CHANGELOG `[Unreleased]`, README command table, AGENTS.md; note depth vs weight in `intent-loop` / `bootstrap-profile-pack`
- [x] 7.2 `npm run verify` in `specra/`
- [x] 7.3 Playground smoke: create with non-unit weights (normalized); add skill with `--from`; `cert reweight --set`; `audit --json` shows clean or expected finding
