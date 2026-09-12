import { z } from "zod";
/** Public CLI command paths for about capabilities (keep in sync when adding CLI). */
export declare const ABOUT_CLI_COMMANDS: readonly ["about", "suggest", "init", "doctor", "player sync", "studio sync", "studio push-view", "studio push-coverage", "studio pull-action", "studio serve", "intent validate-plan", "audit", "quality report", "skill add", "skill link", "skill graph", "skill impact", "content stale", "profile create", "cert create", "cert patch", "cert reweight", "cert coverage", "cert gaps", "question add", "question validate", "question list", "question generate", "term add", "term list", "index rebuild", "search", "export test", "export matrix", "export learning", "export course", "export mermaid", "export confluence", "mcp hosts", "mcp config", "mcp install", "agent hosts", "agent install", "completion install", "completion print"];
/** Public MCP tool names for about capabilities (keep in sync with @spec-driven-methodology/mcp TOOL_NAMES). */
export declare const ABOUT_MCP_TOOLS: readonly ["about", "suggest", "doctor", "audit", "quality_report", "init", "locate_project", "list_projects", "player_sync", "studio_sync", "studio_push_view", "studio_push_coverage", "studio_pull_action", "skill_add", "skill_link", "skill_graph", "skill_impact", "content_stale", "profile_create", "cert_create", "cert_patch", "cert_reweight", "cert_coverage", "cert_gaps", "question_add", "question_validate", "question_list", "question_generate", "term_add", "term_list", "export_test", "export_matrix", "export_learning", "export_course", "export_kit", "export_mermaid", "export_confluence", "index_rebuild", "search", "skill_suggest_links", "question_deep_validate", "topic_registry", "topic_sync", "course_heal"];
export declare const AboutSkillSchema: z.ZodObject<{
    id: z.ZodString;
    purpose: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    purpose: string;
}, {
    id: string;
    purpose: string;
}>;
export declare const AboutPayloadSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    version: z.ZodString;
    name: z.ZodString;
    tagline: z.ZodString;
    positioning: z.ZodObject<{
        what: z.ZodString;
        whatNot: z.ZodArray<z.ZodString, "many">;
        model: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        what: string;
        whatNot: string[];
        model: string;
    }, {
        what: string;
        whatNot: string[];
        model: string;
    }>;
    capabilities: z.ZodObject<{
        cli: z.ZodArray<z.ZodString, "many">;
        mcp: z.ZodArray<z.ZodString, "many">;
        skills: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            purpose: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            purpose: string;
        }, {
            id: string;
            purpose: string;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        cli: string[];
        mcp: string[];
        skills: {
            id: string;
            purpose: string;
        }[];
    }, {
        cli: string[];
        mcp: string[];
        skills: {
            id: string;
            purpose: string;
        }[];
    }>;
    nextSteps: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        hint: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        hint: string;
    }, {
        id: string;
        hint: string;
    }>, "many">;
    pointers: z.ZodObject<{
        about: z.ZodString;
        agents: z.ZodString;
        changelog: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        about: string;
        agents: string;
        changelog: string;
    }, {
        about: string;
        agents: string;
        changelog: string;
    }>;
}, "strip", z.ZodTypeAny, {
    name: string;
    tagline: string;
    ok: true;
    version: string;
    positioning: {
        what: string;
        whatNot: string[];
        model: string;
    };
    capabilities: {
        cli: string[];
        mcp: string[];
        skills: {
            id: string;
            purpose: string;
        }[];
    };
    nextSteps: {
        id: string;
        hint: string;
    }[];
    pointers: {
        about: string;
        agents: string;
        changelog: string;
    };
}, {
    name: string;
    tagline: string;
    ok: true;
    version: string;
    positioning: {
        what: string;
        whatNot: string[];
        model: string;
    };
    capabilities: {
        cli: string[];
        mcp: string[];
        skills: {
            id: string;
            purpose: string;
        }[];
    };
    nextSteps: {
        id: string;
        hint: string;
    }[];
    pointers: {
        about: string;
        agents: string;
        changelog: string;
    };
}>;
export type AboutPayload = z.infer<typeof AboutPayloadSchema>;
export type BuildAboutOptions = {
    /** Override SDM package root (tests / SDM_HOME). */
    sdmHome?: string;
};
/**
 * Resolve SDM package root (contains ABOUT.md + package.json name "sdm").
 * Order: explicit → SDM_HOME → walk from this module → cwd walk.
 */
export declare function resolveSpecraHome(explicit?: string): string;
export declare function listPortableSkills(agentsRoot: string): {
    id: string;
    purpose: string;
}[];
/**
 * Product semver SSOT: root package.json `version` (name "sdm").
 */
export declare function getProductVersion(explicitHome?: string): string;
/**
 * Build product-identity payload. Does not require a methodology project.
 */
export declare function buildAbout(options?: BuildAboutOptions): AboutPayload;
/** Short human-readable summary from the same payload (CLI text mode). */
export declare function formatAboutText(payload: AboutPayload): string;
//# sourceMappingURL=about.d.ts.map