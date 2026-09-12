## 1. Schema and core profile API

- [x] 1.1 Relax profile schema `levels` to allow empty array (coord. with `rename-role-to-profile`)
- [x] 1.2 Add `createProfile` in `@spec-driven-methodology/core` (`PROFILE_EXISTS` / `--force`); export from package index
- [x] 1.3 Narrow `createCertification`: require existing profile (`PROFILE_NOT_FOUND`); drop inventing profile via title; append level id to profile.levels
- [x] 1.4 Unit tests: `createProfile`, cert without profile fails, happy path profile→skills→cert→coverage

## 2. CLI

- [x] 2.1 Add `sdm profile create <id> --title … [--force] --json` (never `role create`)
- [x] 2.2 Update `sdm cert create`: `--profile` required; no invent; BREAKING in help/CHANGELOG
- [x] 2.3 Fix CLI tests/fixtures that call `cert create` without prior `profile create`

## 3. MCP

- [x] 3.1 Add MCP tool `profile_create` wired to `createProfile`
- [x] 3.2 Align `cert_create` args/behavior; update tool list/dispatch
- [x] 3.3 Extend MCP tests for `profile_create` and `PROFILE_NOT_FOUND` on `cert_create`

## 4. Agent docs and product docs

- [x] 4.1 Update bootstrap methodology / profile-pack skills (order + write gate includes `profile create`)
- [x] 4.2 Touch close-coverage guard text if needed
- [x] 4.3 Update `AGENTS.md`, README, CHANGELOG `[Unreleased]` (BREAKING)

## 5. Verify

- [x] 5.1 `npm run verify` in `specra/`
- [x] 5.2 Smoke: `init` → `profile create` → `skill add` → `cert create --profile` → `cert coverage --profile --json`
