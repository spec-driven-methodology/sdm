import { findProjectRoot } from "./project-root.js";
import { loadQuestions } from "./loaders.js";
/**
 * List library questions, optionally filtered by skill id.
 */
export function listQuestions(options) {
    const projectRoot = findProjectRoot(options.startDir);
    const { questions: all, warnings } = loadQuestions(projectRoot);
    const skill = options.skill?.trim();
    const questions = skill
        ? all.filter((q) => q.skill === skill)
        : all;
    return {
        projectRoot,
        questions,
        warnings,
        skill: skill || undefined,
    };
}
//# sourceMappingURL=question-list.js.map