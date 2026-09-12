import type { ContentBasis, Level, Skill, Term } from "./schemas.js";
export type { ContentBasis } from "./schemas.js";
export { ContentBasisSchema } from "./schemas.js";
/** Deterministic truncated hash of semantic skill fields. */
export declare function hashSkillContent(skill: Skill): string;
/** Deterministic truncated hash of library term fields. */
export declare function hashTermContent(term: Term): string;
export declare function buildTermBasis(projectRoot: string, termIds: string[]): Record<string, string>;
/** Deterministic truncated hash of level requirements / threshold. */
export declare function hashLevelContent(level: Level): string;
export declare function nowCapturedAt(): string;
export declare function buildSkillBasis(projectRoot: string, skillIds: string[]): Record<string, string>;
export declare function buildContentBasis(options: {
    projectRoot: string;
    skillIds: string[];
    level?: Level;
    termIds?: string[];
    /** Precomputed term hashes (e.g. before file exists on disk). */
    termHashes?: Record<string, string>;
}): ContentBasis;
//# sourceMappingURL=content-basis.d.ts.map