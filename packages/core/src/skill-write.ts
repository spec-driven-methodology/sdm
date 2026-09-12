import { existsSync } from "node:fs";
import { ZodError } from "zod";
import { SdmError } from "./errors.js";
import { loadQualityConfig } from "./quality-config.js";
import {
  assertAcyclicDepends,
  buildSkillGraphFromProject,
  withProposedDepends,
} from "./skill-graph.js";
import { loadSkill, skillExists, skillFilePath } from "./skills.js";
import { SkillSchema, type Skill } from "./schemas.js";
import { writeYamlFile } from "./yaml.js";

export interface AddSkillInput {
  id: string;
  name: string;
  category?: string;
  description?: string;
  topics?: string[];
  /** Human-readable labels for topic slugs (key → label). */
  topicLabels?: Record<string, string>;
  force?: boolean;
}

export interface LinkSkillInput {
  dependsOn?: string[];
  relatedTo?: string[];
}

export interface SkillWriteWarning {
  code: string;
  message: string;
}

export interface SkillWriteResult {
  skill: Skill;
  path: string;
  action: "add" | "link";
  warnings?: SkillWriteWarning[];
}

function parseSkillOrThrow(payload: unknown): Skill {
  try {
    return SkillSchema.parse(payload);
  } catch (err) {
    if (err instanceof ZodError) {
      throw new SdmError(
        "VALIDATION_FAILED",
        err.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; "),
      );
    }
    throw err;
  }
}

function uniq(values: string[]): string[] {
  return [...new Set(values.filter((v) => v.trim().length > 0))];
}

function assertDepsExist(projectRoot: string, ids: string[], field: string): void {
  for (const id of ids) {
    if (!skillExists(projectRoot, id)) {
      throw new SdmError(
        "SKILL_NOT_FOUND",
        `${field} target skill "${id}" not found under ontology/skills/`,
      );
    }
  }
}

/**
 * Create ontology/skills/<id>.yaml
 */
export function addSkill(projectRoot: string, input: AddSkillInput): SkillWriteResult {
  const id = input.id.trim();
  if (!id) {
    throw new SdmError("VALIDATION_FAILED", "Skill id must not be empty");
  }

  const path = skillFilePath(projectRoot, id);
  if (existsSync(path) && !input.force) {
    throw new SdmError(
      "SKILL_EXISTS",
      `Skill file already exists: ${path}. Use --force to overwrite.`,
    );
  }

  const description = input.description ?? "";
  const topics = uniq(input.topics ?? []);
  const topicLabels = input.topicLabels ?? {};
  const quality = loadQualityConfig(projectRoot);
  const warnings: SkillWriteWarning[] = [];

  if (quality.skillGate !== "off") {
    if (description.trim().length < quality.minSkillDescriptionLength) {
      const msg = `Skill description shorter than ${quality.minSkillDescriptionLength} characters (quality.skillGate)`;
      if (quality.skillGate === "strict") {
        throw new SdmError("SKILL_GATE", msg);
      }
      warnings.push({ code: "SKILL_GATE_DESCRIPTION", message: msg });
    }
    if (topics.length < quality.minSkillTopics) {
      const msg = `Skill has ${topics.length} topics; need ≥ ${quality.minSkillTopics} (quality.skillGate)`;
      if (quality.skillGate === "strict") {
        throw new SdmError("SKILL_GATE", msg);
      }
      warnings.push({ code: "SKILL_GATE_TOPICS", message: msg });
    }
  }

  const skill = parseSkillOrThrow({
    id,
    name: input.name,
    description,
    category: input.category,
    depends_on: [],
    related_to: [],
    topics,
    topic_labels: topicLabels,
  });

  writeYamlFile(path, skill);
  return {
    skill,
    path,
    action: "add",
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Merge depends_on / related_to onto an existing skill (union, dedupe).
 */
export function linkSkill(
  projectRoot: string,
  skillId: string,
  input: LinkSkillInput,
): SkillWriteResult {
  const dependsOn = uniq(input.dependsOn ?? []);
  const relatedTo = uniq(input.relatedTo ?? []);

  if (dependsOn.length === 0 && relatedTo.length === 0) {
    throw new SdmError(
      "VALIDATION_FAILED",
      "Provide at least one of --depends-on or --related-to",
    );
  }

  if (dependsOn.includes(skillId)) {
    throw new SdmError(
      "VALIDATION_FAILED",
      `Skill "${skillId}" cannot depend on itself`,
    );
  }

  assertDepsExist(projectRoot, dependsOn, "depends_on");
  assertDepsExist(projectRoot, relatedTo, "related_to");

  const existing = loadSkill(projectRoot, skillId);
  const path = skillFilePath(projectRoot, existing.id);

  const mergedDepends = uniq([...existing.depends_on, ...dependsOn]);
  if (dependsOn.length > 0) {
    const graph = buildSkillGraphFromProject(projectRoot);
    assertAcyclicDepends(withProposedDepends(graph, existing.id, mergedDepends));
  }

  const skill = parseSkillOrThrow({
    ...existing,
    depends_on: mergedDepends,
    related_to: uniq([...existing.related_to, ...relatedTo]),
  });

  writeYamlFile(path, skill);
  return { skill, path, action: "link" };
}

/** Parse comma-separated skill ids from CLI. */
export function parseSkillIdList(raw: string | undefined): string[] {
  if (!raw || !raw.trim()) {
    return [];
  }
  return uniq(raw.split(",").map((s) => s.trim()));
}
