import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  collectGlossaryMissingTerms,
  collectDuplicateLessons,
} from "../src/export-course.js";
import type { CourseModule } from "../src/export-course.js";

const lesson = (id: string, body: string) => ({ id, title: id, body });

const mod = (skill: string, lessons: ReturnType<typeof lesson>[]): CourseModule => ({
  kind: "skill",
  skill,
  title: skill,
  lessons,
  practiceQuestionIds: [],
});

describe("collectGlossaryMissingTerms", () => {
  it("flags technical terms in lesson bodies missing from glossary", () => {
    const modules = [
      mod("llm", [
        lesson("llm--webclient", "**WebClient** — реактивный HTTP-клиент для вызовов к LLM API."),
      ]),
    ];
    const warnings = collectGlossaryMissingTerms(modules, ["llm"], ["webclient"]);
    assert.ok(warnings.some((w) => w.code === "GLOSSARY_MISSING_TERM"));
    assert.ok(warnings.some((w) => w.message.includes("webclient")));
  });

  it("does not flag terms already in glossary", () => {
    const modules = [mod("llm", [lesson("llm--webclient", "WebClient является клиентом.")])];
    const warnings = collectGlossaryMissingTerms(modules, ["webclient"], ["webclient"]);
    assert.equal(warnings.length, 0);
  });

  it("skips overview modules", () => {
    const overview: CourseModule = {
      kind: "overview",
      skill: "course-overview",
      title: "О курсе",
      lessons: [lesson("course-overview--about", "Термин kafka в обзоре.")],
      practiceQuestionIds: [],
    };
    const warnings = collectGlossaryMissingTerms([overview], [], ["kafka"]);
    assert.equal(warnings.length, 0);
  });
});

describe("collectDuplicateLessons", () => {
  it("flags near-duplicate lesson bodies in same module", () => {
    const bodyA = "Доменное событие фиксирует факт в домене и важно для других частей системы. Оно позволяет агрегатам общаться без прямой связи.";
    const modules = [mod("ddd", [lesson("ddd--1", bodyA), lesson("ddd--2", bodyA)])];
    const warnings = collectDuplicateLessons(modules);
    assert.ok(warnings.some((w) => w.code === "LESSON_DUPLICATE"));
  });

  it("does not flag distinct lessons", () => {
    const modules = [
      mod("ddd", [
        lesson("ddd--1", "Доменное событие фиксирует факт в домене и важно для других частей системы."),
        lesson("ddd--2", "Агрегат инкапсулирует бизнес-правила и гарантирует консистентность изменений."),
      ]),
    ];
    const warnings = collectDuplicateLessons(modules);
    assert.equal(warnings.length, 0);
  });
});
