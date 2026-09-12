import { type ExportQuestionFilter } from "./export-question-filter.js";
import { type ExportSkillFilter } from "./export-skill-filter.js";
import { type ExportTypeFilter } from "./export-type-filter.js";
import { type LoadWarning } from "./loaders.js";
import type { ContentBasis, Level, Question, Profile } from "./schemas.js";
export declare const EXPORT_TEST_SCHEMA = "sdm.export.test/v1";
export declare const EXPORT_MATRIX_SCHEMA = "sdm.export.matrix/v1";
export type ExportTestFormat = "json" | "csv";
export type ExportMatrixFormat = "csv" | "json";
export interface ExportTestDocument {
    schemaVersion: typeof EXPORT_TEST_SCHEMA;
    /** Stable upsert slot for external consumers. */
    id: string;
    profile: string;
    level: string;
    title: string;
    threshold: number;
    requirements: Level["requirements"];
    questions: Question[];
    meta: {
        questionCount: number;
        skillsMissingQuestions: string[];
        adaptive?: boolean;
        seed?: number;
        perSkill?: number;
        selectedIds?: string[];
        team?: string;
        typeFilter?: ExportTypeFilter;
        skillFilter?: ExportSkillFilter;
        questionFilter?: ExportQuestionFilter;
        weightsNormalized?: boolean;
        optionShuffle?: {
            enabled: true;
            seed?: number;
        };
        basis?: ContentBasis;
        /** Content fingerprint (basis hashes without capturedAt). */
        revision?: string;
    };
}
export interface ExportMatrixCell {
    skill: string;
    level: string;
    depth: number;
    weight: number;
}
export interface ExportMatrixDocument {
    schemaVersion: typeof EXPORT_MATRIX_SCHEMA;
    profile: string;
    title: string;
    levels: string[];
    cells: ExportMatrixCell[];
}
export interface ExportTestOptions {
    startDir: string;
    profile: string;
    level: string;
    format?: string;
    team?: string;
    adaptive?: boolean;
    seed?: number;
    perSkill?: number;
    /** Allowlist of question types (mutually exclusive with excludeTypes) */
    includeTypes?: string[];
    /** Denylist of question types (mutually exclusive with includeTypes) */
    excludeTypes?: string[];
    /** Allowlist of skill ids (mutually exclusive with excludeSkills) */
    includeSkills?: string[];
    /** Denylist of skill ids (mutually exclusive with includeSkills) */
    excludeSkills?: string[];
    /** Allowlist of question ids (applied after skill/type filters) */
    includeQuestions?: string[];
    /** Permute choice options and remap correct (library YAML unchanged). */
    shuffleOptions?: boolean;
}
export interface ExportMatrixOptions {
    startDir: string;
    profile: string;
    format?: string;
}
export type AssembledTestDocument = Omit<ExportTestDocument, "id">;
export interface ExportTestRun {
    projectRoot: string;
    format: ExportTestFormat;
    document: ExportTestDocument;
    csv: string | null;
    warnings: LoadWarning[];
}
export interface ExportMatrixRun {
    projectRoot: string;
    format: ExportMatrixFormat;
    document: ExportMatrixDocument;
    csv: string | null;
}
export declare function testDocumentToCsv(document: ExportTestDocument): string;
export declare function matrixDocumentToCsv(document: ExportMatrixDocument): string;
export declare function assembleTestDocument(profileId: string, level: Level, questions: Question[], options?: {
    adaptive?: boolean;
    seed?: number;
    perSkill?: number;
    team?: string;
    includeTypes?: string[];
    excludeTypes?: string[];
    includeSkills?: string[];
    excludeSkills?: string[];
    includeQuestions?: string[];
    shuffleOptions?: boolean;
    basis?: ContentBasis;
}): AssembledTestDocument;
export declare function assembleMatrixDocument(profile: Profile, levels: Level[]): ExportMatrixDocument;
/**
 * Assemble a consumer test package for a role + level.
 */
export declare function exportTest(options: ExportTestOptions): ExportTestRun;
/**
 * Assemble a competency matrix for a role (all listed levels).
 */
export declare function exportMatrix(options: ExportMatrixOptions): ExportMatrixRun;
/** Envelope document field for agent/MCP `--json` mode. */
export declare function exportDocumentPayload(format: "json" | "csv", document: ExportTestDocument | ExportMatrixDocument, csv: string | null): ExportTestDocument | ExportMatrixDocument | {
    csv: string;
};
//# sourceMappingURL=export.d.ts.map