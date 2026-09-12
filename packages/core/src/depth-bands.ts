/** Canonical depth bands (L0–L3) — labels for requirement depth 0..1. */

export const DEPTH_BANDS = [
  { band: "L0", depth: 0, label: "не знает" },
  { band: "L1", depth: 0.3, label: "объясняет" },
  { band: "L2", depth: 0.6, label: "делает" },
  { band: "L3", depth: 0.85, label: "задаёт практику" },
] as const;

export type DepthBandId = (typeof DEPTH_BANDS)[number]["band"];

export interface DepthBandView {
  band: DepthBandId;
  depth: number;
  label: string;
}

/** Nearest band at or below the given depth (e.g. 0.5 → L1). */
export function labelDepth(depth: number): DepthBandView {
  const d = Math.max(0, Math.min(1, depth));
  let chosen: DepthBandView = { ...DEPTH_BANDS[0] };
  for (const row of DEPTH_BANDS) {
    if (d + 1e-9 >= row.depth) {
      chosen = {
        band: row.band,
        depth: row.depth,
        label: row.label,
      };
    }
  }
  return chosen;
}

export function formatDepthBand(depth: number): string {
  const view = labelDepth(depth);
  return `${view.band} · глубина ${depth}`;
}
