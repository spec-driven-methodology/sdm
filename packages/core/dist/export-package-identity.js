import { createHash } from "node:crypto";
function sha16(text) {
    return createHash("sha256").update(text, "utf8").digest("hex").slice(0, 16);
}
function stableStringify(value) {
    if (value === null || typeof value !== "object") {
        return JSON.stringify(value);
    }
    if (Array.isArray(value)) {
        return `[${value.map((v) => stableStringify(v)).join(",")}]`;
    }
    const obj = value;
    const keys = Object.keys(obj).sort((a, b) => a.localeCompare(b));
    return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(",")}}`;
}
function slugPart(value) {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9._-]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 40);
}
function sortedRecord(record) {
    const out = {};
    for (const key of Object.keys(record).sort((a, b) => a.localeCompare(b))) {
        out[key] = record[key];
    }
    return out;
}
/** Content fingerprint for consumer upsert (basis without capturedAt). */
export function hashContentRevision(basis) {
    const payload = {};
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
export function hashModuleRevision(module) {
    return sha16(stableStringify(module));
}
/**
 * Build a per-module revision map `{ [skillId]: hash, … }` from course modules.
 * Skill modules key by `mod.skill`; the overview module (kind=overview) uses
 * its constant synthetic id `course-overview` as key.
 */
export function buildRevisionByModule(modules) {
    const out = {};
    for (const mod of modules) {
        const key = mod.kind === "overview" ? "course-overview" : mod.skill;
        out[key] = hashModuleRevision(mod);
    }
    return out;
}
function testIdentityPayload(input) {
    const payload = {
        kind: "test",
        profile: input.profile,
        level: input.level,
    };
    if (input.team)
        payload.team = input.team;
    if (input.adaptive) {
        payload.adaptive = true;
        payload.seed = input.seed ?? 42;
        payload.perSkill = input.perSkill ?? 3;
    }
    if (input.typeFilter)
        payload.typeFilter = input.typeFilter;
    if (input.skillFilter)
        payload.skillFilter = input.skillFilter;
    if (input.questionFilter)
        payload.questionFilter = input.questionFilter;
    return payload;
}
function isDefaultTestIdentity(input) {
    return (!input.team &&
        !input.adaptive &&
        !input.typeFilter &&
        !input.skillFilter &&
        !input.questionFilter);
}
/** Deterministic upsert slot id for export test JSON. */
export function buildTestPackageId(input) {
    const prefix = `test-${slugPart(input.profile)}-${slugPart(input.level)}`;
    if (isDefaultTestIdentity(input)) {
        return prefix;
    }
    return `${prefix}-${sha16(stableStringify(testIdentityPayload(input)))}`;
}
function courseIdentityPayload(input) {
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
function coursePrefix(input) {
    const { scope } = input;
    const depth = slugPart(input.depth);
    const format = slugPart(input.format);
    const locale = input.locale ? slugPart(input.locale) : "";
    if (scope.mode === "profile_level" || scope.mode === "from_gaps" || scope.mode === "topic_in_level") {
        const profile = scope.profile ? slugPart(scope.profile) : "profile";
        const level = scope.level ? slugPart(scope.level) : "level";
        const bits = ["course", profile, level, format, depth];
        if (locale)
            bits.push(locale);
        if (!input.includePractice)
            bits.push("no-practice");
        if (scope.mode === "from_gaps" || input.fromGaps)
            bits.push("gaps");
        if (scope.mode === "topic_in_level" && scope.topic)
            bits.push(slugPart(scope.topic));
        return bits.filter(Boolean).join("-");
    }
    if (scope.mode === "skill" && scope.skill) {
        const bits = ["course", "skill", slugPart(scope.skill), format, depth];
        if (locale)
            bits.push(locale);
        if (!input.includePractice)
            bits.push("no-practice");
        return bits.join("-");
    }
    if (scope.mode === "topic" && scope.topic) {
        const bits = ["course", "topic", slugPart(scope.topic), format, depth];
        if (locale)
            bits.push(locale);
        if (!input.includePractice)
            bits.push("no-practice");
        return bits.join("-");
    }
    if (scope.mode === "from_questions" && scope.questionIds?.length) {
        const bits = ["course", "questions", format, depth];
        if (locale)
            bits.push(locale);
        return bits.join("-");
    }
    return `course-${format}-${depth}${locale ? `-${locale}` : ""}`;
}
function coursePrefixFullyIdentifies(input) {
    if (input.scope.mode === "from_questions" &&
        input.scope.questionIds &&
        input.scope.questionIds.length > 0) {
        return false;
    }
    return true;
}
/** Deterministic upsert slot id for export expert kit JSON/HTML. */
export function buildKitPackageId(profile, level) {
    return `kit-${slugPart(profile)}-${slugPart(level)}`;
}
/** Deterministic upsert slot id for export course/learning JSON. */
export function buildCoursePackageId(input) {
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
//# sourceMappingURL=export-package-identity.js.map