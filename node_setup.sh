#!/usr/bin/env bash
set -euo pipefail

log() {
  local msg="$1"
  echo -e "\e[1;34m$msg\e[0m"
}

error() {
  echo "Error: $1" >&2
  exit 1
}

log "🔍 Checking prerequisites..."
if ! command -v curl >/dev/null 2>&1; then
  if command -v apt-get >/dev/null 2>&1; then
    log "Installing curl..."
    if command -v sudo >/dev/null 2>&1; then
      sudo apt-get update
      sudo apt-get install -y curl
    else
      apt-get update
      apt-get install -y curl
    fi
  else
    error "curl is required but not installed, and apt-get is unavailable. Please install curl manually and re-run the script."
  fi
fi

export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"

load_nvm() {
  if [ -s "$NVM_DIR/nvm.sh" ]; then
    # shellcheck source=/dev/null
    . "$NVM_DIR/nvm.sh"
  fi
  if [ -s "$NVM_DIR/bash_completion" ]; then
    # shellcheck source=/dev/null
    . "$NVM_DIR/bash_completion"
  fi
}

load_nvm

if ! command -v nvm >/dev/null 2>&1; then
  log "Installing Node Version Manager (nvm)..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  load_nvm
  if ! command -v nvm >/dev/null 2>&1; then
    error "nvm installation failed."
  fi
else
  log "nvm already installed."
fi

log "⬇️ Installing latest stable Node.js..."
nvm install --lts --latest-npm
nvm alias default 'lts/*'
nvm use default

log "✅ Node.js version now in use:"
node -v
npm -v

log "📦 Installing project dependencies..."
if [ -f package.json ]; then
  npm install
else
  log "No package.json found. Run this script from your Vue app root folder."
fi

log "🎉 Setup complete. Your Vue application will use the latest stable Node.js."

