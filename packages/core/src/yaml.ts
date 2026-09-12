import { dump, load } from "js-yaml";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

export function readYamlFile<T = unknown>(path: string): T {
  const raw = readFileSync(path, "utf8");
  return load(raw) as T;
}

export function writeYamlFile(path: string, data: unknown): void {
  mkdirSync(dirname(path), { recursive: true });
  const content = dump(data, {
    lineWidth: 100,
    noRefs: true,
    quotingType: '"',
    forceQuotes: false,
  });
  writeFileSync(path, content.endsWith("\n") ? content : `${content}\n`, "utf8");
}
