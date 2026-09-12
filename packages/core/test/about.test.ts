import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import {
  ABOUT_MCP_TOOLS,
  buildAbout,
  formatAboutText,
  getProductVersion,
  resolveSpecraHome,
} from "../src/about.js";

const REPO_ROOT = resolve(
  join(dirname(fileURLToPath(import.meta.url)), "..", "..", ".."),
);

describe("buildAbout", () => {
  it("works without a methodology project", () => {
    const payload = buildAbout({ sdmHome: REPO_ROOT });
    assert.equal(payload.ok, true);
    assert.ok(payload.positioning.what.length > 0);
    assert.ok(payload.positioning.whatNot.length >= 1);
  });

  it("version matches package.json", () => {
    const pkg = JSON.parse(
      readFileSync(join(REPO_ROOT, "package.json"), "utf8"),
    ) as { version: string };
    const payload = buildAbout({ sdmHome: REPO_ROOT });
    assert.equal(payload.version, pkg.version);
    assert.equal(getProductVersion(REPO_ROOT), pkg.version);
  });

  it("whatNot includes product boundaries", () => {
    const payload = buildAbout({ sdmHome: REPO_ROOT });
    const joined = payload.positioning.whatNot.join(" ").toLowerCase();
    assert.match(joined, /hr|тест|test/i);
    assert.match(joined, /harness|оркестратор|orchestr/i);
    assert.ok(
      joined.includes("не ") ||
        payload.positioning.whatNot.some((s) => /не\s/i.test(s)),
    );
  });

  it("positioning covers methodology-as-specs and competency owners", () => {
    const payload = buildAbout({ sdmHome: REPO_ROOT });
    const what = payload.positioning.what.toLowerCase();
    const model = payload.positioning.model.toLowerCase();
    assert.match(what, /methodology-as-specs|онтолог|ontology/i);
    assert.match(what, /библиотек|контент|library|content/i);
    assert.match(what, /профиль|порог|profile|threshold/i);
    assert.match(what, /покрыт|coverage|экспорт|export/i);
    assert.match(what, /оценк|обучен|assessment|learning/i);
    assert.match(what, /эталон|источник правды|source of truth/i);
    assert.match(model, /владельц|competency|hr|рекрутер|методолог/i);
  });

  it("tagline is Methodology-as-Specs Framework", () => {
    const payload = buildAbout({ sdmHome: REPO_ROOT });
    assert.equal(payload.tagline, "Methodology-as-Specs Framework");
    assert.notEqual(payload.tagline, "Spec-based Methodology Framework");
    assert.notEqual(payload.tagline, "Spec-based Resource Assessment Framework");
  });

  it("mcp capabilities include about and doctor", () => {
    const payload = buildAbout({ sdmHome: REPO_ROOT });
    assert.ok(payload.capabilities.mcp.includes("about"));
    assert.ok(payload.capabilities.mcp.includes("doctor"));
    assert.ok(ABOUT_MCP_TOOLS.includes("about"));
  });

  it("skills include intent-loop, explain-sdm, connect-mcp when present", () => {
    const payload = buildAbout({ sdmHome: REPO_ROOT });
    const ids = payload.capabilities.skills.map((s) => s.id);
    assert.ok(ids.includes("intent-loop"));
    assert.ok(ids.includes("connect-mcp"));
    // explain-sdm ships with this change; require when file exists
    assert.ok(
      ids.includes("explain-sdm"),
      `expected explain-sdm in skills, got: ${ids.join(", ")}`,
    );
  });

  it("nextSteps include intent-loop", () => {
    const payload = buildAbout({ sdmHome: REPO_ROOT });
    assert.ok(payload.nextSteps.some((s) => s.id === "intent-loop"));
  });

  it("nextSteps include quality-report", () => {
    const payload = buildAbout({ sdmHome: REPO_ROOT });
    assert.ok(payload.nextSteps.some((s) => s.id === "quality-report"));
  });

  it("formatAboutText is non-empty summary", () => {
    const text = formatAboutText(buildAbout({ sdmHome: REPO_ROOT }));
    assert.match(text, /SDM/);
    assert.match(text, /Не является/);
  });

  it("resolveSpecraHome accepts explicit package root", () => {
    assert.equal(resolveSpecraHome(REPO_ROOT), REPO_ROOT);
  });
});
