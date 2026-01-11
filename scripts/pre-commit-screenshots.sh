#!/bin/bash
# Pre-commit hook to update screenshots
# This runs before each commit to ensure screenshots are current

set -e

echo "📸 Checking if screenshots need updating..."

# Check if any relevant files have changed (CSS, HTML, JS)
CHANGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(css|html|js)$' | grep -v 'node_modules' | grep -v 'scripts/' || true)

if [ -z "$CHANGED_FILES" ]; then
    echo "No relevant files changed, skipping screenshot generation."
    exit 0
fi

echo "Relevant files changed:"
echo "$CHANGED_FILES"
echo ""

# Generate new screenshots
echo "Generating updated screenshots..."
node scripts/generate-screenshots.js

# Stage the updated screenshots
echo ""
echo "Staging updated screenshots..."
git add docs/screenshots/light-mode.png
git add docs/screenshots/dark-mode.png

echo "✓ Screenshots updated and staged"
