import { MIN_OK_QUESTIONS } from "../coverage.js";
import { jaccardSimilarity } from "../audit.js";
import { SKILL_DESCRIPTION_MIN_CHARS, } from "./types.js";
/**
 * Detect likely text truncation in a lesson body.
 * Returns true when the body looks cut off mid-sentence.
 */
export function detectTruncation(body) {
    if (!body.trim())
        return false;
    const trimmed = body.trim();
    // Check for unclosed brackets/quotes in the last ~200 chars
    const tail = trimmed.slice(-200);
    const unclosed = ["*", "_", '"', "`", "(", "["];
    for (const ch of unclosed) {
        const count = (tail.match(new RegExp(`\\${ch}`, "g")) || []).length;
        if (count % 2 !== 0)
            return true;
    }
    // Last non-whitespace character
    const last = trimmed[trimmed.length - 1];
    if (!/[\.!?\)\]\}\n]/.test(last)) {
        // Check if there's an inline code or link that might end with />
        if (!trimmed.endsWith("/>") && !trimmed.endsWith("`"))
            return true;
    }
    // Ends with a conjunction or preposition (Russian/English)
    const lastWord = trimmed.split(/\s+/).pop()?.toLowerCase() || "";
    const truncationMarkers = [
        "и", "или", "но", "что", "как", "а", "да", "к",
        "the", "and", "or", "but", "that", "which", "because",
        "на", "в", "с", "по", "от", "из", "для", "через",
        "in", "at", "to", "of", "for", "with", "by", "on",
        "a ", "an ",
    ];
    if (truncationMarkers.some((m) => lastWord.endsWith(m)) &&
        lastWord.length < 7) {
        return true;
    }
    return false;
}
export const TRUNCATION_WARNING_CODE = "LESSON_TRUNCATED";
/**
 * Soft heuristic: Cyrillic + Latin word-like tokens outside fenced code.
 * Used when lesson bodies are non-empty (agent-filled packs).
 */
export function detectProseLocaleMixed(body) {
    const withoutCode = body.replace(/```[\s\S]*?```/g, " ");
    const hasCyrillic = /\p{Script=Cyrillic}/u.test(withoutCode);
    const hasLatinWord = /[A-Za-z]{3,}/.test(withoutCode);
    return hasCyrillic && hasLatinWord;
}
export function collectProseLocaleWarnings(modules) {
    const warnings = [];
    for (const mod of modules) {
        for (const lesson of mod.lessons) {
            if (!lesson.body.trim())
                continue;
            if (detectProseLocaleMixed(lesson.body)) {
                warnings.push({
                    code: "PROSE_LOCALE_MIXED",
                    skill: mod.skill,
                    message: `Lesson "${lesson.id}" body mixes Cyrillic and Latin prose outside code fences; keep one locale (identifiers/CLI flags OK).`,
                });
            }
            if (detectTruncation(lesson.body)) {
                warnings.push({
                    code: TRUNCATION_WARNING_CODE,
                    skill: mod.skill,
                    message: `Lesson "${lesson.id}" body looks truncated (ends mid-sentence). Regenerate the lesson body.`,
                });
            }
        }
    }
    return warnings;
}
export function isCriticalWarning(w) {
    return (w.code === "SKILL_DESCRIPTION_THIN" || w.code === "SKILL_TOPICS_EMPTY");
}
/**
 * Collect learning-readiness quality warnings from TeachingContext.
 * All codes are defined in COURSE_WARNING_CODES. Some may become errors
 * when `courseGate` is strict (see course-gate.ts).
 */
