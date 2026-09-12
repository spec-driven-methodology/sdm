import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  extractTopicsFromModules,
  mergeTopicsIntoSkill,
  suggestDescriptionFromModules,
} from "../src/export-course.js";
import type { CourseModule } from "../src/export-course.js";

const mkModule = (skill: string, lessons: Array<{ topic?: string; title: string; body?: string }>): CourseModule => ({
  skill,
  title: skill,
  lessons: lessons.map((l) => ({ id: `${skill}--${l.topic ?? l.title}`, topic: l.topic, title: l.title, body: l.body ?? "" })),
  practiceQuestionIds: [],
});

describe("extractTopicsFromModules (reverse topic extraction)", () => {
  it("collects lesson topics per skill", () => {
    const modules = [
      mkModule("spring-boot", [
        { topic: "bootstrap", title: "Bootstrap" },
        { topic: "configuration", title: "Конфигурация" },
        { topic: "di", title: "DI" },
      ]),
      mkModule("docker", [{ topic: "dockerfile", title: "Dockerfile" }]),
    ];
    const topics = extractTopicsFromModules(modules);
    assert.deepEqual(topics.get("spring-boot"), ["bootstrap", "configuration", "di"]);
    assert.deepEqual(topics.get("docker"), ["dockerfile"]);
  });

  it("skips overview modules", () => {
    const overview: CourseModule = {
      kind: "overview",
      skill: "course-overview",
      title: "О курсе",
      lessons: [{ id: "course-overview--about", topic: "about", title: "Что это за курс", body: "" }],
      practiceQuestionIds: [],
    };
    const topics = extractTopicsFromModules([overview, mkModule("java", [{ topic: "collections", title: "Коллекции" }])]);
    assert.equal(topics.has("course-overview"), false);
    assert.deepEqual(topics.get("java"), ["collections"]);
  });
});

describe("mergeTopicsIntoSkill", () => {
  it("unions declared + course topics without removing declared", () => {
    assert.deepEqual(mergeTopicsIntoSkill(["a"], ["b", "a", "c"]), ["a", "b", "c"]);
  });
});

describe("suggestDescriptionFromModules", () => {
  it("builds a summary from lesson titles and first paragraphs", () => {
    const mods = [
      mkModule("kafka", [
        { topic: "consumer", title: "Consumer", body: "**Consumer** читает сообщения из топиков." },
        { topic: "producer", title: "Producer", body: "**Producer** отправляет сообщения." },
      ]),
    ];
    const desc = suggestDescriptionFromModules(mods, "kafka");
    assert.ok(desc && desc.includes("Consumer"));
    assert.ok(desc.includes("Producer"));
  });

  it("returns undefined for unknown skill", () => {
    assert.equal(suggestDescriptionFromModules([], "nope"), undefined);
  });
});
