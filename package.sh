#!/usr/bin/env bash
# Package THE WARD for game-portal submission.
# Produces: dist/the-ward-v1.zip (single self-contained HTML)
set -e
mkdir -p dist
zip -j dist/the-ward-v1.zip index.html
echo "✓ dist/the-ward-v1.zip ($(du -h dist/the-ward-v1.zip | cut -f1))"
echo "  Upload to: developer.crazygames.com · itch.io · newgrounds.com"
