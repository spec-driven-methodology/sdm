import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { healCourseWarnings } from "../src/course-heal.js";
import { loadAllSkills } from "../src/skills.js";
import { addSkill } from "../src/skill-write.js";
import { addTopic, loadTopics, syncTopicRegistryFromSkills } from "../src/topic-registry.js";
import { withTempProject } from "./helpers/temp-project.js";
import type { CourseModule } from "../src/export-course/types.js";

const mkMod = (skill: string, lessonTopics: string[]): CourseModule => ({
  kind: "skill",
  skill,
  title: skill,
  lessons: lessonTopics.map((t, i) => ({
    id: `${skill}--${t}`,
    topic: t,
    title: t,
    body: `Lesson about ${t}. This explains it well.`,
  })),
  practiceQuestionIds: [],
});

describe("healCourseWarnings", () => {
  it("back-fills topics from lessons into skill.topics", async () => {
    await withTempProject((root) => {
      addSkill(root, {
        id: "java",
        name: "Java",
        description: "Core Java language with collections and streams.",
        topics: [],
      });
      const modules = [mkMod("java", ["collections", "streams"])];
      const result = healCourseWarnings({ projectRoot: root, modules, warnings: [] });
      assert.ok(result.backfilledTopics.includes("java"));
      const [skill] = loadAllSkills(root);
      assert.ok(skill.topics.includes("collections"));
      assert.ok(skill.topics.includes("streams"));
    });
  });

  it("creates registry entries via syncTopicRegistryFromSkills", async () => {
    await withTempProject((root) => {
      addSkill(root, {
        id: "java",
        name: "Java",
        description: "Core Java.",
        topics: ["collections"],
      });
      const created = syncTopicRegistryFromSkills(root);
      assert.ok(created.includes("collections"));
      const topics = loadTopics(root);
      assert.equal(topics[0]?.id, "collections");
    });
  });

  it("suggests description from lesson content for thin skills", async () => {
    await withTempProject((root) => {
      addSkill(root, {
        id: "java",
        name: "Java",
        description: "short",
        topics: ["collections"],
      });
      const modules = [mkMod("java", ["collections"])];
      const result = healCourseWarnings({
        projectRoot: root,
        modules,
        warnings: [{ code: "SKILL_DESCRIPTION_THIN", message: "too short", skill: "java" }],
      });
      assert.ok(result.suggestedDescriptions.includes("java"));
      const [skill] = loadAllSkills(root);
      assert.ok((skill.description?.length ?? 0) > 20);
    });
  });

  it("is idempotent — second call does nothing", async () => {
    await withTempProject((root) => {
      addSkill(root, {
        id: "java",
        name: "Java",
        description: "Core Java language with collections.",
        topics: ["collections"],
      });
      const modules = [mkMod("java", ["collections"])];
      const r1 = healCourseWarnings({ projectRoot: root, modules, warnings: [] });
      const r2 = healCourseWarnings({ projectRoot: root, modules, warnings: [] });
      assert.equal(r2.backfilledTopics.length, 0);
    });
  });
});
