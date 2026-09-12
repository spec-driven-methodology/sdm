import { buildContentBasis, hashTermContent } from "./content-basis.js";
import { labelDepth } from "./depth-bands.js";
import { renderKitHtml } from "./export-kit-html.js";
import { buildKitPackageId, hashContentRevision, } from "./export-package-identity.js";
import { orderSkillsByDepends } from "./export-course.js";
import { kitModuleDisplayTitle } from "./kit-ui-copy.js";
import { SdmError } from "./errors.js";
import { assertProfileLevelMatch, loadLevel, loadQuestions, loadProfile, loadTerms, } from "./loaders.js";
import { findProjectRoot } from "./project-root.js";
import { buildSkillGraphFromProject, } from "./skill-graph.js";
import { loadSkill } from "./skills.js";
export const EXPORT_KIT_SCHEMA = "sdm.export.kit/v1";
export const KIT_PROBE_TYPES = ["open", "code"];
export const KIT_WARNING_CODES = [
    "KIT_NO_PROBE_QUESTION",
    "KIT_EXPLANATION_MISSING",
    "KIT_SKILL_DESCRIPTION_EMPTY",
    "KIT_NO_WORK_SAMPLE",
    "KIT_PROBE_RUBRIC_MISSING",
    "KIT_GLOSSARY_EMPTY",
    "KIT_GLOSSARY_FALLBACK_SKILL",
    "KIT_GLOSSARY_PRODUCT_HEAVY",
    "KIT_SECURITY_SKILL_MISSING",
    "KIT_TERM_UNLINKED",
];
export function parseKitFormat(value) {
    const v = (value ?? "json").toLowerCase();
    if (v === "json" || v === "html")
        return v;
    throw new SdmError("KIT_FORMAT_INVALID", `Invalid kit format "${value}". Use json or html.`);
}
export function isKitProbeType(type) {
    return type === "open" || type === "code";
}
export function isMiddlePlusLevel(levelId, levelTitle) {
    const blob = `${levelId} ${levelTitle}`.toLowerCase();
    return /\b(middle|senior|lead|staff)\b/.test(blob);
}
function isSecurityRelatedSkill(skill) {
    const blob = [skill.id, skill.category ?? "", ...skill.topics]
        .join(" ")
        .toLowerCase();
    return /secur|privacy|injection|pii/.test(blob);
}
function probeFromQuestion(q) {
    const validationCriteria = q.validation?.criteria;
    const minDepthView = q.min_depth !== undefined ? labelDepth(q.min_depth) : undefined;
    return {
        id: q.id,
        text: q.text,
        type: q.type,
        difficulty: q.difficulty,
        ...(q.explanation !== undefined ? { explanation: q.explanation } : {}),
        ...(q.expected !== undefined ? { expected: q.expected } : {}),
        ...(validationCriteria && validationCriteria.length > 0
            ? { validationCriteria: [...validationCriteria] }
            : {}),
        topics: [...q.topics],
        ...(q.evidence !== undefined ? { evidence: q.evidence } : {}),
        ...(q.min_depth !== undefined ? { min_depth: q.min_depth } : {}),
        ...(minDepthView
            ? {
                minDepthBand: minDepthView.band,
                minDepthLabel: minDepthView.label,
            }
            : {}),
        ...(q.red_flags.length > 0 ? { red_flags: [...q.red_flags] } : {}),
        ...(q.rubric.length > 0 ? { rubric: [...q.rubric] } : {}),
    };
}
function buildKitGlossary(input) {
    const { terms } = loadTerms(input.projectRoot);
    const matched = terms.filter((t) => t.skills.some((sid) => input.requiredSkillIds.has(sid)));
    if (matched.length > 0) {
        return {
            glossary: matched.map((t) => termToGlossaryEntry(t)),
            usedTermIds: new Set(matched.map((t) => t.id)),
        };
    }
    return {
        glossary: input.skills.map((s) => ({
            id: s.id,
            term: kitModuleDisplayTitle(s),
            definition: s.description,
            source: "skill_fallback",
        })),
        usedTermIds: new Set(),
    };
}
function termToGlossaryEntry(t) {
    return {
        id: t.id,
        term: t.term,
        definition: t.definition,
        kind: t.kind,
        source: "library_term",
    };
}
export function collectKitWarnings(input) {
    const warnings = [];
    const middlePlus = isMiddlePlusLevel(input.levelId, input.levelTitle);
    let hasCodeProbe = false;
    for (const skill of input.skills) {
        if (!skill.description.trim()) {
            warnings.push({
                code: "KIT_SKILL_DESCRIPTION_EMPTY",
                skill: skill.id,
                message: `Skill "${skill.id}" has empty description.`,
            });
        }
        const qs = (input.questionsBySkill.get(skill.id) ?? []).filter((q) => isKitProbeType(q.type));
        if (input.requiredSkillIds.has(skill.id) && qs.length === 0) {
            warnings.push({
                code: "KIT_NO_PROBE_QUESTION",
                skill: skill.id,
                message: `Skill "${skill.id}" has no open/code probe questions in the library.`,
            });
        }
        for (const q of qs) {
            if (q.type === "code") {
                hasCodeProbe = true;
            }
            if (!q.explanation || !q.explanation.trim()) {
                warnings.push({
                    code: "KIT_EXPLANATION_MISSING",
                    skill: skill.id,
                    questionId: q.id,
                    message: `Probe "${q.id}" has no explanation (expected answer rubric).`,
                });
            }
            if (isKitProbeType(q.type) && q.rubric.length === 0) {
                warnings.push({
                    code: "KIT_PROBE_RUBRIC_MISSING",
                    skill: skill.id,
                    questionId: q.id,
                    message: `Probe "${q.id}" has no rubric rows (scored criteria for interviewer).`,
                });
            }
        }
    }
    if (middlePlus && !hasCodeProbe) {
        warnings.push({
            code: "KIT_NO_WORK_SAMPLE",
            message: `Level "${input.levelId}" expects at least one code work-sample probe.`,
        });
    }
    if (input.glossary.length === 0) {
        warnings.push({
            code: "KIT_GLOSSARY_EMPTY",
            message: "Kit glossary is empty after filtering terms and skills.",
        });
    }
    else if (!input.glossaryFromTerms) {
        warnings.push({
            code: "KIT_GLOSSARY_FALLBACK_SKILL",
            message: "Glossary uses skill descriptions — add library/terms linked to level skills.",
        });
    }
    else {
        const productCount = input.glossary.filter((g) => g.kind === "product").length;
        if (input.glossary.length > 0 &&
            productCount / input.glossary.length >= 0.5) {
            warnings.push({
                code: "KIT_GLOSSARY_PRODUCT_HEAVY",
                message: `Glossary is product-heavy (${productCount}/${input.glossary.length} kind=product).`,
            });
        }
    }
    if (middlePlus) {
        const hasSecurity = input.skills.some((s) => input.requiredSkillIds.has(s.id) && isSecurityRelatedSkill(s));
        if (!hasSecurity) {
            warnings.push({
                code: "KIT_SECURITY_SKILL_MISSING",
                message: `Middle+ level "${input.levelId}" has no security-related required skill.`,
            });
        }
    }
    for (const t of input.allTerms) {
        if (t.skills.length === 0 && !input.usedTermIds.has(t.id)) {
            warnings.push({
                code: "KIT_TERM_UNLINKED",
                termId: t.id,
                message: `Term "${t.id}" has no skills link and is not included in kit glossary.`,
            });
        }
    }
    return warnings;
}
const STRICT_BLOCK_CODES = new Set([
    "KIT_NO_PROBE_QUESTION",
    "KIT_SKILL_DESCRIPTION_EMPTY",
    "KIT_EXPLANATION_MISSING",
    "KIT_NO_WORK_SAMPLE",
    "KIT_GLOSSARY_EMPTY",
]);
function isCriticalKitWarning(w) {
    return STRICT_BLOCK_CODES.has(w.code);
}
export function exportKit(options) {
    const projectRoot = findProjectRoot(options.startDir);
    const profile = options.profile.trim();
    const levelId = options.level.trim();
    const format = parseKitFormat(options.format);
    if (!profile || !levelId) {
        throw new SdmError("KIT_SCOPE_INVALID", "export kit requires --profile and --level.");
    }
    const profileDoc = loadProfile(projectRoot, profile);
    const level = loadLevel(projectRoot, levelId);
    assertProfileLevelMatch(profileDoc, level, profile);
    const skillIds = level.requirements.map((r) => r.skill);
    const requirementsBySkill = new Map(level.requirements.map((r) => [r.skill, r]));
    const requiredSkillIds = new Set(skillIds);
    const graph = buildSkillGraphFromProject(projectRoot);
    const { ordered, cycleFallback } = orderSkillsByDepends(skillIds, graph);
    const skills = ordered.map((id) => loadSkill(projectRoot, id));
    const { questions: allQuestions, warnings: qWarnings } = loadQuestions(projectRoot);
    const { terms: allTerms } = loadTerms(projectRoot);
    const questionsBySkill = new Map();
    const assessmentCountBySkill = new Map();
    for (const id of ordered) {
        const skillQuestions = allQuestions.filter((q) => q.skill === id);
        assessmentCountBySkill.set(id, skillQuestions.filter((q) => q.type === "single_choice" || q.type === "multi_choice").length);
        const pool = skillQuestions
            .filter((q) => isKitProbeType(q.type))
            .sort((a, b) => a.id.localeCompare(b.id));
        questionsBySkill.set(id, pool);
    }
    const { glossary, usedTermIds } = buildKitGlossary({
        projectRoot,
        skills,
        requiredSkillIds,
    });
    const glossaryFromTerms = glossary.some((g) => g.source === "library_term");
    const warnings = collectKitWarnings({
        skills,
        questionsBySkill,
        requiredSkillIds,
        levelId,
        levelTitle: level.title,
        glossary,
        allTerms,
        usedTermIds,
        glossaryFromTerms,
    });
    if (options.strict && warnings.some(isCriticalKitWarning)) {
        const codes = [
            ...new Set(warnings.filter(isCriticalKitWarning).map((w) => w.code)),
        ].join(", ");
        throw new SdmError("KIT_EXPORT_BLOCKED", `Kit export blocked under --strict (${codes}). Fix library/ontology first.`);
    }
    const modules = skills.map((skill) => {
        const req = requirementsBySkill.get(skill.id);
        const depthView = labelDepth(req.depth);
        const probes = (questionsBySkill.get(skill.id) ?? []).map(probeFromQuestion);
        const assessmentQuestionCount = assessmentCountBySkill.get(skill.id) ?? 0;
        return {
            skill: skill.id,
            title: kitModuleDisplayTitle(skill),
            description: skill.description,
            topics: [...skill.topics],
            depth: req.depth,
            weight: req.weight,
            depthBand: depthView.band,
            depthLabel: depthView.label,
            probes,
            ...(assessmentQuestionCount > 0 ? { assessmentQuestionCount } : {}),
        };
    });
    const checklist = ordered.map((id) => {
        const skill = loadSkill(projectRoot, id);
        const req = requirementsBySkill.get(id);
        const depthView = labelDepth(req.depth);
        return {
            skill: id,
            skillName: kitModuleDisplayTitle(skill),
            depth: req.depth,
            weight: req.weight,
            depthBand: depthView.band,
            depthLabel: depthView.label,
        };
    });
    const termHashes = Object.fromEntries(allTerms.map((t) => [t.id, hashTermContent(t)]));
    const basis = buildContentBasis({
        projectRoot,
        skillIds: ordered,
        level,
        ...(Object.keys(termHashes).length > 0 ? { termHashes } : {}),
    });
    const packageId = buildKitPackageId(profile, levelId);
    const revision = hashContentRevision(basis);
    const document = {
        schemaVersion: EXPORT_KIT_SCHEMA,
        id: packageId,
        profile,
        level: levelId,
        title: level.title,
        modules,
        glossary,
        checklist,
        warnings,
        meta: {
            moduleOrder: cycleFallback ? "alpha_fallback" : "depends_on_topo",
            basis,
            revision,
        },
    };
    const html = format === "html" ? renderKitHtml(document) : undefined;
    return {
        projectRoot,
        format,
        document,
        ...(html !== undefined ? { html } : {}),
        loadWarnings: qWarnings,
    };
}
export { renderKitHtml } from "./export-kit-html.js";
//# sourceMappingURL=export-kit.js.map