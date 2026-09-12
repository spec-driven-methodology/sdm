import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { SdmError } from "./errors.js";
import { SkillSchema, type Skill } from "./schemas.js";
import { readYamlFile } from "./yaml.js";

function listYamlFiles(dir: string): string[] {
  if (!existsSync(dir)) {
    return [];
  }
  const results: string[] = [];
  function walk(current: string): void {
    for (const entry of readdirSync(current)) {
      const full = join(current, entry);
      if (statSync(full).isDirectory()) {
        walk(full);
      } else if (entry.endsWith(".yaml") || entry.endsWith(".yml")) {
        results.push(full);
      }
    }
  }
  walk(dir);
  return results;
}

export function skillFilePath(projectRoot: string, skillId: string): string {
  return join(projectRoot, "ontology", "skills", `${skillId}.yaml`);
}

export function skillExists(projectRoot: string, skillId: string): boolean {
  if (existsSync(skillFilePath(projectRoot, skillId))) {
    return true;
  }
  const skillsDir = join(projectRoot, "ontology", "skills");
  for (const file of listYamlFiles(skillsDir)) {
    try {
      const parsed = SkillSchema.parse(readYamlFile(file));
      if (parsed.id === skillId) {
        return true;
      }
    } catch {
      // continue
    }
  }
  return false;
}

export function assertSkillExists(projectRoot: string, skillId: string): void {
  if (!skillExists(projectRoot, skillId)) {
    throw new SdmError(
      "SKILL_NOT_FOUND",
      `Skill "${skillId}" not found under ontology/skills/`,
    );
  }
}

export function loadSkill(projectRoot: string, skillId: string): Skill {
  const preferred = skillFilePath(projectRoot, skillId);
  if (existsSync(preferred)) {
    return SkillSchema.parse(readYamlFile(preferred));
  }
  const skillsDir = join(projectRoot, "ontology", "skills");
  for (const file of listYamlFiles(skillsDir)) {
    try {
      const parsed = SkillSchema.parse(readYamlFile(file));
      if (parsed.id === skillId) {
        return parsed;
      }
    } catch {
      // continue
    }
  }
  throw new SdmError(
    "SKILL_NOT_FOUND",
    `Skill "${skillId}" not found under ontology/skills/`,
  );
}

/** Load every valid skill YAML under ontology/skills (invalid files skipped). */
export function loadAllSkills(projectRoot: string): Skill[] {
  const skillsDir = join(projectRoot, "ontology", "skills");
  const skills: Skill[] = [];
  const seen = new Set<string>();
  for (const file of listYamlFiles(skillsDir)) {
    try {
      const parsed = SkillSchema.parse(readYamlFile(file));
      if (seen.has(parsed.id)) {
        continue;
      }
      seen.add(parsed.id);
      skills.push(parsed);
    } catch {
      // skip invalid
    }
  }
  return skills;
}
