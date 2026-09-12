/** Canonical depth bands (L0–L3) — labels for requirement depth 0..1. */
export declare const DEPTH_BANDS: readonly [{
    readonly band: "L0";
    readonly depth: 0;
    readonly label: "не знает";
}, {
    readonly band: "L1";
    readonly depth: 0.3;
    readonly label: "объясняет";
}, {
    readonly band: "L2";
    readonly depth: 0.6;
    readonly label: "делает";
}, {
    readonly band: "L3";
    readonly depth: 0.85;
    readonly label: "задаёт практику";
}];
export type DepthBandId = (typeof DEPTH_BANDS)[number]["band"];
export interface DepthBandView {
    band: DepthBandId;
    depth: number;
    label: string;
}
/** Nearest band at or below the given depth (e.g. 0.5 → L1). */
export declare function labelDepth(depth: number): DepthBandView;
export declare function formatDepthBand(depth: number): string;
//# sourceMappingURL=depth-bands.d.ts.map