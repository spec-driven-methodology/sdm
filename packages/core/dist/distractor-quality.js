export const DEFAULT_DISTRACTOR_QUALITY = {
    distractorQuality: "off",
    lengthBandRatio: 0.5,
    positionBiasThreshold: 0.6,
    minChoiceSample: 5,
};
const UNIQUE_LONGEST_RATIO = 1.3;
export function isChoiceQuestion(q) {
    return q.type === "single_choice" || q.type === "multi_choice";
}
/** 1-based correct indexes for a choice question. */
export function correctIndexes(correct) {
    if (correct === undefined)
        return [];
    return (Array.isArray(correct) ? correct : [correct]).filter((n) => Number.isInteger(n) && n >= 1);
}
/**
 * Length of the (primary) correct option text.
 * multi_choice: max length among correct options.
 */
export function correctOptionLength(options, correct) {
    const idxs = correctIndexes(correct);
    if (idxs.length === 0 || options.length === 0)
        return null;
    let max = 0;
    let found = false;
    for (const oneBased of idxs) {
        const text = options[oneBased - 1];
        if (text === undefined)
            continue;
        found = true;
        if (text.length > max)
            max = text.length;
    }
    return found ? max : null;
}
/**
 * Evaluate length-band + unique-longest outlier rules for a choice question.
 */
export function evaluateOptionLengthQuality(question, lengthBandRatio = DEFAULT_DISTRACTOR_QUALITY.lengthBandRatio) {
    if (question.type !== "single_choice" && question.type !== "multi_choice") {
        return { ok: true, reasons: [] };
    }
    const options = question.options ?? [];
    if (options.length < 2) {
        return { ok: true, reasons: [] };
    }
    const C = correctOptionLength(options, question.correct);
    if (C === null || C === 0) {
        return { ok: true, reasons: [] };
    }
    const reasons = [];
    const R = lengthBandRatio;
    const minLen = C * R;
    const maxLen = C / R;
    const correctSet = new Set(correctIndexes(question.correct));
    for (let i = 0; i < options.length; i++) {
        if (correctSet.has(i + 1))
            continue;
        const len = options[i].length;
        if (len < minLen || len > maxLen) {
            reasons.push(`distractor[${i + 1}] length ${len} outside [${minLen.toFixed(1)}, ${maxLen.toFixed(1)}] of correct C=${C}`);
        }
    }
    const lengths = options.map((o) => o.length);
    const sortedUnique = [...new Set(lengths)].sort((a, b) => b - a);
    const longest = sortedUnique[0] ?? 0;
    const second = sortedUnique[1];
    const longestCount = lengths.filter((l) => l === longest).length;
    const correctIsUniquelyLongest = longestCount === 1 &&
        [...correctSet].some((oneBased) => options[oneBased - 1]?.length === longest);
    if (correctIsUniquelyLongest &&
        second !== undefined &&
        longest >= UNIQUE_LONGEST_RATIO * second) {
        reasons.push(`correct uniquely longest (${longest} ≥ ${UNIQUE_LONGEST_RATIO}× second ${second})`);
    }
    return { ok: reasons.length === 0, reasons };
}
export function evaluatePositionBias(questions, settings = DEFAULT_DISTRACTOR_QUALITY) {
    const choice = questions.filter(isChoiceQuestion);
    let firstPositionCount = 0;
    for (const q of choice) {
        const idxs = correctIndexes(q.correct);
        if (idxs.length === 0)
            continue;
        if (Math.min(...idxs) === 1)
            firstPositionCount += 1;
    }
    const sample = choice.length;
    const share = sample === 0 ? 0 : firstPositionCount / sample;
    const triggered = sample >= settings.minChoiceSample &&
        share >= settings.positionBiasThreshold;
    return { sample, firstPositionCount, share, triggered };
}
/** Deterministic PRNG (mulberry32). */
export function mulberry32(seed) {
    let t = seed >>> 0;
    return () => {
        t += 0x6d2b79f5;
        let r = Math.imul(t ^ (t >>> 15), 1 | t);
        r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
}
/**
 * Fisher–Yates shuffle of options with 1-based correct remap.
 * Non-choice questions should not call this.
 */
export function shuffleChoiceOptions(options, correct, rand = Math.random) {
    const n = options.length;
    const order = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
    }
    const shuffled = order.map((i) => options[i]);
    const oldToNew = new Map();
    for (let newIdx = 0; newIdx < order.length; newIdx++) {
        oldToNew.set(order[newIdx] + 1, newIdx + 1);
    }
    const corrects = Array.isArray(correct) ? correct : [correct];
    const remapped = corrects.map((c) => oldToNew.get(c) ?? c);
    return {
        options: shuffled,
        correct: Array.isArray(correct) ? remapped : remapped[0],
    };
}
/** Shuffle options on a question copy; leave open/code unchanged. */
export function shuffleQuestionOptions(question, rand = Math.random) {
    if (!isChoiceQuestion(question) || !question.options || question.correct === undefined) {
        return question;
    }
    const { options, correct } = shuffleChoiceOptions(question.options, question.correct, rand);
    return { ...question, options, correct };
}
export function shuffleDocumentQuestions(questions, seed) {
    const rand = seed === undefined ? Math.random : mulberry32(seed);
    return questions.map((q) => shuffleQuestionOptions(q, rand));
}
//# sourceMappingURL=distractor-quality.js.map