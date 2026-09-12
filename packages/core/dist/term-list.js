import { findProjectRoot } from "./project-root.js";
import { loadTerms } from "./loaders.js";
export function listTerms(options) {
    const projectRoot = findProjectRoot(options.startDir);
    const { terms: all, warnings } = loadTerms(projectRoot);
    const skill = options.skill?.trim();
    const terms = skill
        ? all.filter((t) => t.skills.length === 0 || t.skills.includes(skill))
        : all;
    return {
        projectRoot,
        terms,
        warnings,
        skill: skill || undefined,
    };
}
//# sourceMappingURL=term-list.js.map