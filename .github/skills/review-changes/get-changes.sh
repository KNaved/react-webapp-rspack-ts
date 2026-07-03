#!/usr/bin/env bash
# get-changes.sh — Retrieve all uncommitted changes (staged + unstaged)
# Usage: get-changes.sh
#   Shows git diff HEAD — everything not yet committed.

set -euo pipefail

echo "=== Uncommitted File Stats ==="
git diff HEAD --stat 2>/dev/null || true

echo ""
echo "=== Uncommitted Diff ==="
git diff HEAD