import type { Skill } from "./schemas.js";
export interface SuggestedEdge {
    from: string;
    to: string;
    kind: "depends_on" | "related_to";
    confidence: number;
    reason: string;
}
/**
 * Infer candidate graph edges from skill descriptions and topics.
 * Looks for mentions of one skill id (or plausible variations) inside
 * another skill's description and topics.
 *
 * Returns suggestions only — never applies them. The agent/human must
 * confirm via `skill link`.
 */
export declare function inferEdgesFromContent(skills: Skill[]): SuggestedEdge[];
/**
 * Suggest edges for a specific project. Loads all skills, infers, returns.
 */
export declare function inferEdgesForProject(projectRoot: string): SuggestedEdge[];
//# sourceMappingURL=skill-edge-inference.d.ts.map