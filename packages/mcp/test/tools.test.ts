import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import {
  ABOUT_MCP_TOOLS,
  addQuestion,
  addSkill,
  createCertification,
  createProfile,
  getProductVersion,
} from "@spec-driven-methodology/core";
import {
  createServer,
  MCP_SERVER_DESCRIPTION,
  MCP_SERVER_TITLE,
  parseToolJson,
  runTool,
  TOOL_DESCRIPTIONS,
  TOOL_INPUT_SHAPES,
  TOOL_NAMES,
  zodFieldDescription,
} from "../src/server.js";
import { parseArgs } from "../src/args.js";
import { withTempProject } from "./helpers/temp-project.js";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const PRODUCT_VERSION = (
  JSON.parse(readFileSync(join(REPO_ROOT, "package.json"), "utf8")) as {
    version: string;
  }
).version;

function seedCert(
  root: string,
  profile: string,
  level: string,
  requirements: string[],
) {
  createProfile(root, { profile, title: profile });
  createCertification(root, {
    profile,
    level,
    levelTitle: level,
    requirementTriples: requirements,
  });
}

describe("MCP server identity", () => {
  it("uses product SSOT version and SDM title/description", () => {
    assert.equal(getProductVersion(), PRODUCT_VERSION);
    const server = createServer();
    const info = (
      server as unknown as {
        server: { _serverInfo: {
          name: string;
          title?: string;
          description?: string;
          version: string;
        } };
      }
    ).server._serverInfo;
    assert.equal(info.name, "sdm");
    assert.equal(info.title, MCP_SERVER_TITLE);
    assert.equal(info.version, PRODUCT_VERSION);
    assert.equal(
      info.description,
      `${MCP_SERVER_DESCRIPTION} · v${PRODUCT_VERSION}`,
    );
  });
});

describe("parseArgs", () => {
  it("returns empty for no args", () => {
    assert.deepEqual(parseArgs([]), {});
  });

  it("returns empty for unrelated flags", () => {
    assert.deepEqual(parseArgs(["--foo", "bar"]), {});
  });

  it("parses --project <dir>", () => {
    assert.deepEqual(parseArgs(["--project", "/my/proj"]), { project: "/my/proj" });
  });

  it("parses -p <dir>", () => {
    assert.deepEqual(parseArgs(["-p", "/other"]), { project: "/other" });
  });

  it("parses --project=dir syntax", () => {
    assert.deepEqual(parseArgs(["--project=/my/proj"]), { project: "/my/proj" });
  });

  it("returns empty when --project value is empty", () => {
    assert.deepEqual(parseArgs(["--project", ""]), {});
    assert.deepEqual(parseArgs(["--project="]), {});
  });

  it("prefers first --project when repeated", () => {
    assert.deepEqual(parseArgs(["--project", "/a", "--project", "/b"]), { project: "/a" });
  });
});

describe("MCP tool registration", () => {
  it("exposes the full shipped tool set", () => {
    assert.deepEqual(
      [...TOOL_NAMES].sort(),
      [
        "about",
        "audit",
        "cert_coverage",
        "cert_create",
        "cert_gaps",
        "cert_patch",
        "cert_reweight",
        "content_stale",
        "course_heal",
        "doctor",
        "export_confluence",
        "export_course",
        "export_kit",
        "export_learning",
        "export_matrix",
        "export_mermaid",
        "export_test",
        "index_rebuild",
        "init",
        "list_projects",
        "locate_project",
        "player_sync",
        "profile_create",
        "quality_report",
        "question_add",
        "question_deep_validate",
        "question_generate",
        "question_list",
        "question_validate",
        "search",
        "skill_add",
        "skill_graph",
        "skill_impact",
        "skill_link",
        "skill_suggest_links",
        "studio_pull_action",
        "studio_push_coverage",
        "studio_push_view",
        "studio_sync",
        "suggest",
        "term_add",
        "term_list",
        "topic_registry",
        "topic_sync",
      ].sort(),
    );
  });

  it("ABOUT_MCP_TOOLS matches TOOL_NAMES", () => {
    assert.deepEqual([...ABOUT_MCP_TOOLS].sort(), [...TOOL_NAMES].sort());
  });

  it("every tool input param has a non-empty description", () => {
    const missing: string[] = [];
    for (const name of TOOL_NAMES) {
      const shape = TOOL_INPUT_SHAPES[name];
      assert.ok(shape, `missing TOOL_INPUT_SHAPES.${name}`);
      assert.ok(
        TOOL_DESCRIPTIONS[name]?.trim(),
        `missing TOOL_DESCRIPTIONS.${name}`,
      );
      for (const [param, schema] of Object.entries(shape)) {
        if (!zodFieldDescription(schema)) {
          missing.push(`${name}.${param}`);
        }
      }
    }
    assert.deepEqual(missing, [], `params without description: ${missing.join(", ")}`);
  });

  it("studio_sync installs studio assets", async () => {
    await withTempProject(async (root) => {
      rmSync(join(root, "studio"), { recursive: true, force: true });
      const payload = parseToolJson(
        await runTool("studio_sync", { project: root }),
      ) as { ok: boolean; studioDir?: string };
      assert.equal(payload.ok, true);
      assert.ok(payload.studioDir);
    });
  });
});

