import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SdmError } from "../src/errors.js";
import {
  ACTIVE_MIX_TYPES,
  assertTypeAndMixExclusive,
  assignTypesForMix,
  parseTypeMixPreset,
} from "../src/question-type-mix.js";

describe("question-type-mix", () => {
  it("assigns single as all single_choice", () => {
    assert.deepEqual(assignTypesForMix("single", 3), [
      "single_choice",
      "single_choice",
      "single_choice",
    ]);
  });

  it("mixed rotates active types", () => {
    assert.deepEqual(assignTypesForMix("mixed", 3), [
      "single_choice",
      "multi_choice",
      "open",
    ]);
    assert.deepEqual(ACTIVE_MIX_TYPES, [
      "single_choice",
      "multi_choice",
      "open",
    ]);
  });

  it("full matches mixed until expansion", () => {
    assert.deepEqual(assignTypesForMix("full", 4), assignTypesForMix("mixed", 4));
    assert.deepEqual(assignTypesForMix("mixed", 4), [
      "single_choice",
      "multi_choice",
      "open",
      "single_choice",
    ]);
  });

  it("rejects unknown preset", () => {
    assert.throws(
      () => parseTypeMixPreset("dropdown"),
      (err: unknown) => err instanceof SdmError && err.code === "TYPE_MIX_INVALID",
    );
  });

  it("rejects type and mix together", () => {
    assert.throws(
      () => assertTypeAndMixExclusive("multi_choice", "mixed"),
      (err: unknown) => err instanceof SdmError && err.code === "TYPE_MIX_CONFLICT",
    );
    assert.doesNotThrow(() => assertTypeAndMixExclusive("open", undefined));
    assert.doesNotThrow(() => assertTypeAndMixExclusive(undefined, "mixed"));
  });
});
