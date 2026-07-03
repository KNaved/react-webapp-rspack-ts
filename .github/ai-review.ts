#!/usr/bin/env npx tsx
// @ts-nocheck

/**
 * AI Code Review — analyzes diffs using GitHub Models API (openai/gpt-4.1).
 *
 * Two modes:
 *   1. Pre-commit (local git)   npx tsx .github/ai-review.ts --staged
 *   2. Bitbucket PR via URL      npx tsx .github/ai-review.ts --url <PR-link>
 *
 * Mode 2 requires no local git clone — diff, PR title, and commit SHA
 * are fetched from Bitbucket Server REST API. Suitable for webhooks.
 *
 * Environment variables:
 *   GITHUB_TOKEN          GitHub PAT (Copilot Business) for model inference
 *   BITBUCKET_TOKEN       Bitbucket HTTP access token
 *
 * Options:
 *   --model <name>        Model to use (default: openai/gpt-4.1)
 *   --staged              Pre-commit hook mode (blocks on errors)
 *   --url <link>          Bitbucket PR URL (auto-extracts repo, PR, project, base URL)
 */

import { readFileSync } from 'fs'
import { execSync } from 'child_process'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { env, argv, exit } from 'node:process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env file from project root (no external dependencies)
function loadEnvFile(): void {
  // Load .env.local first, then .env.development.local (latter fills in missing vars)
  const envFiles = ['.env.local', '.env.development.local']

  for (const fileName of envFiles) {
    try {
      const envPath = resolve(process.cwd(), fileName)
      const content = readFileSync(envPath, 'utf-8')
      for (const line of content.split('\n')) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue
        const eqIndex = trimmed.indexOf('=')
        if (eqIndex === -1) continue
        const key = trimmed.slice(0, eqIndex).trim()
        let value = trimmed.slice(eqIndex + 1).trim()
        // Strip surrounding quotes
        if (
          (value.startsWith("'") && value.endsWith("'")) ||
          (value.startsWith('"') && value.endsWith('"'))
        ) {
          value = value.slice(1, -1)
        }
        // Don't overwrite existing env vars (CLI/pipeline takes priority)
        if (!env[key]) {
          env[key] = value
        }
      }
    } catch {
      // File not found — that's fine, try next
    }
  }
}

loadEnvFile()

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface ChatChoice {
  message: { content: string }
}

interface ChatResponse {
  choices: ChatChoice[]
  error?: { message: string }
}

interface ReviewFinding {
  file: string
  line: number
  severity: 'error' | 'warning' | 'info'
  category: string
  message: string
}

interface ReviewResult {
  summary: string
  findings: ReviewFinding[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface ParsedArgs {
  model: string
  staged: boolean
  repo?: string
  pr?: string
}

/**
 * Parse a Bitbucket PR URL into its components.
 * Supports: https://<>/projects/OLIVE/repos/magica/pull-requests/13
 *           https://<>/users/<userId>/repos/magica/pull-requests/13
 */
function parseBitbucketPrUrl(
  url: string
): { baseUrl: string; project: string; repo: string; pr: string } | null {
  const match = url.match(
    /^(https?:\/\/[^/]+)\/((?:projects|users)\/[^/]+)\/repos\/([^/]+)\/pull-requests\/(\d+)/
  )
  if (!match) return null
  return { baseUrl: match[1], project: match[2], repo: match[3], pr: match[4] }
}

function parseArgs(): ParsedArgs {
  const args = argv.slice(2)
  let model = 'openai/gpt-4.1'
  let staged = false
  let repo: string | undefined
  let pr: string | undefined

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--model' && args[i + 1]) {
      model = args[++i]
    } else if (args[i] === '--url' && args[i + 1]) {
      const parsed = parseBitbucketPrUrl(args[++i])
      if (!parsed) {
        console.error(
          'Error: Invalid Bitbucket PR URL. Expected format:\n  PR'
        )
        exit(1)
      }
      repo = parsed.repo
      pr = parsed.pr
      // Set env vars so getBitbucketConfig() picks them up
      if (!env.BITBUCKET_BASE_URL) {
        env.BITBUCKET_BASE_URL = parsed.baseUrl
      }
      if (!env.BITBUCKET_PROJECT) {
        env.BITBUCKET_PROJECT = parsed.project
      }
    } else if (args[i] === '--staged') {
      staged = true
    }
  }

