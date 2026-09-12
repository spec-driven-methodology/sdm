import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { buildContentBasis, } from "./content-basis.js";
import { SdmError } from "./errors.js";
import { buildQuestionPayload, } from "./question-payload.js";
import { throwIfValidateErrors, validateQuestionDraft, } from "./question-validate.js";
import { assertSkillExists } from "./skills.js";
import { writeYamlFile } from "./yaml.js";
function listQuestionIds(projectRoot) {
    const dir = join(projectRoot, "library", "questions");
    const ids = new Set();
    if (!existsSync(dir)) {
        return ids;
    }
    function walk(current) {
        for (const entry of readdirSync(current)) {
            const full = join(current, entry);
            if (statSync(full).isDirectory()) {
                walk(full);
            }
            else if (entry.endsWith(".yaml") || entry.endsWith(".yml")) {
                ids.add(entry.replace(/\.ya?ml$/i, ""));
            }
        }
    }
    walk(dir);
    return ids;
}
function skillSlug(skillId) {
    return skillId
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 24);
}
export function generateQuestionId(projectRoot, skillId) {
    const existing = listQuestionIds(projectRoot);
    const slug = skillSlug(skillId) || "q";
    let n = 1;
    while (true) {
        const id = `q-${slug}-${String(n).padStart(3, "0")}`;
        if (!existing.has(id)) {
            return id;
        }
        n += 1;
    }
}
function questionPath(projectRoot, id) {
    return join(projectRoot, "library", "questions", `${id}.yaml`);
}
/**
 * Validate and write a question YAML into the methodology library.
 */
export function addQuestion(projectRoot, input) {
    assertSkillExists(projectRoot, input.skill);
    const id = input.id?.trim() || generateQuestionId(projectRoot, input.skill);
    const path = questionPath(projectRoot, id);
    if (existsSync(path) && !input.force) {
        throw new SdmError("QUESTION_EXISTS", `Question file already exists: ${path}. Use --force to overwrite.`);
    }
    const validated = validateQuestionDraft(projectRoot, { ...input, id }, { excludeQuestionId: input.force ? id : undefined });
    throwIfValidateErrors(validated);
    if (!validated.question) {
        throw new SdmError("VALIDATION_FAILED", "Question draft failed to parse");
    }
    // Persist parsed question with content basis stamp
    const question = {
        ...validated.question,
        meta: {
            ...(validated.question.meta ?? {}),
            basis: buildContentBasis({
                projectRoot,
                skillIds: [input.skill],
            }),
        },
    };
    writeYamlFile(path, question);
    const warnings = validated.findings.length > 0 ? validated.findings : undefined;
    return { question, path, skill: input.skill, warnings };
}
/** @internal test helper — rebuild payload without validate */
export function __testBuildPayload(input, id) {
    return buildQuestionPayload(input, id);
}
//# sourceMappingURL=question-add.js.map