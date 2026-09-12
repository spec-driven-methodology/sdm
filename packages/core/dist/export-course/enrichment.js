/**
 * Reverse topic extraction: after lessons are generated, collect the topic
 * slugs used by `lessons[].topic` (and question-derived topics) for a module.
 * These are the topics the course actually teaches — distinct from what
 * `skill.topics` declared. Back-filling them closes SKILL_TOPICS_EMPTY.
 */
export function extractTopicsFromModules(modules) {
    const bySkill = new Map();
    for (const mod of modules) {
        if (mod.kind === "overview")
            continue;
        const seen = bySkill.get(mod.skill) ?? new Set();
        for (const lesson of mod.lessons) {
            if (lesson.topic && lesson.topic.trim()) {
                seen.add(lesson.topic.trim());
            }
        }
        bySkill.set(mod.skill, seen);
    }
    const out = new Map();
    for (const [skill, set] of bySkill) {
        out.set(skill, [...set].sort((a, b) => a.localeCompare(b)));
    }
    return out;
}
/**
 * Merge course-extracted topics into declared skill topics (union, dedupe).
 * Never removes existing topics — only adds ones the course actually teaches.
 */
export function mergeTopicsIntoSkill(declared, courseTopics) {
    const seen = new Set(declared);
    for (const t of courseTopics) {
        if (t.trim())
            seen.add(t.trim());
    }
    return [...seen].sort((a, b) => a.localeCompare(b));
}
/**
 * Suggest a skill description from lesson content.
 * Builds a summary sentence from lesson titles and the first non-empty
 * paragraph of each lesson. For SKILL_DESCRIPTION_THIN auto-fix.
 */
export function suggestDescriptionFromModules(modules, skillId) {
    const mod = modules.find((m) => m.kind !== "overview" && m.skill === skillId);
    if (!mod || mod.lessons.length === 0)
        return undefined;
    const parts = [];
    for (const lesson of mod.lessons) {
        const title = lesson.title?.trim();
        if (!title)
            continue;
        const body = String(lesson.body ?? "").trim();
        const firstSentence = body
            .split(/\n\s*\n/)[0]
            ?.replace(/^#+\s*/, "")
            .replace(/\*\*/g, "")
            .trim();
        if (firstSentence) {
            parts.push(`«${title}»: ${firstSentence}`);
        }
        else {
            parts.push(title);
        }
    }
    if (parts.length === 0)
        return undefined;
    return `Курс по навыку. Темы: ${parts.slice(0, 5).join("; ")}.`;
}
//# sourceMappingURL=enrichment.js.map