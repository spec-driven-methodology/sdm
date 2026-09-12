import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { type Question, type TermKind } from "@spec-driven-methodology/core";
export type ToolContent = {
    content: Array<{
        type: "text";
        text: string;
    }>;
    isError?: boolean;
};
/** Resolve methodology start dir: explicit project → SDM_PROJECT_ROOT → cwd. */
export declare function resolveStartDir(project?: string): string;
/** @deprecated Prefer resolveStartDir(project) for multi-project MCP. */
export declare function projectCwd(): string;
export declare function okJson(payload: unknown): ToolContent;
export declare function errJson(err: unknown): ToolContent;
/** Parse JSON payload from a ToolContent result. */
export declare function parseToolJson(result: ToolContent): Record<string, unknown>;
/** Run a tool handler and append an action-log line (file only — never stdout). */
export declare function loggedTool(name: string, args: unknown, fn: () => Promise<ToolContent>): Promise<ToolContent>;
export declare function toolDoctor(args?: {
    project?: string;
}): Promise<ToolContent>;
/** Product identity — no methodology project required. `project` is accepted but ignored. */
export declare function toolAbout(_args?: {
    project?: string;
}): Promise<ToolContent>;
/** Locate the nearest SDM methodology project from a given directory. */
export declare function toolLocateProject(args: {
    dir: string;
}): Promise<ToolContent>;
/** List SDM methodology projects under a workspace directory. */
export declare function toolListProjects(args: {
    workspaceDir: string;
    maxDepth?: number;
}): Promise<ToolContent>;
export declare function toolSuggest(args?: {
    project?: string;
    profile?: string;
    level?: string;
}): Promise<ToolContent>;
export declare function toolInit(args: {
    targetDir?: string;
    project?: string;
    name?: string;
    withExamples?: boolean;
    force?: boolean;
}): Promise<ToolContent>;
export declare function toolPlayerSync(args: {
    project?: string;
    force?: boolean;
}): Promise<ToolContent>;
export declare function toolStudioSync(args: {
    project?: string;
    force?: boolean;
}): Promise<ToolContent>;
export declare function toolStudioPushView(args: {
    project?: string;
    viewJson: string;
}): Promise<ToolContent>;
export declare function toolStudioPushCoverage(args: {
    project?: string;
    profile: string;
    level: string;
}): Promise<ToolContent>;
export declare function toolStudioPullAction(args: {
    project?: string;
    consume?: boolean;
}): Promise<ToolContent>;
export declare function toolSkillAdd(args: {
    project?: string;
    id: string;
    name: string;
    category?: string;
    description?: string;
    topics?: string[];
    force?: boolean;
}): Promise<ToolContent>;
export declare function toolSkillLink(args: {
    project?: string;
    id: string;
    dependsOn?: string;
    relatedTo?: string;
}): Promise<ToolContent>;
export declare function toolSkillSuggestLinks(args: {
    project?: string;
}): Promise<ToolContent>;
export declare function toolQuestionDeepValidate(args: {
    project?: string;
}): Promise<ToolContent>;
export declare function toolTopicRegistry(args: {
    project?: string;
}): Promise<ToolContent>;
export declare function toolTopicSync(args: {
    project?: string;
}): Promise<ToolContent>;
export declare function toolCourseHeal(args: {
    project?: string;
}): Promise<ToolContent>;
export declare function toolProfileCreate(args: {
    project?: string;
    profile: string;
    title: string;
    force?: boolean;
}): Promise<ToolContent>;
export declare function toolCertCreate(args: {
    project?: string;
    profile: string;
    level: string;
    levelTitle: string;
    requirements: string[];
    description?: string;
    threshold?: number;
    force?: boolean;
    noNormalizeWeights?: boolean;
}): Promise<ToolContent>;
export declare function toolCertPatch(args: {
    project?: string;
    level: string;
    profile?: string;
    addRequirements?: string[];
    setRequirements?: string[];
    removeRequirements?: string[];
    from?: string[];
    absorbInto?: string;
    title?: string;
    description?: string;
    threshold?: number;
}): Promise<ToolContent>;
export declare function toolCertReweight(args: {
    project?: string;
    level: string;
    profile?: string;
    skill?: string;
    delta?: number;
    from?: string[];
    set?: string[];
}): Promise<ToolContent>;
export declare function toolCertCoverage(args: {
    project?: string;
    profile: string;
    level: string;
    team?: string;
}): Promise<ToolContent>;
export declare function toolAudit(args: {
    project?: string;
    profile?: string;
    level?: string;
}): Promise<ToolContent>;
export declare function toolQualityReport(args: {
    project?: string;
    sources?: string;
    profile?: string;
    level?: string;
    diff?: string;
    save?: boolean;
    locale?: string;
}): Promise<ToolContent>;
export declare function toolCertGaps(args: {
    project?: string;
    profile: string;
    level: string;
    team?: string;
}): Promise<ToolContent>;
export declare function toolQuestionAdd(args: {
    project?: string;
    skill: string;
    type: Question["type"];
    difficulty: number;
    text: string;
    options?: string[];
    correct?: number | number[];
    expected?: string | string[];
    explanation?: string;
    code_template?: string;
    topics?: string[];
    evidence?: Question["evidence"];
    min_depth?: number;
    red_flags?: string[];
    rubric?: {
        score: 0 | 1 | 2 | 3;
        description: string;
    }[];
    id?: string;
    force?: boolean;
}): Promise<ToolContent>;
export declare function toolQuestionValidate(args: {
    project?: string;
    skill: string;
    type: Question["type"];
    difficulty: number;
    text: string;
    options?: string[];
    correct?: number | number[];
    expected?: string | string[];
    explanation?: string;
    code_template?: string;
    topics?: string[];
    id?: string;
}): Promise<ToolContent>;
export declare function toolQuestionList(args: {
    project?: string;
    skill?: string;
}): Promise<ToolContent>;
export declare function toolTermAdd(args: {
    project?: string;
    id: string;
    term: string;
    definition: string;
    aliases?: string[];
    skills?: string[];
    kind?: TermKind;
    force?: boolean;
}): Promise<ToolContent>;
export declare function toolTermList(args: {
    project?: string;
    skill?: string;
}): Promise<ToolContent>;
export declare function toolQuestionGenerate(args: {
    project?: string;
    skill: string;
    count?: number;
    difficultyMin?: number;
    difficultyMax?: number;
    type?: Question["type"];
    mix?: string;
    profile?: string;
    level?: string;
}): Promise<ToolContent>;
export declare function toolExportTest(args: {
    project?: string;
    profile: string;
    level: string;
    format?: "json" | "csv";
    team?: string;
    adaptive?: boolean;
    seed?: number;
    perSkill?: number;
    shuffleOptions?: boolean;
    includeTypes?: string[];
    excludeTypes?: string[];
    includeSkills?: string[];
    excludeSkills?: string[];
    includeQuestions?: string[];
}): Promise<ToolContent>;
export declare function toolExportCourse(args: {
    project?: string;
    profile?: string;
    level?: string;
    fromGaps?: boolean;
    skill?: string;
    topic?: string;
    fromQuestions?: string[];
    depth?: string;
    format?: string;
    includePractice?: boolean;
    locale?: string;
    strictContext?: boolean;
}): Promise<ToolContent>;
export declare function toolExportKit(args: {
    project?: string;
    profile: string;
    level: string;
    format?: string;
    strict?: boolean;
}): Promise<ToolContent>;
export declare function toolExportConfluence(args: {
    project?: string;
    profile: string;
    level?: string;
    team?: string;
}): Promise<ToolContent>;
export declare function toolIndexRebuild(args?: {
    project?: string;
}): Promise<ToolContent>;
export declare function toolSearch(args: {
    project?: string;
    query: string;
    kind?: "skill" | "question";
}): Promise<ToolContent>;
export declare function toolExportMatrix(args: {
    project?: string;
    profile: string;
    format?: "csv" | "json";
}): Promise<ToolContent>;
export declare function toolExportMermaid(args: {
    project?: string;
    profile: string;
    level: string;
    coverage?: boolean;
}): Promise<ToolContent>;
export declare function toolSkillGraph(args: {
    project?: string;
    profile: string;
    level: string;
    coverage?: boolean;
}): Promise<ToolContent>;
export declare function toolSkillImpact(args: {
    project?: string;
    skill: string;
}): Promise<ToolContent>;
export declare function toolContentStale(args: {
    project?: string;
    skill?: string;
    profile?: string;
    level?: string;
}): Promise<ToolContent>;
export declare const TOOL_NAMES: readonly ["about", "suggest", "doctor", "audit", "quality_report", "init", "locate_project", "list_projects", "player_sync", "studio_sync", "studio_push_view", "studio_push_coverage", "studio_pull_action", "skill_add", "skill_link", "skill_graph", "skill_impact", "skill_suggest_links", "content_stale", "profile_create", "cert_create", "cert_patch", "cert_reweight", "cert_coverage", "cert_gaps", "question_add", "question_validate", "question_list", "question_deep_validate", "term_add", "term_list", "question_generate", "export_test", "export_matrix", "export_learning", "export_course", "export_mermaid", "export_confluence", "export_kit", "index_rebuild", "search", "topic_registry", "topic_sync", "course_heal"];
export type ToolName = (typeof TOOL_NAMES)[number];
/**
 * Invoke a tool handler by name (for tests). Does not start stdio.
 */
