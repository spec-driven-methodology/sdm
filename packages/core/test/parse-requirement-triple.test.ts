import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SdmError } from "../src/errors.js";
import { parseRequirementTriple } from "../src/cert-write.js";

describe("parseRequirementTriple", () => {
  it("parses a valid skill:depth:weight triple", () => {
    const req = parseRequirementTriple("docker:0.7:0.5");
    assert.deepEqual(req, { skill: "docker", depth: 0.7, weight: 0.5 });
  });

  it("rejects malformed triples with VALIDATION_FAILED", () => {
    assert.throws(
      () => parseRequirementTriple("docker:0.7"),
      (err: unknown) =>
        err instanceof SdmError && err.code === "VALIDATION_FAILED",
    );
    assert.throws(
      () => parseRequirementTriple("docker:2:0.5"),
      (err: unknown) =>
        err instanceof SdmError && err.code === "VALIDATION_FAILED",
    );
  });
});
