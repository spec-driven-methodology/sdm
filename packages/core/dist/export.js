import { mulberry32, shuffleDocumentQuestions, } from "./distractor-quality.js";
import { SdmError } from "./errors.js";
import { applyExportQuestionFilter, resolveExportQuestionFilter, } from "./export-question-filter.js";
import { applySkillFilterToRequirements, resolveExportSkillFilter, } from "./export-skill-filter.js";
import { applyExportTypeFilter, resolveExportTypeFilter, } from "./export-type-filter.js";
import { assertProfileLevelMatch, loadLevel, loadQuestions, loadProfile, } from "./loaders.js";
import { buildContentBasis } from "./content-basis.js";
import { buildTestPackageId, hashContentRevision, } from "./export-package-identity.js";
import { findProjectRoot } from "./project-root.js";
import { resolveLevelForTeam } from "./teams.js";
export const EXPORT_TEST_SCHEMA = "sdm.export.test/v1";
export const EXPORT_MATRIX_SCHEMA = "sdm.export.matrix/v1";
function parseTestFormat(format) {
    const value = (format ?? "json").toLowerCase();
    if (value === "json" || value === "csv") {
        return value;
    }
    throw new SdmError("EXPORT_FORMAT_INVALID", `Invalid export test format "${format}". Use json or csv.`);
}
function parseMatrixFormat(format) {
    const value = (format ?? "csv").toLowerCase();
    if (value === "csv" || value === "json") {
        return value;
    }
    throw new SdmError("EXPORT_FORMAT_INVALID", `Invalid export matrix format "${format}". Use csv or json.`);
}
function csvEscape(value) {
    if (/[",\n\r]/.test(value)) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}
function cellValue(value) {
    if (value === undefined || value === null) {
        return "";
    }
    if (typeof value === "string") {
        return csvEscape(value);
    }
    return csvEscape(JSON.stringify(value));
}
export function testDocumentToCsv(document) {
    const header = "id,skill,difficulty,type,text,options,correct,explanation,expected";
    const rows = document.questions.map((q) => [
        cellValue(q.id),
        cellValue(q.skill),
        cellValue(q.difficulty),
        cellValue(q.type),
        cellValue(q.text),
        cellValue(q.options),
        cellValue(q.correct),
        cellValue(q.explanation),
        cellValue(q.expected),
    ].join(","));
    return [header, ...rows].join("\n") + (rows.length > 0 ? "\n" : "");
}
export function matrixDocumentToCsv(document) {
    const header = "skill,level,depth,weight";
    const rows = document.cells.map((c) => [cellValue(c.skill), cellValue(c.level), cellValue(c.depth), cellValue(c.weight)].join(","));
    return [header, ...rows].join("\n") + (rows.length > 0 ? "\n" : "");
}
function pickAdaptiveQuestions(level, questions, perSkill, seed) {
    const rand = mulberry32(seed);
    const bySkill = new Map();
    for (const q of questions) {
        const list = bySkill.get(q.skill) ?? [];
        list.push(q);
        bySkill.set(q.skill, list);
    }
    const picked = [];
    for (const req of level.requirements) {
        const pool = (bySkill.get(req.skill) ?? []).slice().sort((a, b) => {
            // Prefer closer to required depth, then id
            const da = Math.abs(a.difficulty - req.depth);
            const db = Math.abs(b.difficulty - req.depth);
            if (da !== db)
                return da - db;
            return a.id.localeCompare(b.id);
        });
        // Shuffle top candidates lightly with seed for variety among near-depth items
        const top = pool.slice(0, Math.max(perSkill * 2, perSkill));
        for (let i = top.length - 1; i > 0; i--) {
            const j = Math.floor(rand() * (i + 1));
            [top[i], top[j]] = [top[j], top[i]];
        }
        picked.push(...top.slice(0, perSkill));
    }
    return picked.sort((a, b) => {
        const bySkillCmp = a.skill.localeCompare(b.skill);
        if (bySkillCmp !== 0)
            return bySkillCmp;
        return a.id.localeCompare(b.id);
    });
}
export function assembleTestDocument(profileId, level, questions, options) {
    const adaptive = Boolean(options?.adaptive);
    const seed = options?.seed ?? 42;
    const perSkill = options?.perSkill ?? 3;
    const shuffleOptions = Boolean(options?.shuffleOptions);
    const skillFilter = resolveExportSkillFilter({
        includeSkills: options?.includeSkills,
        excludeSkills: options?.excludeSkills,
    }, level.requirements);
    const { requirements, weightsNormalized } = applySkillFilterToRequirements(level.requirements, skillFilter);
    const effectiveLevel = { ...level, requirements };
    const requiredSkills = new Set(requirements.map((r) => r.skill));
    const typeFilter = resolveExportTypeFilter({
        includeTypes: options?.includeTypes,
        excludeTypes: options?.excludeTypes,
    });
    const questionFilter = resolveExportQuestionFilter({
        includeQuestions: options?.includeQuestions,
    });
    // Pipeline: skill → adaptive → type → question id → optional shuffle
    let selected = adaptive
        ? pickAdaptiveQuestions(effectiveLevel, questions, perSkill, seed)
        : questions
            .filter((q) => requiredSkills.has(q.skill))
            .slice()
            .sort((a, b) => {
            const bySkill = a.skill.localeCompare(b.skill);
            if (bySkill !== 0)
                return bySkill;
            return a.id.localeCompare(b.id);
        });
    selected = applyExportTypeFilter(selected, typeFilter);
    selected = applyExportQuestionFilter(selected, questionFilter);
    if ((skillFilter !== undefined || questionFilter !== undefined) &&
        selected.length === 0) {
        throw new SdmError("EXPORT_FILTER_EMPTY", "Skill or question filter produced an empty export package.");
    }
    if (shuffleOptions) {
        // Shared --seed with adaptive for deterministic option shuffle.
        selected = shuffleDocumentQuestions(selected, seed);
    }
    const counts = new Map();
    for (const q of selected) {
        counts.set(q.skill, (counts.get(q.skill) ?? 0) + 1);
    }
    const skillsMissingQuestions = requirements
        .map((r) => r.skill)
        .filter((skill) => (counts.get(skill) ?? 0) === 0);
    return {
        schemaVersion: EXPORT_TEST_SCHEMA,
        profile: profileId,
        level: level.level,
        title: level.title,
        threshold: level.threshold,
        requirements,
        questions: selected,
        meta: {
            questionCount: selected.length,
            skillsMissingQuestions,
            ...(adaptive
                ? {
                    adaptive: true,
                    seed,
                    perSkill,
                    selectedIds: selected.map((q) => q.id),
                }
                : {}),
            ...(options?.team ? { team: options.team } : {}),
            ...(typeFilter ? { typeFilter } : {}),
            ...(skillFilter ? { skillFilter } : {}),
            ...(questionFilter ? { questionFilter } : {}),
            ...(weightsNormalized ? { weightsNormalized: true } : {}),
            ...(shuffleOptions
                ? { optionShuffle: { enabled: true, seed } }
                : {}),
            ...(options?.basis ? { basis: options.basis } : {}),
        },
    };
}
export function assembleMatrixDocument(profile, levels) {
    const byId = new Map(levels.map((l) => [l.level, l]));
    const ordered = profile.levels.map((id) => {
        const level = byId.get(id);
        if (!level) {
            throw new SdmError("LEVEL_NOT_FOUND", `Level "${id}" not found under certifications/levels/`);
        }
        return level;
    });
    const cells = [];
    for (const level of ordered) {
        for (const req of level.requirements) {
            cells.push({
                skill: req.skill,
                level: level.level,
                depth: req.depth,
                weight: req.weight,
            });
        }
    }
    return {
        schemaVersion: EXPORT_MATRIX_SCHEMA,
        profile: profile.profile,
        title: profile.title,
        levels: ordered.map((l) => l.level),
        cells,
    };
}
/**
 * Assemble a consumer test package for a role + level.
 */
export function exportTest(options) {
    const format = parseTestFormat(options.format);
    const projectRoot = findProjectRoot(options.startDir);
    const profile = loadProfile(projectRoot, options.profile);
    const { level } = resolveLevelForTeam(projectRoot, options.profile, options.level, options.team);
    assertProfileLevelMatch(profile, level, options.profile);
    const { questions, warnings } = loadQuestions(projectRoot);
    const assembled = assembleTestDocument(options.profile, level, questions, {
        adaptive: options.adaptive,
        seed: options.seed,
        perSkill: options.perSkill,
        team: options.team,
        includeTypes: options.includeTypes,
        excludeTypes: options.excludeTypes,
        includeSkills: options.includeSkills,
        excludeSkills: options.excludeSkills,
        includeQuestions: options.includeQuestions,
        shuffleOptions: options.shuffleOptions,
    });
    const basis = buildContentBasis({
        projectRoot,
        skillIds: assembled.requirements.map((r) => r.skill),
        level,
    });
    const packageId = buildTestPackageId({
        profile: options.profile,
        level: options.level,
        team: options.team,
        adaptive: options.adaptive,
        seed: options.seed,
        perSkill: options.perSkill,
        typeFilter: assembled.meta.typeFilter,
        skillFilter: assembled.meta.skillFilter,
        questionFilter: assembled.meta.questionFilter,
    });
    const revision = hashContentRevision(basis);
    const document = {
        ...assembled,
        id: packageId,
        meta: { ...assembled.meta, basis, revision },
    };
    const csv = format === "csv" ? testDocumentToCsv(document) : null;
    return { projectRoot, format, document, csv, warnings };
}
/**
 * Assemble a competency matrix for a role (all listed levels).
 */
export function exportMatrix(options) {
    const format = parseMatrixFormat(options.format);
    const projectRoot = findProjectRoot(options.startDir);
    const profile = loadProfile(projectRoot, options.profile);
    const levels = profile.levels.map((levelId) => loadLevel(projectRoot, levelId));
    const document = assembleMatrixDocument(profile, levels);
    const csv = format === "csv" ? matrixDocumentToCsv(document) : null;
    return { projectRoot, format, document, csv };
}
/** Envelope document field for agent/MCP `--json` mode. */
export function exportDocumentPayload(format, document, csv) {
    if (format === "csv") {
        return { csv: csv ?? "" };
    }
    return document;
}
//# sourceMappingURL=export.js.map