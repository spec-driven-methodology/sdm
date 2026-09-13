import { type Skill } from "./schemas.js";
export interface AddSkillInput {
    id: string;
    name: string;
    kind?: string;
    category?: string;
    description?: string;
    topics?: string[];
    /** Human-readable labels for topic slugs (key → label). */
    topicLabels?: Record<string, string>;
    force?: boolean;
}
export interface LinkSkillInput {
    dependsOn?: string[];
    relatedTo?: string[];
}
export interface SkillWriteWarning {
    code: string;
    message: string;
}
export interface SkillWriteResult {
    skill: Skill;
    path: string;
    action: "add" | "link";
    warnings?: SkillWriteWarning[];
}
/**
 * Create ontology/<id>.yaml
 */
export declare function addSkill(projectRoot: string, input: AddSkillInput): SkillWriteResult;
/**
 * Merge depends_on / related_to onto an existing skill (union, dedupe).
 */
export declare function linkSkill(projectRoot: string, skillId: string, input: LinkSkillInput): SkillWriteResult;
/** Parse comma-separated skill ids from CLI. */
export declare function parseSkillIdList(raw: string | undefined): string[];
//# sourceMappingURL=skill-write.d.ts.map