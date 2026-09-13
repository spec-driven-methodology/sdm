import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { getProductVersion } from "@spec-driven-methodology/core";
import { SDM_ASCII, SDM_TAGLINE } from "../src/banner.js";
import {
  formatSdmVersionOutput,
  getResolvedMcpVersion,
} from "../src/mcp-config.js";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

describe("CLI product version SSOT", () => {
  it("getProductVersion matches root package.json", () => {
    const pkg = JSON.parse(
      readFileSync(join(REPO_ROOT, "package.json"), "utf8"),
    ) as { version: string };
    assert.equal(getProductVersion(), pkg.version);
  });

  it("resolved MCP package version matches workspace @spec-driven-methodology/mcp", () => {
    const mcpPkg = JSON.parse(
      readFileSync(join(REPO_ROOT, "packages/mcp/package.json"), "utf8"),
    ) as { version: string };
    assert.equal(getResolvedMcpVersion(), mcpPkg.version);
  });

  it("formatSdmVersionOutput: logo, tagline, versions with blank lines", () => {
    const cli = getProductVersion();
    const out = formatSdmVersionOutput(cli);
    assert.equal(
      out,
      `${SDM_ASCII}\n\n${SDM_TAGLINE}\n\ncore ${cli}\nmcp ${getResolvedMcpVersion()}\n`,
    );
  });
});
