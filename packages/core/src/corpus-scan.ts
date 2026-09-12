import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { z } from "zod";
import { SdmError } from "./errors.js";

export const CORPUS_MANIFEST_SCHEMA = "sdm.corpus.manifest/v1" as const;

export const CORPUS_ARTIFACT_TYPES = [
  "matrix",
  "question_bank",
  "program",
  "rubric",
  "ops",
  "stub",
  "unknown",
] as const;
export type CorpusArtifactType = (typeof CORPUS_ARTIFACT_TYPES)[number];

export const CORPUS_ENTRY_STATUSES = [
  "ssot",
  "quarry",
  "drop",
  "rewrite",
  "unknown",
] as const;
export type CorpusEntryStatus = (typeof CORPUS_ENTRY_STATUSES)[number];

export const CorpusEntrySchema = z.object({
  path: z.string().min(1),
  artifactType: z.enum(CORPUS_ARTIFACT_TYPES),
  status: z.enum(CORPUS_ENTRY_STATUSES),
  contentHash: z.string().min(1),
  lineCount: z.number().int().nonnegative(),
  headings: z.array(z.string()).default([]),
  signals: z.array(z.string()).default([]),
});

export const CorpusManifestSchema = z.object({
  schemaVersion: z.literal(CORPUS_MANIFEST_SCHEMA),
  generatedAt: z.string().min(1),
  sourcesRoot: z.string().min(1),
  entries: z.array(CorpusEntrySchema),
});

export type CorpusEntry = z.infer<typeof CorpusEntrySchema>;
export type CorpusManifest = z.infer<typeof CorpusManifestSchema>;

const STUB_LINE_THRESHOLD = 20;

function sha256(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex").slice(0, 16);
}

function walkMarkdownFiles(root: string): string[] {
  const out: string[] = [];
  const stack = [root];
  while (stack.length > 0) {
    const dir = stack.pop()!;
    let names: string[];
    try {
      names = readdirSync(dir);
    } catch {
      continue;
    }
    for (const name of names) {
      if (name === "node_modules" || name === ".git" || name === ".sdm") continue;
      const full = join(dir, name);
      let st;
      try {
        st = statSync(full);
      } catch {
        continue;
      }
      if (st.isDirectory()) stack.push(full);
      else if (st.isFile() && /\.md$/i.test(name)) out.push(full);
    }
  }
  return out.sort((a, b) => a.localeCompare(b));
}

