#!/bin/bash
# Post-create setup script for devcontainer
# This script runs automatically when the devcontainer is created

set -e

echo "=== Setting up devcontainer ==="

# Fix DNS order to prioritize Tailscale MagicDNS
# (Also runs via postStartCommand on every container start)
echo "Checking DNS configuration..."
bash "$(dirname "$0")/fix-dns-order.sh"

# Compute repository root (parent of .devcontainer)
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "Repository root: $REPO_ROOT"

# Install npm dependencies if package.json exists
if [ -f "$REPO_ROOT/package.json" ]; then
    echo "Installing npm dependencies..."
    (cd "$REPO_ROOT" && npm install)
else
    echo "No package.json found; skipping npm install."
fi

# Note: Claude Code and playwright-skill plugin are now pre-installed
# in the Dockerfile for faster rebuilds via Docker layer caching.

echo "=== Devcontainer setup complete ==="
