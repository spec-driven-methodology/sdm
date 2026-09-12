import assert from "node:assert/strict";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import {
  addQuestion,
  addSkill,
  createCertification,
  createProfile,
} from "../src/index.js";
import { SdmError } from "../src/errors.js";
import { loadSkill } from "../src/skills.js";
import { buildSuggest } from "../src/suggest.js";
import { writeYamlFile } from "../src/yaml.js";
import { withTempProject } from "./helpers/temp-project.js";

function seedLevel(root: string) {
  addSkill(root, { id: "docker", name: "Docker", category: "ops" });
  addSkill(root, { id: "linux", name: "Linux", category: "ops" });
  createProfile(root, { profile: "pe", title: "Platform" });
  createCertification(root, {
    profile: "pe",
    level: "mid",
    levelTitle: "Middle",
    requirementTriples: ["docker:0.5:0.6", "linux:0.4:0.4"],
  });
}

function addOkQuestions(root: string, skill: string, n: number) {
  for (let i = 0; i < n; i++) {
    addQuestion(root, {
      skill,
      type: "single_choice",
      difficulty: 0.5,
      text: `Q ${skill} ${i}`,
      options: ["a", "b"],
      correct: [1],
    });
  }
}

describe("buildSuggest", () => {
  it("fails outside a methodology project", () => {
    const empty = mkdtempSync(join(tmpdir(), "sdm-suggest-empty-"));
    try {
      assert.throws(
        () => buildSuggest({ startDir: empty }),
        (err: unknown) =>
          err instanceof SdmError && err.code === "NOT_A_PROJECT",
      );
    } finally {
      rmSync(empty, { recursive: true, force: true });
    }
  });

  it("suggests export when questions exist and no export file", async () => {
    await withTempProject((root) => {
      seedLevel(root);
      addOkQuestions(root, "docker", 3);
      addOkQuestions(root, "linux", 3);
      const payload = buildSuggest({
        startDir: root,
        profile: "pe",
        level: "mid",
      });
      assert.equal(payload.ok, true);
      const ids = payload.suggestions.map((s) => s.id);
      assert.ok(ids.includes("export-test"), ids.join(","));
      assert.ok(ids.includes("export-course"), ids.join(","));
      const exportSug = payload.suggestions.find((s) => s.id === "export-test")!;
      assert.ok(
        exportSug.levers.some((l) => l.phrase.includes("без текстовых")),
      );
      assert.ok(
        exportSug.levers.some((l) => l.mapsTo.includes("--exclude-type open")),
      );
      const courseSug = payload.suggestions.find((s) => s.id === "export-course")!;
      assert.equal(courseSug.skill, "export-course");
      assert.match(courseSug.commandHint ?? "", /export learning/);
      assert.ok(
        courseSug.levers.some((l) => l.phrase.includes("короткая инструкция")),
      );
      assert.ok(
        courseSug.levers.some((l) => l.mapsTo.includes("--depth brief")),
      );
      assert.ok(courseSug.levers.some((l) => l.mapsTo.includes("--format notes")));
      assert.ok(courseSug.levers.some((l) => l.mapsTo.includes("--format course")));
    });
  });

  it("offers from-gaps course lever when coverage has holes", async () => {
    await withTempProject((root) => {
      seedLevel(root);
      addOkQuestions(root, "docker", 1); // thin
      const payload = buildSuggest({
        startDir: root,
        profile: "pe",
        level: "mid",
      });
      const courseSug = payload.suggestions.find((s) => s.id === "export-course");
      assert.ok(courseSug, payload.suggestions.map((s) => s.id).join(","));
      assert.match(courseSug!.commandHint ?? "", /--from-gaps/);
      assert.ok(
        courseSug!.levers.some((l) => l.mapsTo.includes("--from-gaps")),
      );
    });
  });

  it("ranks close-gaps above export when thin/missing", async () => {
    await withTempProject((root) => {
      seedLevel(root);
      addOkQuestions(root, "docker", 1); // thin
      const payload = buildSuggest({
        startDir: root,
        profile: "pe",
        level: "mid",
      });
      const ids = payload.suggestions.map((s) => s.id);
      const gapIdx = ids.indexOf("close-gaps");
      const exportIdx = ids.indexOf("export-test");
      assert.ok(gapIdx >= 0, ids.join(","));
      assert.ok(exportIdx >= 0, ids.join(","));
      assert.ok(gapIdx < exportIdx);
      const close = payload.suggestions[gapIdx];
      assert.match(close.label, /пробел/);
      assert.doesNotMatch(close.label, /дыр/);
      const phrases = payload.suggestions.flatMap((s) =>
        s.levers.map((l) => l.phrase),
      );
      for (const p of phrases) {
        assert.doesNotMatch(p, /дыр/);
      }
    });
  });

  it("suggests player when export exists but player missing", async () => {
    await withTempProject((root) => {
      seedLevel(root);
      addOkQuestions(root, "docker", 3);
      addOkQuestions(root, "linux", 3);
      rmSync(join(root, "player"), { recursive: true, force: true });
      mkdirSync(join(root, "exports"), { recursive: true });
      writeFileSync(
        join(root, "exports", "test-pe-mid.json"),
        JSON.stringify({
          schemaVersion: "sdm.export.test/v1",
          profile: "pe",
          level: "mid",
          questions: [],
        }),
        "utf8",
      );
      const payload = buildSuggest({
        startDir: root,
        profile: "pe",
        level: "mid",
      });
      assert.ok(payload.suggestions.some((s) => s.id === "player-sync"));
      assert.equal(payload.snapshot.hasExport, true);
      assert.equal(payload.snapshot.hasPlayer, false);
    });
  });

  it("keeps threshold levers distinct from volume", async () => {
    await withTempProject((root) => {
      seedLevel(root);
      addOkQuestions(root, "docker", 3);
      addOkQuestions(root, "linux", 3);
      mkdirSync(join(root, "exports"), { recursive: true });
      writeFileSync(
        join(root, "exports", "test-pe-mid.json"),
        JSON.stringify({
          schemaVersion: "sdm.export.test/v1",
          profile: "pe",
          level: "mid",
        }),
        "utf8",
      );
      // player present from init
      const payload = buildSuggest({
        startDir: root,
        profile: "pe",
        level: "mid",
      });
      const withThreshold = payload.suggestions.find((s) =>
        s.levers.some((l) => l.category === "threshold"),
      );
      assert.ok(withThreshold);
      for (const lever of withThreshold!.levers.filter(
        (l) => l.category === "threshold",
      )) {
        assert.match(lever.mapsTo, /threshold/i);
        assert.ok(!/depth|weight/i.test(lever.phrase));
      }
    });
  });

  it("ranks review-stale-content above export-test on basis mismatch", async () => {
    await withTempProject((root) => {
      seedLevel(root);
      addOkQuestions(root, "docker", 3);
      addOkQuestions(root, "linux", 3);
      const skill = loadSkill(root, "docker");
      writeYamlFile(join(root, "ontology", "skills", "docker.yaml"), {
        ...skill,
        topics: [...(skill.topics ?? []), "cgroups"],
      });
      const payload = buildSuggest({
        startDir: root,
        profile: "pe",
        level: "mid",
      });
      const ids = payload.suggestions.map((s) => s.id);
      const staleIdx = ids.indexOf("review-stale-content");
      const exportIdx = ids.indexOf("export-test");
      assert.ok(staleIdx >= 0, ids.join(","));
      assert.ok(exportIdx >= 0, ids.join(","));
      assert.ok(staleIdx < exportIdx);
    });
  });
});
