import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SdmError, parseIntentPlanJson, validateIntentPlan } from "../src/index.js";

const validPlan = {
  schema: "sdm.intent.plan/v1",
  kind: "profile-pack",
  profile: { id: "java-developer", title: "Java Developer" },
  level: { id: "middle", title: "Middle" },
  skills: [
    {
      id: "java-core",
      name: "Java Core",
      category: "backend",
      description: "Core language",
    },
  ],
  requirements: [{ skill: "java-core", depth: 0.6, weight: 1 }],
};

describe("intent plan", () => {
  it("accepts a valid profile-pack plan", () => {
    const result = validateIntentPlan(validPlan);
    assert.equal(result.ok, true);
    assert.equal(result.plan.profile.id, "java-developer");
    assert.equal(result.plan.seed.questionsPerSkill, 3);
  });

  it("rejects missing profile id", () => {
    assert.throws(
      () =>
        validateIntentPlan({
          ...validPlan,
          profile: { id: "", title: "X" },
        }),
      (err: unknown) => err instanceof SdmError && err.code === "INTENT_PLAN_INVALID",
    );
  });

  it("rejects requirement skill not in skills[]", () => {
    assert.throws(
      () =>
        validateIntentPlan({
          ...validPlan,
          requirements: [{ skill: "missing", depth: 0.5, weight: 1 }],
        }),
      /not in skills/,
    );
  });

  it("parseIntentPlanJson rejects non-JSON", () => {
    assert.throws(
      () => parseIntentPlanJson("not-json"),
      (err: unknown) => err instanceof SdmError && err.code === "INTENT_PLAN_INVALID",
    );
  });

  it("accepts seed.typeMix mixed", () => {
    const result = validateIntentPlan({
      ...validPlan,
      seed: {
        questionsPerSkill: 3,
        difficultyMin: 0.3,
        difficultyMax: 0.7,
        type: "single_choice",
        typeMix: "mixed",
      },
    });
    assert.equal(result.plan.seed.typeMix, "mixed");
  });

  it("defaults typeMix to single", () => {
    const result = validateIntentPlan(validPlan);
    assert.equal(result.plan.seed.typeMix, "single");
  });

  it("rejects invalid typeMix", () => {
    assert.throws(
      () =>
        validateIntentPlan({
          ...validPlan,
          seed: {
            questionsPerSkill: 3,
            difficultyMin: 0.3,
            difficultyMax: 0.7,
            type: "single_choice",
            typeMix: "dropdown",
          },
        }),
      (err: unknown) => err instanceof SdmError && err.code === "INTENT_PLAN_INVALID",
    );
  });
});
