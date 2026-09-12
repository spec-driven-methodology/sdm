import {
  createServer,
  type IncomingMessage,
  type Server,
  type ServerResponse,
} from "node:http";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { extname, join, relative, resolve, sep } from "node:path";
import { SdmError } from "./errors.js";
import { PROJECT_MANIFEST } from "./project-root.js";

export const STUDIO_VIEW_SCHEMA = "sdm.studio.view/v1";
export const STUDIO_ACTION_SCHEMA = "sdm.studio.action/v1";

export interface StudioBridgePaths {
  dir: string;
  viewPath: string;
  actionPath: string;
}

export function studioBridgePaths(projectRoot: string): StudioBridgePaths {
  const dir = join(projectRoot, ".sdm", "studio");
  return {
    dir,
    viewPath: join(dir, "current-view.json"),
    actionPath: join(dir, "last-action.json"),
  };
}

function assertProject(projectRoot: string): void {
  if (!existsSync(join(projectRoot, PROJECT_MANIFEST))) {
    throw new SdmError(
      "NOT_A_PROJECT",
      `Not a SDM methodology project (missing ${PROJECT_MANIFEST}): ${projectRoot}`,
    );
  }
}

function parseJsonObject(raw: string, code: string, label: string): unknown {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new SdmError(code, `${label} is not valid JSON`);
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new SdmError(code, `${label} must be a JSON object`);
  }
  return data;
}

export function parseStudioViewDocument(raw: string): Record<string, unknown> {
  const data = parseJsonObject(raw, "STUDIO_VIEW_INVALID", "Studio view") as Record<
    string,
    unknown
  >;
  if (data.schemaVersion !== STUDIO_VIEW_SCHEMA) {
    throw new SdmError(
      "STUDIO_VIEW_INVALID",
      `Unsupported view schemaVersion: ${String(data.schemaVersion ?? "(missing)")}. Expected ${STUDIO_VIEW_SCHEMA}`,
    );
  }
  if (!Array.isArray(data.phases)) {
    throw new SdmError(
      "STUDIO_VIEW_INVALID",
      "Studio view must include phases[]",
    );
  }
  return data;
}

export function parseStudioActionDocument(raw: string): Record<string, unknown> {
  const data = parseJsonObject(
    raw,
    "STUDIO_ACTION_INVALID",
    "Studio action",
  ) as Record<string, unknown>;
  if (data.schemaVersion !== STUDIO_ACTION_SCHEMA) {
    throw new SdmError(
      "STUDIO_ACTION_INVALID",
      `Unsupported action schemaVersion: ${String(data.schemaVersion ?? "(missing)")}. Expected ${STUDIO_ACTION_SCHEMA}`,
    );
  }
  if (typeof data.type !== "string" || !data.type) {
    throw new SdmError(
      "STUDIO_ACTION_INVALID",
      "Studio action must include type",
    );
  }
  return data;
}

export interface PushStudioViewResult {
  projectRoot: string;
  viewPath: string;
  schemaVersion: string;
}

export function pushStudioView(options: {
  projectRoot: string;
  raw: string;
}): PushStudioViewResult {
  const projectRoot = options.projectRoot;
  assertProject(projectRoot);
  const doc = parseStudioViewDocument(options.raw);
  const paths = studioBridgePaths(projectRoot);
  mkdirSync(paths.dir, { recursive: true });
  writeFileSync(paths.viewPath, `${JSON.stringify(doc, null, 2)}\n`, "utf8");
  return {
    projectRoot,
    viewPath: paths.viewPath,
    schemaVersion: STUDIO_VIEW_SCHEMA,
  };
}

export interface PullStudioActionResult {
  projectRoot: string;
  actionPath: string;
  action: Record<string, unknown> | null;
  consumed: boolean;
}

export function pullStudioAction(options: {
  projectRoot: string;
  consume?: boolean;
}): PullStudioActionResult {
  const projectRoot = options.projectRoot;
  assertProject(projectRoot);
  const paths = studioBridgePaths(projectRoot);
  if (!existsSync(paths.actionPath)) {
    return {
      projectRoot,
      actionPath: paths.actionPath,
      action: null,
      consumed: false,
    };
  }
  const raw = readFileSync(paths.actionPath, "utf8");
  const action = parseStudioActionDocument(raw);
  let consumed = false;
  if (options.consume) {
    unlinkSync(paths.actionPath);
    consumed = true;
  }
  return {
    projectRoot,
    actionPath: paths.actionPath,
    action,
    consumed,
  };
}

export function readStudioViewFile(projectRoot: string): Record<string, unknown> | null {
  assertProject(projectRoot);
  const { viewPath } = studioBridgePaths(projectRoot);
  if (!existsSync(viewPath)) return null;
  return parseStudioViewDocument(readFileSync(viewPath, "utf8"));
}

export function writeStudioActionFile(
  projectRoot: string,
  raw: string,
): { actionPath: string; action: Record<string, unknown> } {
  assertProject(projectRoot);
  const action = parseStudioActionDocument(raw);
  const paths = studioBridgePaths(projectRoot);
  mkdirSync(paths.dir, { recursive: true });
  writeFileSync(paths.actionPath, `${JSON.stringify(action, null, 2)}\n`, "utf8");
  return { actionPath: paths.actionPath, action };
}

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

