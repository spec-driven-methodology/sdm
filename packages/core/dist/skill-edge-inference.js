import { loadAllSkills } from "./skills.js";
/**
 * Infer candidate graph edges from skill descriptions and topics.
 * Looks for mentions of one skill id (or plausible variations) inside
 * another skill's description and topics.
 *
 * Returns suggestions only — never applies them. The agent/human must
 * confirm via `skill link`.
 */
export function inferEdgesFromContent(skills) {
    const byId = new Map(skills.map((s) => [s.id, s]));
    const suggestions = [];
    const existing = new Set();
    for (const skill of skills) {
        for (const d of skill.depends_on)
            existing.add(`${skill.id}->${d}`);
        for (const r of skill.related_to)
            existing.add(`${skill.id}~${r}`);
    }
    for (const skill of skills) {
        const haystack = `${skill.description} ${skill.topics.join(" ")}`.toLowerCase();
        for (const [otherId, other] of byId) {
            if (otherId === skill.id)
                continue;
            const pairKeyDep = `${skill.id}->${otherId}`;
            const pairKeyRel = `${skill.id}~${otherId}`;
            // Heuristic: the other skill's id appears in this skill's description/topics
            const idMentioned = haystack.includes(otherId.toLowerCase());
            const nameMentioned = haystack.includes(other.name.toLowerCase());
            if (idMentioned || nameMentioned) {
                if (!existing.has(pairKeyDep) && !existing.has(pairKeyRel)) {
                    suggestions.push({
                        from: skill.id,
                        to: otherId,
                        kind: "related_to",
                        confidence: 0.5,
                        reason: `"${otherId}" mentioned in "${skill.id}" description/topics`,
                    });
                }
            }
            // Heuristic: depends_on already exists reversed → might be related_to
            if (existing.has(`${otherId}->${skill.id}`) &&
                !existing.has(pairKeyRel)) {
                suggestions.push({
                    from: skill.id,
                    to: otherId,
                    kind: "related_to",
                    confidence: 0.7,
                    reason: `Reversed depends_on (${otherId} depends on ${skill.id}); suggest related_to`,
                });
            }
        }
    }
    return suggestions;
}
/**
 * Suggest edges for a specific project. Loads all skills, infers, returns.
 */
export function inferEdgesForProject(projectRoot) {
    const skills = loadAllSkills(projectRoot);
    return inferEdgesFromContent(skills);
}
//# sourceMappingURL=skill-edge-inference.js.map