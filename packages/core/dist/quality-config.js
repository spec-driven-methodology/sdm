import { join } from "node:path";
import { DEFAULT_DISTRACTOR_QUALITY, } from "./distractor-quality.js";
import { PROJECT_MANIFEST } from "./project-root.js";
import { QualityConfigSchema, } from "./schemas.js";
import { readYamlFile } from "./yaml.js";
export const DEFAULT_QUALITY_CONFIG = QualityConfigSchema.parse({});
/** Load quality config from project manifest; falls back to defaults. */
export function loadQualityConfig(projectRoot) {
    try {
        const raw = readYamlFile(join(projectRoot, PROJECT_MANIFEST));
        const parsed = QualityConfigSchema.parse(raw.quality ?? {});
        return parsed;
    }
    catch {
        return DEFAULT_QUALITY_CONFIG;
    }
}
/**
 * Effective distractor enforcement mode.
 * writeGate strict enables distractor rules; never weakens explicit distractorQuality strict.
 */
export function effectiveDistractorMode(quality) {
    if (quality.distractorQuality === "strict")
        return "strict";
    if (quality.writeGate === "strict")
        return "strict";
    if (quality.distractorQuality === "soft" || quality.writeGate === "soft") {
        return "soft";
    }
    return "off";
}
export function distractorSettingsFromQuality(quality) {
    return {
        distractorQuality: effectiveDistractorMode(quality),
        lengthBandRatio: quality.lengthBandRatio,
        positionBiasThreshold: quality.positionBiasThreshold,
        minChoiceSample: quality.minChoiceSample,
    };
}
/** Highest severity among two gate modes (strict > soft > off). */
export function maxGate(a, b) {
    const rank = { off: 0, soft: 1, strict: 2 };
    return rank[a] >= rank[b] ? a : b;
}
export function toDistractorDefaults() {
    return { ...DEFAULT_DISTRACTOR_QUALITY };
}
//# sourceMappingURL=quality-config.js.map