describe("cert_reweight and cert_patch transfer", () => {
  it("reweights via MCP transfer", async () => {
    await withTempProject(async (root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      addSkill(root, { id: "k8s", name: "K8s" });
      seedCert(root, "pe", "mid", ["docker:0.5:0.6", "k8s:0.4:0.4"]);
      const payload = parseToolJson(
        await runTool("cert_reweight", {
          level: "mid",
          skill: "k8s",
          delta: 0.1,
          from: ["docker"],
        }),
      );
      assert.equal(payload.ok, true);
      assert.equal(payload.after.k8s, 0.5);
      assert.equal(payload.after.docker, 0.5);
    });
  });

  it("patches add with from via MCP", async () => {
    await withTempProject(async (root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      addSkill(root, { id: "linux", name: "Linux" });
      seedCert(root, "pe", "mid", ["docker:0.5:1.0"]);
      const payload = parseToolJson(
        await runTool("cert_patch", {
          level: "mid",
          addRequirements: ["linux:0.4:0.3"],
          from: ["docker:0.3"],
        }),
      );
      assert.equal(payload.ok, true);
      assert.deepEqual(payload.added, ["linux"]);
    });
  });
});

describe("suggest", () => {
  it("returns ok on a methodology project with focus", async () => {
    await withTempProject(async (root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      createProfile(root, { profile: "pe", title: "PE" });
      createCertification(root, {
        profile: "pe",
        level: "mid",
        levelTitle: "Middle",
        requirementTriples: ["docker:0.5:1.0"],
      });
      addQuestion(root, {
        skill: "docker",
        type: "single_choice",
        difficulty: 0.5,
        text: "Docker q",
        options: ["a", "b"],
        correct: [1],
      });
      const payload = parseToolJson(
        await runTool("suggest", {
          project: root,
          profile: "pe",
          level: "mid",
        }),
      );
      assert.equal(payload.ok, true);
      assert.ok(Array.isArray(payload.suggestions));
      assert.ok(payload.suggestions.length >= 1);
    });
  });

  it("returns NOT_A_PROJECT outside a methodology root", async () => {
    const empty = mkdtempSync(join(tmpdir(), "sdm-mcp-suggest-"));
    const prevCwd = process.cwd();
    const prevProject = process.env.SDM_PROJECT_ROOT;
    try {
      process.chdir(empty);
      delete process.env.SDM_PROJECT_ROOT;
      const payload = parseToolJson(await runTool("suggest"));
      assert.equal(payload.ok, false);
      assert.equal(payload.code, "NOT_A_PROJECT");
    } finally {
      process.chdir(prevCwd);
      if (prevProject === undefined) {
        delete process.env.SDM_PROJECT_ROOT;
      } else {
        process.env.SDM_PROJECT_ROOT = prevProject;
      }
      rmSync(empty, { recursive: true, force: true });
    }
  });
});

describe("about", () => {
  it("returns ok without a methodology project", async () => {
    const empty = mkdtempSync(join(tmpdir(), "sdm-mcp-about-"));
    const prevCwd = process.cwd();
    const prevProject = process.env.SDM_PROJECT_ROOT;
    try {
      process.chdir(empty);
      delete process.env.SDM_PROJECT_ROOT;
      const payload = parseToolJson(await runTool("about"));
      assert.equal(payload.ok, true);
      assert.equal(typeof payload.version, "string");
      assert.ok(payload.positioning?.what);
      assert.ok(Array.isArray(payload.capabilities?.mcp));
      assert.ok(payload.capabilities.mcp.includes("about"));
    } finally {
      process.chdir(prevCwd);
      if (prevProject === undefined) {
        delete process.env.SDM_PROJECT_ROOT;
      } else {
        process.env.SDM_PROJECT_ROOT = prevProject;
      }
      rmSync(empty, { recursive: true, force: true });
    }
  });
});

