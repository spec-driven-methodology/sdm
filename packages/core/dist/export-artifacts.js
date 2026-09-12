import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
function listJsonFiles(dir) {
    if (!existsSync(dir))
        return [];
    const results = [];
    function walk(current) {
        for (const entry of readdirSync(current)) {
            if (entry === "node_modules" || entry === ".git")
                continue;
            const full = join(current, entry);
            let st;
            try {
                st = statSync(full);
            }
            catch {
                continue;
            }
            if (st.isDirectory())
                walk(full);
            else if (entry.endsWith(".json"))
                results.push(full);
        }
    }
    walk(dir);
    return results.sort((a, b) => a.localeCompare(b));
}
function kindFromSchema(schemaVersion) {
    if (typeof schemaVersion !== "string")
        return "unknown";
    if (schemaVersion.includes("export.test"))
        return "export_test";
    if (schemaVersion.includes("export.course"))
        return "export_course";
    if (schemaVersion.includes("export.kit"))
        return "export_kit";
    if (schemaVersion.includes("export.matrix"))
        return "export_matrix";
    if (schemaVersion.includes("export.mermaid"))
        return "export_mermaid";
    if (schemaVersion.includes("export.confluence"))
        return "export_confluence";
    if (schemaVersion.includes("export.learning"))
        return "export_learning";
    return "export";
}
function collectSkillsFromDoc(doc) {
    const skills = new Set();
    if (Array.isArray(doc.requirements)) {
        for (const r of doc.requirements) {
            if (r && typeof r === "object" && typeof r.skill === "string") {
                skills.add(r.skill);
            }
        }
    }
    if (Array.isArray(doc.questions)) {
        for (const q of doc.questions) {
            if (q && typeof q === "object" && typeof q.skill === "string") {
                skills.add(q.skill);
            }
        }
    }
    if (Array.isArray(doc.modules)) {
        for (const m of doc.modules) {
            if (m && typeof m === "object" && typeof m.skill === "string") {
                skills.add(m.skill);
            }
        }
    }
    if (Array.isArray(doc.cells)) {
        for (const c of doc.cells) {
            if (c && typeof c === "object" && typeof c.skill === "string") {
                skills.add(c.skill);
            }
        }
    }
    const meta = doc.meta;
    if (meta && typeof meta === "object") {
        const basis = meta.basis;
        if (basis?.skills) {
            for (const id of Object.keys(basis.skills))
                skills.add(id);
        }
        const scope = meta.scope;
        if (scope?.skill)
            skills.add(scope.skill);
    }
    return [...skills].sort((a, b) => a.localeCompare(b));
}
function parseExportFile(projectRoot, fullPath) {
    let raw;
    try {
        raw = JSON.parse(readFileSync(fullPath, "utf8"));
    }
    catch {
        return null;
    }
    if (!raw || typeof raw !== "object")
        return null;
    const doc = raw;
    const schemaVersion = typeof doc.schemaVersion === "string" ? doc.schemaVersion : undefined;
    if (!schemaVersion || !schemaVersion.startsWith("sdm."))
        return null;
    const packageId = typeof doc.id === "string" ? doc.id : undefined;
    const profile = typeof doc.profile === "string" ? doc.profile : undefined;
    const level = typeof doc.level === "string" ? doc.level : undefined;
    const skills = collectSkillsFromDoc(doc);
    const meta = doc.meta;
    let basis;
    if (meta && typeof meta === "object") {
        const b = meta.basis;
        if (b && typeof b === "object") {
            basis = b;
        }
    }
    return {
        path: relative(projectRoot, fullPath).split("\\").join("/"),
        kind: kindFromSchema(schemaVersion),
        ...(packageId ? { id: packageId } : {}),
        schemaVersion,
        ...(profile ? { profile } : {}),
        ...(level ? { level } : {}),
        ...(skills.length > 0 ? { skills } : {}),
        ...(basis ? { basis } : {}),
    };
}
/** Scan project exports directory for SDM export JSON documents. */
export function scanExportArtifacts(projectRoot) {
    const dir = join(projectRoot, "exports");
    const out = [];
    for (const file of listJsonFiles(dir)) {
        const ref = parseExportFile(projectRoot, file);
        if (ref)
            out.push(ref);
    }
    return out;
}
export function exportMatchesScope(ref, scope) {
    if (scope.skills && ref.skills) {
        for (const s of ref.skills) {
            if (scope.skills.has(s))
                return true;
        }
    }
    if (scope.profiles && ref.profile && scope.profiles.has(ref.profile)) {
        return true;
    }
    if (scope.levels && ref.level && scope.levels.has(ref.level)) {
        return true;
    }
    return false;
}
//# sourceMappingURL=export-artifacts.js.map