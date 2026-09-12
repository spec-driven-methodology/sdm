#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────────────────
# sdm-obsidian-setup.sh
# ──────────────────────────────────────────────────────────
# Настраивает интеграцию SDM + Obsidian:
#   1. Проверяет зависимости (node, sdm-mcp, opencode)
#   2. Находит vault (по .obsidian/ в cwd или parent)
#   3. Создаёт/дополняет opencode.json с SDM + Cortex
#   4. Кладёт AGENTS.md в vault (SDM-воркфлоу)
#   5. Проверяет порт Cortex и подсказывает, если занят
#
# Использование:
#   ./obsidian-setup.sh                          # авто (cwd = vault)
#   ./obsidian-setup.sh /path/to/vault           # явный vault
#   ./obsidian-setup.sh --dry-run /path/to/vault # превью без записи
#   ./obsidian-setup.sh --undo [/path/to/vault]  # откат (удаление артефактов)
# ──────────────────────────────────────────────────────────

# --- helpers -------------------------------------------------
info()  { printf "  \033[1;34m•\033[0m %s\n" "$*"; }
ok()    { printf "  \033[1;32m✓\033[0m %s\n" "$*"; }
warn()  { printf "  \033[1;33m⚠\033[0m %s\n" "$*"; }
fail()  { printf "  \033[1;31m✗\033[0m %s\n" "$*"; exit 1; }
cmd()   { command -v "$1" &>/dev/null; }

DRY_RUN=false
UNDO=false
for arg in "$@"; do
  [[ "$arg" == "--dry-run" ]] && DRY_RUN=true && continue
  [[ "$arg" == "--undo" ]]    && UNDO=true && continue
  VAULT_DIR="$arg"
done

# --undo: delegate to cleanup script
if $UNDO; then
  CLEANUP="$(dirname "$0")/obsidian-cleanup.sh"
  if [[ -f "$CLEANUP" ]]; then
    # filter out --undo, keep --dry-run and positional args
    UNDO_ARGS=()
    for a in "$@"; do [[ "$a" != "--undo" ]] && UNDO_ARGS+=("$a"); done
    exec bash "$CLEANUP" "${UNDO_ARGS[@]}"
  else
    fail "Cleanup script not found at $CLEANUP"
  fi
fi

# --- 1. Определить vault root --------------------------------
find_vault_root() {
  local dir="${1:-$(pwd)}"
  # walk up until .obsidian/
  while [[ "$dir" != "/" ]]; do
    [[ -d "$dir/.obsidian" ]] && echo "$dir" && return 0
    dir=$(dirname "$dir")
  done
  return 1
}

if [[ -z "${VAULT_DIR:-}" ]]; then
  VAULT_DIR=$(find_vault_root "$(pwd)") || true
fi

if [[ -z "${VAULT_DIR:-}" || ! -d "$VAULT_DIR/.obsidian" ]]; then
  fail "Obsidian vault not found. Run from vault or pass path: $0 /path/to/vault"
fi

if $DRY_RUN; then
  echo ""
  info "DRY-RUN: vault = $VAULT_DIR"
  echo ""
fi

# --- 2. Проверка зависимостей ---------------------------------
echo ""
echo "  ── dependencies ──"
echo ""

ERRORS=0

if ! cmd node; then
  warn "node not found in PATH — please install Node.js >= 20.19"
  ERRORS=$((ERRORS + 1))
else
  NVER=$(node --version 2>/dev/null | sed 's/^v//')
  if [[ "$(printf '%s\n' "20.19" "$NVER" | sort -V | head -1)" != "20.19" ]]; then
    warn "node $NVER too old — need >= 20.19"
    ERRORS=$((ERRORS + 1))
  else
    ok "node $NVER"
  fi
fi

if ! cmd sdm-mcp; then
  warn "sdm-mcp not in PATH — install SDM: cd <sdm-repo> && npm install && npm run link:cli"
  ERRORS=$((ERRORS + 1))
else
  ok "sdm-mcp found"
fi

if ! cmd opencode; then
  warn "opencode CLI not in PATH — install: npm install -g @opencode/cli  (or brew install opencode)"
  ERRORS=$((ERRORS + 1))
else
  ok "opencode $(opencode --version 2>/dev/null || true)"
fi

# Cortex plugin — cannot check from CLI, only detect port
CORTEX_PORT=27182
CORTEX_RUNNING=false
if command -v nc &>/dev/null; then
  if nc -z 127.0.0.1 "$CORTEX_PORT" 2>/dev/null; then
    CORTEX_RUNNING=true
    ok "Cortex MCP server detected on port $CORTEX_PORT"
  fi
