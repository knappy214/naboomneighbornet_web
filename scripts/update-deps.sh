#!/usr/bin/env bash
set -euo pipefail

# Update all dependencies in package.json to their latest versions
# Usage:
#   ./scripts/update-deps.sh            # update package.json + refresh lockfile
#   ./scripts/update-deps.sh --dry-run  # show what would change

die() { echo "error: $*" >&2; exit 1; }
have() { command -v "$1" >/dev/null 2>&1; }

detect_pm() {
  if [[ -n "${PM:-}" ]]; then echo "$PM"; return 0; fi
  if [[ -f yarn.lock ]]; then echo "yarn"; return 0; fi
  if [[ -f pnpm-lock.yaml ]]; then echo "pnpm"; return 0; fi
  if [[ -f package-lock.json || -f npm-shrinkwrap.json ]]; then echo "npm"; return 0; fi
  echo "npm"
}

refresh_lockfile() {
  local pm="$1"
  case "$pm" in
    npm)
      have npm || die "npm not found"
      npm install --package-lock-only
      ;;
    pnpm)
      command -v corepack >/dev/null 2>&1 && corepack enable >/dev/null 2>&1 || true
      have pnpm || die "pnpm not found"
      pnpm install --lockfile-only
      ;;
    yarn)
      command -v corepack >/dev/null 2>&1 && corepack enable >/dev/null 2>&1 || true
      have yarn || die "yarn not found"
      yarn install --mode update-lockfile
      ;;
    *)
      die "Unknown package manager: $pm"
      ;;
  esac
}

[[ -f package.json ]] || die "package.json not found in $(pwd)"

DRY_RUN=0
if [[ "${1:-}" == "--dry-run" || "${1:-}" == "-n" ]]; then
  DRY_RUN=1
fi

PM="$(detect_pm)"
echo "Detected package manager: $PM"

have node || die "Node.js not found in PATH. Install Node first."

NCU_BASE=(npx --yes npm-check-updates)
NCU_ARGS=(--dep prod,dev,optional --target latest)

if [[ $DRY_RUN -eq 1 ]]; then
  echo "Running DRY RUN (package.json will NOT be modified)..."
  "${NCU_BASE[@]}" "${NCU_ARGS[@]}" --jsonUpgraded || true
  exit 0
fi

echo "Updating package.json to latest versions..."
"${NCU_BASE[@]}" "${NCU_ARGS[@]}" -u

echo "Refreshing lockfile for $PM..."
refresh_lockfile "$PM"

echo "Done."
case "$PM" in
  npm)  echo "Next: npm install";;
  pnpm) echo "Next: pnpm install";;
  yarn) echo "Next: yarn install";;
esac
