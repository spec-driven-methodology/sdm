import { SdmError } from "@spec-driven-methodology/core";
import { installAgentSkills, } from "./agent-hosts.js";
import { installMcpHosts, } from "./mcp-hosts.js";
/**
 * Install SDM MCP into hosts, then (by default) portable skills for the same hosts.
 * If skills fail after MCP write, throws SdmError; callers SHOULD include `installs` in JSON errors.
 */
export function wireMcpHosts(options) {
    const { installs, config } = installMcpHosts(options);
    const withSkills = options.withSkills !== false;
    if (!withSkills) {
        return { installs, config, skills: null };
    }
    try {
        const skills = installAgentSkills({
            hosts: options.hosts,
            cursorRoot: options.cursorRoot,
            gigacodeHome: options.gigacodeHome,
            agentsRoot: options.agentsRoot,
            link: options.linkSkills,
            force: options.forceSkills,
            homedir: options.homedir,
        });
        return { installs, config, skills: { ok: true, ...skills } };
    }
    catch (err) {
        if (err instanceof SdmError) {
            throw new SdmError(err.code, `${err.message} (MCP already written: ${installs.map((i) => `${i.host}=${i.path}`).join(", ")})`);
        }
        throw err;
    }
}
//# sourceMappingURL=host-wire.js.map