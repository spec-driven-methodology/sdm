import { z } from "zod";
/** Plan envelope for intent-loop (agents). Profile language — not Role. */
export declare const IntentPlanSchema: z.ZodEffects<z.ZodObject<{
    schema: z.ZodLiteral<"sdm.intent.plan/v1">;
    kind: z.ZodEnum<["profile-pack"]>;
    clarifications: z.ZodDefault<z.ZodArray<z.ZodObject<{
        q: z.ZodString;
        a: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        a: string;
        q: string;
    }, {
        a: string;
        q: string;
    }>, "many">>;
    profile: z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        title: string;
    }, {
        id: string;
        title: string;
    }>;
    level: z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        title: string;
    }, {
        id: string;
        title: string;
    }>;
    skills: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        category: z.ZodString;
        description: z.ZodString;
        topics: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        id: string;
        description: string;
        category: string;
        topics?: string[] | undefined;
    }, {
        name: string;
        id: string;
        description: string;
        category: string;
        topics?: string[] | undefined;
    }>, "many">;
    links: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        dependsOn: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        relatedTo: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        dependsOn?: string[] | undefined;
        relatedTo?: string[] | undefined;
    }, {
        id: string;
        dependsOn?: string[] | undefined;
        relatedTo?: string[] | undefined;
    }>, "many">>;
    requirements: z.ZodArray<z.ZodObject<{
        skill: z.ZodString;
        depth: z.ZodNumber;
        weight: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        skill: string;
        depth: number;
        weight: number;
    }, {
        skill: string;
        depth: number;
        weight: number;
    }>, "many">;
    seed: z.ZodDefault<z.ZodObject<{
        questionsPerSkill: z.ZodDefault<z.ZodNumber>;
        difficultyMin: z.ZodDefault<z.ZodNumber>;
        difficultyMax: z.ZodDefault<z.ZodNumber>;
        /** Homogeneous type when typeMix is single (backward compatible). */
        type: z.ZodDefault<z.ZodString>;
        /** Type diversity preset for question generate --mix */
        typeMix: z.ZodDefault<z.ZodEnum<["single", "mixed", "full"]>>;
    }, "strip", z.ZodTypeAny, {
        type: string;
        questionsPerSkill: number;
        difficultyMin: number;
        difficultyMax: number;
        typeMix: "single" | "mixed" | "full";
    }, {
        type?: string | undefined;
        questionsPerSkill?: number | undefined;
        difficultyMin?: number | undefined;
        difficultyMax?: number | undefined;
        typeMix?: "single" | "mixed" | "full" | undefined;
    }>>;
    exportTest: z.ZodDefault<z.ZodBoolean>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    skills: {
        name: string;
        id: string;
        description: string;
        category: string;
        topics?: string[] | undefined;
    }[];
    level: {
        id: string;
        title: string;
    };
    kind: "profile-pack";
    profile: {
        id: string;
        title: string;
    };
    requirements: {
        skill: string;
        depth: number;
        weight: number;
    }[];
    seed: {
        type: string;
        questionsPerSkill: number;
        difficultyMin: number;
        difficultyMax: number;
        typeMix: "single" | "mixed" | "full";
    };
    schema: "sdm.intent.plan/v1";
    clarifications: {
        a: string;
        q: string;
    }[];
    links: {
        id: string;
        dependsOn?: string[] | undefined;
        relatedTo?: string[] | undefined;
    }[];
    exportTest: boolean;
    notes?: string | undefined;
}, {
    skills: {
        name: string;
        id: string;
        description: string;
        category: string;
        topics?: string[] | undefined;
    }[];
    level: {
        id: string;
        title: string;
    };
    kind: "profile-pack";
    profile: {
        id: string;
        title: string;
    };
    requirements: {
        skill: string;
        depth: number;
        weight: number;
    }[];
    schema: "sdm.intent.plan/v1";
    seed?: {
        type?: string | undefined;
        questionsPerSkill?: number | undefined;
        difficultyMin?: number | undefined;
        difficultyMax?: number | undefined;
        typeMix?: "single" | "mixed" | "full" | undefined;
    } | undefined;
    notes?: string | undefined;
    clarifications?: {
        a: string;
        q: string;
    }[] | undefined;
    links?: {
        id: string;
        dependsOn?: string[] | undefined;
        relatedTo?: string[] | undefined;
    }[] | undefined;
    exportTest?: boolean | undefined;
}>, {
    skills: {
        name: string;
        id: string;
        description: string;
        category: string;
        topics?: string[] | undefined;
    }[];
    level: {
        id: string;
        title: string;
    };
    kind: "profile-pack";
    profile: {
        id: string;
        title: string;
    };
    requirements: {
        skill: string;
        depth: number;
        weight: number;
    }[];
    seed: {
        type: string;
        questionsPerSkill: number;
        difficultyMin: number;
        difficultyMax: number;
        typeMix: "single" | "mixed" | "full";
    };
    schema: "sdm.intent.plan/v1";
    clarifications: {
        a: string;
        q: string;
    }[];
    links: {
        id: string;
        dependsOn?: string[] | undefined;
        relatedTo?: string[] | undefined;
    }[];
    exportTest: boolean;
    notes?: string | undefined;
}, {
    skills: {
        name: string;
        id: string;
        description: string;
        category: string;
        topics?: string[] | undefined;
    }[];
    level: {
        id: string;
        title: string;
    };
    kind: "profile-pack";
    profile: {
        id: string;
        title: string;
    };
    requirements: {
        skill: string;
        depth: number;
        weight: number;
    }[];
    schema: "sdm.intent.plan/v1";
    seed?: {
        type?: string | undefined;
        questionsPerSkill?: number | undefined;
        difficultyMin?: number | undefined;
        difficultyMax?: number | undefined;
        typeMix?: "single" | "mixed" | "full" | undefined;
    } | undefined;
    notes?: string | undefined;
    clarifications?: {
        a: string;
        q: string;
    }[] | undefined;
    links?: {
        id: string;
        dependsOn?: string[] | undefined;
        relatedTo?: string[] | undefined;
    }[] | undefined;
    exportTest?: boolean | undefined;
}>;
export type IntentPlan = z.infer<typeof IntentPlanSchema>;
export type ValidateIntentPlanResult = {
    ok: true;
    plan: IntentPlan;
};
/**
 * Validate intent-loop plan JSON. Does not write methodology files.
 */
export declare function validateIntentPlan(input: unknown): ValidateIntentPlanResult;
export declare function parseIntentPlanJson(raw: string): ValidateIntentPlanResult;
//# sourceMappingURL=intent-plan.d.ts.map