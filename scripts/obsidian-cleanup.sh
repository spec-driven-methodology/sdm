#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────────────────
# sdm-obsidian-cleanup.sh
# ──────────────────────────────────────────────────────────
# Безопасно удаляет артефакты интеграции SDM + Obsidian:
#   - opencode.json (с backup)
#   - AGENTS.md (только если создан setup-скриптом)
#   - sdm-mcp из OpenCode MCP-конфига (если opencode.json shared)
#
# Использование:
#   ./obsidian-cleanup.sh                          # авто
#   ./obsidian-cleanup.sh /path/to/vault           # явный vault
#   ./obsidian-cleanup.sh --dry-run /path/to/vault # превью
#   ./obsidian-cleanup.sh --purge                  # удалить без backup
# ──────────────────────────────────────────────────────────

# --- helpers -------------------------------------------------
info()  { printf "  \033[1;34m•\033[0m %s\n" "$*"; }
ok()    { printf "  \033[1;32m✓\033[0m %s\n" "$*"; }
warn()  { printf "  \033[1;33m⚠\033[0m %s\n" "$*"; }
fail()  { printf "  \033[1;31m✗\033[0m %s\n" "$*"; exit 1; }
dry()   { printf "  \033[1;36m~\033[0m %s\n" "$*"; }

DRY_RUN=false
PURGE=false
for arg in "$@"; do
  [[ "$arg" == "--dry-run" ]] && DRY_RUN=true && continue
  [[ "$arg" == "--purge" ]]   && PURGE=true && continue
  VAULT_DIR="$arg"
done

# --- Определить vault root -----------------------------------
find_vault_root() {
  local dir="${1:-$(pwd)}"
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

echo ""
echo "  ── cleanup: $VAULT_DIR ──"
echo ""

if $DRY_RUN; then
  info "DRY-RUN mode — no files will be modified"
  echo ""
fi

# --- 1. opencode.json -----------------------------------------
OP_CONFIG="$VAULT_DIR/opencode.json"

remove_file() {
  local path="$1" label="$2"
  if [[ ! -f "$path" ]]; then
    info "$label: not found — nothing to remove"
    return
  fi
  if $DRY_RUN; then
    dry "would remove: $path"
    return
  fi
  if $PURGE; then
    rm -f "$path"
    ok "$label removed ($path)"
  else
    local backup="${path}.bak.$(date +%Y%m%d-%H%M%S)"
    cp "$path" "$backup"
    rm -f "$path"
    ok "$label removed, backup: $backup"
  fi
}

remove_file "$OP_CONFIG" "opencode.json"
REMOVED_OP=true

# --- 2. AGENTS.md ----------------------------------------------
AGENTS_PATH="$VAULT_DIR/AGENTS.md"

if [[ -f "$AGENTS_PATH" ]]; then
  # Check if it was created by setup (starts with SDM header)
  HEADER=$(head -1 "$AGENTS_PATH" 2>/dev/null || echo "")
  case "$HEADER" in
    "# AI agents — SDM"*)
      remove_file "$AGENTS_PATH" "AGENTS.md (SDM)"
      ;;
    *)
      warn "AGENTS.md exists but header doesn't match SDM — skipping"
      info "  header: $HEADER"
      info "  remove manually if needed"
      ;;
  esac
else
  info "AGENTS.md: not found — nothing to remove"
fi

# --- 3. Global MCP config (opencode.json in XDG/config) -------
XDG_OP="${XDG_CONFIG_HOME:-$HOME/.config}/opencode/opencode.json"
if [[ -f "$XDG_OP" ]]; then
  # Check if sdm section exists
  if grep -q '"sdm"' "$XDG_OP" 2>/dev/null; then
    warn "Global opencode.json has sdm MCP entry: $XDG_OP"
    info "  Remove it manually, or run this script from that directory"
  fi
fi

# --- 4. Global MCP config (claude_desktop_config.json etc.) ----
for CFG in \
  "$HOME/Library/Application Support/Claude/claude_desktop_config.json" \
  "$HOME/.cursor/mcp.json" \
  "$HOME/.codeium/windsurf/mcp_config.json"; do
  if [[ -f "$CFG" ]] && grep -q 'sdm' "$CFG" 2>/dev/null; then
    warn "Found sdm entry in: $CFG"
    info "  Remove manually — this script only cleans vault-local files"
  fi
done

echo ""

if $DRY_RUN; then
  info "Dry-run complete. Run without --dry-run to apply."
else
  ok "Cleanup complete."
  if $PURGE; then
    info "Used --purge: no backups created."
  fi
fi