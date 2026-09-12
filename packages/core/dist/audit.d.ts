import { computeCoverage } from "./coverage.js";
import { type Question } from "./schemas.js";
export declare const AUDIT_SCHEMA = "sdm.audit/v1";
export interface LexicalDuplicate {
    leftId: string;
    rightId: string;
    similarity: number;
}
export interface AuditRecommendation {
    priority: "high" | "medium" | "low";
    message: string;
    /** Stable code aligned with question validate when overlapping. */
    code?: string;
}
export interface WeightSumFinding {
    level: string;
    profile?: string;
    sum: number;
    delta: number;
}
export interface PositionBiasFinding {
    sample: number;
    firstPositionCount: number;
    share: number;
    threshold: number;
}
export interface AuditDocument {
    schemaVersion: typeof AUDIT_SCHEMA;
    ontology: {
        skillCount: number;
        isolatedSkills: string[];
        unusedSkills: string[];
    };
    library: {
        questionCount: number;
        duplicates: LexicalDuplicate[];
        /** Present when search.provider=lancedb and index exists. */
        semanticDuplicates?: LexicalDuplicate[];
        /** Present when quality.distractorQuality is soft|strict and triggered. */
        optionPositionBias?: PositionBiasFinding;
        /** Question ids failing length-band / unique-longest rules. */
        optionLengthOutliers?: string[];
    };
    certifications?: {
        weightSumInvalid: WeightSumFinding[];
    };
    coverage?: {
        profile: string;
        level: string;
        hasMissing: boolean;
        hasThin: boolean;
        skills: ReturnType<typeof computeCoverage>["skills"];
    };
    recommendations: AuditRecommendation[];
    text: string;
}
export interface AuditRun {
    projectRoot: string;
    document: AuditDocument;
}
export declare function jaccardSimilarity(a: string, b: string): number;
export declare function findLexicalDuplicates(questions: Question[], threshold?: number): LexicalDuplicate[];
export interface RunAuditOptions {
    startDir: string;
    profile?: string;
    level?: string;
    duplicateThreshold?: number;
}
export declare function runMethodologyAudit(options: RunAuditOptions): AuditRun;
//# sourceMappingURL=audit.d.ts.map