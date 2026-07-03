---
name: review-commits
description: 'Review last N git commits against project guidelines. Use when: "review commit", "audit last commit", "audit last N commits", "review recent changes".'
argument-hint: 'Number of commits to review (default: 1)'
---

# Review Commit History

Review the diff of the last N commits against the project coding standards.

## When to Use

- After committing — review what was just committed
- "Audit last commit", "review last 3 commits"
- CI/post-commit review

## Procedure

1. Read `.github/review-prompt.md` for review rules, severity definitions, and all project-specific standards.
2. Run [get-commits.sh](./get-commits.sh) with the number of commits to review (default: 1).
   - Usage: `bash .github/skills/review-commits/get-commits.sh [N] [SHA]`
   - `N` = number of commits (default: 1)
   - `SHA` = starting commit ref (default: HEAD)
3. If the diff is empty, report "No changes found in the specified commits." and stop.
4. Audit **only the added/changed lines** (lines starting with `+`). Do NOT flag pre-existing code.
5. Check every rule from `.github/review-prompt.md` against the changed lines.
6. Output the audit report grouped by file using the format below.

## Output Format

Group violations by file. For each violation include:

- **Line number** (from the diff)
- **Severity** with circle icon: 🔴 error, 🟡 warning, 🔵 info
- **Category**: Bug / Security / Performance / TypeScript / CodeQuality / Hardcoded Values / Hardcoded Strings
- **Description** and **How to Fix**

Do NOT rewrite the code unless asked — just provide the audit report.
