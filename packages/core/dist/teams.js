import { existsSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { SdmError } from "./errors.js";
import { loadLevel } from "./loaders.js";
import { RequirementSchema } from "./schemas.js";
import { readYamlFile } from "./yaml.js";
function normalizeTeamRaw(raw) {
    if (typeof raw !== "object" || raw === null)
        return raw;
    const obj = raw;
    if (typeof obj.role === "string" && obj.profile === undefined) {
        const { role, ...rest } = obj;
        return { ...rest, profile: role };
    }
    return raw;
}
export const TeamSchema = z.object({
    id: z.string().min(1),
    profile: z.string().min(1),
    title: z.string().min(1),
    description: z.string().default(""),
    /** Per-level full requirement replacement when present. */
    level_overrides: z
        .record(z.string(), z.object({
        requirements: z.array(RequirementSchema).min(1),
        threshold: z.number().min(0).max(1).optional(),
    }))
        .default({}),
});
export function teamFilePath(projectRoot, teamId) {
    return join(projectRoot, "certifications", "teams", `${teamId}.yaml`);
}
export function loadTeam(projectRoot, teamId) {
    const path = teamFilePath(projectRoot, teamId);
    if (!existsSync(path)) {
        throw new SdmError("TEAM_NOT_FOUND", `Team "${teamId}" not found under certifications/teams/`);
    }
    return TeamSchema.parse(normalizeTeamRaw(readYamlFile(path)));
}
/**
 * Resolve effective level for a profile, applying optional team overrides.
 */
export function resolveLevelForTeam(projectRoot, profileId, levelId, teamId) {
    const base = loadLevel(projectRoot, levelId);
    if (!teamId) {
        return { level: base };
    }
    const team = loadTeam(projectRoot, teamId);
    if (team.profile !== profileId) {
        throw new SdmError("TEAM_PROFILE_MISMATCH", `Team "${teamId}" belongs to profile "${team.profile}", not "${profileId}"`);
    }
    const overlay = team.level_overrides[levelId];
    if (!overlay) {
        return { level: base, team };
    }
    const level = {
        ...base,
        requirements: overlay.requirements,
        threshold: overlay.threshold ?? base.threshold,
    };
    return { level, team };
}
//# sourceMappingURL=teams.js.map