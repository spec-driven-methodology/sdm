import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { SdmError } from "./errors.js";
import { isMethodologyProject } from "./init.js";
import { loadLevel, loadProfile, loadQuestions, parseProfileDocument, } from "./loaders.js";
import { findLexicalDuplicates } from "./audit.js";
import { findProjectRoot } from "./project-root.js";
import { runCertGaps } from "./cert-gaps.js";
import { countBasisMismatches, runContentStale, } from "./content-stale.js";
import { loadQualityConfig } from "./quality-config.js";
import { readYamlFile } from "./yaml.js";
const LeverCategorySchema = z.enum([
    "export",
    "threshold",
    "volume",
    "types",
    "other",
]);
export const SuggestLeverSchema = z.object({
    phrase: z.string().min(1),
    mapsTo: z.string().min(1),
    category: LeverCategorySchema,
});
export const SuggestItemSchema = z.object({
    id: z.string().min(1),
    label: z.string().min(1),
    why: z.string().min(1),
    skill: z.string().optional(),
    commandHint: z.string().optional(),
    requiresConfirm: z.boolean(),
    levers: z.array(SuggestLeverSchema),
});
export const SuggestPayloadSchema = z.object({
    ok: z.literal(true),
    projectRoot: z.string(),
    focus: z.object({
        profile: z.string().optional(),
        level: z.string().optional(),
    }),
    snapshot: z.object({
        hasProfile: z.boolean(),
        hasLevel: z.boolean(),
        questionCount: z.number().int().nonnegative(),
        gapSummary: z
            .object({
            missing: z.number().int().nonnegative(),
            thin: z.number().int().nonnegative(),
            ok: z.number().int().nonnegative(),
        })
            .optional(),
        hasExport: z.boolean(),
        hasPlayer: z.boolean(),
    }),
    suggestions: z.array(SuggestItemSchema).min(1).max(5),
});
function listProfiles(projectRoot) {
    const out = [];
    const seen = new Set();
    for (const dir of [
        join(projectRoot, "certifications", "profiles"),
        join(projectRoot, "certifications", "roles"),
    ]) {
        if (!existsSync(dir))
            continue;
        for (const entry of readdirSync(dir)) {
            if (!entry.endsWith(".yaml") && !entry.endsWith(".yml"))
                continue;
            const full = join(dir, entry);
            try {
                const parsed = parseProfileDocument(readYamlFile(full));
                if (seen.has(parsed.profile))
                    continue;
                seen.add(parsed.profile);
                out.push({ profile: parsed.profile, levels: [...parsed.levels] });
            }
            catch {
                // skip invalid
            }
        }
    }
    return out.sort((a, b) => a.profile.localeCompare(b.profile));
}
function resolveFocus(projectRoot, profileOpt, levelOpt) {
    const profileId = profileOpt?.trim() || undefined;
    const levelId = levelOpt?.trim() || undefined;
    if (profileId && levelId) {
        const profile = loadProfile(projectRoot, profileId);
        const level = loadLevel(projectRoot, levelId);
        if (level.profile && level.profile !== profileId) {
            throw new SdmError("PROFILE_LEVEL_MISMATCH", `Level "${levelId}" belongs to profile "${level.profile}", not "${profileId}"`);
        }
        if (!profile.levels.includes(levelId)) {
            throw new SdmError("PROFILE_LEVEL_MISMATCH", `Profile "${profileId}" does not list level "${levelId}"`);
        }
        return { profile: profileId, level: levelId };
    }
    if (profileId && !levelId) {
        const profile = loadProfile(projectRoot, profileId);
        if (profile.levels.length === 1) {
            return { profile: profileId, level: profile.levels[0] };
        }
        throw new SdmError("SUGGEST_FOCUS_REQUIRED", `Profile "${profileId}" has multiple levels (${profile.levels.join(", ")}). Pass --level.`);
    }
    if (!profileId && levelId) {
        throw new SdmError("SUGGEST_FOCUS_REQUIRED", "Pass --profile together with --level (or omit both for auto-focus).");
    }
    const profiles = listProfiles(projectRoot);
    if (profiles.length === 0) {
        return {};
    }
    if (profiles.length === 1 && profiles[0].levels.length === 1) {
        return { profile: profiles[0].profile, level: profiles[0].levels[0] };
    }
    if (profiles.length === 1 && profiles[0].levels.length === 0) {
        return { profile: profiles[0].profile };
    }
    throw new SdmError("SUGGEST_FOCUS_REQUIRED", `Ambiguous focus (${profiles.length} profile(s)). Pass --profile and --level.`);
}
function exportPathForFocus(projectRoot, profile, level) {
    return join(projectRoot, "exports", `test-${profile}-${level}.json`);
}
function hasExportForFocus(projectRoot, profile, level) {
    const preferred = exportPathForFocus(projectRoot, profile, level);
    if (existsSync(preferred)) {
        return true;
    }
    const exportsDir = join(projectRoot, "exports");
    if (!existsSync(exportsDir)) {
        return false;
    }
    for (const entry of readdirSync(exportsDir)) {
        if (!entry.endsWith(".json"))
            continue;
        try {
            const raw = JSON.parse(readFileSync(join(exportsDir, entry), "utf8"));
            if (raw.schemaVersion === "sdm.export.test/v1" &&
                raw.profile === profile &&
                raw.level === level) {
                return true;
            }
        }
        catch {
            // skip
        }
    }
    return false;
}
function kitExportPathForFocus(projectRoot, profile, level) {
    return join(projectRoot, "exports", `kit-${profile}-${level}.json`);
}
function hasKitExportForFocus(projectRoot, profile, level) {
    const preferred = kitExportPathForFocus(projectRoot, profile, level);
    if (existsSync(preferred)) {
        return true;
    }
    const exportsDir = join(projectRoot, "exports");
    if (!existsSync(exportsDir)) {
        return false;
    }
    for (const entry of readdirSync(exportsDir)) {
        if (!entry.endsWith(".json"))
            continue;
        try {
            const raw = JSON.parse(readFileSync(join(exportsDir, entry), "utf8"));
            if (raw.schemaVersion === "sdm.export.kit/v1" &&
                raw.profile === profile &&
                raw.level === level) {
                return true;
            }
        }
        catch {
            // skip
        }
    }
    return false;
}
function hasPlayer(projectRoot) {
    return existsSync(join(projectRoot, "player", "index.html"));
}
function kitLevers() {
    return [
        {
            phrase: "HTML для интервьюера",
            mapsTo: "--format html",
            category: "export",
        },
        {
            phrase: "строгий kit",
            mapsTo: "--strict",
            category: "export",
        },
        {
            phrase: "почини kit-readiness",
            mapsTo: "audit --profile … --level … → term add / open+code probes / rubric",
            category: "other",
        },
    ];
}
function exportLevers() {
    return [
        {
            phrase: "без текстовых",
            mapsTo: "--exclude-type open",
            category: "types",
        },
        {
            phrase: "только single choice",
            mapsTo: "--include-type single_choice",
            category: "types",
        },
        {
            phrase: "по 5 на навык",
            mapsTo: "--adaptive --per-skill 5",
            category: "volume",
        },
    ];
}
/** Levers for educational materials (`export learning`) — not LMS. */
function courseLevers(hasGaps) {
    const levers = [
        {
            phrase: "короткая инструкция",
            mapsTo: "--depth brief --format howto",
            category: "export",
        },
        {
            phrase: "конспект темы",
            mapsTo: "--format notes",
            category: "export",
        },
        {
            phrase: "с деталями и примерами",
            mapsTo: "--depth detailed --format howto",
            category: "export",
        },
        {
            phrase: "шпаргалка",
            mapsTo: "--format cheatsheet",
            category: "export",
        },
        {
            phrase: "курс / модуль с занятиями",
            mapsTo: "--format course",
            category: "export",
        },
    ];
    if (hasGaps) {
        levers.unshift({
            phrase: "только по пробелам покрытия",
            mapsTo: "--from-gaps",
            category: "export",
        });
    }
    return levers;
}
function thresholdLevers() {
    return [
        {
            phrase: "строже порог",
            mapsTo: "level.threshold (cert patch / edit threshold; not depth/weight)",
            category: "threshold",
        },
    ];
}
function volumeLevers() {
    return [
        {
            phrase: "больше вопросов",
            mapsTo: "question generate / question add; or export --per-skill N",
            category: "volume",
        },
    ];
}
function takeTop(items, max = 5) {
    return items.slice(0, max);
}
/**
 * State → next human actions + Russian levers. Requires methodology project.
 */