  return { model, staged, repo, pr }
}

function getStagedDiff(): string {
  return execSync('git diff --cached', {
    encoding: 'utf-8',
    maxBuffer: 10 * 1024 * 1024
  })
}

/**
 * Annotate a unified diff with line numbers so the AI model can read them directly.
 * Added/context lines get the new-file line number prepended: `[L199] +  md: '30px'`
 * Removed lines get `[DEL]` prefix.
 */
function annotateDiffWithLineNumbers(diff: string): string {
  const lines = diff.split('\n')
  const result: string[] = []
  let newLineNum = 0

  for (const line of lines) {
    // Normalize Bitbucket Server headers: src:// and dst:// → a/ and b/
    if (line.startsWith('diff --git src://')) {
      result.push(line.replace(/src:\/\//g, 'a/').replace(/dst:\/\//g, 'b/'))
      continue
    }
    if (line.startsWith('--- src://')) {
      result.push(line.replace('src://', 'a/'))
      continue
    }
    if (line.startsWith('+++ dst://')) {
      const path = line.slice('+++ dst://'.length)
      result.push(`+++ b/${path}`)
      continue
    }

    // Other file headers — pass through
    const fileMatch = line.match(/^\+\+\+ (?:b\/)(.+)/)
    if (fileMatch || line.startsWith('--- ') || line.startsWith('diff ')) {
      result.push(line)
      continue
    }

    // Hunk header — extract new file starting line
    const hunkMatch = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@(.*)/)
    if (hunkMatch) {
      newLineNum = parseInt(hunkMatch[1], 10)
      result.push(line)
      continue
    }

    if (line.startsWith('+')) {
      result.push(`[L${newLineNum}] ${line}`)
      newLineNum++
    } else if (line.startsWith('-')) {
      result.push(`[DEL] ${line}`)
    } else {
      result.push(`[L${newLineNum}] ${line}`)
      newLineNum++
    }
  }

  return result.join('\n')
}

/**
 * Split a unified diff into per-file sections.
 */
function splitDiffByFile(diff: string): { file: string; content: string }[] {
  const files: { file: string; content: string }[] = []
  const lines = diff.split('\n')
  let currentFile: string | null = null
  let currentLines: string[] = []

  for (const line of lines) {
    // Detect start of a new file diff
    if (line.startsWith('diff --git') || line.startsWith('diff --git src://')) {
      if (currentFile && currentLines.length > 0) {
        files.push({ file: currentFile, content: currentLines.join('\n') })
      }
      currentLines = [line]
      currentFile = null
    } else if (line.match(/^\+\+\+ (?:b\/|dst:\/\/)(.+)/)) {
      const match = line.match(/^\+\+\+ (?:b\/|dst:\/\/)(.+)/)
      currentFile = match![1]
      currentLines.push(line)
    } else {
      currentLines.push(line)
    }
  }

  // Push the last file
  if (currentFile && currentLines.length > 0) {
    files.push({ file: currentFile, content: currentLines.join('\n') })
  }

  // Skip image, JSON, binary, markdown, test files and .github folder — not useful for code review
  const skipExtensions =
    /\.(png|jpe?g|gif|webp|avif|svg|ico|bmp|tiff?|json|md|test\.[a-z]+|spec\.[a-z]+)$|(^|\/)(__tests__|\.github)\//i
  return files.filter(f => !skipExtensions.test(f.file))
}

/**
 * Estimate token count from a string (~4 chars per token).
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

/**
 * Split a block of diff lines into sub-chunks at line boundaries,
 * keeping each under maxTokens. Used when a single hunk is too large
 * to fit in one chunk even on its own.
 */
function splitLinesByTokenLimit(
  diffLines: string[],
  header: string,
  maxTokens: number
): string[] {
  const headerTokens = estimateTokens(header)
  const subChunks: string[] = []
  let currentLines: string[] = []
  let currentTokens = headerTokens

  for (const line of diffLines) {
    const lineTokens = estimateTokens(line)

    // If adding this line would exceed the limit, finalize current sub-chunk
    if (currentTokens + lineTokens > maxTokens && currentLines.length > 0) {
      subChunks.push(header + '\n' + currentLines.join('\n'))
      currentLines = []
      currentTokens = headerTokens
    }

    currentLines.push(line)
    currentTokens += lineTokens
  }

  if (currentLines.length > 0) {
    subChunks.push(header + '\n' + currentLines.join('\n'))
  }

  return subChunks
}

/**
 * Split a single file diff into sub-chunks by hunk boundaries (@@).
 * If a single hunk still exceeds maxTokens, split it further at line boundaries.
 * Each sub-chunk includes the file header so the model knows which file it's reviewing.
 */
function splitFileByHunks(
  fileDiff: { file: string; content: string },
  maxTokens: number
): string[] {
  const lines = fileDiff.content.split('\n')
  const subChunks: string[] = []

  // Extract file header lines (everything before the first @@ hunk)
  const headerLines: string[] = []
  let firstHunkIndex = 0
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('@@')) {
      firstHunkIndex = i
      break
    }
    headerLines.push(lines[i])
  }
  const header = headerLines.join('\n')
  const headerTokens = estimateTokens(header)

  // Collect hunks as separate arrays of lines
  const hunks: string[][] = []
  let currentHunk: string[] = []

  for (let i = firstHunkIndex; i < lines.length; i++) {
    const line = lines[i]
    if (line.startsWith('@@') && currentHunk.length > 0) {
      hunks.push(currentHunk)
      currentHunk = []
    }
    currentHunk.push(line)
  }
  if (currentHunk.length > 0) {
    hunks.push(currentHunk)
  }

  // Group hunks into sub-chunks that fit under maxTokens.
  // If a single hunk exceeds maxTokens, split it at line boundaries.
  let pendingLines: string[] = []
  let pendingTokens = headerTokens

  for (const hunk of hunks) {
    const hunkTokens = estimateTokens(hunk.join('\n'))

    // If this single hunk alone exceeds maxTokens, split it at line level
    if (headerTokens + hunkTokens > maxTokens) {
      // Flush any pending lines first
      if (pendingLines.length > 0) {
        subChunks.push(header + '\n' + pendingLines.join('\n'))
        pendingLines = []
        pendingTokens = headerTokens
      }
      // Split the oversized hunk at line boundaries
      subChunks.push(...splitLinesByTokenLimit(hunk, header, maxTokens))
      continue
    }

    // If adding this hunk would exceed the limit, finalize
    if (pendingTokens + hunkTokens > maxTokens && pendingLines.length > 0) {
      subChunks.push(header + '\n' + pendingLines.join('\n'))
      pendingLines = []
      pendingTokens = headerTokens
    }

    pendingLines.push(...hunk)
    pendingTokens += hunkTokens
  }

  if (pendingLines.length > 0) {
    subChunks.push(header + '\n' + pendingLines.join('\n'))
  }

  return subChunks
}

