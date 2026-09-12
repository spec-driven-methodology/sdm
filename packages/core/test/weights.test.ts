import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SdmError } from "../src/errors.js";
import {
  assertWeightSum,
  normalizeWeights,
  parseWeightSet,
  parseWeightTransfer,
  sumWeights,
  weightSumIsValid,
} from "../src/weights.js";

describe("weights helpers", () => {
  it("accepts sums within epsilon of 1", () => {
    assert.equal(weightSumIsValid(1), true);
    assert.equal(weightSumIsValid(1.0000004), true);
    assert.equal(weightSumIsValid(1.1), false);
  });

  it("normalizes non-unit positive weights", () => {
    const { weights, normalized } = normalizeWeights([0.4, 0.3, 0.2]);
    assert.equal(normalized, true);
    assert.ok(weightSumIsValid(sumWeights(weights)));
    assert.ok(weights[0]! > weights[1]!);
  });

  it("does not mark already-valid weights as normalized", () => {
    const { weights, normalized } = normalizeWeights([0.4, 0.3, 0.2, 0.1]);
    assert.equal(normalized, false);
    assert.deepEqual(weights, [0.4, 0.3, 0.2, 0.1]);
  });

  it("rejects zero total", () => {
    assert.throws(
      () => normalizeWeights([0, 0]),
      (err: unknown) =>
        err instanceof SdmError && err.code === "WEIGHT_SUM_INVALID",
    );
  });

  it("assertWeightSum throws on drift", () => {
    assert.throws(
      () => assertWeightSum([0.5, 0.6]),
      (err: unknown) =>
        err instanceof SdmError && err.code === "WEIGHT_SUM_INVALID",
    );
  });

  it("parses transfer and set strings", () => {
    assert.deepEqual(parseWeightTransfer("docker:0.05"), {
      skill: "docker",
      amount: 0.05,
    });
    assert.deepEqual(parseWeightSet("java-core=0.35"), {
      skill: "java-core",
      weight: 0.35,
    });
  });
});
