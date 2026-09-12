## 1. CLI JSON output

- [x] 1.1 Add `--json` flag to `sdm cert coverage`
- [x] 1.2 Emit success JSON from `runCertCoverage` result (skills, hasMissing, warnings)
- [x] 1.3 Route errors through JSON error payload (`ok: false`)

## 2. Verification

- [x] 2.1 Rebuild and relink CLI
- [x] 2.2 Run coverage with `--json` in playground; confirm shape and exit code
