#!/usr/bin/env bash
# Deploy Graphify local config from graphify-setup-kit into a target repo.
# Does NOT copy graphify-out/ — run `graphify update .` on the target after install.
set -euo pipefail

KIT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET=""
INCLUDE_OPTIONAL=0
COPY_DOCS=0
RUN_BUILD=0
RUN_VERIFY=0
FORCE=0
DRY_RUN=0

usage() {
  cat <<'EOF'
Usage: install.sh [OPTIONS] [TARGET_DIR]

Copy Graphify setup files from this kit into a project (default: ../global-services).

Options:
  -t, --target DIR   Target repo root (monorepo root)
  -o, --optional     Also copy optional files (savings report script)
  -d, --docs         Also copy reference docs to TARGET/private/graphify-docs/
  -b, --build        Run `graphify update .` after copy (requires graphify CLI)
  -v, --verify       Run verification queries + benchmark after copy/build
  -f, --force        Overwrite existing files without prompting
  -n, --dry-run      Show what would be copied; do not write
  -h, --help         Show this help

Examples:
  ./install.sh ../global-services
  ./install.sh -o -b -v ~/Documents/Projects/global-services
  ./install.sh --optional --dry-run ../global-services

Required files (always copied):
  .graphifyignore
  .cursor/rules/graphify.mdc

Optional files (--optional):
  scripts/graphify-savings-report.cjs

Never copied (build on target machine):
  graphify-out/
  reports/graphify/

EOF
}

log() { printf '%s\n' "$*"; }
warn() { printf 'WARN: %s\n' "$*" >&2; }
die() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }

copy_file() {
  local src="$1"
  local dest="$2"
  local label="$3"

  if [[ ! -f "$src" ]]; then
    die "Missing kit file: $src"
  fi

  if [[ -f "$dest" && "$FORCE" -eq 0 ]]; then
    if cmp -s "$src" "$dest"; then
      log "  = $label (unchanged)"
      return 0
    fi
    warn "$label already exists and differs — use --force to overwrite"
    return 1
  fi

  if [[ "$DRY_RUN" -eq 1 ]]; then
    log "  [dry-run] $label → $dest"
    return 0
  fi

  mkdir -p "$(dirname "$dest")"
  cp "$src" "$dest"
  log "  ✓ $label"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -t|--target) TARGET="${2:-}"; shift 2 ;;
    -o|--optional) INCLUDE_OPTIONAL=1; shift ;;
    -d|--docs) COPY_DOCS=1; shift ;;
    -b|--build) RUN_BUILD=1; shift ;;
    -v|--verify) RUN_VERIFY=1; shift ;;
    -f|--force) FORCE=1; shift ;;
    -n|--dry-run) DRY_RUN=1; shift ;;
    -h|--help) usage; exit 0 ;;
    -*) die "Unknown option: $1 (try --help)" ;;
    *)
      if [[ -z "$TARGET" ]]; then
        TARGET="$1"
      else
        die "Unexpected argument: $1"
      fi
      shift
      ;;
  esac
done

if [[ -z "$TARGET" ]]; then
  TARGET="$(cd "$KIT_DIR/.." && pwd)/global-services"
fi

TARGET="$(cd "$TARGET" 2>/dev/null && pwd)" || die "Target directory does not exist: $TARGET"

# Basic sanity check — looks like global-services monorepo
if [[ ! -d "$TARGET/services" || ! -d "$TARGET/web" ]]; then
  warn "Target does not look like global-services (missing services/ or web/). Continuing anyway."
fi

log "Graphify setup kit: $KIT_DIR"
log "Target project:     $TARGET"
log ""

FAILED=0

log "Copying required files..."
copy_file "$KIT_DIR/required/.graphifyignore" "$TARGET/.graphifyignore" ".graphifyignore" || FAILED=1
copy_file "$KIT_DIR/required/.cursor/rules/graphify.mdc" "$TARGET/.cursor/rules/graphify.mdc" ".cursor/rules/graphify.mdc" || FAILED=1

if [[ "$INCLUDE_OPTIONAL" -eq 1 ]]; then
  log ""
  log "Copying optional files..."
  copy_file "$KIT_DIR/optional/scripts/graphify-savings-report.cjs" "$TARGET/scripts/graphify-savings-report.cjs" "scripts/graphify-savings-report.cjs" || FAILED=1
  if [[ "$DRY_RUN" -eq 0 && -f "$TARGET/scripts/graphify-savings-report.cjs" ]]; then
    chmod +x "$TARGET/scripts/graphify-savings-report.cjs" 2>/dev/null || true
  fi
fi

if [[ "$COPY_DOCS" -eq 1 ]]; then
  log ""
  log "Copying reference docs..."
  DOCS_DEST="$TARGET/private/graphify-docs"
  for doc in graphify-guide.md graphify-new-computer-setup.md graphify-agent-setup-prompt.md; do
    copy_file "$KIT_DIR/docs/$doc" "$DOCS_DEST/$doc" "private/graphify-docs/$doc" || FAILED=1
  done
fi

if [[ "$FAILED" -ne 0 && "$FORCE" -eq 0 ]]; then
  die "Some files were not copied. Re-run with --force to overwrite."
fi

if [[ "$DRY_RUN" -eq 1 ]]; then
  log ""
  log "Dry run complete. No files written."
  exit 0
fi

if [[ "$RUN_BUILD" -eq 1 ]]; then
  log ""
  log "Building graph (graphify update .)..."
  if ! command -v graphify >/dev/null 2>&1; then
    die "graphify CLI not found. Install: uv tool install graphifyy"
  fi
  (cd "$TARGET" && graphify update .)
  log "  ✓ graphify update ."
fi

if [[ "$RUN_VERIFY" -eq 1 ]]; then
  log ""
  log "Verifying setup..."
  if ! command -v graphify >/dev/null 2>&1; then
    die "graphify CLI not found. Install: uv tool install graphifyy"
  fi
  if [[ ! -f "$TARGET/graphify-out/graph.json" ]]; then
    warn "graphify-out/graph.json missing — run with --build or: cd \"$TARGET\" && graphify update ."
  else
    (cd "$TARGET" && graphify query "places proxy Google Places" --budget 800) | head -15
    log ""
    (cd "$TARGET" && graphify benchmark graphify-out/graph.json) | head -12
  fi
  log ""
  log "Git status (Graphify files should NOT be committed):"
  (cd "$TARGET" && git status --short .graphifyignore .cursor/rules/graphify.mdc graphify-out/ scripts/graphify-savings-report.cjs 2>/dev/null) || true
fi

log ""
log "Done."
log ""
log "Next steps:"
log "  1. Install CLI (if needed): uv tool install graphifyy"
log "  2. Build graph:             cd \"$TARGET\" && graphify update ."
log "  3. Open project in Cursor — agent rule is at .cursor/rules/graphify.mdc"
log "  4. After code changes:      graphify update ."
if [[ "$INCLUDE_OPTIONAL" -eq 0 ]]; then
  log "  5. Optional savings:      re-run with --optional"
fi
