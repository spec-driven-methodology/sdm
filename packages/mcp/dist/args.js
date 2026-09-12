export function parseArgs(argv) {
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === "--project" || a === "-p") {
            const v = argv[i + 1]?.trim();
            if (v)
                return { project: v };
        }
        if (a?.startsWith("--project=")) {
            const v = a.slice("--project=".length).trim();
            if (v)
                return { project: v };
        }
    }
    return {};
}
//# sourceMappingURL=args.js.map