export declare function runTool(name: ToolName, args?: Record<string, unknown>): Promise<ToolContent>;
/** Zod input shapes for each tool (SSOT for registerTools + description tests). */
export declare const TOOL_INPUT_SHAPES: {
    about: {
        project: z.ZodOptional<z.ZodString>;
    };
    suggest: {
        project: z.ZodOptional<z.ZodString>;
        profile: z.ZodOptional<z.ZodString>;
        level: z.ZodOptional<z.ZodString>;
    };
    doctor: {
        project: z.ZodOptional<z.ZodString>;
    };
    audit: {
        project: z.ZodOptional<z.ZodString>;
        profile: z.ZodOptional<z.ZodString>;
        level: z.ZodOptional<z.ZodString>;
    };
    quality_report: {
        project: z.ZodOptional<z.ZodString>;
        sources: z.ZodOptional<z.ZodString>;
        profile: z.ZodOptional<z.ZodString>;
        level: z.ZodOptional<z.ZodString>;
        diff: z.ZodOptional<z.ZodString>;
        save: z.ZodOptional<z.ZodBoolean>;
        locale: z.ZodOptional<z.ZodString>;
    };
    init: {
        project: z.ZodOptional<z.ZodString>;
        targetDir: z.ZodOptional<z.ZodString>;
        name: z.ZodOptional<z.ZodString>;
        withExamples: z.ZodOptional<z.ZodBoolean>;
        force: z.ZodOptional<z.ZodBoolean>;
    };
    locate_project: {
        dir: z.ZodString;
    };
    list_projects: {
        workspaceDir: z.ZodString;
        maxDepth: z.ZodOptional<z.ZodNumber>;
    };
    player_sync: {
        project: z.ZodOptional<z.ZodString>;
        force: z.ZodOptional<z.ZodBoolean>;
    };
    studio_sync: {
        project: z.ZodOptional<z.ZodString>;
        force: z.ZodOptional<z.ZodBoolean>;
    };
    studio_push_view: {
        project: z.ZodOptional<z.ZodString>;
        viewJson: z.ZodString;
    };
    studio_push_coverage: {
        project: z.ZodOptional<z.ZodString>;
        profile: z.ZodString;
        level: z.ZodString;
    };
    studio_pull_action: {
        project: z.ZodOptional<z.ZodString>;
        consume: z.ZodOptional<z.ZodBoolean>;
    };
    skill_add: {
        project: z.ZodOptional<z.ZodString>;
        id: z.ZodString;
        name: z.ZodString;
        category: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        topics: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        force: z.ZodOptional<z.ZodBoolean>;
    };
    skill_link: {
        project: z.ZodOptional<z.ZodString>;
        id: z.ZodString;
        dependsOn: z.ZodOptional<z.ZodString>;
        relatedTo: z.ZodOptional<z.ZodString>;
    };
    skill_graph: {
        project: z.ZodOptional<z.ZodString>;
        profile: z.ZodString;
        level: z.ZodString;
        coverage: z.ZodOptional<z.ZodBoolean>;
    };
    skill_impact: {
        project: z.ZodOptional<z.ZodString>;
        skill: z.ZodString;
    };
    content_stale: {
        project: z.ZodOptional<z.ZodString>;
        skill: z.ZodOptional<z.ZodString>;
        profile: z.ZodOptional<z.ZodString>;
        level: z.ZodOptional<z.ZodString>;
    };
    profile_create: {
        project: z.ZodOptional<z.ZodString>;
        profile: z.ZodString;
        title: z.ZodString;
        force: z.ZodOptional<z.ZodBoolean>;
    };
    cert_create: {
        project: z.ZodOptional<z.ZodString>;
        profile: z.ZodString;
        level: z.ZodString;
        levelTitle: z.ZodString;
        requirements: z.ZodArray<z.ZodString, "many">;
        description: z.ZodOptional<z.ZodString>;
        threshold: z.ZodOptional<z.ZodNumber>;
        force: z.ZodOptional<z.ZodBoolean>;
        noNormalizeWeights: z.ZodOptional<z.ZodBoolean>;
    };
    cert_patch: {
        project: z.ZodOptional<z.ZodString>;
        level: z.ZodString;
        profile: z.ZodOptional<z.ZodString>;
        addRequirements: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        setRequirements: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        removeRequirements: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        from: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        absorbInto: z.ZodOptional<z.ZodString>;
        title: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        threshold: z.ZodOptional<z.ZodNumber>;
    };
    cert_reweight: {
        project: z.ZodOptional<z.ZodString>;
        level: z.ZodString;
        profile: z.ZodOptional<z.ZodString>;
        skill: z.ZodOptional<z.ZodString>;
        delta: z.ZodOptional<z.ZodNumber>;
        from: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        set: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    };
    cert_coverage: {
        project: z.ZodOptional<z.ZodString>;
        profile: z.ZodString;
        level: z.ZodString;
        team: z.ZodOptional<z.ZodString>;
    };
    cert_gaps: {
        project: z.ZodOptional<z.ZodString>;
        profile: z.ZodString;
        level: z.ZodString;
        team: z.ZodOptional<z.ZodString>;
    };
    question_add: {
        project: z.ZodOptional<z.ZodString>;
        skill: z.ZodString;
        type: z.ZodEnum<["single_choice", "multi_choice", "code", "open"]>;
        difficulty: z.ZodNumber;
        text: z.ZodString;
        options: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        correct: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodArray<z.ZodNumber, "many">]>>;
        expected: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
        explanation: z.ZodOptional<z.ZodString>;
        code_template: z.ZodOptional<z.ZodString>;
        topics: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        evidence: z.ZodOptional<z.ZodEnum<["knowledge", "skill", "artifact"]>>;
        min_depth: z.ZodOptional<z.ZodNumber>;
        red_flags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        rubric: z.ZodOptional<z.ZodArray<z.ZodObject<{
            score: z.ZodUnion<[z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>;
            description: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            description: string;
            score: 0 | 1 | 2 | 3;
        }, {
            description: string;
            score: 0 | 1 | 2 | 3;
        }>, "many">>;
        id: z.ZodOptional<z.ZodString>;
        force: z.ZodOptional<z.ZodBoolean>;
    };
    question_validate: {
        project: z.ZodOptional<z.ZodString>;
        skill: z.ZodString;
        type: z.ZodEnum<["single_choice", "multi_choice", "code", "open"]>;
        difficulty: z.ZodNumber;
        text: z.ZodString;
        options: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        correct: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodArray<z.ZodNumber, "many">]>>;
        expected: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
        explanation: z.ZodOptional<z.ZodString>;
        code_template: z.ZodOptional<z.ZodString>;
        topics: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        id: z.ZodOptional<z.ZodString>;
    };
    question_list: {
        project: z.ZodOptional<z.ZodString>;
        skill: z.ZodOptional<z.ZodString>;
    };
    term_add: {
        project: z.ZodOptional<z.ZodString>;
        id: z.ZodString;
        term: z.ZodString;
        definition: z.ZodString;
        aliases: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        skills: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        kind: z.ZodOptional<z.ZodEnum<["concept", "product"]>>;
        force: z.ZodOptional<z.ZodBoolean>;
    };
    term_list: {
        project: z.ZodOptional<z.ZodString>;
        skill: z.ZodOptional<z.ZodString>;
    };
    question_generate: {
        project: z.ZodOptional<z.ZodString>;
        skill: z.ZodString;
        count: z.ZodOptional<z.ZodNumber>;
        difficultyMin: z.ZodOptional<z.ZodNumber>;
        difficultyMax: z.ZodOptional<z.ZodNumber>;
        type: z.ZodOptional<z.ZodEnum<["single_choice", "multi_choice", "code", "open"]>>;
        mix: z.ZodOptional<z.ZodEnum<["single", "mixed", "full"]>>;
        profile: z.ZodOptional<z.ZodString>;
        level: z.ZodOptional<z.ZodString>;
    };
    export_test: {
        project: z.ZodOptional<z.ZodString>;
        profile: z.ZodString;
        level: z.ZodString;
        format: z.ZodOptional<z.ZodEnum<["json", "csv"]>>;
        team: z.ZodOptional<z.ZodString>;
        adaptive: z.ZodOptional<z.ZodBoolean>;
        seed: z.ZodOptional<z.ZodNumber>;
        perSkill: z.ZodOptional<z.ZodNumber>;
        shuffleOptions: z.ZodOptional<z.ZodBoolean>;
        includeTypes: z.ZodOptional<z.ZodArray<z.ZodEnum<["single_choice", "multi_choice", "open", "code"]>, "many">>;
        excludeTypes: z.ZodOptional<z.ZodArray<z.ZodEnum<["single_choice", "multi_choice", "open", "code"]>, "many">>;
        includeSkills: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        excludeSkills: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        includeQuestions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    };
    export_matrix: {
        project: z.ZodOptional<z.ZodString>;
        profile: z.ZodString;
        format: z.ZodOptional<z.ZodEnum<["csv", "json"]>>;
    };
    export_learning: {
        project: z.ZodOptional<z.ZodString>;
        profile: z.ZodOptional<z.ZodString>;
        level: z.ZodOptional<z.ZodString>;
        fromGaps: z.ZodOptional<z.ZodBoolean>;
        skill: z.ZodOptional<z.ZodString>;
        topic: z.ZodOptional<z.ZodString>;
        fromQuestions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        depth: z.ZodOptional<z.ZodEnum<["brief", "standard", "detailed"]>>;
        format: z.ZodOptional<z.ZodEnum<["howto", "notes", "cheatsheet", "course", "concept"]>>;
        includePractice: z.ZodOptional<z.ZodBoolean>;
        locale: z.ZodOptional<z.ZodString>;
        strictContext: z.ZodOptional<z.ZodBoolean>;
    };
    export_course: {
        project: z.ZodOptional<z.ZodString>;
        profile: z.ZodOptional<z.ZodString>;
        level: z.ZodOptional<z.ZodString>;
        fromGaps: z.ZodOptional<z.ZodBoolean>;
        skill: z.ZodOptional<z.ZodString>;
        topic: z.ZodOptional<z.ZodString>;
        fromQuestions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        depth: z.ZodOptional<z.ZodEnum<["brief", "standard", "detailed"]>>;
        format: z.ZodOptional<z.ZodEnum<["howto", "notes", "cheatsheet", "course", "concept"]>>;
        includePractice: z.ZodOptional<z.ZodBoolean>;
        locale: z.ZodOptional<z.ZodString>;
        strictContext: z.ZodOptional<z.ZodBoolean>;
    };
    export_mermaid: {
        project: z.ZodOptional<z.ZodString>;
        profile: z.ZodString;
        level: z.ZodString;
        coverage: z.ZodOptional<z.ZodBoolean>;
    };
    export_confluence: {
        project: z.ZodOptional<z.ZodString>;
        profile: z.ZodString;
        level: z.ZodOptional<z.ZodString>;
        team: z.ZodOptional<z.ZodString>;
    };
    export_kit: {
        project: z.ZodOptional<z.ZodString>;
        profile: z.ZodString;
        level: z.ZodString;
        format: z.ZodOptional<z.ZodEnum<["json", "html"]>>;
        strict: z.ZodOptional<z.ZodBoolean>;
    };
    index_rebuild: {
        project: z.ZodOptional<z.ZodString>;
    };
    search: {
        project: z.ZodOptional<z.ZodString>;
        query: z.ZodString;
        kind: z.ZodOptional<z.ZodEnum<["skill", "question"]>>;
    };
    skill_suggest_links: {
        project: z.ZodOptional<z.ZodString>;
    };
    question_deep_validate: {
        project: z.ZodOptional<z.ZodString>;
    };
    topic_registry: {
        project: z.ZodOptional<z.ZodString>;
    };
    topic_sync: {
        project: z.ZodOptional<z.ZodString>;
    };
    course_heal: {
        project: z.ZodOptional<z.ZodString>;
    };
};
/** Tool-level MCP descriptions (SSOT for registerTools). */
export declare const TOOL_DESCRIPTIONS: Record<ToolName, string>;
/** Non-empty Zod `.description` for a field (tests / hygiene). */
export declare function zodFieldDescription(schema: z.ZodTypeAny): string | undefined;
export declare function registerTools(server: McpServer): void;
/** Product display strings for MCP initialize (UI title/description). */
export declare const MCP_SERVER_TITLE = "SDM";
export declare const MCP_SERVER_DESCRIPTION = "Methodology-as-Specs Framework";
export declare function createServer(version?: string): McpServer;
//# sourceMappingURL=server.d.ts.map