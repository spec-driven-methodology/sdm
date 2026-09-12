import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  hashLevelContent,
  hashSkillContent,
} from "../src/content-basis.js";
import type { Level, Skill } from "../src/schemas.js";

describe("content basis hashes", () => {
  it("is stable for the same skill fields", () => {
    const skill: Skill = {
      id: "java-core",
      name: "Java Core",
      description: "Basics",
      category: "backend",
      depends_on: ["oop"],
      related_to: [],
      topics: ["collections", "streams"],
    };
    assert.equal(hashSkillContent(skill), hashSkillContent({ ...skill }));
  });

  it("changes when topics change", () => {
    const a: Skill = {
      id: "java-core",
      name: "Java Core",
      description: "Basics",
      depends_on: [],
      related_to: [],
      topics: ["collections"],
    };
    const b: Skill = { ...a, topics: ["collections", "streams"] };
    assert.notEqual(hashSkillContent(a), hashSkillContent(b));
  });

  it("is order-independent for topics", () => {
    const a: Skill = {
      id: "s",
      name: "S",
      description: "",
      depends_on: [],
      related_to: [],
      topics: ["b", "a"],
    };
    const b: Skill = { ...a, topics: ["a", "b"] };
    assert.equal(hashSkillContent(a), hashSkillContent(b));
  });

  it("hashes levels from requirements", () => {
    const level: Level = {
      level: "middle",
      title: "Middle",
      description: "",
      profile: "java-developer",
      threshold: 0.7,
      requirements: [
        { skill: "spring", depth: 0.6, weight: 0.5 },
        { skill: "java-core", depth: 0.8, weight: 0.5 },
      ],
    };
    const again = hashLevelContent({
      ...level,
      requirements: [...level.requirements].reverse(),
    });
    assert.equal(hashLevelContent(level), again);
  });
});