/**
 * Group per-file diffs into chunks that stay under maxTokens.
 * If a single file exceeds maxTokens, split it by hunks into sub-chunks.
 */
function chunkDiffs(
  fileDiffs: { file: string; content: string }[],
  maxTokens: number = 2000
  // Token budget: 8,000 max input tokens
  // System prompt (review-prompt.md + schema): ~2,600 tokens
  // Annotation overhead ([L###] prefix): ~30%
  // Raw diff 2,000 → annotated ~2,600 → total ~5,200 (safe under 8,000)
): string[] {
  const chunks: string[] = []
  let currentChunk: string[] = []
  let currentTokens = 0

  for (const fileDiff of fileDiffs) {
    const fileTokens = estimateTokens(fileDiff.content)

    // If a single file exceeds maxTokens, split it by hunks
    if (fileTokens > maxTokens) {
      // Finalize any current chunk first
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.join('\n'))
        currentChunk = []
        currentTokens = 0
      }
      const subChunks = splitFileByHunks(fileDiff, maxTokens)
      chunks.push(...subChunks)
      continue
    }

    // If adding this file would exceed the limit, finalize the current chunk
    if (currentTokens + fileTokens > maxTokens && currentChunk.length > 0) {
      chunks.push(currentChunk.join('\n'))
      currentChunk = []
      currentTokens = 0
    }

    currentChunk.push(fileDiff.content)
    currentTokens += fileTokens
  }

  // Push remaining
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join('\n'))
  }

  return chunks
}

/**
 * Parse a unified diff to build a map of file -> line -> lineType.
 * This lets us set the correct anchor lineType (ADDED vs CONTEXT) for Bitbucket.
 */
