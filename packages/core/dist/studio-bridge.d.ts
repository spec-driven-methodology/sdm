import { type Server } from "node:http";
export declare const STUDIO_VIEW_SCHEMA = "sdm.studio.view/v1";
export declare const STUDIO_ACTION_SCHEMA = "sdm.studio.action/v1";
export interface StudioBridgePaths {
    dir: string;
    viewPath: string;
    actionPath: string;
}
export declare function studioBridgePaths(projectRoot: string): StudioBridgePaths;
export declare function parseStudioViewDocument(raw: string): Record<string, unknown>;
export declare function parseStudioActionDocument(raw: string): Record<string, unknown>;
export interface PushStudioViewResult {
    projectRoot: string;
    viewPath: string;
    schemaVersion: string;
}
export declare function pushStudioView(options: {
    projectRoot: string;
    raw: string;
}): PushStudioViewResult;
export interface PullStudioActionResult {
    projectRoot: string;
    actionPath: string;
    action: Record<string, unknown> | null;
    consumed: boolean;
}
export declare function pullStudioAction(options: {
    projectRoot: string;
    consume?: boolean;
}): PullStudioActionResult;
export declare function readStudioViewFile(projectRoot: string): Record<string, unknown> | null;
export declare function writeStudioActionFile(projectRoot: string, raw: string): {
    actionPath: string;
    action: Record<string, unknown>;
};
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
export declare function startStudioServe(options: StartStudioServeOptions): Promise<StudioServeHandle>;
//# sourceMappingURL=studio-bridge.d.ts.map