describe("doctor", () => {
  it("returns ok on a methodology project", async () => {
    await withTempProject(async (root) => {
      const payload = parseToolJson(await runTool("doctor"));
      assert.equal(payload.ok, true);
      assert.equal(payload.projectRoot, root);
    });
  });

  it("accepts explicit project when cwd/env point elsewhere", async () => {
    await withTempProject(async (root) => {
      const empty = mkdtempSync(join(tmpdir(), "sdm-mcp-elsewhere-"));
      const prev = process.env.SDM_PROJECT_ROOT;
      try {
        process.env.SDM_PROJECT_ROOT = empty;
        const payload = parseToolJson(
          await runTool("doctor", { project: root }),
        );
        assert.equal(payload.ok, true);
        assert.equal(payload.projectRoot, root);
      } finally {
        if (prev === undefined) delete process.env.SDM_PROJECT_ROOT;
        else process.env.SDM_PROJECT_ROOT = prev;
        rmSync(empty, { recursive: true, force: true });
      }
    });
  });

  it("returns NOT_A_PROJECT outside a methodology root", async () => {
    const empty = mkdtempSync(join(tmpdir(), "sdm-mcp-empty-"));
    const prev = process.env.SDM_PROJECT_ROOT;
    try {
      process.env.SDM_PROJECT_ROOT = empty;
      const payload = parseToolJson(await runTool("doctor"));
      assert.equal(payload.ok, false);
      assert.equal(payload.code, "NOT_A_PROJECT");
    } finally {
      if (prev === undefined) delete process.env.SDM_PROJECT_ROOT;
      else process.env.SDM_PROJECT_ROOT = prev;
      rmSync(empty, { recursive: true, force: true });
    }
  });
});

describe("profile_create", () => {
  it("creates a profile with empty levels", async () => {
    await withTempProject(async () => {
      const payload = parseToolJson(
        await runTool("profile_create", {
          profile: "platform",
          title: "Platform",
        }),
      );
      assert.equal(payload.ok, true);
      const profile = payload.profile as { profile: string; levels: string[] };
      assert.equal(profile.profile, "platform");
      assert.deepEqual(profile.levels, []);
    });
  });
});

describe("cert_create", () => {
  it("returns PROFILE_NOT_FOUND when profile is missing", async () => {
    await withTempProject(async () => {
      const root = process.env.SDM_PROJECT_ROOT!;
      addSkill(root, { id: "docker", name: "Docker" });
      const result = await runTool("cert_create", {
        profile: "platform",
        level: "middle",
        levelTitle: "Middle",
        requirements: ["docker:0.5:1"],
      });
      assert.equal(result.isError, true);
      const payload = parseToolJson(result);
      assert.equal(payload.ok, false);
      assert.equal(payload.code, "PROFILE_NOT_FOUND");
    });
  });
});

describe("audit", () => {
  it("returns methodology findings", async () => {
    await withTempProject(async () => {
      const root = process.env.SDM_PROJECT_ROOT!;
      addSkill(root, { id: "docker", name: "Docker" });
      addQuestion(root, {
        skill: "docker",
        type: "open",
        difficulty: 0.3,
        text: "What is a container?",
        id: "q-docker-001",
      });
      const payload = parseToolJson(await runTool("audit"));
      assert.equal(payload.ok, true);
      const document = payload.document as { schemaVersion: string; library: { questionCount: number } };
      assert.equal(document.schemaVersion, "sdm.audit/v1");
      assert.equal(document.library.questionCount, 1);
    });
  });
});

describe("quality_report", () => {
  it("returns summary report for methodology project", async () => {
    await withTempProject(async (root) => {
      addSkill(root, {
        id: "docker",
        name: "Docker",
        description: "Containers and images for platform work",
        topics: ["images", "compose", "volumes"],
      });
      const payload = parseToolJson(
        await runTool("quality_report", {
          project: root,
          save: true,
          locale: "ru",
        }),
      ) as {
        ok: boolean;
        document: { schemaVersion: string; summaryRu: string; mode: string };
      };
      assert.equal(payload.ok, true);
      assert.equal(payload.document.schemaVersion, "sdm.quality.report/v1");
      assert.equal(payload.document.mode, "methodology");
      assert.ok(payload.document.summaryRu.length > 10);
    });
  });
});

