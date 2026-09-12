import type { ExportQuestionFilter } from "./export-question-filter.js";
import type { ExportSkillFilter } from "./export-skill-filter.js";
import type { ExportTypeFilter } from "./export-type-filter.js";
import type { ContentBasis } from "./schemas.js";
/** Scope fields that define a distinct learning export slot (mirrors CourseScopeMeta). */
export interface CoursePackageScopeIdentity {
    mode: "profile_level" | "from_gaps" | "skill" | "topic" | "from_questions" | "topic_in_level";
    profile?: string;
    level?: string;
    skill?: string;
    topic?: string;
    questionIds?: string[];
}
/** Content fingerprint for consumer upsert (basis without capturedAt). */
export declare function hashContentRevision(basis: ContentBasis): string;
/**
 * Per-module content fingerprint for diff: hashes the module's own shape
 * (skill id + lesson ids/topics/titles), so changing one lesson updates only
 * that module's hash — unlike the global `meta.revision`.
 */
export declare function hashModuleRevision(module: unknown): string;
/**
 * Build a per-module revision map `{ [skillId]: hash, … }` from course modules.
 * Skill modules key by `mod.skill`; the overview module (kind=overview) uses
 * its constant synthetic id `course-overview` as key.
 */
export declare function buildRevisionByModule<T extends {
    skill: string;
    kind?: string;
}>(modules: T[]): Record<string, string>;
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
/** Deterministic upsert slot id for export test JSON. */
export declare function buildTestPackageId(input: TestPackageIdentityInput): string;
export interface CoursePackageIdentityInput {
    scope: CoursePackageScopeIdentity;
    depth: string;
    format: string;
    includePractice: boolean;
    locale?: string;
    fromGaps?: boolean;
}
/** Deterministic upsert slot id for export expert kit JSON/HTML. */
export declare function buildKitPackageId(profile: string, level: string): string;
/** Deterministic upsert slot id for export course/learning JSON. */
export declare function buildCoursePackageId(input: CoursePackageIdentityInput): string;
//# sourceMappingURL=export-package-identity.d.ts.map