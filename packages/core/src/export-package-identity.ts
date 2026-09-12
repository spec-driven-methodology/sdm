import { createHash } from "node:crypto";
import type { ExportQuestionFilter } from "./export-question-filter.js";
import type { ExportSkillFilter } from "./export-skill-filter.js";
import type { ExportTypeFilter } from "./export-type-filter.js";
import type { ContentBasis } from "./schemas.js";

/** Scope fields that define a distinct learning export slot (mirrors CourseScopeMeta). */
export interface CoursePackageScopeIdentity {
  mode:
    | "profile_level"
    | "from_gaps"
    | "skill"
    | "topic"
    | "from_questions"
    | "topic_in_level";
  profile?: string;
  level?: string;
  skill?: string;
  topic?: string;
  questionIds?: string[];
}

function sha16(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex").slice(0, 16);
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((v) => stableStringify(v)).join(",")}]`;
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort((a, b) => a.localeCompare(b));
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(",")}}`;
}

function slugPart(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

function sortedRecord(record: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of Object.keys(record).sort((a, b) => a.localeCompare(b))) {
    out[key] = record[key]!;
  }
  return out;
}

/** Content fingerprint for consumer upsert (basis without capturedAt). */
export function hashContentRevision(basis: ContentBasis): string {
  const payload: Record<string, unknown> = {};
  if (basis.skills && Object.keys(basis.skills).length > 0) {
    payload.skills = sortedRecord(basis.skills);
  }
  if (basis.level) {
    payload.level = { id: basis.level.id, hash: basis.level.hash };
  }
  if (basis.terms && Object.keys(basis.terms).length > 0) {
    payload.terms = sortedRecord(basis.terms);
  }
  return sha16(stableStringify(payload));
}

/**
 * Per-module content fingerprint for diff: hashes the module's own shape
 * (skill id + lesson ids/topics/titles), so changing one lesson updates only
 * that module's hash — unlike the global `meta.revision`.
 */
export function hashModuleRevision(module: unknown): string {
  return sha16(stableStringify(module));
}

/**
 * Build a per-module revision map `{ [skillId]: hash, … }` from course modules.
 * Skill modules key by `mod.skill`; the overview module (kind=overview) uses
 * its constant synthetic id `course-overview` as key.
 */
export function buildRevisionByModule<T extends { skill: string; kind?: string }>(
  modules: T[],
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const mod of modules) {
    const key = mod.kind === "overview" ? "course-overview" : mod.skill;
    out[key] = hashModuleRevision(mod);
  }
  return out;
}

export interface TestPackageIdentityInput {
  profile: string;
  level: string;
  team?: string;
  adaptive?: boolean;
  seed?: number;
  perSkill?: number;
  typeFilter?: ExportTypeFilter;
  skillFilter?: ExportSkillFilter;
  questionFilter?: ExportQuestionFilter;
}

function testIdentityPayload(input: TestPackageIdentityInput): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    kind: "test",
    profile: input.profile,
    level: input.level,
  };
  if (input.team) payload.team = input.team;
  if (input.adaptive) {
    payload.adaptive = true;
    payload.seed = input.seed ?? 42;
    payload.perSkill = input.perSkill ?? 3;
  }
  if (input.typeFilter) payload.typeFilter = input.typeFilter;
  if (input.skillFilter) payload.skillFilter = input.skillFilter;
  if (input.questionFilter) payload.questionFilter = input.questionFilter;
  return payload;
}

function isDefaultTestIdentity(input: TestPackageIdentityInput): boolean {
  return (
    !input.team &&
    !input.adaptive &&
    !input.typeFilter &&
    !input.skillFilter &&
    !input.questionFilter
  );
}

/** Deterministic upsert slot id for export test JSON. */
export function buildTestPackageId(input: TestPackageIdentityInput): string {
  const prefix = `test-${slugPart(input.profile)}-${slugPart(input.level)}`;
  if (isDefaultTestIdentity(input)) {
    return prefix;
  }
  return `${prefix}-${sha16(stableStringify(testIdentityPayload(input)))}`;
}

export interface CoursePackageIdentityInput {
  scope: CoursePackageScopeIdentity;
  depth: string;
  format: string;
  includePractice: boolean;
  locale?: string;
  fromGaps?: boolean;
}

function courseIdentityPayload(input: CoursePackageIdentityInput): Record<string, unknown> {
  const scope = { ...input.scope };
  if (scope.questionIds) {
    scope.questionIds = [...scope.questionIds].sort((a, b) => a.localeCompare(b));
  }
  return {
    kind: "course",
    scope,
    depth: input.depth,
    format: input.format,
    includePractice: input.includePractice,
    ...(input.locale ? { locale: input.locale } : {}),
    ...(input.fromGaps ? { fromGaps: true } : {}),
  };
}

function coursePrefix(input: CoursePackageIdentityInput): string {
  const { scope } = input;
  const depth = slugPart(input.depth);
  const format = slugPart(input.format);
  const locale = input.locale ? slugPart(input.locale) : "";

  if (scope.mode === "profile_level" || scope.mode === "from_gaps" || scope.mode === "topic_in_level") {
    const profile = scope.profile ? slugPart(scope.profile) : "profile";
    const level = scope.level ? slugPart(scope.level) : "level";
    const bits = ["course", profile, level, format, depth];
    if (locale) bits.push(locale);
    if (!input.includePractice) bits.push("no-practice");
    if (scope.mode === "from_gaps" || input.fromGaps) bits.push("gaps");
    if (scope.mode === "topic_in_level" && scope.topic) bits.push(slugPart(scope.topic));
    return bits.filter(Boolean).join("-");
  }

  if (scope.mode === "skill" && scope.skill) {
    const bits = ["course", "skill", slugPart(scope.skill), format, depth];
    if (locale) bits.push(locale);
    if (!input.includePractice) bits.push("no-practice");
    return bits.join("-");
  }

  if (scope.mode === "topic" && scope.topic) {
    const bits = ["course", "topic", slugPart(scope.topic), format, depth];
    if (locale) bits.push(locale);
    if (!input.includePractice) bits.push("no-practice");
    return bits.join("-");
  }

  if (scope.mode === "from_questions" && scope.questionIds?.length) {
    const bits = ["course", "questions", format, depth];
    if (locale) bits.push(locale);
    return bits.join("-");
  }

  return `course-${format}-${depth}${locale ? `-${locale}` : ""}`;
}

function coursePrefixFullyIdentifies(input: CoursePackageIdentityInput): boolean {
  if (
    input.scope.mode === "from_questions" &&
    input.scope.questionIds &&
    input.scope.questionIds.length > 0
  ) {
    return false;
  }
  return true;
}

/** Deterministic upsert slot id for export expert kit JSON/HTML. */
export function buildKitPackageId(profile: string, level: string): string {
  return `kit-${slugPart(profile)}-${slugPart(level)}`;
}

/** Deterministic upsert slot id for export course/learning JSON. */
export function buildCoursePackageId(input: CoursePackageIdentityInput): string {
  const prefix = coursePrefix(input);
  const payloadHash = sha16(stableStringify(courseIdentityPayload(input)));
  if (prefix.length > 80) {
    return `${prefix.slice(0, 64)}-${payloadHash}`;
  }
  if (coursePrefixFullyIdentifies(input)) {
    return prefix;
  }
  return `${prefix}-${payloadHash}`;
}
