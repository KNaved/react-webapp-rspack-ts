---
name: review-staged
description: 'Review git staged changes against project guidelines. Use when: "review staged", "pre-commit review", "check my staged changes", "audit staged".'
---

# Review Staged Changes

Review all currently staged git changes (`git diff --cached`) against the project coding standards.

## When to Use

- Before committing — check staged files for violations
- Pre-commit review requests
- "Review my staged changes", "check what I'm about to commit"

## Procedure

1. Read `.github/review-prompt.md` for review rules, severity definitions, and all project-specific standards.
2. Run [get-diff.sh](./get-diff.sh) to retrieve the staged diff with file stats.
3. If the diff is empty, report "No staged changes to review." and stop.
4. Audit **only the added/changed lines** (lines starting with `+` in the diff). Do NOT flag pre-existing code.
5. Check every rule from `.github/review-prompt.md` against the changed lines.
6. Output the audit report grouped by file using the format below.

## Output Format

Group violations by file. For each violation include:

- **Line number** (from the diff)
- **Severity** with circle icon: 🔴 error, 🟡 warning, 🔵 info
- **Category**: Bug / Security / Performance / TypeScript / CodeQuality / Hardcoded Values / Hardcoded Strings
- **Description** and **How to Fix**

Do NOT rewrite the code unless asked — just provide the audit report.
