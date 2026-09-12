import { z } from "zod";
import { type CorpusManifest } from "./corpus-scan.js";
import { type SdmLocale } from "./locale.js";
export declare const QUALITY_REPORT_SCHEMA: "sdm.quality.report/v1";
export declare const DENSITY_LEVELS: readonly ["full", "partial", "thin", "none"];
export type DensityLevel = (typeof DENSITY_LEVELS)[number];
export declare const DENSITY_SYMBOL: Record<DensityLevel, string>;
export declare const MATRIX_LEGEND_RU = "\u25CF\u25CF\u25CF \u043F\u043B\u043E\u0442\u043D\u043E\u0435 \u00B7 \u25CF\u25CF\u25CB \u0435\u0441\u0442\u044C \u0441 \u0434\u044B\u0440\u0430\u043C\u0438 \u00B7 \u25CF\u25CB\u25CB \u0442\u043E\u043D\u043A\u043E \u00B7 \u25CB\u25CB\u25CB \u043F\u043E\u0447\u0442\u0438 \u043D\u0435\u0442";
export declare const MATRIX_LEGEND_EN = "\u25CF\u25CF\u25CF dense \u00B7 \u25CF\u25CF\u25CB with gaps \u00B7 \u25CF\u25CB\u25CB thin \u00B7 \u25CB\u25CB\u25CB almost none";
export declare const BUILTIN_GLOSSARY_RU: {
    term: string;
    definition: string;
}[];
export declare const BUILTIN_GLOSSARY_EN: {
    term: string;
    definition: string;
}[];
export declare const QualityReportDocumentSchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<"sdm.quality.report/v1">;
    id: z.ZodString;
    createdAt: z.ZodString;
    mode: z.ZodEnum<["methodology", "corpus", "diff"]>;
    locale: z.ZodEnum<["ru", "en"]>;
    scope: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    verdict: z.ZodString;
    score: z.ZodNumber;
    readiness: z.ZodEnum<["high", "medium", "low"]>;
    summaryRu: z.ZodString;
    summaryEn: z.ZodOptional<z.ZodString>;
    matrix: z.ZodObject<{
        rows: z.ZodArray<z.ZodString, "many">;
        cols: z.ZodArray<z.ZodString, "many">;
        cells: z.ZodArray<z.ZodObject<{
            row: z.ZodString;
            col: z.ZodString;
            density: z.ZodEnum<["full", "partial", "thin", "none"]>;
            symbol: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            symbol: string;
            row: string;
            col: string;
            density: "none" | "thin" | "partial" | "full";
        }, {
            symbol: string;
            row: string;
            col: string;
            density: "none" | "thin" | "partial" | "full";
        }>, "many">;
        legend: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        cells: {
            symbol: string;
            row: string;
            col: string;
            density: "none" | "thin" | "partial" | "full";
        }[];
        rows: string[];
        cols: string[];
        legend: string;
    }, {
        cells: {
            symbol: string;
            row: string;
            col: string;
            density: "none" | "thin" | "partial" | "full";
        }[];
        rows: string[];
        cols: string[];
        legend: string;
    }>;
    topActions: z.ZodArray<z.ZodObject<{
        priority: z.ZodEnum<["high", "medium", "low"]>;
        message: z.ZodString;
        code: z.ZodOptional<z.ZodString>;
        entityRefs: z.ZodDefault<z.ZodArray<z.ZodObject<{
            kind: z.ZodString;
            id: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            kind: string;
        }, {
            id: string;
            kind: string;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        message: string;
        priority: "high" | "medium" | "low";
        entityRefs: {
            id: string;
            kind: string;
        }[];
        code?: string | undefined;
    }, {
        message: string;
        priority: "high" | "medium" | "low";
        code?: string | undefined;
        entityRefs?: {
            id: string;
            kind: string;
        }[] | undefined;
    }>, "many">;
    glossary: z.ZodArray<z.ZodObject<{
        term: z.ZodString;
        definition: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        definition: string;
        term: string;
    }, {
        definition: string;
        term: string;
    }>, "many">;
    entityScores: z.ZodArray<z.ZodObject<{
        kind: z.ZodString;
        id: z.ZodString;
        score: z.ZodOptional<z.ZodNumber>;
        density: z.ZodOptional<z.ZodEnum<["full", "partial", "thin", "none"]>>;
        label: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        kind: string;
        label?: string | undefined;
        score?: number | undefined;
        density?: "none" | "thin" | "partial" | "full" | undefined;
    }, {
        id: string;
        kind: string;
        label?: string | undefined;
        score?: number | undefined;
        density?: "none" | "thin" | "partial" | "full" | undefined;
    }>, "many">;
    findings: z.ZodArray<z.ZodObject<{
        code: z.ZodString;
        severity: z.ZodEnum<["info", "warn", "error"]>;
        message: z.ZodString;
        entityRefs: z.ZodDefault<z.ZodArray<z.ZodObject<{
            kind: z.ZodString;
            id: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            kind: string;
        }, {
            id: string;
            kind: string;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        code: string;
        message: string;
        severity: "info" | "warn" | "error";
        entityRefs: {
            id: string;
            kind: string;
        }[];
    }, {
        code: string;
        message: string;
        severity: "info" | "warn" | "error";
        entityRefs?: {
            id: string;
            kind: string;
        }[] | undefined;
    }>, "many">;
    contentHash: z.ZodString;
    auditRef: z.ZodOptional<z.ZodObject<{
        schemaVersion: z.ZodString;
        hasMissing: z.ZodOptional<z.ZodBoolean>;
        hasThin: z.ZodOptional<z.ZodBoolean>;
        duplicateCount: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        schemaVersion: string;
        hasMissing?: boolean | undefined;
        hasThin?: boolean | undefined;
        duplicateCount?: number | undefined;
    }, {
        schemaVersion: string;
        hasMissing?: boolean | undefined;
        hasThin?: boolean | undefined;
        duplicateCount?: number | undefined;
    }>>;
    corpusManifest: z.ZodOptional<z.ZodUnknown>;
    diff: z.ZodOptional<z.ZodObject<{
        baselineId: z.ZodString;
        scoreDelta: z.ZodNumber;
        matrixChanges: z.ZodArray<z.ZodObject<{
            row: z.ZodString;
            col: z.ZodString;
            from: z.ZodEnum<["full", "partial", "thin", "none"]>;
            to: z.ZodEnum<["full", "partial", "thin", "none"]>;
            fromSymbol: z.ZodString;
            toSymbol: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            to: "none" | "thin" | "partial" | "full";
            from: "none" | "thin" | "partial" | "full";
            row: string;
            col: string;
            fromSymbol: string;
            toSymbol: string;
        }, {
            to: "none" | "thin" | "partial" | "full";
            from: "none" | "thin" | "partial" | "full";
            row: string;
            col: string;
            fromSymbol: string;
            toSymbol: string;
        }>, "many">;
        newFindingCodes: z.ZodArray<z.ZodString, "many">;
        resolvedFindingCodes: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        baselineId: string;
        scoreDelta: number;
        matrixChanges: {
            to: "none" | "thin" | "partial" | "full";
            from: "none" | "thin" | "partial" | "full";
            row: string;
            col: string;
            fromSymbol: string;
            toSymbol: string;
        }[];
        newFindingCodes: string[];
        resolvedFindingCodes: string[];
    }, {
        baselineId: string;
        scoreDelta: number;
        matrixChanges: {
            to: "none" | "thin" | "partial" | "full";
            from: "none" | "thin" | "partial" | "full";
            row: string;
            col: string;
            fromSymbol: string;
            toSymbol: string;
        }[];
        newFindingCodes: string[];
        resolvedFindingCodes: string[];
    }>>;
    savedPath: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    score: number;
    mode: "methodology" | "corpus" | "diff";
    scope: Record<string, unknown>;
    locale: "ru" | "en";
    glossary: {
        definition: string;
        term: string;
    }[];
    schemaVersion: "sdm.quality.report/v1";
    matrix: {
        cells: {
            symbol: string;
            row: string;
            col: string;
            density: "none" | "thin" | "partial" | "full";
        }[];
        rows: string[];
        cols: string[];
        legend: string;
    };
    contentHash: string;
    createdAt: string;
    verdict: string;
    readiness: "high" | "medium" | "low";
    summaryRu: string;
    topActions: {
        message: string;
        priority: "high" | "medium" | "low";
        entityRefs: {
            id: string;
            kind: string;
        }[];
        code?: string | undefined;
    }[];
    entityScores: {
        id: string;
        kind: string;
        label?: string | undefined;
        score?: number | undefined;
        density?: "none" | "thin" | "partial" | "full" | undefined;
    }[];
    findings: {
        code: string;
        message: string;
        severity: "info" | "warn" | "error";
        entityRefs: {
            id: string;
            kind: string;
        }[];
    }[];
    diff?: {
        baselineId: string;
        scoreDelta: number;
        matrixChanges: {
            to: "none" | "thin" | "partial" | "full";
            from: "none" | "thin" | "partial" | "full";
            row: string;
            col: string;
            fromSymbol: string;
            toSymbol: string;
        }[];
        newFindingCodes: string[];
        resolvedFindingCodes: string[];
    } | undefined;
    summaryEn?: string | undefined;
    auditRef?: {
        schemaVersion: string;
        hasMissing?: boolean | undefined;
        hasThin?: boolean | undefined;
        duplicateCount?: number | undefined;
    } | undefined;
    corpusManifest?: unknown;
    savedPath?: string | undefined;
}, {
    id: string;
    score: number;
    mode: "methodology" | "corpus" | "diff";
    scope: Record<string, unknown>;
    locale: "ru" | "en";
    glossary: {
        definition: string;
        term: string;
    }[];
    schemaVersion: "sdm.quality.report/v1";
    matrix: {
        cells: {
            symbol: string;
            row: string;
            col: string;
            density: "none" | "thin" | "partial" | "full";
        }[];
        rows: string[];
        cols: string[];
        legend: string;
    };
    contentHash: string;
    createdAt: string;
    verdict: string;
    readiness: "high" | "medium" | "low";
    summaryRu: string;
    topActions: {
        message: string;
        priority: "high" | "medium" | "low";
        code?: string | undefined;
        entityRefs?: {
            id: string;
            kind: string;
        }[] | undefined;
    }[];
    entityScores: {
        id: string;
        kind: string;
        label?: string | undefined;
        score?: number | undefined;
        density?: "none" | "thin" | "partial" | "full" | undefined;
    }[];
    findings: {
        code: string;
        message: string;
        severity: "info" | "warn" | "error";
        entityRefs?: {
            id: string;
            kind: string;
        }[] | undefined;
    }[];
    diff?: {
        baselineId: string;
        scoreDelta: number;
        matrixChanges: {
            to: "none" | "thin" | "partial" | "full";
            from: "none" | "thin" | "partial" | "full";
            row: string;
            col: string;
            fromSymbol: string;
            toSymbol: string;
        }[];
        newFindingCodes: string[];
        resolvedFindingCodes: string[];
    } | undefined;
    summaryEn?: string | undefined;
    auditRef?: {
        schemaVersion: string;
        hasMissing?: boolean | undefined;
        hasThin?: boolean | undefined;
        duplicateCount?: number | undefined;
    } | undefined;
    corpusManifest?: unknown;
    savedPath?: string | undefined;
}>;
export type QualityReportDocument = z.infer<typeof QualityReportDocumentSchema>;
export interface BuildQualityReportOptions {
    startDir?: string;
    sourcesDir?: string;
    profile?: string;
    level?: string;
    locale?: string;
    /** When set, build fresh report then attach diff against saved baseline. */
    diffReportId?: string;
    save?: boolean;
}
export interface QualityReportRun {
    document: QualityReportDocument;
    projectRoot: string | null;
    reportsRoot: string;
    manifest?: CorpusManifest;
}
export declare function qualityReportsDir(reportsRoot: string): string;
export declare function loadQualityReport(reportsRoot: string, reportId: string): QualityReportDocument;
export declare function saveQualityReport(reportsRoot: string, document: QualityReportDocument): string;
export declare function diffQualityReports(baseline: QualityReportDocument, current: QualityReportDocument): NonNullable<QualityReportDocument["diff"]>;
export declare function buildQualityReport(options?: BuildQualityReportOptions): QualityReportRun;
export declare function formatQualityReportText(document: QualityReportDocument, locale?: SdmLocale): string;
//# sourceMappingURL=quality-report.d.ts.map