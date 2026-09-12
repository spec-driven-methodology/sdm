import {
  computeCoverage,
  type CoverageResult,
  type SkillCoverage,
} from "./coverage.js";
import {
  assertProfileLevelMatch,
  loadLevel,
  loadQuestions,
  loadProfile,
  parseLevelDocument,
  parseProfileDocument,
  type LoadWarning,
} from "./loaders.js";
import {
  exportMatchesScope,
  scanExportArtifacts,
  type ExportArtifactRef,
} from "./export-artifacts.js";
import { findProjectRoot } from "./project-root.js";
import {
  buildSkillGraphFromProject,
  type SkillGraph,
} from "./skill-graph.js";
import { assertSkillExists } from "./skills.js";
import type { Level, Profile } from "./schemas.js";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { readYamlFile } from "./yaml.js";

export const SKILL_GRAPH_SCHEMA = "sdm.skill.graph/v1";
export const SKILL_IMPACT_SCHEMA = "sdm.skill.impact/v2";

export interface SkillGraphNodeView {
  skill: string;
  dependsOn: string[];
  coverage?: SkillCoverage;
  /** Indent depth for terminal tree (0 = root requirement). */
  depth: number;
}

export interface SkillGraphDocument {
  schemaVersion: typeof SKILL_GRAPH_SCHEMA;
  profile: string;
  level: string;
  title: string;
  coverage: boolean;
  minOkQuestions: number;
  nodes: SkillGraphNodeView[];
  text: string;
}

export interface SkillGraphRun {
  projectRoot: string;
  document: SkillGraphDocument;
  coverageResult?: CoverageResult;
  warnings: LoadWarning[];
}

export interface SkillImpactQuestionRef {
  id: string;
  skill: string;
}

export interface SkillImpactDocument {
  schemaVersion: typeof SKILL_IMPACT_SCHEMA;
  skill: string;
  downstreamSkills: string[];
  profiles: string[];
  levels: Array<{ profile?: string; level: string; title: string }>;
  questions: SkillImpactQuestionRef[];
  exports: ExportArtifactRef[];
}

export interface SkillImpactRun {
  projectRoot: string;
  document: SkillImpactDocument;
}

function listYamlFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const results: string[] = [];
  function walk(current: string): void {
    for (const entry of readdirSync(current)) {
      const full = join(current, entry);
      if (statSync(full).isDirectory()) walk(full);
      else if (entry.endsWith(".yaml") || entry.endsWith(".yml")) results.push(full);
    }
  }
  walk(dir);
  return results;
}

export function loadAllProfiles(projectRoot: string): Profile[] {
  const profiles: Profile[] = [];
  const seen = new Set<string>();
  for (const dir of [
    join(projectRoot, "certifications", "profiles"),
    join(projectRoot, "certifications", "roles"),
  ]) {
    for (const file of listYamlFiles(dir)) {
      try {
        const parsed = parseProfileDocument(readYamlFile(file));
        if (seen.has(parsed.profile)) continue;
        seen.add(parsed.profile);
        profiles.push(parsed);
      } catch {
        // skip
      }
    }
  }
  return profiles;
}

export function loadAllLevels(projectRoot: string): Level[] {
  const dir = join(projectRoot, "certifications", "levels");
  const levels: Level[] = [];
  const seen = new Set<string>();
  for (const file of listYamlFiles(dir)) {
    try {
      const parsed = parseLevelDocument(readYamlFile(file));
      if (seen.has(parsed.level)) continue;
      seen.add(parsed.level);
      levels.push(parsed);
    } catch {
      // skip
    }
  }
  return levels;
}

function bar(ratio: number, width = 20): string {
  const clamped = Math.max(0, Math.min(1.5, ratio));
  const filled = Math.round(Math.min(1, clamped) * width);
  const extra = clamped > 1 ? Math.min(width, Math.round((clamped - 1) * width)) : 0;
  const body = "█".repeat(filled) + "░".repeat(Math.max(0, width - filled));
  return extra > 0 ? body.slice(0, width) : body;
}

function formatGraphText(
  nodes: SkillGraphNodeView[],
  coverage: boolean,
  minOk: number,
): string {
  const lines: string[] = [];
  for (const node of nodes) {
    const indent = "  ".repeat(node.depth);
    const prefix = node.depth === 0 ? "" : "└── ";
    if (coverage && node.coverage) {
      const c = node.coverage;
      const ratio = minOk > 0 ? c.questionCount / minOk : 0;
      lines.push(
        `${indent}${prefix}${node.skill} [${c.questionCount}/${minOk}] ${bar(ratio)} ${c.statusSymbol}`,
      );
    } else {
      lines.push(`${indent}${prefix}${node.skill}`);
    }
  }
  return lines.join("\n") + (lines.length ? "\n" : "");
}

/**
 * Walk depends_on children that appear in `allowed` set, DFS from roots.
 */
