#!/usr/bin/env bash
set -euo pipefail

# Get the directory where this script is located
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PACKAGE_DIR="$ROOT_DIR/packages/mobx-form"

# Check if a bump type was provided
if [ $# -eq 0 ]; then
  echo "❌ Error: Please provide a version bump type (major, minor, patch)"
  echo "Usage: ./publish.sh <major|minor|patch>"
  exit 1
fi

BUMP_TYPE=$1

# Validate bump type
if [[ ! "$BUMP_TYPE" =~ ^(major|minor|patch)$ ]]; then
  echo "❌ Error: Invalid bump type '$BUMP_TYPE'. Must be major, minor, or patch."
  exit 1
fi

echo "🚀 Starting publish process for 'mobx-form'..."
echo "📍 Package directory: $PACKAGE_DIR"

# Navigate to package directory
cd "$PACKAGE_DIR"

# Check if version script exists in package.json
if ! grep -q "bump-$BUMP_TYPE" package.json; then
  echo "❌ Error: Script 'bump-$BUMP_TYPE' not found in $PACKAGE_DIR/package.json"
  exit 1
fi

# Run the corresponding bump script
echo "📦 Running 'bun run bump-$BUMP_TYPE'..."
bun run "bump-$BUMP_TYPE"

echo "✅ Publish process completed successfully!"

npm publish
