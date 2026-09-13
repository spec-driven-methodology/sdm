import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import {
  findProjectRoot,
  listMethodologyProjects,
  locateProject,
  PROJECT_MANIFEST,
} from "../src/project-root.js";
import { SdmError } from "../src/errors.js";

function makeProject(root: string, name: string): string {
  const dir = join(root, name);
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, PROJECT_MANIFEST),
    `version: "0.1"\nname: ${name}\nsearch:\n  provider: none\n`,
    "utf8",
  );
  return dir;
}

describe("findProjectRoot", () => {
  it("finds root walking up from a nested dir", () => {
    const root = mkdtempSync(join(tmpdir(), "sdm-root-"));
    const project = makeProject(root, "proj");
    const nested = join(project, "ontology");
    mkdirSync(nested, { recursive: true });
    assert.equal(findProjectRoot(nested), project);
  });

  it("throws PROJECT_ROOT_NOT_FOUND when absent", () => {
    const root = mkdtempSync(join(tmpdir(), "sdm-noproj-"));
    assert.throws(
      () => findProjectRoot(root),
      (err: unknown) =>
        err instanceof SdmError && err.code === "PROJECT_ROOT_NOT_FOUND",
    );
  });
});

describe("locateProject", () => {
  it("returns root + name for a project dir", () => {
    const root = mkdtempSync(join(tmpdir(), "sdm-locate-"));
    const project = makeProject(root, "backend-methodology");
    const found = locateProject(project);
    assert.deepEqual(found, { root: project, name: "backend-methodology" });
  });

  it("returns root + name for a nested dir", () => {
    const root = mkdtempSync(join(tmpdir(), "sdm-locate-nested-"));
    const project = makeProject(root, "proj");
    const nested = join(project, "library", "questions");
    mkdirSync(nested, { recursive: true });
    assert.deepEqual(locateProject(nested), {
      root: project,
      name: "proj",
    });
  });

  it("returns null outside a project", () => {
    const root = mkdtempSync(join(tmpdir(), "sdm-locate-none-"));
    assert.equal(locateProject(root), null);
  });
});

describe("listMethodologyProjects", () => {
  it("scans workspace and lists nested projects", () => {
    const root = mkdtempSync(join(tmpdir(), "sdm-ws-"));
    const a = makeProject(root, "alpha");
    const b = makeProject(root, "beta");
    assert.equal(listMethodologyProjects(root).length, 2);
    const names = listMethodologyProjects(root)
      .map((p) => p.name)
      .sort();
    assert.deepEqual(names, ["alpha", "beta"]);
    assert.ok(listMethodologyProjects(root).some((p) => p.root === a));
    assert.ok(listMethodologyProjects(root).some((p) => p.root === b));
  });

  it("skips node_modules and hidden dirs", () => {
    const root = mkdtempSync(join(tmpdir(), "sdm-ws-skip-"));
    makeProject(root, "real");
    const nm = join(root, "node_modules", "fake");
    mkdirSync(nm, { recursive: true });
    writeFileSync(
      join(nm, PROJECT_MANIFEST),
      "name: fake\n",
      "utf8",
    );
    const hidden = join(root, ".hidden");
    mkdirSync(hidden, { recursive: true });
    writeFileSync(
      join(hidden, PROJECT_MANIFEST),
      "name: hidden\n",
      "utf8",
    );
    const found = listMethodologyProjects(root);
    assert.deepEqual(found.map((p) => p.name), ["real"]);
  });

  it("does not descend into a project's subdirs", () => {
    const root = mkdtempSync(join(tmpdir(), "sdm-ws-depth-"));
    const project = makeProject(root, "top");
    // nested "project" inside a project should NOT be listed
    const inner = join(project, "sub", "nested");
    mkdirSync(inner, { recursive: true });
    writeFileSync(join(inner, PROJECT_MANIFEST), "name: nested\n", "utf8");
    const found = listMethodologyProjects(root);
    assert.deepEqual(found.map((p) => p.name), ["top"]);
  });

  it("returns empty for missing workspace", () => {
    const root = mkdtempSync(join(tmpdir(), "sdm-ws-missing-"));
    assert.deepEqual(listMethodologyProjects(join(root, "nope")), []);
  });
});