function buildTreeNodes(
  roots: string[],
  graph: SkillGraph,
  allowed: Set<string>,
  coverageBySkill: Map<string, SkillCoverage> | undefined,
): SkillGraphNodeView[] {
  const nodes: SkillGraphNodeView[] = [];
  const visited = new Set<string>();

  function walk(skillId: string, depth: number): void {
    if (!allowed.has(skillId) || visited.has(skillId)) return;
    visited.add(skillId);
    const deps = (graph.dependsOn.get(skillId) ?? []).filter((d) => allowed.has(d));
    nodes.push({
      skill: skillId,
      dependsOn: deps,
      coverage: coverageBySkill?.get(skillId),
      depth,
    });
    for (const child of deps) {
      walk(child, depth + 1);
    }
  }

  for (const root of roots) {
    walk(root, 0);
  }
  return nodes;
}

export interface RunSkillGraphOptions {
  startDir: string;
  profile: string;
  level: string;
  coverage?: boolean;
}

export function runSkillGraph(options: RunSkillGraphOptions): SkillGraphRun {
  const projectRoot = findProjectRoot(options.startDir);
  const profile = loadProfile(projectRoot, options.profile);
  const level = loadLevel(projectRoot, options.level);
  assertProfileLevelMatch(profile, level, options.profile);

  const withCoverage = options.coverage !== false;
  const { questions, warnings } = loadQuestions(projectRoot);
  const graph = buildSkillGraphFromProject(projectRoot);
  const coverageResult = computeCoverage(level, questions, {
    profile: options.profile,
    skillsById: graph.skills,
  });
  const coverageBySkill = new Map(
    coverageResult.skills.map((s) => [s.skill, s] as const),
  );

  const required = level.requirements.map((r) => r.skill);
  const allowed = new Set(required);

  // Include transitive depends_on targets that exist in ontology even if not required,
  // but only show nodes that are in required set for the certification view.
  const nodes = buildTreeNodes(required, graph, allowed, withCoverage ? coverageBySkill : undefined);

  const document: SkillGraphDocument = {
    schemaVersion: SKILL_GRAPH_SCHEMA,
    profile: options.profile,
    level: level.level,
    title: level.title,
    coverage: withCoverage,
    minOkQuestions: coverageResult.minOkQuestions,
    nodes,
    text: formatGraphText(nodes, withCoverage, coverageResult.minOkQuestions),
  };

  return {
    projectRoot,
    document,
    coverageResult: withCoverage ? coverageResult : undefined,
    warnings,
  };
}

function reverseDepends(graph: SkillGraph): Map<string, string[]> {
  const rev = new Map<string, string[]>();
  for (const id of graph.skills.keys()) {
    rev.set(id, []);
  }
  for (const [from, deps] of graph.dependsOn) {
    for (const to of deps) {
      if (!rev.has(to)) rev.set(to, []);
      rev.get(to)!.push(from);
    }
  }
  return rev;
}

export interface RunSkillImpactOptions {
  startDir: string;
  skill: string;
}

export function runSkillImpact(options: RunSkillImpactOptions): SkillImpactRun {
  const projectRoot = findProjectRoot(options.startDir);
  assertSkillExists(projectRoot, options.skill);

  const graph = buildSkillGraphFromProject(projectRoot);
  const rev = reverseDepends(graph);

  const downstream: string[] = [];
  const queue = [...(rev.get(options.skill) ?? [])];
  const seen = new Set<string>();
  while (queue.length) {
    const id = queue.shift()!;
    if (seen.has(id) || id === options.skill) continue;
    seen.add(id);
    downstream.push(id);
    for (const next of rev.get(id) ?? []) {
      if (!seen.has(next)) queue.push(next);
    }
  }
  downstream.sort();

  const affected = new Set([options.skill, ...downstream]);
  const levelsHit: SkillImpactDocument["levels"] = [];
  const profilesHit = new Set<string>();

  for (const level of loadAllLevels(projectRoot)) {
    const hit = level.requirements.some((r) => affected.has(r.skill));
    if (!hit) continue;
    levelsHit.push({
      profile: level.profile,
      level: level.level,
      title: level.title,
    });
    if (level.profile) profilesHit.add(level.profile);
  }

  for (const profile of loadAllProfiles(projectRoot)) {
    for (const levelId of profile.levels) {
      if (levelsHit.some((l) => l.level === levelId)) {
        profilesHit.add(profile.profile);
      }
    }
  }

  const { questions } = loadQuestions(projectRoot);
  const questionRefs = questions
    .filter((q) => affected.has(q.skill))
    .map((q) => ({ id: q.id, skill: q.skill }))
    .sort((a, b) => a.id.localeCompare(b.id));

  const levelIds = new Set(levelsHit.map((l) => l.level));
  const exportRefs = scanExportArtifacts(projectRoot).filter((ref) =>
    exportMatchesScope(ref, {
      skills: affected,
      profiles: profilesHit,
      levels: levelIds,
    }),
  );

  return {
    projectRoot,
    document: {
      schemaVersion: SKILL_IMPACT_SCHEMA,
      skill: options.skill,
      downstreamSkills: downstream,
      profiles: [...profilesHit].sort(),
      levels: levelsHit.sort((a, b) => a.level.localeCompare(b.level)),
      questions: questionRefs,
      exports: exportRefs,
    },
  };
}
