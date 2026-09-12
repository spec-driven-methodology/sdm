import { type DistractorQualityMode, type DistractorQualitySettings } from "./distractor-quality.js";
import { type GateMode, type QualityConfig } from "./schemas.js";
export declare const DEFAULT_QUALITY_CONFIG: QualityConfig;
/** Load quality config from project manifest; falls back to defaults. */
export declare function loadQualityConfig(projectRoot: string): QualityConfig;
/**
 * Effective distractor enforcement mode.
 * writeGate strict enables distractor rules; never weakens explicit distractorQuality strict.
 */
export declare function effectiveDistractorMode(quality: QualityConfig): DistractorQualityMode;
export declare function distractorSettingsFromQuality(quality: QualityConfig): DistractorQualitySettings;
/** Highest severity among two gate modes (strict > soft > off). */
export declare function maxGate(a: GateMode, b: GateMode): GateMode;
export declare function toDistractorDefaults(): DistractorQualitySettings;
//# sourceMappingURL=quality-config.d.ts.map