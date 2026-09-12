import { z } from "zod";
import { SdmError } from "./errors.js";
import { TypeMixPresetSchema } from "./question-type-mix.js";
const ClarificationSchema = z.object({
    q: z.string().min(1),
    a: z.string().min(1),
});
const ProfileRefSchema = z.object({
    id: z.string().min(1),
    title: z.string().min(1),
});
const LevelRefSchema = z.object({
    id: z.string().min(1),
    title: z.string().min(1),
});
const SkillPlanSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    category: z.string().min(1),
    description: z.string().min(1),
    topics: z.array(z.string()).optional(),
});
const LinkPlanSchema = z.object({
    id: z.string().min(1),
    dependsOn: z.array(z.string()).optional(),
    relatedTo: z.array(z.string()).optional(),
});
const RequirementPlanSchema = z.object({
    skill: z.string().min(1),
    depth: z.number().min(0).max(1),
    weight: z.number().min(0).max(1),
});
const SeedPlanSchema = z.object({
    questionsPerSkill: z.number().int().min(1).max(20).default(3),
    difficultyMin: z.number().min(0).max(1).default(0.3),
    difficultyMax: z.number().min(0).max(1).default(0.7),
    /** Homogeneous type when typeMix is single (backward compatible). */
    type: z.string().min(1).default("single_choice"),
    /** Type diversity preset for question generate --mix */
    typeMix: TypeMixPresetSchema.default("single"),
});
/** Plan envelope for intent-loop (agents). Profile language — not Role. */
export const IntentPlanSchema = z
    .object({
    schema: z.literal("sdm.intent.plan/v1"),
    kind: z.enum(["profile-pack"]),
    clarifications: z.array(ClarificationSchema).default([]),
    profile: ProfileRefSchema,
    level: LevelRefSchema,
    skills: z.array(SkillPlanSchema).min(1),
    links: z.array(LinkPlanSchema).default([]),
    requirements: z.array(RequirementPlanSchema).min(1),
    seed: SeedPlanSchema.default({
        questionsPerSkill: 3,
        difficultyMin: 0.3,
        difficultyMax: 0.7,
        type: "single_choice",
        typeMix: "single",
    }),
    exportTest: z.boolean().default(false),
    notes: z.string().optional(),
})
    .superRefine((plan, ctx) => {
    if (plan.seed.difficultyMin > plan.seed.difficultyMax) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "seed.difficultyMin must be <= difficultyMax",
            path: ["seed", "difficultyMin"],
        });
    }
    const skillIds = new Set(plan.skills.map((s) => s.id));
    for (const [i, req] of plan.requirements.entries()) {
        if (!skillIds.has(req.skill)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `requirement skill "${req.skill}" is not in skills[]`,
                path: ["requirements", i, "skill"],
            });
        }
    }
});
/**
 * Validate intent-loop plan JSON. Does not write methodology files.
 */
export function validateIntentPlan(input) {
    const parsed = IntentPlanSchema.safeParse(input);
    if (!parsed.success) {
        const detail = parsed.error.issues
            .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
            .join("; ");
        throw new SdmError("INTENT_PLAN_INVALID", `Invalid intent plan: ${detail}`);
    }
    return { ok: true, plan: parsed.data };
}
export function parseIntentPlanJson(raw) {
    let data;
    try {
        data = JSON.parse(raw);
    }
    catch {
        throw new SdmError("INTENT_PLAN_INVALID", "Intent plan is not valid JSON");
    }
    return validateIntentPlan(data);
}
//# sourceMappingURL=intent-plan.js.map