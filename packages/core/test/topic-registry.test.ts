import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { join } from "node:path";
import { existsSync } from "node:fs";
import {
  buildTopicRegistry,
  syncTopicRegistryFromSkills,
  addTopic,
  mergeRegistryLabelsIntoSkills,
  loadTopics,
} from "../src/topic-registry.js";
import { addSkill } from "../src/skill-write.js";
import { addQuestion } from "../src/question-add.js";
import { loadAllSkills } from "../src/skills.js";
import { withTempProject } from "./helpers/temp-project.js";

describe("topic-registry", () => {
  it("reports unregistered skill topics and orphan question topics", async () => {
    await withTempProject((root) => {
      addSkill(root, {
        id: "java",
        name: "Java",
        description: "Core Java language with collections and streams.",
        topics: ["collections", "streams"],
      });
      addQuestion(root, {
        skill: "java",
        type: "single_choice",
        difficulty: 0.4,
        text: "What is a List?",
        id: "q-java-001",
        explanation: "Ordered collection.",
        options: ["ArrayList", "HashMap"],
        correct: 1,
        topics: ["collections", "jmm"],
      });
      const idx = buildTopicRegistry(root);
      assert.deepEqual(idx.unregisteredFromSkills, ["collections", "streams"]);
      assert.deepEqual(idx.orphanQuestionTopics, ["jmm"]);
      assert.equal(idx.registered.size, 0);
    });
  });

  it("sync creates YAML files for skill topics with label from topic_labels", async () => {
    await withTempProject((root) => {
      addSkill(root, {
        id: "llm",
        name: "LLM",
        description: "LLM integration with HTTP clients and resilience.",
        topics: ["http-client"],
        topicLabels: { "http-client": "HTTP-клиент для LLM" },
      });
      const created = syncTopicRegistryFromSkills(root);
      assert.deepEqual(created, ["http-client"]);
      const [topic] = loadTopics(root);
      assert.equal(topic?.label, "HTTP-клиент для LLM");
      assert.ok(existsSync(join(root, "library", "topics", "http-client.yaml")));
    });
  });

  it("addTopic persists and validates", async () => {
    await withTempProject((root) => {
      const topic = addTopic(root, { id: "cqrs", label: "CQRS" });
      assert.equal(topic.label, "CQRS");
      const loaded = loadTopics(root);
      assert.equal(loaded[0]?.id, "cqrs");
    });
  });

  it("mergeRegistryLabelsIntoSkills writes topic_labels into skill YAML", async () => {
    await withTempProject((root) => {
      addSkill(root, {
        id: "java",
        name: "Java",
        description: "Core Java.",
        topics: ["collections"],
      });
      addTopic(root, { id: "collections", label: "Коллекции" });
      const updated = mergeRegistryLabelsIntoSkills(root);
      assert.equal(updated, 1);
      const skill = loadAllSkills(root)[0]!;
      assert.equal(skill.topic_labels?.["collections"], "Коллекции");
    });
  });
});