export function buildSuggest(options) {
    const start = options.startDir;
    let projectRoot;
    try {
        projectRoot = findProjectRoot(start);
    }
    catch (err) {
        if (err instanceof SdmError && err.code === "PROJECT_ROOT_NOT_FOUND") {
            throw new SdmError("NOT_A_PROJECT", `Not a SDM methodology project: ${start}. Run: sdm init`);
        }
        throw err;
    }
    if (!isMethodologyProject(projectRoot)) {
        throw new SdmError("NOT_A_PROJECT", `Not a SDM methodology project: ${start}. Run: sdm init`);
    }
    const focus = resolveFocus(projectRoot, options.profile, options.level);
    const { questions } = loadQuestions(projectRoot);
    const playerPresent = hasPlayer(projectRoot);
    const suggestions = [];
    if (!focus.profile || !focus.level) {
        if (!focus.profile) {
            suggestions.push({
                id: "bootstrap-profile",
                label: "Создать основу профиля (intent-loop)",
                why: "В проекте ещё нет профиля/уровня для оценки.",
                skill: "intent-loop",
                commandHint: "profile create <id> --title \"…\" --json",
                requiresConfirm: true,
                levers: [],
            });
        }
        else {
            suggestions.push({
                id: "create-level",
                label: `Добавить уровень для профиля ${focus.profile}`,
                why: "Профиль есть, но уровень не выбран или не создан.",
                skill: "intent-loop",
                commandHint: `cert create --profile ${focus.profile} --level <id> --level-title "…" --requirement … --json`,
                requiresConfirm: true,
                levers: [],
            });
        }
        const payload = {
            ok: true,
            projectRoot,
            focus,
            snapshot: {
                hasProfile: Boolean(focus.profile) || listProfiles(projectRoot).length > 0,
                hasLevel: false,
                questionCount: questions.length,
                hasExport: false,
                hasPlayer: playerPresent,
            },
            suggestions: takeTop(suggestions),
        };
        return SuggestPayloadSchema.parse(payload);
    }
    const profileId = focus.profile;
    const levelId = focus.level;
    const level = loadLevel(projectRoot, levelId);
    const skillIds = new Set(level.requirements.map((r) => r.skill));
    const focusedQuestions = questions.filter((q) => skillIds.has(q.skill));
    const gapsRun = runCertGaps({
        startDir: projectRoot,
        profile: profileId,
        level: levelId,
    });
    const missing = gapsRun.result.skills.filter((s) => s.status === "missing").length;
    const thin = gapsRun.result.skills.filter((s) => s.status === "thin").length;
    const okCount = gapsRun.result.skills.filter((s) => s.status === "ok").length;
    const hasGaps = missing + thin > 0;
    const workItemCount = gapsRun.workItems.length;
    const quality = loadQualityConfig(projectRoot);
    const qualityOn = quality.writeGate !== "off" ||
        quality.distractorQuality !== "off" ||
        quality.coverageMode === "blueprint";
    const nearDups = qualityOn
        ? findLexicalDuplicates(questions, quality.nearDupThreshold)
        : [];
    const needsQualityHarden = workItemCount > 0 || nearDups.length > 0 || (hasGaps && quality.coverageMode === "blueprint");
    const exportPresent = hasExportForFocus(projectRoot, profileId, levelId);
    const kitPresent = hasKitExportForFocus(projectRoot, profileId, levelId);
    suggestions.push({
        id: "quality-report",
        label: "Сводный отчёт качества (матрица ●○○)",
        why: "Краткий вердикт + матрица плотности + глоссарий; детальный разбор — отдельно через audit.",
        skill: "quality-report",
        commandHint: `quality report --profile ${profileId} --level ${levelId} --json --save`,
        requiresConfirm: false,
        levers: [
            {
                phrase: "сводный отчёт качества",
                mapsTo: `quality report --profile ${profileId} --level ${levelId} --json`,
                category: "other",
            },
            {
                phrase: "отчёт по корпусу sources",
                mapsTo: "quality report --sources <dir> --json --save",
                category: "other",
            },
        ],
    });
    if (hasGaps || needsQualityHarden) {
        suggestions.push({
            id: "close-gaps",
            label: "Закрыть пробелы покрытия (не покрыто / слабо покрыто)",
            why: `По ${profileId}/${levelId}: не покрыто=${missing}, слабо покрыто=${thin}, покрыто=${okCount}${workItemCount ? `, workItems=${workItemCount}` : ""}.`,
            skill: "close-coverage",
            commandHint: `cert gaps --profile ${profileId} --level ${levelId} --json`,
            requiresConfirm: true,
            levers: [
                {
                    phrase: "сгенерировать черновики",
                    mapsTo: `question generate --to-skill <skill> --mix mixed --profile ${profileId} --level ${levelId} --json`,
                    category: "other",
                },
                {
                    phrase: "проверь черновик",
                    mapsTo: "question validate --json",
                    category: "other",
                },
                ...volumeLevers(),
            ],
        });
        suggestions.push({
            id: "generate-questions",
            label: "Сгенерировать вопросы по тонким навыкам",
            why: "Черновики через question generate → validate → question add.",
            skill: "generate-questions",
            commandHint: `question generate --to-skill <skill> --count 3 --mix mixed --profile ${profileId} --level ${levelId} --json`,
            requiresConfirm: true,
            levers: volumeLevers(),
        });
    }
    if (needsQualityHarden || nearDups.length > 0) {
        suggestions.push({
            id: "harden-quality",
            label: "Укрепить качество банка (validate / audit)",
            why: nearDups.length > 0
                ? `Найдены near-dup пары (${nearDups.length}). Прогоните validate/audit и перепишите слабые вопросы.`
                : workItemCount > 0
                    ? `Остались workItems (${workItemCount}) — закройте topics/bands до export.`
                    : "Включён quality policy — проверьте audit и question validate перед экспортом.",
            skill: "generate-questions",
            commandHint: `audit --profile ${profileId} --level ${levelId} --json`,
            requiresConfirm: false,
            levers: [
                {
                    phrase: "проверь черновик",
                    mapsTo: "question validate --json",
                    category: "other",
                },
                {
                    phrase: "включи строгий writeGate",
                    mapsTo: "quality.writeGate: strict in sdm.yaml",
                    category: "other",
                },
                {
                    phrase: "закрой topics",
                    mapsTo: `cert gaps --profile ${profileId} --level ${levelId} --json → workItems`,
                    category: "other",
                },
            ],
        });
    }
    let staleMismatchCount = 0;
    try {
        const staleRun = runContentStale({
            startDir: projectRoot,
            profile: profileId,
            level: levelId,
        });
        staleMismatchCount = countBasisMismatches(staleRun.document);
        if (staleMismatchCount > 0) {
            suggestions.push({
                id: "review-stale-content",
                label: "Проверить устаревший контент (basis mismatch)",
                why: `После правок онтологии ${staleMismatchCount} артефакт(ов) с устаревшим meta.basis — ревью вопросов / пересборка экспорта.`,
                skill: "close-staleness",
                commandHint: `content stale --profile ${profileId} --level ${levelId} --json`,
                requiresConfirm: true,
                levers: [
                    {
                        phrase: "что устарело",
                        mapsTo: `content stale --profile ${profileId} --level ${levelId} --json`,
                        category: "other",
                    },
                    {
                        phrase: "радиус влияния",
                        mapsTo: "skill impact --skill <id> --json",
                        category: "other",
                    },
                ],
            });
        }
    }
    catch {
        // ignore stale scan failures in suggest
    }
    if (focusedQuestions.length > 0) {
        if (!exportPresent) {
            suggestions.push({
                id: "export-test",
                label: hasGaps
                    ? "Экспорт теста (preview as-is)"
                    : `Сделать экспорт теста (${profileId}/${levelId})`,
                why: hasGaps
                    ? "Вопросы уже есть — можно собрать пакет даже при thin/missing (preview)."
                    : `В библиотеке ${focusedQuestions.length} вопрос(ов) по требованиям уровня; файла экспорта ещё нет.`,
                skill: "export-methodology",
                commandHint: `export test --profile ${profileId} --level ${levelId} --json`,
                requiresConfirm: true,
                levers: exportLevers(),
            });
        }
        else if (!playerPresent) {
            suggestions.push({
                id: "player-sync",
                label: "Поставить player и прогнать экспорт",
                why: "Экспорт есть, но нет player/index.html для author preview.",
                skill: "export-methodology",
                commandHint: "player sync --json",
                requiresConfirm: false,
                levers: [
                    {
                        phrase: "открыть плеер",
                        mapsTo: "open player/index.html and load exports/test-….json",
                        category: "other",
                    },
                ],
            });
        }
        else {
            suggestions.push({
                id: "try-player",
                label: "Прогнать тест в player (author preview)",
                why: "Экспорт и player на месте — можно проверить пакет глазами автора.",
                skill: "export-methodology",
                commandHint: "open player/index.html → load export JSON",
                requiresConfirm: false,
                levers: [
                    ...thresholdLevers(),
                    ...volumeLevers(),
                    ...exportLevers(),
                ],
            });
            suggestions.push({
                id: "re-export-stricter",
                label: "Пересобрать экспорт строже / иначе",
                why: "Поменять типы, объём на навык или порог сдачи, затем снова export test.",
                skill: "export-methodology",
                commandHint: `export test --profile ${profileId} --level ${levelId} --exclude-type open --json`,
                requiresConfirm: true,
                levers: [...exportLevers(), ...thresholdLevers(), ...volumeLevers()],
            });
        }
        suggestions.push({
            id: "export-course",
            label: hasGaps
                ? "Собрать учебные материалы по пробелам / навыкам"
                : `Собрать учебные материалы (${profileId}/${levelId})`,
            why: hasGaps
                ? "Те же skills/questions → TeachingContext + practice; format howto|notes|cheatsheet|course; можно --from-gaps. Не LMS — prose пишет агент после HITL."
                : "Обратный consumer к export test: howto/notes/cheatsheet/course, depth brief|detailed. Не LMS.",
            skill: "export-course",
            commandHint: hasGaps
                ? `export learning --profile ${profileId} --level ${levelId} --from-gaps --depth standard --format howto --json`
                : `export learning --profile ${profileId} --level ${levelId} --depth standard --format howto --json`,
            requiresConfirm: true,
            levers: courseLevers(hasGaps),
        });
        if (!kitPresent) {
            suggestions.push({
                id: "export-kit",
                label: `Собрать шпаргалку эксперта (${profileId}/${levelId})`,
                why: "Kit = open/code пробы + глоссарий + чеклист из эталона. HTML — рендер, не SSOT.",
                skill: "export-kit",
                commandHint: `export kit --profile ${profileId} --level ${levelId} --json`,
                requiresConfirm: true,
                levers: kitLevers(),
            });
        }
    }
    else if (!hasGaps) {
        suggestions.push({
            id: "generate-questions",
            label: "Добавить вопросы в библиотеку",
            why: "У уровня пока нет вопросов по требованиям — экспорт будет пустым.",
            skill: "generate-questions",
            commandHint: `question generate --to-skill <skill> --count 3 --json`,
            requiresConfirm: true,
            levers: volumeLevers(),
        });
    }
    if (suggestions.length === 0) {
        suggestions.push({
            id: "audit",
            label: "Проверить методологию (audit)",
            why: "Явных next-step сигналов нет — полезно прогнать audit/coverage.",
            skill: "audit-methodology",
            commandHint: `audit --profile ${profileId} --level ${levelId} --json`,
            requiresConfirm: false,
            levers: [],
        });
    }
    const payload = {
        ok: true,
        projectRoot,
        focus: { profile: profileId, level: levelId },
        snapshot: {
            hasProfile: true,
            hasLevel: true,
            questionCount: focusedQuestions.length,
            gapSummary: { missing, thin, ok: okCount },
            hasExport: exportPresent,
            hasPlayer: playerPresent,
        },
        suggestions: takeTop(suggestions),
    };
    return SuggestPayloadSchema.parse(payload);
}
/** Short human summary for CLI text mode. */
export function formatSuggestText(payload) {
    const focus = payload.focus.profile && payload.focus.level
        ? `${payload.focus.profile} / ${payload.focus.level}`
        : payload.focus.profile ?? "(no focus)";
    const lines = [
        `Suggest → ${payload.projectRoot}`,
        `Focus: ${focus}`,
        `Snapshot: questions=${payload.snapshot.questionCount} export=${payload.snapshot.hasExport} player=${payload.snapshot.hasPlayer}` +
            (payload.snapshot.gapSummary
                ? ` gaps(missing=${payload.snapshot.gapSummary.missing}, thin=${payload.snapshot.gapSummary.thin}, ok=${payload.snapshot.gapSummary.ok})`
                : ""),
        "",
        "Дальше:",
    ];
    for (const s of payload.suggestions) {
        lines.push(`  • [${s.id}] ${s.label}`);
        lines.push(`      ${s.why}`);
        if (s.commandHint) {
            lines.push(`      hint: sdm ${s.commandHint}`);
        }
        for (const lever of s.levers.slice(0, 4)) {
            lines.push(`      lever: «${lever.phrase}» → ${lever.mapsTo}`);
        }
    }
    return lines.join("\n");
}
//# sourceMappingURL=suggest.js.map