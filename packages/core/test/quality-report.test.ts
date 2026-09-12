import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import {
  addQuestion,
  addSkill,
  buildQualityReport,
  createCertification,
  createProfile,
  DENSITY_SYMBOL,
  formatQualityReportText,
  loadQualityReport,
  resolveLocale,
  scanCorpusSources,
  SdmError,
} from "../src/index.js";
import { withTempProject } from "./helpers/temp-project.js";

const FIXTURES = join(
  dirname(fileURLToPath(import.meta.url)),
  "fixtures",
  "corpus",
);

describe("resolveLocale", () => {
  it("defaults to ru", () => {
    const prev = process.env.SDM_LOCALE;
    delete process.env.SDM_LOCALE;
    try {
      assert.equal(resolveLocale(undefined), "ru");
    } finally {
      if (prev !== undefined) process.env.SDM_LOCALE = prev;
    }
  });

  it("honors explicit en", () => {
    assert.equal(resolveLocale("en"), "en");
  });
});

describe("corpus scan", () => {
  it("classifies fixture markdown", () => {
    const manifest = scanCorpusSources({ sourcesDir: FIXTURES });
    assert.equal(manifest.schemaVersion, "sdm.corpus.manifest/v1");
    assert.ok(manifest.entries.length >= 3);
    const bank = manifest.entries.find((e) => e.path.includes("qa-bank"));
    assert.ok(bank);
    assert.equal(bank!.artifactType, "question_bank");
    assert.ok(bank!.signals.includes("multi_correct_mcq"));
    const stub = manifest.entries.find((e) => e.path.includes("stub"));
    assert.ok(stub);
    assert.equal(stub!.artifactType, "stub");
  });
});

describe("quality report", () => {
  it("builds corpus report with RU summary and matrix symbols", () => {
    const run = buildQualityReport({
      sourcesDir: FIXTURES,
      locale: "ru",
    });
    assert.equal(run.document.schemaVersion, "sdm.quality.report/v1");
    assert.equal(run.document.mode, "corpus");
    assert.ok(run.document.summaryRu.length > 20);
    assert.ok(run.document.glossary.some((g) => g.term === "SSOT"));
    assert.ok(run.document.matrix.cells.length > 0);
    assert.ok(
      run.document.matrix.cells.every((c) =>
        Object.values(DENSITY_SYMBOL).includes(c.symbol),
      ),
    );
    const text = formatQualityReportText(run.document, "ru");
    assert.match(text, /●/);
    assert.match(text, /Глоссарий/);
  });

  it("builds methodology report, saves, and diffs", async () => {
    await withTempProject((root) => {
      addSkill(root, {
        id: "docker",
        name: "Docker",
        description: "Containers and images for deployment workflows",
        topics: ["images", "compose", "networking"],
      });
      createProfile(root, { profile: "pe", title: "Platform" });
      createCertification(root, {
        profile: "pe",
        level: "mid",
        levelTitle: "Middle",
        requirementTriples: ["docker:0.5:1"],
      });
      addQuestion(root, {
        skill: "docker",
        type: "single_choice",
        difficulty: 0.5,
        text: "What is a container?",
        options: ["a", "b"],
        correct: [1],
      });

      const first = buildQualityReport({
        startDir: root,
        profile: "pe",
        level: "mid",
        save: true,
        locale: "ru",
      });
      assert.equal(first.document.mode, "methodology");
      assert.ok(first.document.savedPath);
      assert.equal(first.projectRoot, root);

      for (let i = 0; i < 4; i++) {
        addQuestion(root, {
          skill: "docker",
          type: "single_choice",
          difficulty: 0.5,
          text: `Extra docker question ${i}`,
          options: ["a", "b"],
          correct: [1],
        });
      }

      const second = buildQualityReport({
        startDir: root,
        profile: "pe",
        level: "mid",
        diffReportId: first.document.id,
        save: true,
        locale: "ru",
      });
      assert.equal(second.document.mode, "diff");
      assert.ok(second.document.diff);
      assert.equal(second.document.diff!.baselineId, first.document.id);

      const loaded = loadQualityReport(first.reportsRoot, first.document.id);
      assert.equal(loaded.id, first.document.id);
    });
  });

  it("throws QUALITY_REPORT_NOT_FOUND for missing diff id", async () => {
    await withTempProject((root) => {
      assert.throws(
        () =>
          buildQualityReport({
            startDir: root,
            diffReportId: "no-such-report",
          }),
        (err: unknown) =>
          err instanceof SdmError && err.code === "QUALITY_REPORT_NOT_FOUND",
      );
    });
  });
});