function parseDiffLineTypes(
  diff: string
): Map<string, Map<number, 'ADDED' | 'CONTEXT'>> {
  const fileMap = new Map<string, Map<number, 'ADDED' | 'CONTEXT'>>()
  let currentFile: string | null = null
  let newLineNum = 0

  for (const line of diff.split('\n')) {
    // Detect file header: +++ b/path or +++ dst://path (Bitbucket Server format)
    const fileMatch = line.match(/^\+\+\+ (?:b\/|dst:\/\/)(.+)/)
    if (fileMatch) {
      currentFile = fileMatch[1]
      if (!fileMap.has(currentFile)) {
        fileMap.set(currentFile, new Map())
      }
      continue
    }

    // Skip --- header lines
    if (line.startsWith('--- ')) continue

    // Detect hunk header: @@ -old,count +new,count @@
    const hunkMatch = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/)
    if (hunkMatch) {
      newLineNum = parseInt(hunkMatch[1], 10)
      continue
    }

    if (!currentFile) continue

    const lineMap = fileMap.get(currentFile)!

    if (line.startsWith('+')) {
      lineMap.set(newLineNum, 'ADDED')
      newLineNum++
    } else if (line.startsWith('-')) {
      // Removed lines don't increment new line counter
      continue
    } else {
      // Context line (unchanged, starts with space or is empty)
      lineMap.set(newLineNum, 'CONTEXT')
      newLineNum++
    }
  }

  return fileMap
}

/**
 * Parse a unified diff to build a map of file -> line -> content (trimmed).
 * Used to snap model-reported line numbers to the actual line containing the issue.
 */
function parseDiffLineContent(diff: string): Map<string, Map<number, string>> {
  const fileMap = new Map<string, Map<number, string>>()
  let currentFile: string | null = null
  let newLineNum = 0

  for (const line of diff.split('\n')) {
    const fileMatch = line.match(/^\+\+\+ (?:b\/|dst:\/\/)(.+)/)
    if (fileMatch) {
      currentFile = fileMatch[1]
      if (!fileMap.has(currentFile)) {
        fileMap.set(currentFile, new Map())
      }
      continue
    }

    if (line.startsWith('--- ')) continue

    const hunkMatch = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/)
    if (hunkMatch) {
      newLineNum = parseInt(hunkMatch[1], 10)
      continue
    }

    if (!currentFile) continue

    const contentMap = fileMap.get(currentFile)!

    if (line.startsWith('+')) {
      // Store content without the leading '+'
      contentMap.set(newLineNum, line.slice(1).trim())
      newLineNum++
    } else if (line.startsWith('-')) {
      // skip
      continue
    } else {
      contentMap.set(newLineNum, line.slice(1).trim())
      newLineNum++
    }
  }

  return fileMap
}

/**
 * Try to snap a finding's line number to the actual line in the diff that
 * contains the problematic value mentioned in the finding message.
 * Searches ±5 lines from the reported line for keywords from the message.
 */
