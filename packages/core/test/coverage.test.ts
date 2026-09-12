import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeCoverage, MIN_OK_QUESTIONS } from "../src/coverage.js";
import type { Level, Question, Skill } from "../src/schemas.js";

function levelWith(skill: string, depth = 0.7): Level {
  return {
    level: "middle",
    title: "Middle",
    description: "",
    profile: "demo-role",
    requirements: [{ skill, depth, weight: 0.5 }],
    threshold: 0.7,
  };
}

function questionsFor(
  skill: string,
  count: number,
  difficulty = 0.5,
): Question[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `q-${skill}-${i + 1}`,
    skill,
    difficulty,
    type: "open" as const,
    text: `Question ${i + 1}`,
    topics: [],
  }));
}

describe("computeCoverage", () => {
  it("marks missing when there are zero questions", () => {
    const result = computeCoverage(levelWith("docker"), []);
    assert.equal(result.skills[0]?.status, "missing");
    assert.equal(result.hasMissing, true);
    assert.equal(result.skills[0]?.achievedDepth, 0);
  });

  it("marks thin when below MIN_OK_QUESTIONS", () => {
    const result = computeCoverage(
      levelWith("docker", 0.5),
      questionsFor("docker", MIN_OK_QUESTIONS - 1, 0.5),
    );
    assert.equal(result.skills[0]?.status, "thin");
    assert.equal(result.hasMissing, false);
    assert.equal(result.hasThin, true);
  });

  it("marks thin when depth ratio is below 0.9 even with enough questions", () => {
    const result = computeCoverage(
      levelWith("docker", 0.8),
      questionsFor("docker", MIN_OK_QUESTIONS, 0.4),
    );
    assert.equal(result.skills[0]?.status, "thin");
    assert.ok((result.skills[0]?.depthRatio ?? 1) < 0.9);
    assert.ok(result.skills[0]?.missingDifficultyBand);
  });

  it("marks ok when count and depth are sufficient", () => {
    const result = computeCoverage(
      levelWith("docker", 0.5),
      questionsFor("docker", MIN_OK_QUESTIONS, 0.5),
    );
    assert.equal(result.skills[0]?.status, "ok");
    assert.equal(result.skills[0]?.questionCount, MIN_OK_QUESTIONS);
    assert.equal(result.skills[0]?.achievedDepth, 0.5);
  });

  it("reports uncovered topics when skill topics are provided", () => {
    const skill: Skill = {
      id: "docker",
      name: "Docker",
      description: "",
      depends_on: [],
      related_to: [],
      topics: ["networking", "images"],
    };
    const qs = questionsFor("docker", MIN_OK_QUESTIONS, 0.8);
    qs[0]!.topics = ["images"];
    const result = computeCoverage(levelWith("docker", 0.5), qs, {
      skillsById: new Map([["docker", skill]]),
    });
    assert.deepEqual(result.skills[0]?.uncoveredTopics, ["networking"]);
    assert.equal(result.skills[0]?.status, "ok");
    assert.equal(result.coverageMode, "legacy");
    assert.deepEqual(result.workItems, []);
  });

  it("blueprint mode marks thin when topics uncovered despite count/depth", () => {
    const skill: Skill = {
      id: "docker",
      name: "Docker",
      description: "",
      depends_on: [],
      related_to: [],
      topics: ["networking", "images"],
    };
    const qs = questionsFor("docker", MIN_OK_QUESTIONS, 0.8);
    qs[0]!.topics = ["images"];
    const result = computeCoverage(levelWith("docker", 0.5), qs, {
      skillsById: new Map([["docker", skill]]),
      quality: {
        distractorQuality: "off",
        lengthBandRatio: 0.5,
        positionBiasThreshold: 0.6,
        minChoiceSample: 5,
        coverageMode: "blueprint",
        writeGate: "off",
        skillGate: "off",
        nearDupThreshold: 0.85,
        requireExplanation: false,
        minSkillTopics: 3,
        minSkillDescriptionLength: 20,
        minTopicsCoveredRatio: 1,
        minDistinctTypes: 0,
        minQuestions: 0,
      },
    });
    assert.equal(result.skills[0]?.status, "thin");
    assert.ok(result.skills[0]?.reasons.includes("uncovered_topics"));
    assert.ok(result.workItems.some((w) => w.topic === "networking"));
  });
});
