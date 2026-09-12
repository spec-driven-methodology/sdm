import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { labelDepth, formatDepthBand, DEPTH_BANDS } from "../src/depth-bands.js";

describe("labelDepth", () => {
  it("maps depth to nearest band below", () => {
    assert.equal(labelDepth(0).band, "L0");
    assert.equal(labelDepth(0.5).band, "L1");
    assert.equal(labelDepth(0.6).band, "L2");
    assert.equal(labelDepth(0.85).band, "L3");
    assert.equal(labelDepth(1).band, "L3");
  });

  it("formatDepthBand includes band and numeric depth", () => {
    assert.match(formatDepthBand(0.5), /L1/);
    assert.match(formatDepthBand(0.5), /0\.5/);
  });

  it("exposes four canonical bands", () => {
    assert.equal(DEPTH_BANDS.length, 4);
  });
});