function snapToCorrectLine(
  finding: ReviewFinding,
  lineContent: Map<number, string>
): number {
  // Extract quoted values from the finding message (e.g. '30px', '#E2E2E2')
  const quotedValues = finding.message.match(/['"`]([^'"`]+)['"`]/g)
  if (!quotedValues || quotedValues.length === 0) return finding.line

  const searchTerms = quotedValues.map(v => v.slice(1, -1))

  // Check if the reported line already contains the term
  const reportedContent = lineContent.get(finding.line) ?? ''
  if (searchTerms.some(term => reportedContent.includes(term))) {
    return finding.line
  }

  // Search nearby lines ±5
  for (const offset of [1, -1, 2, -2, 3, -3, 4, -4, 5, -5]) {
    const candidate = finding.line + offset
    const content = lineContent.get(candidate) ?? ''
    if (searchTerms.some(term => content.includes(term))) {
      return candidate
    }
  }

  return finding.line
}

function getBitbucketConfig() {
  const bbBaseUrl = env.BITBUCKET_BASE_URL
  const bbToken = env.BITBUCKET_TOKEN
  const bbProject = env.BITBUCKET_PROJECT

  if (!bbBaseUrl || !bbToken || !bbProject) {
    throw new Error(
      'BITBUCKET_TOKEN is required. BITBUCKET_BASE_URL and BITBUCKET_PROJECT are auto-detected from --url.'
    )
  }

  return {
    apiBase: bbBaseUrl.replace(/\/$/, ''),
    token: bbToken,
    project: bbProject
  }
}

async function fetchPrDiff(repoSlug: string, prId: string): Promise<string> {
  const { apiBase, token, project } = getBitbucketConfig()
  const diffUrl = `${apiBase}/rest/api/1.0/${project}/repos/${repoSlug}/pull-requests/${prId}.diff`

  const res = await fetch(diffUrl, {
    headers: { Authorization: `Bearer ${token}` }
  })

  if (!res.ok) {
    throw new Error(`Bitbucket API failed`)
  }

  return res.text()
}

/**
 * Fetch PR title and latest commit SHA from Bitbucket Server API.
 * Eliminates the need for a local git clone in PR mode.
 */
async function fetchPrDetails(
  repoSlug: string,
  prId: string
): Promise<{ title: string; latestCommit: string }> {
  const { apiBase, token, project } = getBitbucketConfig()
  const prUrl = `${apiBase}/rest/api/1.0/${project}/repos/${repoSlug}/pull-requests/${prId}`

  const res = await fetch(prUrl, {
    headers: { Authorization: `Bearer ${token}` }
  })

  if (!res.ok) {
    throw new Error(`Bitbucket API failed`)
  }

  const data = (await res.json()) as {
    title?: string
    description?: string
    fromRef?: { latestCommit?: string }
  }

  const title = data.title ?? '(no PR title)'
  const latestCommit = data.fromRef?.latestCommit ?? 'unknown'

  return { title, latestCommit }
}

async function analyzeWithModel(
  model: string,
  commitMessage: string,
  diff: string
): Promise<ReviewResult> {
  // Load shared review prompt
  const reviewPromptPath = resolve(__dirname, 'review-prompt.md')
  const reviewPrompt = readFileSync(reviewPromptPath, 'utf-8')

  // Always request JSON: append JSON schema so the model responds in structured JSON
  const systemPrompt =
    reviewPrompt +
    `\n\n## JSON Response Override\nIgnore the table format above. Respond ONLY with a JSON object (no markdown fences) matching this schema:\n{\n  "summary": "string (brief overall assessment)",\n  "findings": [\n    {\n      "file": "string (exact path from diff)",\n      "line": number,\n      "severity": "error" | "warning" | "info",\n      "category": "Bug" | "Security" | "Performance" | "TypeScript" | "CodeQuality",\n      "message": "string (issue description and how to fix)"\n    }\n  ]\n}\nIf no issues found, return: { "summary": "No issues found.", "findings": [] }`

  const userPrompt = `## Commit message
${commitMessage}

## Diff
${annotateDiffWithLineNumbers(diff)}`

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ]

  const MAX_RETRIES = 5
  let lastError: string = ''

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch(
      'https://models.github.ai/inference/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.GITHUB_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.2,
          response_format: { type: 'json_object' }
        }),
        signal: AbortSignal.timeout(30_000) // 30s timeout
      }
    )

    if (res.status === 429) {
      const retryAfter = parseInt(res.headers.get('retry-after') ?? '', 10)
      const waitSec = retryAfter > 0 ? retryAfter : attempt * 15
      console.warn(
        `  ⚠ Rate limited. Retrying... (attempt ${attempt}/${MAX_RETRIES})`
      )
      await new Promise(r => setTimeout(r, waitSec * 1000))
      continue
    }

    // 413 / token limit — single file too large even after chunking, skip (no retry)
    if (res.status === 413) {
      console.warn(
        `  ⚠ Single file diff exceeds 8k token limit — skipped, not retried.`
      )
      return {
        summary: 'Chunk skipped (single file too large for model).',
        findings: []
      }
    }

    if (!res.ok) {
      const responseBody = await res.text()
      // Token limit error returned as 400 — single file too large, skip (no retry)
      if (responseBody.includes('tokens_limit_reached')) {
        console.warn(
          `  ⚠ Single file diff exceeds 8k token limit — skipped, not retried.`
        )
        return {
          summary: 'Chunk skipped (single file too large for model).',
          findings: []
        }
      }
      lastError = `HTTP ${res.status}`
      if (attempt < MAX_RETRIES) {
        const waitSec = attempt * 10
        console.warn(
          `  ⚠ API error. Retrying... (attempt ${attempt}/${MAX_RETRIES})`
        )
        await new Promise(r => setTimeout(r, waitSec * 1000))
        continue
      }
      console.error(`  ❌ API request failed after ${MAX_RETRIES} attempts.`)
      exit(1)
    }

    const data = (await res.json()) as ChatResponse
    if (data.error) {
      console.error(`  ❌ Model error`)
      exit(1)
    }

    const raw = data.choices[0].message.content
    try {
      return JSON.parse(raw) as ReviewResult
    } catch {
      return { summary: raw, findings: [] }
    }
  }

  console.error(`  ❌ All ${MAX_RETRIES} retry attempts exhausted.`)
  exit(1)
}

