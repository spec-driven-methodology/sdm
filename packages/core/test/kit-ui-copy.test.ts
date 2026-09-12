import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { kitEmptyProbesHtml, kitModuleDisplayTitle } from "../src/kit-ui-copy.js";
import type { Skill } from "../src/schemas.js";

describe("kitModuleDisplayTitle", () => {
  it("prefers Russian description when name is English-only", () => {
    const skill: Skill = {
      id: "ai-chat-exploratory",
      name: "Exploratory chat testing",
      description:
        "Исследовательское тестирование диалогов: multi-turn, сдвиг персоны.",
      depends_on: [],
      related_to: [],
      topics: [],
    };
    assert.match(kitModuleDisplayTitle(skill), /Исследовательское тестирование/);
  });
});

describe("kitEmptyProbesHtml", () => {
  it("mentions assessment count when present", () => {
    const html = kitEmptyProbesHtml({
      skillId: "ai-chat-exploratory",
      assessmentQuestionCount: 5,
    });
    assert.match(html, /5/);
    assert.match(html, /тестов.*экспорт/);
    assert.match(html, /Библиотеке SDM/);
  });
});
