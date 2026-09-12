import { join } from "node:path";
import {
  DEFAULT_DISTRACTOR_QUALITY,
  type DistractorQualityMode,
  type DistractorQualitySettings,
} from "./distractor-quality.js";
import { PROJECT_MANIFEST } from "./project-root.js";
import {
  QualityConfigSchema,
  type GateMode,
  type QualityConfig,
  type SdmConfig,
} from "./schemas.js";
import { readYamlFile } from "./yaml.js";

export const DEFAULT_QUALITY_CONFIG: QualityConfig = QualityConfigSchema.parse({});

/** Load quality config from project manifest; falls back to defaults. */
export function loadQualityConfig(projectRoot: string): QualityConfig {
  try {
    const raw = readYamlFile(join(projectRoot, PROJECT_MANIFEST)) as SdmConfig;
    const parsed = QualityConfigSchema.parse(raw.quality ?? {});
    return parsed;
  } catch {
    return DEFAULT_QUALITY_CONFIG;
  }
}

/**
 * Effective distractor enforcement mode.
 * writeGate strict enables distractor rules; never weakens explicit distractorQuality strict.
 */
export function effectiveDistractorMode(quality: QualityConfig): DistractorQualityMode {
  if (quality.distractorQuality === "strict") return "strict";
  if (quality.writeGate === "strict") return "strict";
  if (quality.distractorQuality === "soft" || quality.writeGate === "soft") {
    return "soft";
  }
  return "off";
}

export function distractorSettingsFromQuality(
  quality: QualityConfig,
): DistractorQualitySettings {
  return {
    distractorQuality: effectiveDistractorMode(quality),
    lengthBandRatio: quality.lengthBandRatio,
    positionBiasThreshold: quality.positionBiasThreshold,
    minChoiceSample: quality.minChoiceSample,
  };
}

/** Highest severity among two gate modes (strict > soft > off). */
export function maxGate(a: GateMode, b: GateMode): GateMode {
  const rank = { off: 0, soft: 1, strict: 2 } as const;
  return rank[a] >= rank[b] ? a : b;
}

export function toDistractorDefaults(): DistractorQualitySettings {
  return { ...DEFAULT_DISTRACTOR_QUALITY };
}