fi

if [[ $ERRORS -gt 0 ]]; then
  fail "$ERRORS dependency error(s) above — fix and re-run"
fi

# --- 3. Найти / создать SDM-проекты в vault -----------------
echo ""
echo "  ── SDM projects in vault ──"
echo ""

SPECRA_PROJECTS=()
while IFS= read -r -d '' f; do
  PROJECT_ROOT=$(dirname "$f")
  # read name from sdm.yaml
  NAME=$(grep -m1 '^name:' "$f" 2>/dev/null | sed 's/^name:[[:space:]]*//; s/^"//; s/"$//' || echo "")
  [[ -z "$NAME" ]] && NAME=$(basename "$PROJECT_ROOT")
  SPECRA_PROJECTS+=("$PROJECT_ROOT")
  ok "$PROJECT_ROOT ($NAME)"  # actually name is $NAME
done < <(find "$VAULT_DIR" -maxdepth 3 -name 'sdm.yaml' -not -path '*/node_modules/*' -not -path '*/\.*' -print0 2>/dev/null)

SPECRA_COUNT=${#SPECRA_PROJECTS[@]}
if [[ $SPECRA_COUNT -eq 0 ]]; then
  info "No SDM projects found in vault."
  info "Create one: sdm init \"$VAULT_DIR/my-methodology\" --with-examples"
else
  ok "$SPECRA_COUNT SDM project(s) found"
fi

# --- 4. Создать/дополнить opencode.json -------------------------
echo ""
echo "  ── opencode.json ──"
echo ""

OP_CONFIG="$VAULT_DIR/opencode.json"
SPECRA_MCP_CMD="${SPECRA_PROJECTS[0]:-}"
# multi-project: no SDM_PROJECT_ROOT, agent passes project per tool
SPECRA_MCP_ROOT=""

if [[ ${#SPECRA_PROJECTS[@]} -gt 0 ]]; then
  # single project — set default root for convenience
  if [[ ${#SPECRA_PROJECTS[@]} -eq 1 ]]; then
    SPECRA_MCP_ROOT="${SPECRA_PROJECTS[0]}"
  fi
  # multi-project — leave unset, agent discovers via list_projects
fi

OP_CONTENT='{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "sdm": {
      "type": "local",
      "command": ["sdm-mcp"]
    },
    "cortex": {
      "type": "remote",
      "url": "http://127.0.0.1:27182/mcp"
    }
  },
  "model": {
    "provider": "openai-compatible",
    "name": "deepseek-chat",
    "baseURL": "https://api.deepseek.com/v1"
  }
}'

# If single project, add SDM_PROJECT_ROOT
if [[ -n "$SPECRA_MCP_ROOT" ]]; then
  OP_CONTENT=$(echo "$OP_CONTENT" | sed 's|"command": \["sdm-mcp"\]|"command": ["sdm-mcp"],\n      "env": {\n        "SDM_PROJECT_ROOT": "'"$SPECRA_MCP_ROOT"'"\n      }|')
fi

if $DRY_RUN; then
  echo "Would write: $OP_CONFIG"
  echo "$OP_CONTENT" | python3 -m json.tool 2>/dev/null || echo "$OP_CONTENT"
else
  echo "$OP_CONTENT" > "$OP_CONFIG"
  ok "written $OP_CONFIG"
  if [[ -n "$SPECRA_MCP_ROOT" ]]; then
    info "  sdm MCP default project: $SPECRA_MCP_ROOT"
  else
    info "  sdm MCP multi-project mode — agent discovers via list_projects"
  fi
fi

# --- 5. AGENTS.md в vault --------------------------------------
echo ""
echo "  ── AGENTS.md ──"
echo ""

AGENTS_PATH="$VAULT_DIR/AGENTS.md"
AGENTS_MD_CONTENT='# AI agents — SDM methodology workspace

This vault contains **SDM methodology projects** (`sdm.yaml`).
SDM MCP is connected via OpenCode — use its tools to manage skills, questions, profiles, and exports.

## Human UX (methodologists)

Describe **intent** in natural language:

> Хочу основу профиля Java-разработчик, уровень Middle, направление backend.

The agent uses SDM skill **intent-loop** (clarify → plan → confirm → execute → result).

## Data model (vault ↔ SDM)

| Vault path | SDM domain |
|---|---|
| `ontology/skills/*.yaml` | Skills (навыки, граф) |
| `library/questions/*.yaml` | Questions (вопросы) |
| `library/terms/*.yaml` | Terms (термины) |
| `certifications/profiles/*.yaml` | Profiles (профили) |
| `certifications/levels/*.yaml` | Levels (уровни) |
| `exports/*.json` | Export artifacts (тесты, курсы, шпаргалки) |

## Multi-project workflow

This vault may contain **multiple** SDM projects.
SDM MCP runs without `SDM_PROJECT_ROOT` — **always pass `project`** (root path) to SDM tools.

### Discovery

- `sdm list_projects(workspaceDir: "<vault-root>")` — list all projects
- `sdm locate_project(dir: "<current-path>")` — find which project

### Read vs. write

| Operation | MCP server | How to specify project |
|---|---|---|
| **Read vault files** (YAML, .md) | **cortex** `read_note` / `search_notes` | Vault path |
| **List / locate SDM projects** | **sdm** `list_projects`, `locate_project` | `workspaceDir` / `dir` |
| **Create/edit methodology** | **sdm** (`skill_add`, `question_add`, `cert_create`, ...) | **Always** `project` |
| **Coverage / gaps** | **sdm** (`cert_coverage`, `cert_gaps`) | **Always** `project` |
| **Export** | **sdm** (`export_test`, `export_course`, ...) | **Always** `project` |

## How agents operate

- Prefer SDM MCP tools over CLI or hand-editing YAML.
- Cortex MCP server: read vault notes, search content, list files.
- SDM MCP server: all methodology operations.

## Common workflows

1. **Create profile**: `profile_create(project: "<root>", profile: "...", title: "...")`
2. **Add skill**: `skill_add(project: "<root>", id: "my-skill", name: "My Skill")`
3. **Create level**: `cert_create(project: "<root>", profile: "...", level: "...", levelTitle: "...", requirements: [...])`
4. **Generate questions**: `question_generate(project: "<root>", skill: "...", count: 3)`
5. **Check coverage**: `cert_coverage(project: "<root>", profile: "...", level: "...")`
6. **Export test**: `export_test(project: "<root>", profile: "...", level: "...")`
'

if $DRY_RUN; then
  echo "Would write: $AGENTS_PATH"
else
  # only write if not exists (user may have their own)
  if [[ -f "$AGENTS_PATH" ]]; then
    warn "AGENTS.md already exists at $AGENTS_PATH — skipping (merge manually)"
  else
    echo "$AGENTS_MD_CONTENT" > "$AGENTS_PATH"
    ok "written $AGENTS_PATH"
  fi
fi

# --- 6. Проверка Cortex + предупреждения -----------------------
echo ""
echo "  ── checks ──"
echo ""

if ! $CORTEX_RUNNING; then
  warn "Cortex MCP server not detected on port $CORTEX_PORT"
  info "  Install the MCP plugin 'Cortex' (author: doktordavejoos) — NOT 'Cortex Chat'"
  info "  Obsidian → Settings → Community plugins → Browse → search 'Cortex'"
  info "  Install → Enable → it auto-starts on port $CORTEX_PORT"
  info "  Note: 'Cortex Chat' is a different plugin (AI chat sidebar) — it is not needed and not used by SDM"
fi

# detect mistaken Cortex Chat (creates _cortex/ folder in vault)
if [[ -d "$VAULT_DIR/_cortex" ]]; then
  warn "'_cortex/' folder found — you may have 'Cortex Chat' installed instead of 'Cortex' (MCP)"
  info "  Remove it via Obsidian Settings → Community plugins → Cortex Chat → Uninstall"
  info "  Then install 'Cortex' (author: doktordavejoos) for MCP vault access"
fi

# detect port conflicts
for PLUGIN_PORT in 3001 3443; do
  if command -v nc &>/dev/null && nc -z 127.0.0.1 "$PLUGIN_PORT" 2>/dev/null; then
    warn "Port $PLUGIN_PORT busy — possibly another MCP plugin (aaronsb/obsidian-mcp-plugin)"
    info "  Either uninstall the other plugin, or Cortex will conflict"
  fi
done

if ! $CORTEX_RUNNING; then
  echo ""
  info "Summary: opencode.json created, AGENTS.md created."
  info "Before using SDM from Obsidian:"
  info "  1. Install plugin 'Cortex' (author doktordavejoos — the MCP one, not 'Cortex Chat')"
  info "  2. Enable it → Cortex starts on port $CORTEX_PORT"
  info "  3. OpenCode plugin (optional): run opencode from terminal, or use OpenCode Obsidian plugin"
  info "  4. Restart OpenCode → MCP servers connect"
  echo ""
else
  echo ""
  ok "All set! OpenCode + Cortex + SDM ready."
fi