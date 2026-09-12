import type { KitChecklistItem, KitWarning } from "./export-kit.js";
import type { Skill } from "./schemas.js";
/** Prefer Russian description lead when skill.name is English-only. */
export declare function kitModuleDisplayTitle(skill: Skill): string;
export declare function kitMetaDepthWeight(depth: number, weight: number, depthBand?: string): string;
export declare function kitChecklistIntroHtml(): string;
export declare function kitChecklistRowLabel(item: KitChecklistItem): string;
export interface KitWarningView {
    title: string;
    detail: string;
    action?: string;
}
export declare function kitWarningView(w: KitWarning, skillTitle?: string): KitWarningView;
export declare function kitEmptyProbesHtml(input: {
    skillId: string;
    assessmentQuestionCount: number;
}): string;
export declare function kitWarningsSummaryHtml(warnings: KitWarning[], skillTitles: Map<string, string>): string;
//# sourceMappingURL=kit-ui-copy.d.ts.map