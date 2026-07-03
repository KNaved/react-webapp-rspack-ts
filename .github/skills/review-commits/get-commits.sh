#!/usr/bin/env bash
# get-commits.sh — Retrieve diff for the last N commits
# Usage: get-commits.sh [N] [SHA]
#   N   = number of commits to include (default: 1)
#   SHA = starting commit reference   (default: HEAD)

set -euo pipefail

N="${1:-1}"
SHA="${2:-HEAD}"

echo "=== Commit Log (last ${N}) ==="
git log --oneline -"${N}" "${SHA}"

echo ""
echo "=== Diff ==="
git diff "${SHA}~${N}" "${SHA}"