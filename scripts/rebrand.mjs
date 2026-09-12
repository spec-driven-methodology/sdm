import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = join(import.meta.dirname, "..");

const EXCLUDE_DIRS = new Set([
  "node_modules", "dist", ".git", ".sdm", "openspec", "CHANGELOG.md",
]);

const EXCLUDE_FILES = new Set([
  "package-lock.json",
  "rebrand.mjs",
]);

const EXTENSIONS = new Set([
  ".ts", ".json", ".md", ".html", ".js", ".yaml", ".yml", ".sh", ".mjs",
]);

function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith(".") && entry !== ".sdm") continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (!EXCLUDE_DIRS.has(entry)) files.push(...walk(full));
    } else if (EXTENSIONS.has(extname(entry)) && !EXCLUDE_FILES.has(entry)) {
      files.push(full);
    }
  }
  return files;
}

const REPLACEMENTS = [
  // npm scope
  [/@specra\//g, "@spec-driven-methodology/"],

  // env vars
  [/SPECRA_SKIP_COMPLETION/g, "SDM_SKIP_COMPLETION"],
  [/SPECRA_PROJECT_ROOT/g, "SDM_PROJECT_ROOT"],
  [/SPECRA_HOME/g, "SDM_HOME"],
  [/SPECRA_LOG/g, "SDM_LOG"],
  [/SPECRA_LOCALE/g, "SDM_LOCALE"],
  [/SPECRA_ASCII/g, "SDM_ASCII"],
  [/SPECRA_TAGLINE/g, "SDM_TAGLINE"],
  [/SPECRA_NO_BUMP_BUILD/g, "SDM_NO_BUMP_BUILD"],

  // scheme namespaces
  [/specra\.export\./g, "sdm.export."],
  [/specra\.studio\./g, "sdm.studio."],
  [/specra\.intent\./g, "sdm.intent."],
  [/specra\.skill\./g, "sdm.skill."],
  [/specra\.corpus\./g, "sdm.corpus."],
  [/specra\.bootstrap\./g, "sdm.bootstrap."],
  [/specra\.content\./g, "sdm.content."],
  [/specra\.quality\./g, "sdm.quality."],
  [/specra\.log\b/g, "sdm.log"],
  [/specra\.diagnostics\./g, "sdm.diagnostics."],
  [/specra\.audit\b/g, "sdm.audit"],
  [/specra\.semantic-index\b/g, "sdm.semantic-index"],

  // localStorage keys
  [/specra\.player\./g, "sdm.player."],

  // classes & types
  [/SpecraError/g, "SdmError"],
  [/SpecraConfigSchema/g, "SdmConfigSchema"],
  [/SpecraConfig\b/g, "SdmConfig"],
  [/SpecraLocale\b/g, "SdmLocale"],
  [/SpecraPackageRoot/g, "SdmPackageRoot"],
  [/SpecraSchema/g, "SdmSchema"],

  // string literals
  [/"Specra"/g, '"SDM"'],
  [/'Specra'/g, "'SDM'"],
  [/"specra"/g, '"sdm"'],
  [/'specra'/g, "'sdm'"],

  // project manifest
  [/specra\.yaml/g, "sdm.yaml"],

  // .specra dir
  [/\.specra\//g, ".sdm/"],

  // file basenames in strings
  [/\bspecra\.(zsh|bash|fish)\b/g, "sdm.$1"],

  // comments/labels
  [/\bSpecra\s(MCP|methodology|project|CLI|shell)\b/g, "SDM $1"],

  // shell completion identifiers (_specra → _sdm, compdef specra)
  [/_specra/g, "_sdm"],
  [/\bcompdef\s+specra\b/g, "compdef sdm"],
  [/\bcomplete\s+-F\s+_sdm_completions\s+specra\b/g, "complete -F _sdm_completions sdm"],

  // standalone "specra" as command/identifier
  [/(?<!@|\/|\w)specra(?!\/|\.\w)/g, "sdm"],

  // file/dir names in paths
  [/\bexplain-specra\b/g, "explain-sdm"],

  // final pass: any remaining "Specra" as brand word → SDM
  [/\bSpecra\b/g, "SDM"],
];

const files = walk(ROOT);
let changed = 0;

for (const file of files) {
  let content = readFileSync(file, "utf-8");
  const before = content;
  for (const [regex, repl] of REPLACEMENTS) {
    content = content.replace(regex, repl);
  }
  if (content !== before) {
    writeFileSync(file, content, "utf-8");
    changed++;
  }
}

console.log(`Changed ${changed} files.`);