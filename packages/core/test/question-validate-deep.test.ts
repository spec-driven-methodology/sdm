import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { openSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import {
  validateQuestionLibraryDeep,
  difficultyLabel,
} from "../src/question-validate.js";
import { withTempProject } from "./helpers/temp-project.js";

function writeQ(root: string, id: string, body: Record<string, unknown>): void {
  const dir = join(root, "library", "questions");
  mkdirSync(dir, { recursive: true });
  const lines = [
    `id: ${id}`,
    `skill: ${body.skill ?? "java"}`,
    `type: ${body.type ?? "single_choice"}`,
    `difficulty: ${body.difficulty ?? 0.5}`,
    `text: ${JSON.stringify(body.text ?? `Question ${id}`)}`,
  ];
  if (body.options) {
    lines.push("options:");
    lines.push(...(body.options as string[]).map((o: string) => `  - ${JSON.stringify(o)}`));
  }
  if (body.correct !== undefined) lines.push(`correct: ${body.correct}`);
  if (body.expected) lines.push(`expected: ${JSON.stringify(body.expected)}`);
  if (body.rubric) {
    lines.push("rubric:");
    lines.push(...(body.rubric as string[]).map((r: string) => `  - ${JSON.stringify(r)}`));
  }
  writeFileSync(join(dir, `${id}.yaml`), lines.join("\n"));
}

describe("difficultyLabel", () => {
  it("maps 0..1 to easy/medium/hard", () => {
    assert.equal(difficultyLabel(0), "unknown");
    assert.equal(difficultyLabel(0.2), "easy");
    assert.equal(difficultyLabel(0.5), "medium");
    assert.equal(difficultyLabel(0.8), "hard");
  });
});

describe("validateQuestionLibraryDeep — rubric & difficulty", () => {
  it("flags missing rubric on open/code as finding", async () => {
    await withTempProject((root) => {
      writeQ(root, "q-open-no-rubric", {
        type: "open",
        expected: "short answer",
        rubric: undefined,
      });
      writeQ(root, "q-open-rubric", {
        type: "open",
        expected: "answer",
        rubric: ["0: плохо", "1: хорошо"],
      });
      const res = validateQuestionLibraryDeep(root);
      assert.ok(res.issues.some((i) => i.code === "PROBE_RUBRIC_MISSING"));
      assert.equal(res.rubricMissingCount >= 1, true);
    });
  });

  it("counts difficulty distribution", async () => {
    await withTempProject((root) => {
      writeQ(root, "q-easy", { type: "single_choice", difficulty: 0.2, options: ["a","b"], correct: 1 });
      writeQ(root, "q-hard", { type: "single_choice", difficulty: 0.9, options: ["a","b"], correct: 1 });
      const res = validateQuestionLibraryDeep(root);
      assert.equal(res.difficultySummary.easy, 1);
      assert.equal(res.difficultySummary.hard, 1);
    });
  });
});
