---
name: figma-snapshot
description: 'Fetch Figma design data and store it locally as a snapshot (node tree + screenshot + metadata) for offline reference and future code generation. Use when: "snapshot this design", "capture figma frame", "store this figma design", "save figma data locally".'
argument-hint: 'Figma frame URL (e.g. https://www.figma.com/design/<fileKey>/...?node-id=...)'
---

# Figma Snapshot Skill

Capture a Figma frame's full design context — node tree, screenshot, and metadata — and persist it in `.figma-snapshots/` so it can be used as an offline memory for future code generation and design reviews.

---

## Storage Structure

All snapshots live under `.figma-snapshots/` at the project root:

```
.figma-snapshots/
  index.json                  ← registry of all captured snapshots
  <slug>/                     ← one folder per captured frame
    metadata.json             ← URL, fileKey, nodeId, frame name, viewport, capturedAt
    design-context.json       ← full get_design_context response (node tree + reference code)
    screenshot.png            ← visual screenshot of the frame
    variables.json            ← design variable definitions (colours, spacing, etc.)
    README.md                 ← human-readable summary + usage guide for this snapshot
```

**Slug format**: `<sanitised-file-name>--<nodeId>` (lowercase, spaces → hyphens, `:` → `-`)
Example: `quick-od--34981-7468`

---

## Phase 1 — Parse and Validate the URL

1. Extract `fileKey` and `nodeId` from the provided Figma URL.
   - `nodeId`: convert `-` to `:` when calling MCP tools (e.g. `34981-7468` → `34981:7468`); store with `-` in the slug and metadata.
   - Branch URLs (`.../branch/:branchKey/...`): use `branchKey` as `fileKey`.
