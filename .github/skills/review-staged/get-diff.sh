#!/usr/bin/env bash
# get-diff.sh — Retrieve staged git diff with file stats
# Used by the review-staged skill to feed the agent.

set -euo pipefail

echo "=== Staged File Stats ==="
git diff --cached --stat 2>/dev/null || true

echo ""
echo "=== Staged Diff ==="
git diff --cached