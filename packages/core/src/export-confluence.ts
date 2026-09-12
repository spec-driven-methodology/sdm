import { runCertCoverage } from "./cert-coverage.js";
import { exportMatrix } from "./export.js";
import { exportMermaid } from "./export-mermaid.js";
import { findProjectRoot } from "./project-root.js";

export const EXPORT_CONFLUENCE_SCHEMA = "sdm.export.confluence/v1";

export interface ExportConfluenceDocument {
  schemaVersion: typeof EXPORT_CONFLUENCE_SCHEMA;
  profile: string;
  level?: string;
  title: string;
  markdown: string;
}

export interface ExportConfluenceOptions {
  startDir: string;
  profile: string;
  level?: string;
  team?: string;
}

export interface ExportConfluenceRun {
  projectRoot: string;
  document: ExportConfluenceDocument;
}

/**
 * One Markdown page for Confluence: coverage summary + mermaid + matrix.
 */
export function exportConfluence(options: ExportConfluenceOptions): ExportConfluenceRun {
  const projectRoot = findProjectRoot(options.startDir);
  const levelId = options.level;
  const parts: string[] = [];

  let title = `SDM — ${options.profile}`;
  if (levelId) {
    const coverage = runCertCoverage({
      startDir: projectRoot,
      profile: options.profile,
      level: levelId,
      team: options.team,
    });
    title = coverage.result.title;
    parts.push(`# ${title}`);
    parts.push("");
    parts.push(`Profile: \`${options.profile}\` · Level: \`${levelId}\``);
    if (options.team) parts.push(`Team: \`${options.team}\``);
    parts.push("");
    parts.push("## Coverage");
    parts.push("");
    for (const s of coverage.result.skills) {
      parts.push(
        `- ${s.statusSymbol} **${s.skill}** — questions=${s.questionCount}, depth=${s.achievedDepth}/${s.depth} (ratio=${s.depthRatio})`,
      );
    }
    parts.push("");
    const mermaid = exportMermaid({
      startDir: projectRoot,
      profile: options.profile,
      level: levelId,
    });
    parts.push("## Skill graph");
    parts.push("");
    parts.push(mermaid.document.markdown.trimEnd());
    parts.push("");
  } else {
    parts.push(`# SDM competency matrix — ${options.profile}`);
    parts.push("");
  }

  const matrix = exportMatrix({
    startDir: projectRoot,
    profile: options.profile,
    format: "csv",
  });
  parts.push("## Competency matrix");
  parts.push("");
  parts.push("```csv");
  parts.push((matrix.csv ?? "").trimEnd());
  parts.push("```");
  parts.push("");

  return {
    projectRoot,
    document: {
      schemaVersion: EXPORT_CONFLUENCE_SCHEMA,
      profile: options.profile,
      level: levelId,
      title,
      markdown: parts.join("\n"),
    },
  };
}
