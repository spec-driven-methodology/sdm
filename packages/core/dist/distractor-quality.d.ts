import type { Question } from "./schemas.js";
export type DistractorQualityMode = "off" | "soft" | "strict";
export interface DistractorQualitySettings {
    distractorQuality: DistractorQualityMode;
    lengthBandRatio: number;
    positionBiasThreshold: number;
    minChoiceSample: number;
}
export declare const DEFAULT_DISTRACTOR_QUALITY: DistractorQualitySettings;
export declare function isChoiceQuestion(q: Pick<Question, "type">): q is Pick<Question, "type"> & {
    type: "single_choice" | "multi_choice";
};
/** 1-based correct indexes for a choice question. */
export declare function correctIndexes(correct: Question["correct"]): number[];
/**
 * Length of the (primary) correct option text.
 * multi_choice: max length among correct options.
 */
export declare function correctOptionLength(options: string[], correct: Question["correct"]): number | null;
export interface LengthQualityResult {
    ok: boolean;
    reasons: string[];
}
/**
 * Evaluate length-band + unique-longest outlier rules for a choice question.
 */
export declare function evaluateOptionLengthQuality(question: Pick<Question, "type" | "options" | "correct">, lengthBandRatio?: number): LengthQualityResult;
export interface PositionBiasResult {
    sample: number;
    firstPositionCount: number;
    share: number;
    triggered: boolean;
}
export declare function evaluatePositionBias(questions: Question[], settings?: Pick<DistractorQualitySettings, "positionBiasThreshold" | "minChoiceSample">): PositionBiasResult;
/** Deterministic PRNG (mulberry32). */
export declare function mulberry32(seed: number): () => number;
export interface ShuffledChoice {
    options: string[];
    correct: number | number[];
}
/**
 * Fisher–Yates shuffle of options with 1-based correct remap.
 * Non-choice questions should not call this.
 */
export declare function shuffleChoiceOptions(options: string[], correct: number | number[], rand?: () => number): ShuffledChoice;
/** Shuffle options on a question copy; leave open/code unchanged. */
export declare function shuffleQuestionOptions<T extends Question>(question: T, rand?: () => number): T;
export declare function shuffleDocumentQuestions(questions: Question[], seed?: number): Question[];
//# sourceMappingURL=distractor-quality.d.ts.map