function extractHeadings(content: string): string[] {
  const headings: string[] = [];
  for (const line of content.split(/\r?\n/)) {
    const m = /^(#{1,3})\s+(.+)$/.exec(line.trim());
    if (m) headings.push(m[2]!.trim());
  }
  return headings.slice(0, 40);
}

function detectSignals(content: string): string[] {
  const signals: string[] = [];
  const checkMarks = (content.match(/✅/g) ?? []).length;
  if (checkMarks >= 2) {
    // Multiple correct markers in one item is a common bank defect
    const blocks = content.split(/\n(?=#{1,3}\s|\d+\.\s)/);
    for (const block of blocks) {
      const n = (block.match(/✅/g) ?? []).length;
      if (n >= 2) {
        signals.push("multi_correct_mcq");
        break;
      }
    }
  }
  if (
    /[A-DА-Г]\)/.test(content) === false &&
    /✅/.test(content) === false &&
    /(вопрос|question)/i.test(content) &&
    content.split(/\r?\n/).length < 80
  ) {
    signals.push("flashcard_no_distractors");
  }
  if (/\bMCP\b|\bmcp\./.test(content) && /лимит|токен|token/i.test(content)) {
    signals.push("tool_trivia_risk");
  }
  return signals;
}

function classifyArtifact(
  relPath: string,
  content: string,
  lineCount: number,
): { artifactType: CorpusArtifactType; status: CorpusEntryStatus } {
  const p = relPath.toLowerCase();
  const base = p.split("/").pop() ?? p;

  const looksLikeBank =
    /bank|assignment|question|testing-qa|prompt-engineering|analyst|developer/.test(
      p,
    ) ||
    /✅/.test(content) ||
    /single_choice|multi_choice|вариант/.test(content);

  if (
    /matrix|competenc|паутин|digital-trace|следы/.test(p) ||
    /matrix|competenc/.test(base)
  ) {
    if (/ai-dev-competency|rubric|literacy/.test(p)) {
      return { artifactType: "rubric", status: "quarry" };
    }
    return { artifactType: "matrix", status: "unknown" };
  }

  if (looksLikeBank) {
    const status: CorpusEntryStatus = /bank\.md|qa-bank/.test(p)
      ? "quarry"
      : "unknown";
    return { artifactType: "question_bank", status };
  }

  if (lineCount > 0 && lineCount < STUB_LINE_THRESHOLD) {
    return { artifactType: "stub", status: "drop" };
  }

  if (/program|roadmap|methodology|certification-engineers|motivation/.test(p)) {
    return { artifactType: "program", status: "unknown" };
  }

  if (/bootcamp|virtual-environment|workspace-structure|lms/.test(p)) {
    return { artifactType: "ops", status: "drop" };
  }

  if (/rubric|практик|daily-work|quality-design/.test(p)) {
    return { artifactType: "rubric", status: "quarry" };
  }

  return { artifactType: "unknown", status: "unknown" };
}

/** Topic-like headings used for corpus matrix rows (heuristic). */
export function extractTopicCandidates(manifest: CorpusManifest): string[] {
  const topics = new Set<string>();
  const known = [
    "Prompting",
    "Prompt engineering",
    "Context management",
    "Creating tools",
    "Creating skills",
    "Agents team",
  ];
  for (const k of known) topics.add(k);

  for (const e of manifest.entries) {
    for (const h of e.headings) {
      const lower = h.toLowerCase();
      for (const k of known) {
        if (lower.includes(k.toLowerCase()) || lower.includes(k.split(" ")[0]!.toLowerCase())) {
          topics.add(k);
        }
      }
      if (/prompt/i.test(h)) topics.add("Prompting");
      if (/context|контекст/i.test(h)) topics.add("Context management");
      if (/agent/i.test(h)) topics.add("Agents team");
      if (/tool|инструмент/i.test(h)) topics.add("Creating tools");
      if (/skill|навык/i.test(h) && !/prompt/i.test(h)) topics.add("Creating skills");
    }
  }
  return [...topics];
}

export interface ScanCorpusOptions {
  sourcesDir: string;
}

export function scanCorpusSources(options: ScanCorpusOptions): CorpusManifest {
  const sourcesRoot = resolve(options.sourcesDir);
  if (!existsSync(sourcesRoot) || !statSync(sourcesRoot).isDirectory()) {
    throw new SdmError(
      "CORPUS_SOURCES_NOT_FOUND",
      `Sources directory not found or not a directory: ${sourcesRoot}`,
    );
  }

  const files = walkMarkdownFiles(sourcesRoot);
  const entries: CorpusEntry[] = [];

  for (const full of files) {
    let content: string;
    try {
      content = readFileSync(full, "utf8");
    } catch {
      continue;
    }
    const rel = relative(sourcesRoot, full).split("\\").join("/");
    const lineCount = content.split(/\r?\n/).length;
    const { artifactType, status } = classifyArtifact(rel, content, lineCount);
    const signals = detectSignals(content);
    if (lineCount < STUB_LINE_THRESHOLD && !signals.includes("stub_short")) {
      signals.push("stub_short");
    }
    entries.push(
      CorpusEntrySchema.parse({
        path: rel,
        artifactType,
        status,
        contentHash: sha256(content),
        lineCount,
        headings: extractHeadings(content),
        signals,
      }),
    );
  }

  return CorpusManifestSchema.parse({
    schemaVersion: CORPUS_MANIFEST_SCHEMA,
    generatedAt: new Date().toISOString(),
    sourcesRoot,
    entries,
  });
}