function sendJson(
  res: ServerResponse,
  status: number,
  body: unknown,
): void {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(payload);
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolveBody, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(Buffer.from(c)));
    req.on("end", () => resolveBody(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

/** Resolve a URL path under a static root; returns null on traversal / empty. */
function safeStaticFile(staticRoot: string, urlPath: string): string | null {
  const decoded = decodeURIComponent(urlPath.split("?")[0] || "/");
  const rel = decoded === "/" ? "index.html" : decoded.replace(/^\//, "");
  if (!rel || rel.includes("\0")) return null;
  const root = resolve(staticRoot);
  const abs = resolve(root, rel);
  const relToRoot = relative(root, abs);
  if (relToRoot.startsWith("..") || relToRoot.includes(`..${sep}`)) {
    return null;
  }
  return abs;
}

function tryServeStatic(
  res: ServerResponse,
  method: string,
  staticRoot: string,
  urlPath: string,
): boolean {
  if (!existsSync(staticRoot)) {
    return false;
  }
  const filePath = safeStaticFile(staticRoot, urlPath);
  if (!filePath || !existsSync(filePath)) {
    return false;
  }
  const data = readFileSync(filePath);
  const type = MIME[extname(filePath)] || "application/octet-stream";
  res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-cache" });
  if (method === "HEAD") {
    res.end();
  } else {
    res.end(data);
  }
  return true;
}

export interface StartStudioServeOptions {
  projectRoot: string;
  port?: number;
  host?: string;
}

export interface StudioServeHandle {
  host: string;
  port: number;
  url: string;
  close: () => Promise<void>;
  server: Server;
}

/**
 * Localhost-only static server for studio/ + player/ + exports/ + bridge API.
 * Does not write methodology YAML; bridge POST only touches .sdm/studio/.
 */
export function startStudioServe(
  options: StartStudioServeOptions,
): Promise<StudioServeHandle> {
  const projectRoot = options.projectRoot;
  assertProject(projectRoot);
  const host = options.host ?? "127.0.0.1";
  if (host !== "127.0.0.1" && host !== "localhost") {
    throw new SdmError(
      "STUDIO_SERVE_BIND",
      `studio serve only allows 127.0.0.1/localhost (got ${host})`,
    );
  }
  const port = options.port ?? 4173;
  const studioRoot = join(projectRoot, "studio");
  const playerRoot = join(projectRoot, "player");
  const exportsRoot = join(projectRoot, "exports");
  if (!existsSync(join(studioRoot, "index.html"))) {
    throw new SdmError(
      "STUDIO_MISSING",
      `studio/index.html not found. Run: sdm studio sync`,
    );
  }

  const server = createServer(async (req, res) => {
    try {
      const method = req.method || "GET";
      const url = new URL(req.url || "/", `http://${host}`);
      const pathname = url.pathname;

      if (pathname === "/bridge/status" && method === "GET") {
        const paths = studioBridgePaths(projectRoot);
        sendJson(res, 200, {
          ok: true,
          bridge: true,
          hasView: existsSync(paths.viewPath),
          hasAction: existsSync(paths.actionPath),
          player: existsSync(join(playerRoot, "index.html")),
          exports: existsSync(exportsRoot),
        });
        return;
      }

      if (pathname === "/bridge/view" && method === "GET") {
        const view = readStudioViewFile(projectRoot);
        if (!view) {
          sendJson(res, 404, {
            ok: false,
            code: "STUDIO_VIEW_MISSING",
            message: "No current-view.json in bridge",
          });
          return;
        }
        sendJson(res, 200, view);
        return;
      }

      if (pathname === "/bridge/action" && method === "POST") {
        const raw = await readBody(req);
        const written = writeStudioActionFile(projectRoot, raw);
        sendJson(res, 200, { ok: true, actionPath: written.actionPath });
        return;
      }

      if (method !== "GET" && method !== "HEAD") {
        sendJson(res, 405, { ok: false, code: "METHOD_NOT_ALLOWED" });
        return;
      }

      if (pathname === "/player" || pathname.startsWith("/player/")) {
        const sub =
          pathname === "/player" || pathname === "/player/"
            ? "/"
            : pathname.slice("/player".length);
        if (tryServeStatic(res, method, playerRoot, sub)) return;
        sendJson(res, 404, { ok: false, code: "NOT_FOUND", path: pathname });
        return;
      }

      if (pathname === "/exports" || pathname.startsWith("/exports/")) {
        const sub =
          pathname === "/exports" || pathname === "/exports/"
            ? "/"
            : pathname.slice("/exports".length);
        if (tryServeStatic(res, method, exportsRoot, sub)) return;
        sendJson(res, 404, { ok: false, code: "NOT_FOUND", path: pathname });
        return;
      }

      if (tryServeStatic(res, method, studioRoot, pathname)) return;
      sendJson(res, 404, { ok: false, code: "NOT_FOUND", path: pathname });
    } catch (err) {
      if (err instanceof SdmError) {
        sendJson(res, 400, { ok: false, code: err.code, message: err.message });
        return;
      }
      sendJson(res, 500, {
        ok: false,
        code: "STUDIO_SERVE_ERROR",
        message: err instanceof Error ? err.message : String(err),
      });
    }
  });

  return new Promise((resolveListen, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => {
      const addr = server.address();
      const boundPort =
        addr && typeof addr === "object" ? addr.port : port;
      const url = `http://${host}:${boundPort}/`;
      resolveListen({
        host,
        port: boundPort,
        url,
        server,
        close: () =>
          new Promise((resClose, rejClose) => {
            server.close((e) => (e ? rejClose(e) : resClose()));
          }),
      });
    });
  });
}
