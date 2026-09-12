import type { Question } from "./schemas.js";
export interface AddQuestionInput {
    skill: string;
    type: Question["type"];
    difficulty: number;
    text: string;
    options?: string[];
    /** 1-based index or indexes (matches existing library YAML). */
    correct?: number | number[];
    /** Acceptable short answers for type=open. */
    expected?: string | string[];
    explanation?: string;
    code_template?: string;
    topics?: string[];
    evidence?: Question["evidence"];
    min_depth?: number;
    red_flags?: string[];
    rubric?: {
        score: 0 | 1 | 2 | 3;
        description: string;
    }[];
    id?: string;
    force?: boolean;
}
export declare function normalizeExpectedInput(expected: string | string[]): string | string[];
export declare function buildQuestionPayload(input: AddQuestionInput, id: string): Record<string, unknown>;
export declare function assertChoiceShapeOrThrow(input: AddQuestionInput): void;
export declare function assertExpectedShapeOrThrow(input: AddQuestionInput): void;
//# sourceMappingURL=question-payload.d.ts.map