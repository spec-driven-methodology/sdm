import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  evaluateOptionLengthQuality,
  evaluatePositionBias,
  mulberry32,
  shuffleChoiceOptions,
  shuffleDocumentQuestions,
} from "../src/distractor-quality.js";
import type { Question } from "../src/schemas.js";

describe("distractor-quality", () => {
  it("flags short distractors outside length band", () => {
    const r = evaluateOptionLengthQuality(
      {
        type: "single_choice",
        options: [
          "A reasonably long correct explanation about the topic",
          "short",
          "tiny",
          "nope",
        ],
        correct: 1,
      },
      0.5,
    );
    assert.equal(r.ok, false);
    assert.ok(r.reasons.some((x) => x.includes("distractor")));
  });

  it("passes balanced option lengths", () => {
    const r = evaluateOptionLengthQuality({
      type: "single_choice",
      options: [
        "Correct answer text here ok",
        "Wrong but similar length aa",
        "Another wrong of same size",
        "Fourth option matching len",
      ],
      correct: 2,
    });
    assert.equal(r.ok, true);
  });

  it("flags uniquely longest correct outlier", () => {
    const r = evaluateOptionLengthQuality({
      type: "single_choice",
      options: [
        "This is a much longer correct option that stands out visually",
        "short one",
        "short two",
        "short 3",
      ],
      correct: 1,
    });
    assert.equal(r.ok, false);
    assert.ok(r.reasons.some((x) => x.includes("uniquely longest")));
  });

  it("shuffles options and remaps single_choice correct", () => {
    const options = ["A", "B", "C", "D"];
    const { options: out, correct } = shuffleChoiceOptions(
      options,
      1,
      mulberry32(7),
    );
    assert.deepEqual([...out].sort(), [...options].sort());
    assert.equal(out[(correct as number) - 1], "A");
  });

  it("shuffles options and remaps multi_choice correct set", () => {
    const options = ["A", "B", "C", "D"];
    const { options: out, correct } = shuffleChoiceOptions(
      options,
      [1, 3],
      mulberry32(99),
    );
    const idxs = correct as number[];
    const texts = idxs.map((i) => out[i - 1]).sort();
    assert.deepEqual(texts, ["A", "C"]);
  });

  it("seeded document shuffle is deterministic", () => {
    const questions: Question[] = [
      {
        id: "q1",
        skill: "docker",
        difficulty: 0.3,
        type: "single_choice",
        text: "t",
        options: ["A", "B", "C", "D"],
        correct: 1,
        topics: [],
      },
    ];
    const a = shuffleDocumentQuestions(questions, 42);
    const b = shuffleDocumentQuestions(questions, 42);
    assert.deepEqual(a[0]!.options, b[0]!.options);
    assert.equal(a[0]!.correct, b[0]!.correct);
  });

  it("position bias triggers above threshold", () => {
    const qs: Question[] = Array.from({ length: 5 }, (_, i) => ({
      id: `q${i}`,
      skill: "docker",
      difficulty: 0.3,
      type: "single_choice" as const,
      text: "t",
      options: ["a", "b", "c", "d"],
      correct: 1,
      topics: [],
    }));
    const r = evaluatePositionBias(qs, {
      positionBiasThreshold: 0.6,
      minChoiceSample: 5,
    });
    assert.equal(r.triggered, true);
    assert.equal(r.share, 1);
  });
});
