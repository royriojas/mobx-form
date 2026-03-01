#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🧹 Cleaning generated files..."

# Turbo cache and generated files
echo "  Removing .turbo caches..."
find "$ROOT_DIR" -name ".turbo" -type d -prune -exec rm -rf {} +

# Node modules
echo "  Removing node_modules..."
find "$ROOT_DIR" -name "node_modules" -type d -prune -exec rm -rf {} +

# Build outputs
echo "  Removing dist/ and build/ folders..."
find "$ROOT_DIR" -name "dist" -type d -prune -not -path "*/.git/*" -exec rm -rf {} +
find "$ROOT_DIR" -name "build" -type d -prune -not -path "*/.git/*" -exec rm -rf {} +

# Coverage
echo "  Removing coverage/ folders..."
find "$ROOT_DIR" -name "coverage" -type d -prune -exec rm -rf {} +

# Storybook static
echo "  Removing storybook-static/ folders..."
find "$ROOT_DIR" -name "storybook-static" -type d -prune -exec rm -rf {} +

# ESLint cache
echo "  Removing ESLint caches..."
find "$ROOT_DIR" -name ".eslintcache" -type f -delete

# Docusaurus
echo "  Removing .docusaurus caches..."
find "$ROOT_DIR" -name ".docusaurus" -type d -prune -exec rm -rf {} +

echo "✅ Clean complete. Run 'bun install' to restore dependencies."
