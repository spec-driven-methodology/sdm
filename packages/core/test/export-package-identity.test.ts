import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildCoursePackageId,
  buildTestPackageId,
  hashContentRevision,
} from "../src/export-package-identity.js";
import type { ContentBasis } from "../src/schemas.js";

describe("hashContentRevision", () => {
  it("is stable and ignores capturedAt", () => {
    const basis: ContentBasis = {
      skills: { java: "abc123", spring: "def456" },
      level: { id: "middle", hash: "lvl789" },
      capturedAt: "2026-01-01T00:00:00.000Z",
    };
    const other: ContentBasis = {
      ...basis,
      capturedAt: "2026-02-01T00:00:00.000Z",
    };
    assert.equal(hashContentRevision(basis), hashContentRevision(other));
    assert.match(hashContentRevision(basis), /^[a-f0-9]{16}$/);
  });

  it("changes when skill hash changes", () => {
    const a: ContentBasis = {
      skills: { java: "abc123" },
      capturedAt: "2026-01-01T00:00:00.000Z",
    };
    const b: ContentBasis = {
      skills: { java: "xyz999" },
      capturedAt: "2026-01-01T00:00:00.000Z",
    };
    assert.notEqual(hashContentRevision(a), hashContentRevision(b));
  });
});

describe("buildTestPackageId", () => {
  it("uses canonical slug without filters", () => {
    assert.equal(
      buildTestPackageId({ profile: "qa-manual", level: "junior" }),
      "test-qa-manual-junior",
    );
  });

  it("changes id when skill filter applied", () => {
    const base = buildTestPackageId({ profile: "qa-manual", level: "junior" });
    const filtered = buildTestPackageId({
      profile: "qa-manual",
      level: "junior",
      skillFilter: { mode: "include", skills: ["testing-fundamentals"] },
    });
    assert.notEqual(base, filtered);
    assert.ok(filtered.startsWith("test-qa-manual-junior-"));
  });
});

describe("buildCoursePackageId", () => {
  it("uses level course canonical slug", () => {
    assert.equal(
      buildCoursePackageId({
        scope: { mode: "profile_level", profile: "qa-manual", level: "junior" },
        depth: "brief",
        format: "course",
        includePractice: true,
        locale: "ru",
      }),
      "course-qa-manual-junior-course-brief-ru",
    );
  });

  it("differs for skill-scoped vs profile level", () => {
    const level = buildCoursePackageId({
      scope: { mode: "profile_level", profile: "backend", level: "middle" },
      depth: "standard",
      format: "howto",
      includePractice: true,
    });
    const skill = buildCoursePackageId({
      scope: { mode: "skill", skill: "java" },
      depth: "standard",
      format: "howto",
      includePractice: true,
    });
    assert.notEqual(level, skill);
  });
});
