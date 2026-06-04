---
name: review-bitbucket-pr
description: 'Review a Bitbucket PR and post inline comments. Use when: "review PR", "audit PR", Bitbucket URL, "review pull request", "post PR comments".'
argument-hint: 'Bitbucket PR URL (e.g. https://bitbucket.domain.com/projects/PROJ/repos/repo/pull-requests/42)'
---

# Review Bitbucket Pull Request

Fetch a Bitbucket Server PR diff, review it against project guidelines, and optionally post inline comments.

## When to Use

- "Review PR https://bitbucket.example.com/…/pull-requests/42"
- "Audit this pull request"
- Any request containing a Bitbucket PR URL

## Prerequisites

Environment variables (set in `.env.local`, git-ignored):

| Variable          | Required | Purpose                                                 |
| ----------------- | -------- | ------------------------------------------------------- |
| `GITHUB_TOKEN`    | Yes      | GitHub PAT for AI model inference (when using CLI mode) |
| `BITBUCKET_TOKEN` | Yes      | Bitbucket HTTP access token (read + write)              |

## Procedure

1. Read `.github/review-prompt.md` for review rules, severity definitions, and all project-specific standards.
2. Run the CLI script to fetch the PR diff, review it with the AI model, and post inline comments:
   ```bash
   NODE_TLS_REJECT_UNAUTHORIZED=0  npx tsx .github/ai-review.ts --url <PR_URL>
   ```
3. The script automatically:
   - Fetches the PR diff and title from the Bitbucket Server API
   - Sends the diff to the AI model for review
   - Prints the audit report to the terminal
   - Posts inline comments on the Bitbucket PR

If the user only wants a **chat-based review** (no inline comments posted), skip the CLI script and instead:

1. Ask the user for the PR URL.
2. Run `NODE_TLS_REJECT_UNAUTHORIZED=0  npx tsx .github/ai-review.ts --url <PR_URL>` and review the terminal output.
3. Present the findings in the standard output format below.

## Output Format

Group violations by file. For each violation include:

- **Line number** (from the diff)
- **Severity** with circle icon: 🔴 error, 🟡 warning, 🔵 info
- **Category**: Bug / Security / Performance / TypeScript / CodeQuality / Hardcoded Values / Hardcoded Strings
- **Description** and **How to Fix**
