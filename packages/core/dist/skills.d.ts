import { type Skill } from "./schemas.js";
export declare function skillFilePath(projectRoot: string, skillId: string): string;
export declare function skillExists(projectRoot: string, skillId: string): boolean;
export declare function assertSkillExists(projectRoot: string, skillId: string): void;
export declare function loadSkill(projectRoot: string, skillId: string): Skill;
/** Load every valid skill YAML under ontology/ (invalid files skipped). */
export declare function loadAllSkills(projectRoot: string): Skill[];
//# sourceMappingURL=skills.d.ts.map