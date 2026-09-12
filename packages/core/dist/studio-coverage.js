import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { runCertGaps } from "./cert-gaps.js";
import { SdmError } from "./errors.js";
import { PROJECT_MANIFEST } from "./project-root.js";
import { buildSuggest } from "./suggest.js";
import { STUDIO_VIEW_SCHEMA, studioBridgePaths, } from "./studio-bridge.js";
/**
 * Build a studio view document with a coverage phase from live gaps + suggest.
 * Does not write methodology YAML.
 */
export function buildStudioCoverageView(options) {
    const { projectRoot, profile, level } = options;
    if (!existsSync(join(projectRoot, PROJECT_MANIFEST))) {
        throw new SdmError("NOT_A_PROJECT", `Not a SDM methodology project (missing ${PROJECT_MANIFEST}): ${projectRoot}`);
    }
    const gapsRun = runCertGaps({
        startDir: projectRoot,
        profile,
        level,
    });
    const skills = gapsRun.result.skills.map((s) => ({
        id: s.skill,
        name: s.skill,
        status: s.status,
        questionCount: s.questionCount,
        depthRatio: s.depthRatio,
        depth: s.depth,
        weight: s.weight,
        uncoveredTopics: s.uncoveredTopics,
    }));
    const missing = skills.filter((s) => s.status === "missing").length;
    const thin = skills.filter((s) => s.status === "thin").length;
    const ok = skills.filter((s) => s.status === "ok").length;
    let suggestions = [];
    try {
        const suggest = buildSuggest({
            startDir: projectRoot,
            profile,
            level,
        });
        suggestions = suggest.suggestions.map((item) => {
            const label = item.id === "close-gaps"
                ? "Закрыть пробелы покрытия (не покрыто / слабо покрыто)"
                : item.label;
            return {
                id: item.id,
                label,
                why: item.why,
                skill: item.skill,
                commandHint: item.commandHint,
                requiresConfirm: item.requiresConfirm,
                levers: item.levers.map((l) => ({
                    phrase: l.phrase,
                    mapsTo: l.mapsTo,
                    category: l.category,
                })),
            };
        });
    }
    catch {
        suggestions = [];
    }
    return {
        schemaVersion: STUDIO_VIEW_SCHEMA,
        id: `coverage-${profile}-${level}`,
        title: `Покрытие: ${profile} / ${level}`,
        phases: [
            {
                kind: "coverage",
                id: "coverage",
                title: missing + thin > 0 ? "Пробелы покрытия" : "Покрытие",
                profile,
                level,
                summary: { missing, thin, ok },
                skills,
                suggestions,
            },
        ],
    };
}
/** Build coverage view and write to .sdm/studio/current-view.json */
export function pushStudioCoverage(options) {
    const view = buildStudioCoverageView(options);
    const paths = studioBridgePaths(options.projectRoot);
    mkdirSync(paths.dir, { recursive: true });
    writeFileSync(paths.viewPath, `${JSON.stringify(view, null, 2)}\n`, "utf8");
    const phase = view.phases[0];
    const summary = phase.summary;
    return {
        projectRoot: options.projectRoot,
        viewPath: paths.viewPath,
        profile: options.profile,
        level: options.level,
        summary,
    };
}
//# sourceMappingURL=studio-coverage.js.map