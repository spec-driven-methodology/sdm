import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { SdmError } from "./errors.js";
import { loadQuestions } from "./loaders.js";
import { findProjectRoot, PROJECT_MANIFEST } from "./project-root.js";
import { SdmConfigSchema } from "./schemas.js";
import { loadAllSkills } from "./skills.js";
import { readYamlFile } from "./yaml.js";
export const SEMANTIC_INDEX_SCHEMA = "sdm.semantic-index/v1";
const INDEX_PATH = [".sdm", "index", "methodology.json"];
function requireEnabled(projectRoot) {
    const config = SdmConfigSchema.parse(readYamlFile(join(projectRoot, PROJECT_MANIFEST)));
    if (config.search.provider === "none") {
        throw new SdmError("SEARCH_DISABLED", "Semantic search is disabled (set search.provider to lancedb)");
    }
}
function tokens(value) {
    return new Set(value.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(Boolean));
}
export function semanticSimilarity(left, right) {
    const a = tokens(left);
    const b = tokens(right);
    let dot = 0;
    for (const token of a)
        if (b.has(token))
            dot += 1;
    return a.size && b.size ? dot / Math.sqrt(a.size * b.size) : 0;
}
export function semanticIndexPath(projectRoot) {
    return join(projectRoot, ...INDEX_PATH);
}
export function rebuildSemanticIndex(startDir) {
    const projectRoot = findProjectRoot(startDir);
    requireEnabled(projectRoot);
    const skills = loadAllSkills(projectRoot);
    const { questions } = loadQuestions(projectRoot);
    const documents = [
        ...skills.map((skill) => ({ id: skill.id, kind: "skill", text: `${skill.name} ${skill.description} ${skill.topics.join(" ")}` })),
        ...questions.map((question) => ({ id: question.id, kind: "question", text: `${question.skill} ${question.text} ${question.topics.join(" ")}` })),
    ].sort((a, b) => a.id.localeCompare(b.id));
    const index = { schemaVersion: SEMANTIC_INDEX_SCHEMA, documents };
    const path = semanticIndexPath(projectRoot);
    mkdirSync(join(projectRoot, ".sdm", "index"), { recursive: true });
    writeFileSync(path, `${JSON.stringify(index, null, 2)}\n`, "utf8");
    return { projectRoot, index };
}
export function searchSemanticIndex(startDir, query, kind) {
    const projectRoot = findProjectRoot(startDir);
    requireEnabled(projectRoot);
    const path = semanticIndexPath(projectRoot);
    if (!existsSync(path))
        throw new SdmError("INDEX_NOT_FOUND", "Semantic index is missing; run: sdm index rebuild");
    const index = JSON.parse(readFileSync(path, "utf8"));
    const hits = index.documents.filter((doc) => !kind || doc.kind === kind).map((doc) => ({ ...doc, score: Number(semanticSimilarity(query, doc.text).toFixed(6)) })).filter((hit) => hit.score > 0).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
    return { projectRoot, hits };
}
//# sourceMappingURL=semantic-index.js.map