#!/usr/bin/env bash
# Generates random secrets for the JVB_AUTH_PASSWORD, JICOFO_AUTH_PASSWORD,
# and JICOFO_COMPONENT_SECRET fields in .env.
#
# Usage:
#   cp .env.example .env
#   ./gen-passwords.sh

set -euo pipefail

ENV_FILE="${1:-.env}"

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: $ENV_FILE not found. Run 'cp .env.example .env' first." >&2
  exit 1
fi

gen() {
  openssl rand -hex 16
}

set_var() {
  local key="$1"
  local value="$2"
  if grep -q "^${key}=" "$ENV_FILE"; then
    # Portable in-place edit for macOS (BSD sed) and Linux (GNU sed)
    sed -i.bak "s|^${key}=.*|${key}=${value}|" "$ENV_FILE" && rm -f "${ENV_FILE}.bak"
  else
    echo "${key}=${value}" >> "$ENV_FILE"
  fi
}

set_var "JVB_AUTH_PASSWORD" "$(gen)"
set_var "JICOFO_AUTH_PASSWORD" "$(gen)"
set_var "JICOFO_COMPONENT_SECRET" "$(gen)"

echo "Generated fresh secrets in $ENV_FILE"
