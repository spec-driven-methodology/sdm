import { existsSync } from "node:fs";
import { join } from "node:path";
import { ZodError } from "zod";
import { buildContentBasis, hashTermContent } from "./content-basis.js";
import { SdmError } from "./errors.js";
import { loadTerms } from "./loaders.js";
import { TermSchema } from "./schemas.js";
import { assertSkillExists } from "./skills.js";
import { writeYamlFile } from "./yaml.js";
function termPath(projectRoot, id) {
    return join(projectRoot, "library", "terms", `${id}.yaml`);
}
function parseTermOrThrow(payload) {
    try {
        return TermSchema.parse(payload);
    }
    catch (err) {
        if (err instanceof ZodError) {
            throw new SdmError("VALIDATION_FAILED", err.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; "));
        }
        throw err;
    }
}
function uniq(values) {
    return [...new Set(values.map((v) => v.trim()).filter(Boolean))];
}
export function addTerm(projectRoot, input) {
    const id = input.id.trim();
    if (!id) {
        throw new SdmError("VALIDATION_FAILED", "Term id must not be empty");
    }
    const path = termPath(projectRoot, id);
    if (existsSync(path) && !input.force) {
        throw new SdmError("TERM_EXISTS", `Term "${id}" already exists at ${path}. Use --force to overwrite.`);
    }
    const skills = uniq(input.skills ?? []);
    for (const skillId of skills) {
        assertSkillExists(projectRoot, skillId);
    }
    const { terms: existing } = loadTerms(projectRoot);
    const termLabel = input.term.trim();
    const dup = existing.find((t) => t.id !== id && t.term.toLowerCase() === termLabel.toLowerCase());
    if (dup && !input.force) {
        throw new SdmError("TERM_DUPLICATE_LABEL", `Term label "${termLabel}" already used by "${dup.id}"`);
    }
    const docBody = {
        id,
        term: termLabel,
        definition: input.definition.trim(),
        aliases: uniq(input.aliases ?? []),
        skills,
        kind: input.kind ?? "concept",
    };
    const basis = buildContentBasis({
        projectRoot,
        skillIds: skills,
        termHashes: { [id]: hashTermContent(parseTermOrThrow(docBody)) },
    });
    const doc = parseTermOrThrow({
        ...docBody,
        meta: { basis },
    });
    writeYamlFile(path, doc);
    return { term: doc, path };
}
//# sourceMappingURL=term-add.js.map