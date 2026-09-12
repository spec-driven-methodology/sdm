## 1. Config and quality metrics

- [x] 1.1 Extend `SdmConfigSchema` with optional `quality.distractorQuality` (`off|soft|strict`, default off) and knobs `lengthBandRatio`, `positionBiasThreshold`, `minChoiceSample`
- [x] 1.2 Add pure helpers: length-band / unique-longest evaluation + option Fisher–Yates shuffle with correct remap; seeded PRNG for export
- [x] 1.3 Unit tests for length evaluation edge cases and shuffle remap (single + multi, seeded determinism)

## 2. Export shuffle

- [x] 2.1 Wire `--shuffle-options` / `--seed` into `export test` (core + CLI); fail if seed without shuffle; set `meta.optionShuffle`
- [x] 2.2 MCP `export_test` args `shuffleOptions` / `seed` with same semantics; `--json` envelope unchanged shape aside from document meta
- [x] 2.3 Tests: default preserves order; shuffle remaps correct; same seed reproduces

## 3. Audit findings

- [x] 3.1 When policy `soft|strict`, emit position-bias and length-outlier findings + recommendations in `audit` document/text
- [x] 3.2 When policy `off`, emit neither; tests cover soft/off and sample thresholds
- [x] 3.3 Ensure `--json` includes machine-readable finding lists (question ids / share)

## 4. Question add strict gate

- [x] 4.1 On `question add` for choice types under `strict`, reject with `DISTRACTOR_QUALITY` before write; soft/off unchanged
- [x] 4.2 Tests for strict reject vs soft write; `--json` error envelope

## 5. Player option shuffle

- [x] 5.1 Load-screen checkbox «Перетасовывать варианты», `localStorage` `sdm.player.shuffleOptions`, independent of question shuffle
- [x] 5.2 On **Начать**, session-local permute options + remap correct; retake reshuffles; library entry unchanged
- [x] 5.3 Update player README follow-up note; Russian labels

## 6. Agents and docs

- [x] 6.1 Update `agents/generate-questions/SKILL.md` (and bootstrap notes if needed) for length/plausibility + audit/`distractorQuality`
- [x] 6.2 CHANGELOG: ship shuffle-options + quality policy; remove from «Запланировано»; touch README/`AGENTS.md` as needed
- [x] 6.3 Playground/smoke: `export test --shuffle-options --seed 1 --json`, `audit --json` with soft config, player sync if template changed; `npm run verify`
