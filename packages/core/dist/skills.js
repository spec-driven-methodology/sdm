import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { SdmError } from "./errors.js";
import { SkillSchema } from "./schemas.js";
import { readYamlFile } from "./yaml.js";
function listYamlFiles(dir) {
    if (!existsSync(dir)) {
        return [];
    }
    const results = [];
    function walk(current) {
        for (const entry of readdirSync(current)) {
            const full = join(current, entry);
            if (statSync(full).isDirectory()) {
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
function skillsDir(projectRoot) {
    const primary = join(projectRoot, "ontology");
    const legacy = join(projectRoot, "ontology", "skills");
    // Prefer primary (ontology/), fall back to legacy (ontology/skills/)
    if (existsSync(primary) && !existsSync(legacy))
        return primary;
    if (existsSync(legacy))
        return legacy;
    return primary;
}
export function skillFilePath(projectRoot, skillId) {
    return join(skillsDir(projectRoot), `${skillId}.yaml`);
}
export function skillExists(projectRoot, skillId) {
    if (existsSync(skillFilePath(projectRoot, skillId))) {
        return true;
    }
    for (const file of listYamlFiles(skillsDir(projectRoot))) {
        try {
            const parsed = SkillSchema.parse(readYamlFile(file));
            if (parsed.id === skillId) {
                return true;
            }
        }
        catch {
            // continue
        }
    }
    return false;
}
export function assertSkillExists(projectRoot, skillId) {
    if (!skillExists(projectRoot, skillId)) {
        throw new SdmError("SKILL_NOT_FOUND", `Skill "${skillId}" not found under ontology/`);
    }
}
export function loadSkill(projectRoot, skillId) {
    const preferred = skillFilePath(projectRoot, skillId);
    if (existsSync(preferred)) {
        return SkillSchema.parse(readYamlFile(preferred));
    }
    for (const file of listYamlFiles(skillsDir(projectRoot))) {
        try {
            const parsed = SkillSchema.parse(readYamlFile(file));
            if (parsed.id === skillId) {
                return parsed;
            }
        }
        catch {
            // continue
        }
    }
    throw new SdmError("SKILL_NOT_FOUND", `Skill "${skillId}" not found under ontology/`);
}
/** Load every valid skill YAML under ontology/ (invalid files skipped). */
export function loadAllSkills(projectRoot) {
    const skills = [];
    const seen = new Set();
    for (const file of listYamlFiles(skillsDir(projectRoot))) {
        try {
            const parsed = SkillSchema.parse(readYamlFile(file));
            if (seen.has(parsed.id)) {
                continue;
            }
            seen.add(parsed.id);
            skills.push(parsed);
        }
        catch {
            // skip invalid
        }
    }
    return skills;
}
//# sourceMappingURL=skills.js.map