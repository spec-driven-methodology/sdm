import { SdmError } from "./errors.js";
export function normalizeExpectedInput(expected) {
    const values = (Array.isArray(expected) ? expected : [expected])
        .map((v) => v.trim())
        .filter(Boolean);
    if (values.length === 0) {
        return "";
    }
    if (values.length === 1) {
        return values[0];
    }
    return [...new Set(values)];
}
export function buildQuestionPayload(input, id) {
    const base = {
        id,
        skill: input.skill,
        difficulty: input.difficulty,
        type: input.type,
        text: input.text,
    };
    if (input.options !== undefined) {
        base.options = input.options;
    }
    if (input.correct !== undefined) {
        base.correct = input.correct;
    }
    if (input.expected !== undefined) {
        base.expected = normalizeExpectedInput(input.expected);
    }
    if (input.explanation !== undefined) {
        base.explanation = input.explanation;
    }
    if (input.code_template !== undefined) {
        base.code_template = input.code_template;
    }
    if (input.topics !== undefined && input.topics.length > 0) {
        base.topics = [...new Set(input.topics.map((t) => t.trim()).filter(Boolean))];
    }
    if (input.evidence !== undefined) {
        base.evidence = input.evidence;
    }
    if (input.min_depth !== undefined) {
        base.min_depth = input.min_depth;
    }
    if (input.red_flags !== undefined && input.red_flags.length > 0) {
        base.red_flags = [...new Set(input.red_flags.map((f) => f.trim()).filter(Boolean))];
    }
    if (input.rubric !== undefined && input.rubric.length > 0) {
        base.rubric = input.rubric;
    }
    return base;
}
export function assertChoiceShapeOrThrow(input) {
    if (input.type === "single_choice" || input.type === "multi_choice") {
        if (!input.options || input.options.length < 2) {
            throw new SdmError("VALIDATION_FAILED", `Type ${input.type} requires at least two --option values`);
        }
        if (input.correct === undefined) {
            throw new SdmError("VALIDATION_FAILED", `Type ${input.type} requires --correct (1-based option index)`);
        }
        const corrects = Array.isArray(input.correct) ? input.correct : [input.correct];
        for (const c of corrects) {
            if (!Number.isInteger(c) || c < 1 || c > input.options.length) {
                throw new SdmError("VALIDATION_FAILED", `--correct ${c} is out of range for ${input.options.length} options (1-based)`);
            }
        }
        if (input.type === "single_choice" && corrects.length !== 1) {
            throw new SdmError("VALIDATION_FAILED", "single_choice requires exactly one --correct");
        }
    }
}
export function assertExpectedShapeOrThrow(input) {
    if (input.expected === undefined) {
        return;
    }
    if (input.type !== "open") {
        throw new SdmError("VALIDATION_FAILED", `--expected is only allowed for type open (got ${input.type})`);
    }
}
//# sourceMappingURL=question-payload.js.map