import { loadAllSkills, skillFilePath } from "./skills.js";
import { readYamlFile, writeYamlFile } from "./yaml.js";
import { suggestDescriptionFromModules } from "./export-course/enrichment.js";
import { syncTopicRegistryFromSkills } from "./topic-registry.js";
/**
 * Deterministic auto-heal for common course-gate warnings. Works on the
 * *filled* pack (lesson bodies present) and mutates the methodology:
 *
 * 1. Registry sync: create library/topics YAML for every skill topic.
 * 2. Back-fill: for each skill module, union lesson topic slugs into
 *    `skill.topics` (closes SKILL_TOPICS_EMPTY / TOPIC_UNCOVERED_BY_QUESTIONS).
 * 3. Description: when a skill description is thin, suggest one from lesson
 *    titles + first paragraphs (closes SKILL_DESCRIPTION_THIN).
 *
 * Returns a report of what changed. Does NOT re-export; caller re-runs export
 * to confirm warnings shrank.
 */
export function healCourseWarnings(input) {
    const { projectRoot, modules } = input;
    // 1. Registry sync for skill topics (idempotent)
    const registryCreated = syncTopicRegistryFromSkills(projectRoot);
    // 2. Back-fill lesson topics into skill.topics
    const backfilledTopics = [];
    const skills = loadAllSkills(projectRoot);
    const byId = new Map(skills.map((s) => [s.id, s]));
    const skillModules = modules.filter((m) => m.kind !== "overview");
    for (const mod of skillModules) {
        const skill = byId.get(mod.skill);
        if (!skill)
            continue;
        const lessonTopics = new Set();
        for (const lesson of mod.lessons) {
            if (lesson.topic && lesson.topic.trim()) {
                lessonTopics.add(lesson.topic.trim());
            }
        }
        if (lessonTopics.size === 0)
            continue;
        const existingSet = new Set(skill.topics);
        let changed = false;
        for (const t of lessonTopics) {
            if (!existingSet.has(t)) {
                changed = true;
                break;
            }
        }
        if (!changed)
            continue;
        const merged = [...new Set([...skill.topics, ...lessonTopics])].sort((a, b) => a.localeCompare(b));
        const path = skillFilePath(projectRoot, skill.id);
        const doc = readYamlFile(path);
        writeYamlFile(path, { ...doc, topics: merged });
        backfilledTopics.push(skill.id);
    }
    // 3. Suggest descriptions for thin skills
    const suggestedDescriptions = [];
    const thinWarnings = input.warnings.filter((w) => w.code === "SKILL_DESCRIPTION_THIN" && w.skill);
    for (const w of thinWarnings) {
        const skillId = w.skill;
        const desc = suggestDescriptionFromModules(modules, skillId);
        if (!desc)
            continue;
        const skill = byId.get(skillId);
        if (!skill)
            continue;
        const path = skillFilePath(projectRoot, skillId);
        const doc = readYamlFile(path);
        writeYamlFile(path, { ...doc, description: desc });
        suggestedDescriptions.push(skillId);
    }
    return { backfilledTopics, suggestedDescriptions, registryCreated };
}
//# sourceMappingURL=course-heal.js.map