import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { ZodError } from "zod";
import { SdmError } from "./errors.js";
import { LevelSchema, ProfileSchema, QuestionSchema, TermSchema, } from "./schemas.js";
import { readYamlFile } from "./yaml.js";
function listYamlFiles(dir) {
    if (!existsSync(dir)) {
        return [];
    }
    const results = [];
    function walk(current) {
        for (const entry of readdirSync(current)) {
            const full = join(current, entry);
            const st = statSync(full);
            if (st.isDirectory()) {
                walk(full);
            }
            else if (entry.endsWith(".yaml") || entry.endsWith(".yml")) {
                results.push(full);
            }
        }
    }
    walk(dir);
    return results;
}
function normalizeLevelRaw(raw) {
    if (typeof raw !== "object" || raw === null)
        return raw;
    const obj = raw;
    if (typeof obj.role === "string" && obj.profile === undefined) {
        const { role, ...rest } = obj;
        return { ...rest, profile: role };
    }
    return raw;
}
function normalizeProfileRaw(raw) {
    if (typeof raw !== "object" || raw === null)
        return raw;
    const obj = raw;
    if (typeof obj.role === "string" && obj.profile === undefined) {
        const { role, ...rest } = obj;
        return { ...rest, profile: role };
    }
    return raw;
}
/** Parse level YAML with legacy `role:` → `profile:` normalization. */
export function parseLevelDocument(raw) {
    try {
        return LevelSchema.parse(normalizeLevelRaw(raw));
    }
    catch (err) {
        if (err instanceof ZodError) {
            throw new SdmError("VALIDATION_FAILED", err.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; "));
        }
        throw err;
    }
}
/** Parse profile YAML with legacy `role:` → `profile:` normalization. */
export function parseProfileDocument(raw) {
    try {
        return ProfileSchema.parse(normalizeProfileRaw(raw));
    }
    catch (err) {
        if (err instanceof ZodError) {
            throw new SdmError("VALIDATION_FAILED", err.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; "));
        }
        throw err;
    }
}
export function profilePath(projectRoot, profileId) {
    return join(projectRoot, "certifications", "profiles", `${profileId}.yaml`);
}
export function legacyProfilePath(projectRoot, profileId) {
    return join(projectRoot, "certifications", "roles", `${profileId}.yaml`);
}
export function loadLevel(projectRoot, levelId) {
    const preferred = join(projectRoot, "certifications", "levels", `${levelId}.yaml`);
    if (existsSync(preferred)) {
        return parseLevelDocument(readYamlFile(preferred));
    }
    const levelsDir = join(projectRoot, "certifications", "levels");
    for (const file of listYamlFiles(levelsDir)) {
        try {
            const parsed = parseLevelDocument(readYamlFile(file));
            if (parsed.level === levelId) {
                return parsed;
            }
        }
        catch {
            // continue scanning
        }
    }
    throw new SdmError("LEVEL_NOT_FOUND", `Level "${levelId}" not found under certifications/levels/`);
}
export function loadProfile(projectRoot, profileId) {
    const preferred = profilePath(projectRoot, profileId);
    if (existsSync(preferred)) {
        return parseProfileDocument(readYamlFile(preferred));
    }
    const legacy = legacyProfilePath(projectRoot, profileId);
    if (existsSync(legacy)) {
        return parseProfileDocument(readYamlFile(legacy));
    }
    for (const dir of [
        join(projectRoot, "certifications", "profiles"),
        join(projectRoot, "certifications", "roles"),
    ]) {
        for (const file of listYamlFiles(dir)) {
            try {
                const parsed = parseProfileDocument(readYamlFile(file));
                if (parsed.profile === profileId) {
                    return parsed;
                }
            }
            catch {
                // continue
            }
        }
    }
    throw new SdmError("PROFILE_NOT_FOUND", `Profile "${profileId}" not found under certifications/profiles/`);
}
export function loadQuestions(projectRoot) {
    const questionsDir = join(projectRoot, "library", "questions");
    const questions = [];
    const warnings = [];
    for (const file of listYamlFiles(questionsDir)) {
        try {
            const parsed = QuestionSchema.parse(readYamlFile(file));
            questions.push(parsed);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            warnings.push({ path: file, message });
        }
    }
    return { questions, warnings };
}
export function loadTerms(projectRoot) {
    const termsDir = join(projectRoot, "library", "terms");
    const terms = [];
    const warnings = [];
    for (const file of listYamlFiles(termsDir)) {
        try {
            const parsed = TermSchema.parse(readYamlFile(file));
            terms.push(parsed);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            warnings.push({ path: file, message });
        }
    }
    terms.sort((a, b) => a.id.localeCompare(b.id));
    return { terms, warnings };
}
/**
 * Ensure profile/level pair is consistent for PoC rules from design.md.
 */
export function assertProfileLevelMatch(profile, level, profileId) {
    if (level.profile && level.profile !== profileId) {
        throw new SdmError("PROFILE_LEVEL_MISMATCH", `Level "${level.level}" belongs to profile "${level.profile}", not "${profileId}"`);
    }
    if (!profile.levels.includes(level.level)) {
        throw new SdmError("PROFILE_LEVEL_MISMATCH", `Profile "${profileId}" does not list level "${level.level}"`);
    }
}
/** True when legacy certifications/roles/ directory exists. */
export function hasLegacyRolesDirectory(projectRoot) {
    return existsSync(join(projectRoot, "certifications", "roles"));
}
//# sourceMappingURL=loaders.js.map