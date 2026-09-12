import { z } from "zod";
export declare const CORPUS_MANIFEST_SCHEMA: "sdm.corpus.manifest/v1";
export declare const CORPUS_ARTIFACT_TYPES: readonly ["matrix", "question_bank", "program", "rubric", "ops", "stub", "unknown"];
export type CorpusArtifactType = (typeof CORPUS_ARTIFACT_TYPES)[number];
export declare const CORPUS_ENTRY_STATUSES: readonly ["ssot", "quarry", "drop", "rewrite", "unknown"];
export type CorpusEntryStatus = (typeof CORPUS_ENTRY_STATUSES)[number];
export declare const CorpusEntrySchema: z.ZodObject<{
    path: z.ZodString;
    artifactType: z.ZodEnum<["matrix", "question_bank", "program", "rubric", "ops", "stub", "unknown"]>;
    status: z.ZodEnum<["ssot", "quarry", "drop", "rewrite", "unknown"]>;
    contentHash: z.ZodString;
    lineCount: z.ZodNumber;
    headings: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    signals: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    path: string;
    status: "unknown" | "ssot" | "quarry" | "drop" | "rewrite";
    artifactType: "unknown" | "rubric" | "matrix" | "question_bank" | "program" | "ops" | "stub";
    contentHash: string;
    lineCount: number;
    headings: string[];
    signals: string[];
}, {
    path: string;
    status: "unknown" | "ssot" | "quarry" | "drop" | "rewrite";
    artifactType: "unknown" | "rubric" | "matrix" | "question_bank" | "program" | "ops" | "stub";
    contentHash: string;
    lineCount: number;
    headings?: string[] | undefined;
    signals?: string[] | undefined;
}>;
export declare const CorpusManifestSchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<"sdm.corpus.manifest/v1">;
    generatedAt: z.ZodString;
    sourcesRoot: z.ZodString;
    entries: z.ZodArray<z.ZodObject<{
        path: z.ZodString;
        artifactType: z.ZodEnum<["matrix", "question_bank", "program", "rubric", "ops", "stub", "unknown"]>;
        status: z.ZodEnum<["ssot", "quarry", "drop", "rewrite", "unknown"]>;
        contentHash: z.ZodString;
        lineCount: z.ZodNumber;
        headings: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        signals: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        path: string;
        status: "unknown" | "ssot" | "quarry" | "drop" | "rewrite";
        artifactType: "unknown" | "rubric" | "matrix" | "question_bank" | "program" | "ops" | "stub";
        contentHash: string;
        lineCount: number;
        headings: string[];
        signals: string[];
    }, {
        path: string;
        status: "unknown" | "ssot" | "quarry" | "drop" | "rewrite";
        artifactType: "unknown" | "rubric" | "matrix" | "question_bank" | "program" | "ops" | "stub";
        contentHash: string;
        lineCount: number;
        headings?: string[] | undefined;
        signals?: string[] | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    entries: {
        path: string;
        status: "unknown" | "ssot" | "quarry" | "drop" | "rewrite";
        artifactType: "unknown" | "rubric" | "matrix" | "question_bank" | "program" | "ops" | "stub";
        contentHash: string;
        lineCount: number;
        headings: string[];
        signals: string[];
    }[];
    schemaVersion: "sdm.corpus.manifest/v1";
    generatedAt: string;
    sourcesRoot: string;
}, {
    entries: {
        path: string;
        status: "unknown" | "ssot" | "quarry" | "drop" | "rewrite";
        artifactType: "unknown" | "rubric" | "matrix" | "question_bank" | "program" | "ops" | "stub";
        contentHash: string;
        lineCount: number;
        headings?: string[] | undefined;
        signals?: string[] | undefined;
    }[];
    schemaVersion: "sdm.corpus.manifest/v1";
    generatedAt: string;
    sourcesRoot: string;
}>;
export type CorpusEntry = z.infer<typeof CorpusEntrySchema>;
export type CorpusManifest = z.infer<typeof CorpusManifestSchema>;
/** Topic-like headings used for corpus matrix rows (heuristic). */
export declare function extractTopicCandidates(manifest: CorpusManifest): string[];
export interface ScanCorpusOptions {
    sourcesDir: string;
}
export declare function scanCorpusSources(options: ScanCorpusOptions): CorpusManifest;
//# sourceMappingURL=corpus-scan.d.ts.map