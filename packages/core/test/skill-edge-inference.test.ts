import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { inferEdgesFromContent } from "../src/skill-edge-inference.js";
import type { Skill } from "../src/schemas.js";

const skill = (partial: Partial<Skill> & { id: string; name: string }): Skill => ({
  description: "",
  category: undefined,
  depends_on: [],
  related_to: [],
  topics: [],
  topic_labels: {},
  ...partial,
});

describe("inferEdgesFromContent", () => {
  it("suggests related_to when a skill mentions another in description/topics", () => {
    const skills: Skill[] = [
      skill({
        id: "spring-boot",
        name: "Spring Boot",
        description: "DI, конфигурация, стартеры. Интеграция с jpa и kafka.",
        topics: ["bootstrap", "jpa"],
      }),
      skill({ id: "jpa", name: "JPA / Hibernate", description: "Сущности, маппинг." }),
      skill({ id: "kafka", name: "Apache Kafka", description: "Брокер сообщений." }),
      skill({ id: "docker", name: "Docker", description: "Контейнеры." }),
    ];
    const edges = inferEdgesFromContent(skills);
    const fromSpring = edges.filter((e) => e.from === "spring-boot");
    assert.ok(fromSpring.some((e) => e.to === "jpa" && e.kind === "related_to"));
    assert.ok(fromSpring.some((e) => e.to === "kafka" && e.kind === "related_to"));
    assert.equal(fromSpring.some((e) => e.to === "docker"), false);
  });

  it("does not duplicate existing edges", () => {
    const skills: Skill[] = [
      skill({
        id: "spring-boot",
        name: "Spring Boot",
        description: "Работает с jpa и kafka.",
        depends_on: ["jpa"],
        related_to: ["kafka"],
      }),
      skill({ id: "jpa", name: "JPA", description: "" }),
      skill({ id: "kafka", name: "Kafka", description: "" }),
    ];
    const edges = inferEdgesFromContent(skills);
    assert.equal(edges.filter((e) => e.from === "spring-boot").length, 0);
  });

  it("suggests related_to for reversed depends_on", () => {
    const skills: Skill[] = [
      skill({ id: "a", name: "A", description: "" }),
      skill({ id: "b", name: "B", description: "", depends_on: ["a"] }),
    ];
    const edges = inferEdgesFromContent(skills);
    assert.ok(edges.some((e) => e.from === "a" && e.to === "b" && e.kind === "related_to"));
  });
});