2. Check whether a snapshot already exists for this frame:
   - Read `.figma-snapshots/index.json` (if it exists).
   - Search for an entry where `nodeId` and `fileKey` match.
   - If a match is found, ask:
     > "A snapshot for this frame already exists (captured: `<capturedAt>`). Do you want to **refresh** it (overwrite) or **use the existing one**?"
   - If the user chooses **use existing**, stop here and print the [Usage Guide](#usage-guide) for that snapshot.
   - If **refresh** or no existing snapshot, continue.

---

## Phase 2 — Fetch Design Data from Figma

Call all four tools. If any tool returns an error, output the [MCP error block](#mcp-error-block) and stop.

### 2.1 — Design Context

Call `get_design_context` with:

- `fileKey`, `nodeId`, `clientFrameworks: 'react'`, `clientLanguages: 'typescript'`

Captures: full node tree, component hierarchy, layout, styles, and reference React code.

### 2.2 — Screenshot

Call `get_screenshot` with `fileKey` and `nodeId`.

### 2.3 — Metadata

Call `get_metadata` with `fileKey` and `nodeId`.

Captures: frame name, file name, last modified date.

### 2.4 — Variable Definitions

Call `get_variable_defs` with `fileKey`.

Captures: all design variable definitions (colour, spacing, radius tokens).

---

## Phase 2.5 — Semantic Validity Check

<!-- WHY THIS EXISTS: MCP tools returning HTTP 200 is not sufficient proof that the node is a
     UI frame suitable for code generation. A prior session fetched a <vector> asset node
     (a wide banner illustration). All tools returned successfully. The agent incorrectly
     treated this as a successful snapshot and proceeded to infer code from the wrong source.
     This check is the formal gate that catches that case before any code is written. -->

> **This check is mandatory.** A snapshot is only valid if the node is a real UI frame.
> Passing this check is what "Phase 1 succeeded" actually means — not just "the tools ran."

After the four tool calls above complete, verify ALL of the following:

**Check 1 — Node type**
The root element returned by `get_metadata` must be one of: `<frame>`, `<component>`, `<component_set>`, `<instance>`.
If it is `<vector>`, `<boolean_operation>`, `<rectangle>`, `<ellipse>`, `<line>`, or any primitive shape → **FAIL**.

**Check 2 — Children present**
The metadata tree must contain at least one child element.
A childless node is a leaf asset (icon, image, shape), not a UI frame → **FAIL**.

**Check 3 — Component tree in design context**
The code returned by `get_design_context` must contain more than one JSX element.
A response that is only a single `<div>` wrapping a single `<img>` means the node is a rasterised asset → **FAIL**.

**Check 4 — Name heuristic (warning, enforces checks 1–3 strictly)**
If the node name matches any of: `-->`, `image`, `banner`, `illustration`, `bg`, `background`, `asset` — treat as a likely asset. Checks 1–3 must all pass without exception.

**If any check fails:**

Stop. Output this message and do NOT write any snapshot files:

> ⛔ **Snapshot aborted — node is not a UI frame.**
> Node `<nodeId>` (`<nodeName>`) is a `<type>`. This is an asset, not a UI frame.
> Snapshot files have NOT been written.
>
> **Next step:** Scan adjacent node IDs (±5, ±10, ±20) using `get_metadata` to find the parent UI frame, then ask the user to confirm the correct node before retrying.

The calling agent (FigmaToReact) must then execute the Adjacent Node Scanning procedure defined in its Phase 1 section.

---

## Phase 3 — Build the Metadata Record

Construct a `metadata.json` object:

```json
{
  "slug": "<slug>",
  "figmaUrl": "<original URL as provided>",
  "fileKey": "<fileKey>",
  "nodeId": "<nodeId with dash, e.g. 34981-7468>",
  "frameName": "<frame name from get_metadata>",
  "fileName": "<file name from get_metadata>",
  "capturedAt": "<ISO 8601 timestamp>",
  "viewport": "<mobile | desktop | tablet>",
  "frameType": "<page | component>",
  "tools": {
    "designContext": true,
    "screenshot": true,
    "metadata": true,
    "variableDefs": true
  }
}
```

Determine `viewport` from the frame width in the design context:

- Width ≤ 430px → `mobile`
- Width ≥ 768px → `desktop`
- 431–767px → `tablet`

Determine `frameType`:

- Top-level page with multiple frames → `page`
- Single frame or component node → `component`

---

## Phase 4 — Write Files

Create the folder `.figma-snapshots/<slug>/` and write all files:

1. `metadata.json` — the record from Phase 3
2. `design-context.json` — JSON envelope wrapping the `get_design_context` response:
   ```json
   {
     "code": "<raw string output from get_design_context>",
     "hints": []
   }
   ```
   **Never write raw JSX/JS code directly into this file** — the `code` value must always be a JSON string inside this object.
3. `screenshot.png` — image from `get_screenshot`
4. `variables.json` — raw response from `get_variable_defs`
5. `README.md` — generated in Phase 5

---

## Phase 5 — Generate the README

Write `.figma-snapshots/<slug>/README.md` with:

```markdown
# Snapshot: <frameName> (<fileName>)

| Field      | Value        |
| :--------- | :----------- |
| Figma URL  | <figmaUrl>   |
| Frame      | <frameName>  |
| File       | <fileName>   |
| Viewport   | <viewport>   |
| Frame type | <frameType>  |
| Captured   | <capturedAt> |
| Slug       | <slug>       |

## Files in this snapshot

| File                  | Contents                                      |
| :-------------------- | :-------------------------------------------- |
| `design-context.json` | Full node tree, component hierarchy, ref code |
| `screenshot.png`      | Visual screenshot of the frame                |
| `metadata.json`       | URL, keys, timestamps                         |
| `variables.json`      | Figma variable/token definitions              |

## Design summary

<Write 3-5 bullet points summarising what the frame contains: key sections, components used, viewport, interactive elements. Base this on the design context data.>

## How to use this snapshot

See the [Figma Snapshots Usage Guide](./../USAGE-GUIDE.md) for full instructions.

Quick reference:

\`\`\`
@FigmaDev build from snapshot <slug>
\`\`\`

Or when providing the original URL, FigmaDev will auto-detect this snapshot.
```

---

## Phase 6 — Update the Index

Read `.figma-snapshots/index.json` (create it if it does not exist with `{ "snapshots": [] }`).

- If **refreshing**: find the existing entry by `fileKey` + `nodeId` and replace it.
- If **new**: append the metadata record to the `snapshots` array.

Write the updated `index.json`.

---

## Phase 7 — Output Summary

Print the following confirmation:

```
✅ Snapshot captured successfully

  Slug:      <slug>
  Frame:     <frameName> (<fileName>)
  Viewport:  <viewport>
  Stored in: .figma-snapshots/<slug>/

To use this snapshot for code generation:
  @FigmaDev build from snapshot <slug>

Or simply provide the original Figma URL to @FigmaDev — it will auto-detect the snapshot.
```

Then print the [Usage Guide](#usage-guide).

---

## Usage Guide

> This section is also written to `.figma-snapshots/USAGE-GUIDE.md` after the first snapshot is created.

### What is a snapshot?

A snapshot is a local copy of a Figma frame's design data — node tree, screenshot, tokens, and metadata — stored in `.figma-snapshots/`. It lets you generate or update code **without needing the Figma MCP server to be running**, and serves as a versioned design reference for the team.

---

### Capturing a snapshot

```
@FigmaSnapshot https://www.figma.com/design/<fileKey>/...?node-id=<nodeId>
```

Or explicitly:

```
@FigmaSnapshot capture https://www.figma.com/design/...
```

To refresh (overwrite) an existing snapshot:

```
@FigmaSnapshot refresh https://www.figma.com/design/...
```

---

### Using a snapshot for code generation

**Option A — By slug** (no Figma connection needed):

```
@FigmaDev build from snapshot quick-od--34981-7468
```

**Option B — By URL** (FigmaDev auto-detects the snapshot):

```
@FigmaDev build https://www.figma.com/design/CPiY3lh6nqjvlj4HbhjfLG/Quick-OD?node-id=34981-7468
```

FigmaDev checks `.figma-snapshots/index.json` first. If a matching snapshot is found, it uses the local data. If not, it falls back to live Figma MCP.

---

### Using a snapshot when updating existing code

```
@FigmaDev update src/Pages/QuickOdNTB/LoanOffer/LoanOffer.Page.tsx from snapshot quick-od--34981-7468
```

---

### Listing all snapshots

```
@FigmaSnapshot list
```

This reads and prints `.figma-snapshots/index.json` in a formatted table.

---

### Snapshot folder structure

```
.figma-snapshots/
  index.json                  ← registry (all slugs, URLs, timestamps)
  USAGE-GUIDE.md              ← this guide
  quick-od--34981-7468/
    metadata.json
    design-context.json
    screenshot.png
    variables.json
    README.md                 ← frame-specific summary + quick usage
```

---

## MCP Error Block

If any Figma MCP call fails, stop and output:

---

**Figma MCP Error — Snapshot cannot be created**

| Field         | Detail                                                                                             |
| :------------ | :------------------------------------------------------------------------------------------------- |
| **Error**     | `<exact error message or HTTP status>`                                                             |
| **Figma URL** | `<the URL that was provided>`                                                                      |
| **Failed at** | `<which tool call failed: get_design_context / get_screenshot / get_metadata / get_variable_defs>` |

**How to fix**

1. `Cmd+Shift+P` → **MCP: List Servers** → check `figma` is `Running`
2. If not running: click **Start** and complete the OAuth login in the browser
3. Open a **new Copilot Chat session** after authentication
4. Retry the snapshot command

---