describe("question_list", () => {
  it("lists seeded questions", async () => {
    await withTempProject(async () => {
      const root = process.env.SDM_PROJECT_ROOT!;
      addSkill(root, { id: "docker", name: "Docker" });
      addQuestion(root, {
        skill: "docker",
        type: "open",
        difficulty: 0.3,
        text: "What is a container?",
        id: "q-docker-001",
      });

      const payload = parseToolJson(await runTool("question_list", {}));
      assert.equal(payload.ok, true);
      assert.equal(payload.count, 1);
      const questions = payload.questions as Array<{ id: string }>;
      assert.equal(questions[0]?.id, "q-docker-001");
    });
  });
});

describe("cert_gaps", () => {
  it("reports missing skills", async () => {
    await withTempProject(async () => {
      const root = process.env.SDM_PROJECT_ROOT!;
      addSkill(root, { id: "docker", name: "Docker" });
      seedCert(root, "platform", "middle", ["docker:0.5:1"]);

      const payload = parseToolJson(
        await runTool("cert_gaps", { profile: "platform", level: "middle" }),
      );
      assert.equal(payload.ok, true);
      assert.equal(payload.hasMissing, true);
      const gaps = payload.gaps as Array<{ skill: string; status: string }>;
      assert.ok(gaps.some((g) => g.skill === "docker" && g.status === "missing"));
    });
  });
});

describe("export_learning / export_course", () => {
  it("rejects skill-scoped export without lesson bodies (planOnly removed)", async () => {
    await withTempProject(async () => {
      const root = process.env.SDM_PROJECT_ROOT!;
      addSkill(root, {
        id: "prompt",
        name: "Prompt",
        description: "System prompts, few-shot patterns, and evaluation loops.",
        topics: ["testing"],
      });
      addQuestion(root, {
        skill: "prompt",
        type: "open",
        difficulty: 0.4,
        text: "How do you test a prompt?",
        id: "q-prompt-001",
        explanation: "Golden set.",
        topics: ["testing"],
      });

      const payload = parseToolJson(
        await runTool("export_learning", {
          skill: "prompt",
          depth: "brief",
          format: "howto",
        }),
      );
      assert.equal(payload.ok, false);
      assert.equal(payload.code, "COURSE_ALL_EMPTY");

      const alias = parseToolJson(
        await runTool("export_course", {
          skill: "prompt",
          format: "notes",
        }),
      );
      assert.equal(alias.ok, false);
      assert.equal(alias.code, "COURSE_ALL_EMPTY");
    });
  });
});

describe("export_kit", () => {
  it("exports expert kit for profile/level", async () => {
    await withTempProject(async () => {
      const root = process.env.SDM_PROJECT_ROOT!;
      addSkill(root, {
        id: "prompt",
        name: "Prompt",
        description: "System prompts, few-shot patterns, and evaluation loops.",
        topics: ["testing"],
      });
      seedCert(root, "ai", "junior", ["prompt:0.4:1"]);
      addQuestion(root, {
        skill: "prompt",
        type: "open",
        difficulty: 0.4,
        text: "How do you test a prompt?",
        id: "q-prompt-001",
        explanation: "Golden set.",
        topics: ["testing"],
      });

      const payload = parseToolJson(
        await runTool("export_kit", {
          profile: "ai",
          level: "junior",
        }),
      );
      assert.equal(payload.ok, true);
      const document = payload.document as {
        schemaVersion: string;
        id: string;
        modules: Array<{ skill: string; probes: Array<{ id: string }> }>;
      };
      assert.equal(document.schemaVersion, "sdm.export.kit/v1");
      assert.equal(document.id, "kit-ai-junior");
      assert.equal(document.modules[0]?.skill, "prompt");
      assert.equal(document.modules[0]?.probes[0]?.id, "q-prompt-001");
    });
  });

  it("returns html field when format is html", async () => {
    await withTempProject(async () => {
      const root = process.env.SDM_PROJECT_ROOT!;
      addSkill(root, {
        id: "prompt",
        name: "Prompt",
        description: "System prompts, few-shot patterns, and evaluation loops.",
        topics: ["testing"],
      });
      seedCert(root, "ai", "junior", ["prompt:0.4:1"]);
      addQuestion(root, {
        skill: "prompt",
        type: "open",
        difficulty: 0.4,
        text: "How do you test a prompt?",
        id: "q-prompt-001",
        explanation: "Golden set.",
        topics: ["testing"],
      });

      const payload = parseToolJson(
        await runTool("export_kit", {
          profile: "ai",
          level: "junior",
          format: "html",
        }),
      );
      assert.equal(payload.ok, true);
      assert.equal(payload.format, "html");
      const html = payload.html as string;
      assert.match(html, /<html/i);
      assert.match(html, /How do you test a prompt\?/);
      assert.match(html, /kit-ai-junior/);
    });
  });
});