function severityIcon(severity: string): string {
  switch (severity) {
    case 'error':
      return '🔴'
    case 'warning':
      return '🟡'
    default:
      return '🔵'
  }
}

function printReviewToTerminal(review: ReviewResult): void {
  console.log('─'.repeat(60))

  if (review.findings.length === 0) {
    console.log('No issues found.')
  } else {
    for (const f of review.findings) {
      console.log(
        `${severityIcon(f.severity)} [${f.category}] ${f.file}:${f.line}`
      )
      console.log(`   ${f.message}\n`)
    }
  }
  console.log('─'.repeat(60))
}

async function postInlineComments(
  review: ReviewResult,
  repoSlug: string,
  prId: string,
  diff: string
): Promise<void> {
  let config: ReturnType<typeof getBitbucketConfig>
  try {
    config = getBitbucketConfig()
  } catch {
    console.warn(
      '⚠ Missing BITBUCKET_TOKEN or --url not provided — skipping PR comments.'
    )
    return
  }

  const commentsUrl = `${config.apiBase}/rest/api/1.0/${config.project}/repos/${repoSlug}/pull-requests/${prId}/comments`

  const headers = {
    Authorization: `Bearer ${config.token}`,
    'Content-Type': 'application/json'
  }

  console.log('\n📤 Posting review comments on Bitbucket PR...')

  // Fetch existing AI comments to avoid duplicates
  const existingComments = new Set<string>()
  try {
    const activitiesUrl = `${config.apiBase}/rest/api/1.0/${config.project}/repos/${repoSlug}/pull-requests/${prId}/activities?limit=1000`
    const activitiesRes = await fetch(activitiesUrl, { headers })
    if (activitiesRes.ok) {
      const data = (await activitiesRes.json()) as {
        values?: Array<{
          action?: string
          comment?: {
            text?: string
            anchor?: { path?: string; line?: number }
          }
        }>
      }
      for (const activity of data.values ?? []) {
        if (
          activity.comment?.text?.startsWith('🤖 **AI Code Review**') &&
          activity.comment.anchor
        ) {
          const key = `${activity.comment.anchor.path}:${activity.comment.anchor.line}`
          existingComments.add(key)
        }
      }
    }
  } catch {
    // Failed to fetch existing comments — proceed without dedup
  }

  // Parse diff to determine correct lineType per line
  const diffLineTypes = parseDiffLineTypes(diff)
  const diffContent = parseDiffLineContent(diff)

  // Post inline comments on each finding
  let posted = 0
  let skipped = 0
  let failed = 0

  for (const finding of review.findings) {
    const commentText = `🤖 **AI Code Review** - ${severityIcon(finding.severity)} **${finding.category}**\n\n${finding.message}`

    // Snap to the correct line by searching for quoted values from the message
    const fileContent = diffContent.get(finding.file)
    const snappedLine = fileContent
      ? snapToCorrectLine(finding, fileContent)
      : finding.line

    // Look up whether this line is ADDED or CONTEXT in the diff
    const fileLines = diffLineTypes.get(finding.file)
    let anchorLine = snappedLine

    // If still not in the diff, try nearby lines (±1, ±2)
    if (!fileLines?.has(anchorLine) && fileLines) {
      for (const offset of [1, -1, 2, -2]) {
        if (fileLines.has(anchorLine + offset)) {
          anchorLine = anchorLine + offset
          break
        }
      }
    }

    // Skip if an AI comment already exists on this file:line
    const commentKey = `${finding.file}:${anchorLine}`
    if (existingComments.has(commentKey)) {
      skipped++
      continue
    }

    const resolvedLineType = fileLines?.get(anchorLine) ?? 'ADDED'

    const anchor = {
      line: anchorLine,
      lineType: resolvedLineType,
      fileType: 'TO' as const,
      path: finding.file
    }

    const res = await fetch(commentsUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        text: commentText,
        anchor
      })
    })

    if (res.ok) {
      posted++
    } else {
      failed++
      const body = await res.text()
      // console.error(
      //   `  ⚠ Failed to post comment on ${finding.file}:${finding.line} (${res.status}): ${body}`
      // )
    }
  }

  console.log(
    `✅ Posted ${posted} inline comment(s)${skipped > 0 ? `, ${skipped} skipped (duplicate)` : ''}${failed > 0 ? `, ${failed} failed` : ''}.`
  )
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const { model, staged, repo, pr } = parseArgs()

  const token = env.GITHUB_TOKEN
  if (!token) {
    console.error('Error: GITHUB_TOKEN environment variable is required.')
    console.error('Create a PAT at https://github.com/settings/tokens')
    exit(1)
  }

  console.log('🔑 GitHub Co-pilot connect to consume model')

  let diff: string
  let commitMessage: string

  if (staged) {
    // Pre-commit mode: analyze staged changes
    console.log('🔍 Mode: pre-commit (staged changes)')
    console.log(`🤖 Model: ${model}\n`)
    diff = getStagedDiff()
    commitMessage = '(pre-commit — no message yet)'

    if (!diff.trim()) {
      console.log('No staged changes to review.')
      exit(0)
    }
  } else if (repo && pr) {
    // PR mode: fetch everything from Bitbucket API (no local git needed)
    console.log(`🔍 Mode: Bitbucket PR (${repo} #${pr})`)
    console.log(`🤖 Model: ${model}\n`)
    const prDetails = await fetchPrDetails(repo, pr)
    commitMessage = prDetails.title
    diff = await fetchPrDiff(repo, pr)

    if (!diff.trim()) {
      console.log('PR diff is empty — nothing to review.')
      exit(0)
    }
  } else {
    console.error('Error: Provide --staged or --url <PR_URL>')
    exit(1)
  }

  const fileDiffs = splitDiffByFile(diff)
  const chunks = chunkDiffs(fileDiffs, 2000)

  console.log(
    `Analyzing ${fileDiffs.length} file(s) in ${chunks.length} chunk(s)...\n`
  )

  const mergedReview: ReviewResult = { summary: '', findings: [] }

  // Process chunks with a concurrency pool of 3 — always 3 in-flight,
  // next chunk starts as soon as one finishes (avoids 429 from bursting)
  const MAX_CONCURRENT = 3
  const results: ReviewResult[] = new Array(chunks.length)
  let apiCallCount = 0
  let running = 0
  let nextIndex = 0

  await new Promise<void>(resolveAll => {
    function launchNext() {
      while (running < MAX_CONCURRENT && nextIndex < chunks.length) {
        const i = nextIndex++
        running++
        apiCallCount++
        if (chunks.length > 1) {
          console.log(`  ⏳ Chunk ${i + 1}/${chunks.length}...`)
        }
        // Stagger launches by 1s to avoid bursting the rate limit
        const delay = i === 0 ? 0 : 1000
        setTimeout(() => {
          analyzeWithModel(model, commitMessage, chunks[i])
            .then(result => {
              results[i] = result
            })
            .catch(() => {
              results[i] = { summary: 'Chunk failed.', findings: [] }
            })
            .finally(() => {
              running--
              if (nextIndex < chunks.length) {
                launchNext()
              } else if (running === 0) {
                resolveAll()
              }
            })
        }, delay)
      }
      if (chunks.length === 0) resolveAll()
    }
    launchNext()
  })

  console.log(`\n📊 Total API calls made: ${apiCallCount}`)

  for (const result of results) {
    mergedReview.findings.push(...result.findings)
  }

  const summaries = results.map(r => r.summary).filter(Boolean)
  mergedReview.summary =
    summaries.length === 1 ? summaries[0] : summaries.join(' | ')

  const review = mergedReview

  printReviewToTerminal(review)

  if (repo && pr) {
    console.log('\n⏭ Attempting to post inline comments on Bitbucket PR...')
    await postInlineComments(review, repo, pr, diff)
  }

  // Exit with error code only in pre-commit mode (blocks the commit)
  const errors = review.findings.filter(f => f.severity === 'error')
  if (errors.length > 0 && staged) {
    console.error(`\n❌ ${errors.length} error(s) found — commit blocked.`)
    console.error(
      'Fix the errors above, or skip with: LEFTHOOK_EXCLUDE=ai-review git commit -m "<your message>"'
    )
    exit(1)
  }
}

main()