export function collectLearningWarnings(input) {
    const warnings = [];
    const scoped = new Set(input.scopedSkillIds);
    if (input.cycleFallback) {
        warnings.push({
            code: "GRAPH_CYCLE_FALLBACK",
            message: "depends_on cycle in scope; module order fell back to alphabetical skill ids.",
        });
    }
    for (const skill of input.skills) {
        const desc = skill.description.trim();
        if (desc.length < SKILL_DESCRIPTION_MIN_CHARS) {
            warnings.push({
                code: "SKILL_DESCRIPTION_THIN",
                skill: skill.id,
                message: `Skill "${skill.id}" description is empty or shorter than ${SKILL_DESCRIPTION_MIN_CHARS} characters.`,
            });
        }
        if (skill.topics.length === 0) {
            warnings.push({
                code: "SKILL_TOPICS_EMPTY",
                skill: skill.id,
                message: `Skill "${skill.id}" has no topics for lesson stubs.`,
            });
        }
        const qs = input.questionsBySkill.get(skill.id) ?? [];
        const coveredTopics = new Set(qs.flatMap((q) => q.topics));
        for (const topic of skill.topics) {
            if (!coveredTopics.has(topic)) {
                warnings.push({
                    code: "TOPIC_UNCOVERED_BY_QUESTIONS",
                    skill: skill.id,
                    topic,
                    message: `Topic "${topic}" on skill "${skill.id}" has no practice questions with that topic.`,
                });
            }
        }
        const hasDepEdge = skill.depends_on.some((d) => scoped.has(d));
        const hasRelEdge = skill.related_to.some((d) => scoped.has(d));
        const referencedBy = input.skills.some((other) => other.id !== skill.id &&
            (other.depends_on.includes(skill.id) ||
                other.related_to.includes(skill.id)));
        if (input.scopedSkillIds.length > 1 &&
            !hasDepEdge &&
            !hasRelEdge &&
            !referencedBy) {
            warnings.push({
                code: "GRAPH_ISOLATED_IN_SCOPE",
                skill: skill.id,
                message: `Skill "${skill.id}" has no depends_on/related_to edges to other skills in this course scope.`,
            });
        }
        if (input.includePractice) {
            if (qs.length === 0) {
                warnings.push({
                    code: "PRACTICE_EMPTY",
                    skill: skill.id,
                    message: `Skill "${skill.id}" has no practice questions in the library.`,
                });
            }
            else if (qs.length < MIN_OK_QUESTIONS) {
                warnings.push({
                    code: "PRACTICE_THIN",
                    skill: skill.id,
                    message: `Skill "${skill.id}" has only ${qs.length} practice question(s) (min ${MIN_OK_QUESTIONS} recommended).`,
                });
            }
            const types = new Set(qs.map((q) => q.type));
            if (qs.length >= 2 && types.size === 1) {
                warnings.push({
                    code: "PRACTICE_MONO_TYPE",
                    skill: skill.id,
                    message: `Skill "${skill.id}" practice pool is mono-type (${[...types][0]}).`,
                });
            }
            for (const q of qs) {
                if (!q.explanation || !q.explanation.trim()) {
                    warnings.push({
                        code: "QUESTION_EXPLANATION_MISSING",
                        skill: skill.id,
                        questionId: q.id,
                        message: `Question "${q.id}" has no explanation (weak teaching seed).`,
                    });
                }
            }
        }
    }
    // Glossary quality checks
    const gloss = input.glossary ?? [];
    for (const g of gloss) {
        const term = g.term?.trim();
        const def = g.definition?.trim();
        if (!term || !def)
            continue;
        if (def.toLowerCase().startsWith(term.toLowerCase())) {
            warnings.push({
                code: "GLOSSARY_TAUTOLOGY",
                message: `Glossary entry "${term}" definition starts with the term itself: "${def.slice(0, 50)}…". Provide an actual explanation.`,
            });
        }
    }
    return warnings;
}
/**
 * Scan lesson bodies for technical terms (topics, concept words) that appear
 * but are not defined in the course glossary. Only considers words ≥4 chars
 * that match topic slugs or look like foreign/technical terms.
 */
export function collectGlossaryMissingTerms(modules, glossaryTerms, topicSlugs) {
    const warnings = [];
    const glossSet = new Set(glossaryTerms.map((t) => t.toLowerCase()));
    for (const mod of modules) {
        if (mod.kind === "overview")
            continue;
        for (const lesson of mod.lessons) {
            if (!lesson.body)
                continue;
            const body = lesson.body.toLowerCase();
            for (const slug of topicSlugs) {
                if (glossSet.has(slug.toLowerCase()))
                    continue;
                if (slug.length < 3)
                    continue;
                if (body.includes(slug.toLowerCase()) || body.includes(slug.replace(/-/g, " ").toLowerCase())) {
                    warnings.push({
                        code: "GLOSSARY_MISSING_TERM",
                        skill: mod.skill,
                        message: `Glossary missing term "${slug}" — appears in lesson "${lesson.id}" body but has no glossary entry. Add a definition to library/terms or course glossary.`,
                    });
                }
            }
        }
    }
    return warnings;
}
/**
 * Detect near-duplicate lesson bodies within the same module/skill.
 * Uses jaccardSimilarity; threshold=0.7 means >70% token overlap.
 */
export function collectDuplicateLessons(modules, threshold = 0.7) {
    const warnings = [];
    for (const mod of modules) {
        if (mod.kind === "overview")
            continue;
        const lessons = mod.lessons.filter((l) => l.body.trim().length > 0);
        for (let i = 0; i < lessons.length; i++) {
            for (let j = i + 1; j < lessons.length; j++) {
                const sim = jaccardSimilarity(lessons[i].body, lessons[j].body);
                if (sim >= threshold) {
                    warnings.push({
                        code: "LESSON_DUPLICATE",
                        skill: mod.skill,
                        message: `Lessons "${lessons[i].id}" and "${lessons[j].id}" are near-duplicates (similarity ${sim.toFixed(2)}). Merge or differentiate them.`,
                    });
                }
            }
        }
    }
    return warnings;
}
//# sourceMappingURL=warnings.js.map