describe("export_test", () => {
  it("exports a test package for profile/level", async () => {
    await withTempProject(async () => {
      const root = process.env.SDM_PROJECT_ROOT!;
      addSkill(root, { id: "docker", name: "Docker" });
      seedCert(root, "platform", "middle", ["docker:0.5:1"]);
      addQuestion(root, {
        skill: "docker",
        type: "open",
        difficulty: 0.3,
        text: "What is Docker?",
        id: "q-docker-001",
      });

      const payload = parseToolJson(
        await runTool("export_test", { profile: "platform", level: "middle" }),
      );
      assert.equal(payload.ok, true);
      assert.equal(payload.format, "json");
      const document = payload.document as {
        schemaVersion: string;
        questions: Array<{ id: string }>;
      };
      assert.equal(document.schemaVersion, "sdm.export.test/v1");
      assert.equal(document.questions[0]?.id, "q-docker-001");
    });
  });

  it("returns LEVEL_NOT_FOUND for missing level", async () => {
    await withTempProject(async () => {
      const root = process.env.SDM_PROJECT_ROOT!;
      addSkill(root, { id: "docker", name: "Docker" });
      seedCert(root, "platform", "middle", ["docker:0.5:1"]);

      const result = await runTool("export_test", {
        profile: "platform",
        level: "senior",
      });
      assert.equal(result.isError, true);
      const payload = parseToolJson(result);
      assert.equal(payload.ok, false);
      assert.equal(payload.code, "LEVEL_NOT_FOUND");
    });
  });

  it("excludes open via excludeTypes", async () => {
    await withTempProject(async () => {
      const root = process.env.SDM_PROJECT_ROOT!;
      addSkill(root, { id: "docker", name: "Docker" });
      seedCert(root, "platform", "middle", ["docker:0.5:1"]);
      addQuestion(root, {
        skill: "docker",
        type: "open",
        difficulty: 0.3,
        text: "Open",
        id: "q-open",
      });
      addQuestion(root, {
        skill: "docker",
        type: "single_choice",
        difficulty: 0.3,
        text: "Choice",
        options: ["a", "b"],
        correct: 1,
        id: "q-sc",
      });

      const payload = parseToolJson(
        await runTool("export_test", {
          profile: "platform",
          level: "middle",
          excludeTypes: ["open"],
        }),
      );
      assert.equal(payload.ok, true);
      const document = payload.document as {
        questions: Array<{ type: string }>;
        meta: { typeFilter?: { mode: string; types: string[] } };
      };
      assert.equal(document.questions.length, 1);
      assert.equal(document.questions[0]?.type, "single_choice");
      assert.deepEqual(document.meta.typeFilter, {
        mode: "exclude",
        types: ["open"],
      });
    });
  });

  it("returns EXPORT_TYPE_FILTER_CONFLICT when both filters set", async () => {
    await withTempProject(async () => {
      const root = process.env.SDM_PROJECT_ROOT!;
      addSkill(root, { id: "docker", name: "Docker" });
      seedCert(root, "platform", "middle", ["docker:0.5:1"]);

      const result = await runTool("export_test", {
        profile: "platform",
        level: "middle",
        includeTypes: ["open"],
        excludeTypes: ["code"],
      });
      assert.equal(result.isError, true);
      const payload = parseToolJson(result);
      assert.equal(payload.ok, false);
      assert.equal(payload.code, "EXPORT_TYPE_FILTER_CONFLICT");
    });
  });

  it("filters via includeSkills", async () => {
    await withTempProject(async () => {
      const root = process.env.SDM_PROJECT_ROOT!;
      addSkill(root, { id: "docker", name: "Docker" });
      addSkill(root, { id: "linux", name: "Linux" });
      seedCert(root, "platform", "middle", ["docker:0.5:0.5", "linux:0.5:0.5"]);
      addQuestion(root, {
        skill: "docker",
        type: "open",
        difficulty: 0.3,
        text: "D",
        id: "q-docker-001",
      });
      addQuestion(root, {
        skill: "linux",
        type: "open",
        difficulty: 0.3,
        text: "L",
        id: "q-linux-001",
      });

      const payload = parseToolJson(
        await runTool("export_test", {
          profile: "platform",
          level: "middle",
          includeSkills: ["docker"],
        }),
      );
      assert.equal(payload.ok, true);
      const document = payload.document as {
        questions: Array<{ skill: string }>;
        meta: { skillFilter?: { mode: string; skills: string[] } };
      };
      assert.equal(document.questions.length, 1);
      assert.equal(document.questions[0]?.skill, "docker");
      assert.deepEqual(document.meta.skillFilter, {
        mode: "include",
        skills: ["docker"],
      });
    });
  });

  it("filters via includeQuestions", async () => {
    await withTempProject(async () => {
      const root = process.env.SDM_PROJECT_ROOT!;
      addSkill(root, { id: "docker", name: "Docker" });
      seedCert(root, "platform", "middle", ["docker:0.5:1"]);
      addQuestion(root, {
        skill: "docker",
        type: "open",
        difficulty: 0.3,
        text: "A",
        id: "q-docker-001",
      });
      addQuestion(root, {
        skill: "docker",
        type: "open",
        difficulty: 0.4,
        text: "B",
        id: "q-docker-002",
      });

      const payload = parseToolJson(
        await runTool("export_test", {
          profile: "platform",
          level: "middle",
          includeQuestions: ["q-docker-002"],
        }),
      );
      assert.equal(payload.ok, true);
      const document = payload.document as {
        questions: Array<{ id: string }>;
        meta: { questionFilter?: { mode: string; ids: string[] } };
      };
      assert.deepEqual(
        document.questions.map((q) => q.id),
        ["q-docker-002"],
      );
      assert.equal(document.meta.questionFilter?.mode, "include");
    });
  });

  it("returns EXPORT_SKILL_FILTER_CONFLICT when both skill filters set", async () => {
    await withTempProject(async () => {
      const root = process.env.SDM_PROJECT_ROOT!;
      addSkill(root, { id: "docker", name: "Docker" });
      seedCert(root, "platform", "middle", ["docker:0.5:1"]);

      const result = await runTool("export_test", {
        profile: "platform",
        level: "middle",
        includeSkills: ["docker"],
        excludeSkills: ["docker"],
      });
      assert.equal(result.isError, true);
      const payload = parseToolJson(result);
      assert.equal(payload.ok, false);
      assert.equal(payload.code, "EXPORT_SKILL_FILTER_CONFLICT");
    });
  });
});

