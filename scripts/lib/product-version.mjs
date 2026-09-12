/**
 * Product identity helpers: stable X.Y.Z or prerelease X.Y.Z-(alpha|beta|rc).N
 */

/** @typedef {"alpha" | "beta" | "rc"} Stage */
/** @typedef {{ major: number, minor: number, patch: number, stage: Stage | null, build: number | null }} ParsedVersion */

const STAGES = new Set(["alpha", "beta", "rc"]);

/** Full identity: stable or stage.build prerelease only. */
export const PRODUCT_VERSION_RE =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-(alpha|beta|rc)\.([1-9]\d*))?$/;

/**
 * @param {string} version
 * @returns {ParsedVersion}
 */
export function parseProductVersion(version) {
  const raw = (version || "").trim();
  const m = raw.match(PRODUCT_VERSION_RE);
  if (!m) {
    throw new Error(
      `Invalid product identity "${version || "(empty)"}" (want X.Y.Z or X.Y.Z-(alpha|beta|rc).N)`,
    );
  }
  return {
    major: Number(m[1]),
    minor: Number(m[2]),
    patch: Number(m[3]),
    stage: m[4] ? /** @type {Stage} */ (m[4]) : null,
    build: m[5] ? Number(m[5]) : null,
  };
}

/**
 * @param {ParsedVersion} v
 * @returns {string}
 */
export function formatProductVersion(v) {
  const base = `${v.major}.${v.minor}.${v.patch}`;
  if (v.stage && v.build != null) {
    if (!STAGES.has(v.stage) || !Number.isInteger(v.build) || v.build < 1) {
      throw new Error(`Invalid stage/build in ${JSON.stringify(v)}`);
    }
    return `${base}-${v.stage}.${v.build}`;
  }
  if (v.stage || v.build != null) {
    throw new Error(`Incomplete prerelease in ${JSON.stringify(v)}`);
  }
  return base;
}

/**
 * @param {string} version
 * @returns {boolean}
 */
export function isValidProductVersion(version) {
  try {
    parseProductVersion(version);
    return true;
  } catch {
    return false;
  }
}

/**
 * @param {ParsedVersion} current
 * @param {"show"|"build"|"prerelease"|"major"|"minor"|"patch"|"alpha"|"beta"|"rc"|"stable"} mode
 * @returns {ParsedVersion}
 */
export function bumpParsedVersion(current, mode) {
  switch (mode) {
    case "show":
      return { ...current };
    case "build":
    case "prerelease": {
      if (!current.stage || current.build == null) {
        throw new Error(
          `Cannot bump build on stable identity ${formatProductVersion(current)}; set a stage first (version:alpha|beta|rc)`,
        );
      }
      return { ...current, build: current.build + 1 };
    }
    case "major":
      return {
        major: current.major + 1,
        minor: 0,
        patch: 0,
        stage: current.stage,
        build: current.stage ? 1 : null,
      };
    case "minor":
      return {
        major: current.major,
        minor: current.minor + 1,
        patch: 0,
        stage: current.stage,
        build: current.stage ? 1 : null,
      };
    case "patch":
      return {
        major: current.major,
        minor: current.minor,
        patch: current.patch + 1,
        stage: current.stage,
        build: current.stage ? 1 : null,
      };
    case "alpha":
    case "beta":
    case "rc":
      return {
        major: current.major,
        minor: current.minor,
        patch: current.patch,
        stage: mode,
        build: 1,
      };
    case "stable":
      return {
        major: current.major,
        minor: current.minor,
        patch: current.patch,
        stage: null,
        build: null,
      };
    default:
      throw new Error(`Unknown bump mode: ${mode}`);
  }
}
