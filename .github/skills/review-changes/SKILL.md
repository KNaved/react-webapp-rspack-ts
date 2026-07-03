---
name: review-changes
description: 'Review all uncommitted changes (staged + unstaged) against project guidelines. Use when: "review changes", "review my changes", "audit changes", "check all changes".'
---

# Review All Uncommitted Changes

Review all uncommitted changes (`git diff HEAD` — staged + unstaged combined) against the project coding standards.

## When to Use

- "Review changes", "review my changes", "audit changes"
- When the developer wants a full review of everything modified since the last commit
- Catches both staged and unstaged modifications in one pass

## Procedure

1. Read `.github/review-prompt.md` for review rules, severity definitions, and all project-specific standards.
2. Run [get-changes.sh](./get-changes.sh) to retrieve all uncommitted changes with file stats.
3. If the diff is empty, report "No uncommitted changes to review." and stop.
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