describe("export_mermaid", () => {
  it("exports a mermaid document for profile/level", async () => {
    await withTempProject(async () => {
      const root = process.env.SDM_PROJECT_ROOT!;
      addSkill(root, { id: "docker", name: "Docker" });
      seedCert(root, "platform", "middle", ["docker:0.5:1"]);

      const payload = parseToolJson(
        await runTool("export_mermaid", { profile: "platform", level: "middle" }),
      );
      assert.equal(payload.ok, true);
      assert.equal(payload.format, "markdown");
      const document = payload.document as {
        schemaVersion: string;
        mermaid: string;
        markdown: string;
      };
      assert.equal(document.schemaVersion, "sdm.export.mermaid/v1");
      assert.ok(document.mermaid.includes("flowchart LR"));
      assert.ok(document.markdown.includes("```mermaid"));
    });
  });
});

describe("export_confluence", () => {
  it("exports a confluence markdown document", async () => {
    await withTempProject(async () => {
      const root = process.env.SDM_PROJECT_ROOT!;
      addSkill(root, { id: "docker", name: "Docker" });
      seedCert(root, "platform", "middle", ["docker:0.5:1"]);

      const payload = parseToolJson(
        await runTool("export_confluence", {
          profile: "platform",
          level: "middle",
        }),
      );
      assert.equal(payload.ok, true);
      const document = payload.document as {
        schemaVersion: string;
        markdown: string;
      };
      assert.equal(document.schemaVersion, "sdm.export.confluence/v1");
      assert.ok(document.markdown.includes("## Coverage"));
    });
  });
});
