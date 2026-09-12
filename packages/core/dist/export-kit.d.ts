import { type LoadWarning } from "./loaders.js";
import type { ContentBasis, Question, Skill, Term } from "./schemas.js";
export declare const EXPORT_KIT_SCHEMA: "sdm.export.kit/v1";
export declare const KIT_PROBE_TYPES: readonly ["open", "code"];
export type KitProbeType = (typeof KIT_PROBE_TYPES)[number];
export declare const KIT_WARNING_CODES: readonly ["KIT_NO_PROBE_QUESTION", "KIT_EXPLANATION_MISSING", "KIT_SKILL_DESCRIPTION_EMPTY", "KIT_NO_WORK_SAMPLE", "KIT_PROBE_RUBRIC_MISSING", "KIT_GLOSSARY_EMPTY", "KIT_GLOSSARY_FALLBACK_SKILL", "KIT_GLOSSARY_PRODUCT_HEAVY", "KIT_SECURITY_SKILL_MISSING", "KIT_TERM_UNLINKED"];
export type KitWarningCode = (typeof KIT_WARNING_CODES)[number];
export interface KitWarning {
    code: KitWarningCode;
    message: string;
    skill?: string;
    questionId?: string;
    termId?: string;
}
export interface KitRubricRow {
    score: 0 | 1 | 2 | 3;
    description: string;
}
export interface KitProbe {
    id: string;
    text: string;
    type: Question["type"];
    difficulty: number;
    explanation?: string;
    expected?: string | string[];
    validationCriteria?: string[];
    topics: string[];
    evidence?: Question["evidence"];
    min_depth?: number;
    minDepthBand?: string;
    minDepthLabel?: string;
    red_flags?: string[];
    rubric?: KitRubricRow[];
}
export interface KitModule {
    skill: string;
    title: string;
    description: string;
    topics: string[];
    depth: number;
    weight: number;
    depthBand: string;
    depthLabel: string;
    probes: KitProbe[];
    assessmentQuestionCount?: number;
}
export interface KitGlossaryEntry {
    id: string;
    term: string;
    definition: string;
    kind?: "concept" | "product";
    source: "library_term" | "skill_fallback";
}
export interface KitChecklistItem {
    skill: string;
    skillName: string;
    depth: number;
    weight: number;
    depthBand: string;
    depthLabel: string;
}
export interface ExportKitDocument {
    schemaVersion: typeof EXPORT_KIT_SCHEMA;
    id: string;
    profile: string;
    level: string;
    title: string;
    modules: KitModule[];
    glossary: KitGlossaryEntry[];
    checklist: KitChecklistItem[];
    warnings: KitWarning[];
    meta: {
        moduleOrder: "depends_on_topo" | "alpha_fallback";
        basis?: ContentBasis;
        revision?: string;
    };
}
export type ExportKitFormat = "json" | "html";
export interface ExportKitOptions {
    startDir: string;
    profile: string;
    level: string;
    format?: string;
    strict?: boolean;
}
export interface ExportKitRun {
    projectRoot: string;
    format: ExportKitFormat;
    document: ExportKitDocument;
    html?: string;
    loadWarnings: LoadWarning[];
}
export declare function parseKitFormat(value?: string): ExportKitFormat;
export declare function isKitProbeType(type: Question["type"]): type is KitProbeType;
export declare function isMiddlePlusLevel(levelId: string, levelTitle: string): boolean;
export declare function collectKitWarnings(input: {
    skills: Skill[];
    questionsBySkill: Map<string, Question[]>;
    requiredSkillIds: Set<string>;
    levelId: string;
    levelTitle: string;
    glossary: KitGlossaryEntry[];
    allTerms: Term[];
    usedTermIds: Set<string>;
    glossaryFromTerms: boolean;
}): KitWarning[];
export declare function exportKit(options: ExportKitOptions): ExportKitRun;
export { renderKitHtml } from "./export-kit-html.js";
//# sourceMappingURL=export-kit.d.ts.map