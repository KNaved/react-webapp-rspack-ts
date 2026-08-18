---
name: figma-to-react-code
description: 'Generate or update production-ready React components/pages from a Figma design link, using the project design system. Use when: a Figma URL is provided, "implement this design", "convert Figma to code", "generate UI from Figma", "update component from Figma".'
argument-hint: 'Figma frame or page URL (e.g. https://www.figma.com/design/<fileKey>/...?node-id=...)'
---

# Figma → React Code Skill

Convert a Figma design into production-ready React + TypeScript code that follows this project's conventions, design system, and guidelines.

## Reference Files (always load before generating any code)

- `.github/figma-token-map.md` — Token mappings, Design System component map, and enforcement rules.
- `GUIDELINES.md` — React/TypeScript code standards, naming conventions, and file structure.

---

## Phase 1 — Analyze the Figma Link

> **CRITICAL GATE**: Phase 1 must succeed fully before any other phase begins. If the Figma frame cannot be read for **any reason**, stop immediately, report the error, and do **not** ask Phase 2 questions or generate any code.

### 1.1 — Parse URL and Fetch Design Context

1.  Extract `fileKey` and `nodeId` from the Figma URL.
    - Convert `-` to `:` in `nodeId` (e.g., `2397-120172` → `2397:120172`).
    - For branch URLs (`.../branch/:branchKey/...`), use `branchKey` as the `fileKey`.
2.  Call the Figma MCP `get_design_context` tool with the `fileKey`, `nodeId`, `clientFrameworks: 'react'`, and `clientLanguages: 'typescript'`.

### 1.2 — Handle Failure

If the tool returns an error or no node data, output the following structure:

---

**Figma MCP Error — Cannot proceed**

| Field         | Detail                                                      |
| :------------ | :---------------------------------------------------------- |
| **Error**     | `<exact error message or HTTP status returned by the tool>` |
| **Figma URL** | `<the URL that was provided>`                               |

**What this means**

_One or more of the following caused this failure:_

1.  **MCP server is not running** — The Figma MCP server must be started in VS Code.
2.  **Not authenticated** — The server may be running but OAuth login has not been completed.
3.  **No access to this file** — Your Figma account may not have view permission for this file.
4.  **Token/session expired** — A previously valid session may have expired.

**How to fix**

1.  Open the VS Code Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`).
2.  Run **"MCP: List Servers"** and check that the `figma` server is listed.
3.  If its status is not `Running`, click **Start**.
4.  Complete the OAuth login flow that opens in the browser.
5.  **Open a new Copilot Chat session** (the current session does not pick up a newly started server).
6.  Paste the same Figma URL again.

---

### 1.3 — On Success, Build the Node Inventory

If `get_design_context` returns valid data, analyze the design:

1.  **Component hierarchy**: parent/child relationships, nesting.
2.  **Layout**: flex direction, alignment, wrapping, gaps.
3.  **Typography**: font family, weight, size, line-height.
4.  **Colors**: hex values.
5.  **Spacing**: pixel values for padding, margins, etc.
6.  **Border radius**.
7.  **Interactive states**: selected, disabled, hover.
8.  **Data patterns**: repeated items suggesting lists.
9.  **Viewport**:
    - Width ≤ 430px → **Mobile** view.
    - Width ≥ 768px → **Desktop** view.
    - Width between 431–767px → **Tablet** (treat as mobile).
10. **Icon / Graphic Classification** — for every non-text, non-layout node, tag it before writing any code:
    - `REMIX_ICON` → implement as `DsRemixIcon`
    - `SVG_ASSET` → SVG file in `src/AssetFiles/images/`
    - `DS_COMPONENT` → DS primitives (`DsBox`, `DsStack`, etc.)
    See §5.9 for the full decision rule and signals.
11. **Colour per-node attribution** — when the parent node's design context lists two or more colour tokens, do NOT assign them to child elements by inference. Call `get_design_context` on each relevant child node individually. Each sub-node response maps exactly one token set to exactly one element — use that, not the parent's combined list.

---

## Phase 2 — Ask Clarifying Questions

Ask all required questions upfront in a single message.

**Required questions (always ask):**

**Q1 — Intent**: "Is this a new UI to build, or an update to an existing component/page?"

**Q2 — Viewport** (ask only if a view is missing):

- If Figma link is **mobile only**: "This appears to be a mobile view. Do you have a desktop Figma link as well? If yes, please share it. If this is mobile-only, I'll build responsively from mobile."
- If Figma link is **desktop only**: "This appears to be a desktop view. Do you have a mobile Figma link as well? If yes, please share it. If desktop-only, I'll adapt spacing for mobile using breakpoints."

**Q_SPEC — Feature Spec** (always ask): "Do you have a feature spec file for this feature? If yes, provide the relative path (e.g. `src/Pages/Home/home.spec.md`). If not, type 'no' to skip."

- If the user provides a path: read the spec file fully and store its contents as **Spec Context**. This context will be passed to the code generation phase to inform API contracts, variant conditions, business logic, validation rules, and navigation flow.
- If the user answers 'no' or does not provide a path: continue without a spec. The agent will infer everything from the Figma design alone.

### If answer to Q1 is **Update existing**:

**Q3**: "Please provide the relative path to the file you want to update (e.g. `src/Pages/Home/Home.Page.tsx`)."

Then skip to Phase 3.

### If answer to Q1 is **New UI**:

**Q4**: "Is this a full page or a reusable component?"

- **Page** → continue to Phase 4A
- **Component** → continue to Phase 4B

---

## Phase 3 — Update Existing File

### 3.1 — Read and Map the Existing File

1.  Read the target file fully.
2.  Build a **UI Element Map** of JSX tags and their visual props (`direction`, `gap`, `variant`, etc.).
3.  Build a **Logic Anchor Map** of non-UI code (`onClick` handlers, hooks, selectors, props).

### 3.2 — Match Figma Nodes to JSX Elements

Match by priority: component type, then text content, then position/hierarchy. Document each match.

### 3.3 — Decide What to Change vs. Preserve

| Figma owns (safe to update)                    | Code owns (never modify)                    |
| :--------------------------------------------- | :------------------------------------------ |
| `variant` prop on DS components                | `onClick`, `onChange` handler refs          |
| `gap`, `padding`, `direction` on layout        | All `use...` hook calls                     |
| CSS variables for color in `sx` or `className` | All `useAppSelector`/`useAppDispatch` calls |
| Static `DsTypography` text content             | Props interface and prop types              |
| Swapping one DS component for another          | Redux action dispatches                     |
| Border radius tokens in `sx`                   | Conditional logic (`isLoading`, etc.)       |

### 3.4 — Handle Edge Cases

- **New element**: Add it with a `// TODO: wire handler` comment.
- **Removed element with logic**: Stop and ask before removing.
- **Restructured layout**: Restructure the wrapper but keep children and their logic intact.
- **Raw hex color**: Check `figma-token-map.md`. If not found, ask the user.
- **Ambiguous match**: Ask the user to clarify.
<!-- FIX 2: Matching a reference component's padding/spacing by value alone is not enough.
     The container that carries the padding matters as much as the value itself.
     A parent wrapper and a child container have different visual effects even with equal values.
     Always read the reference component's source to verify which element holds the padding. -->
- **Matching an existing component's padding/spacing**: Read that component's source file first. Apply the same *container scope* the reference uses (i.e. which element carries the padding), not just the same value.

---

## Phase 4A — New Page

### 4A.1 — Determine File Placement and Routing

1.  Propose a file path following this structure:
    ```
    src/Pages/<Domain>/<PageName>/
      <PageName>.Page.tsx       ← main page component
      <PageName>.Page.scss      ← page-scoped styles (if needed)
      Components/               ← sub-components used only on this page
        <SubComponentName>.tsx
      Hooks/
        use<PageName>.ts        ← business logic hook
    ```
    Ask the user: "Which domain does this page belong to? (e.g. Home, Product, CommonModule)"
2.  Search `src/Routes/` for the appropriate routes file (e.g. `*_APP_ROUTES.ts`, `*_ROUTES.tsx`). Read the existing pattern and propose:
    - A new route constant entry in `*_APP_ROUTES.ts`
    - A new lazy-loaded page entry in `*_ROUTES.tsx`
3.  Ask: "Should I also add the route entry, or will you handle routing separately?"

### 4A.2 — Identify and Reuse Code

Search the codebase for:

- Any `CONSTANTS` file that would apply (e.g. error codes, form keys, strings)
- Any existing helper in `src/Helpers/` that the new page might reuse
- Any existing hook in `src/Hooks/` that covers needed behaviour
- Any existing domain slice in `src/Redux/` if data-fetching is involved

List what you found and confirm with the user before importing anything.

### 4A.3 — Generate the Page

Create the page with:

- Functional component, `React.FC<I<PageName>Props>`, explicit return type `React.ReactElement`
- `Readonly<I<PageName>Props>` interface
- Custom hook `use<PageName>` with blank handler bodies and `// TODO:` comments for logic
- All DS components from `figma-token-map.md` component map
- All tokens from `figma-token-map.md` — no raw hex, no raw px values
- `React.lazy` import in the routes file if routing is included
- `withBreakpoints` HOC wrapping if both mobile + desktop views are provided

---

## Phase 4B — New Component

### 4B.1 — Determine File Placement

Ask: "Is this component reusable across pages, or specific to one page?"

- **Reusable**: place in
  ```
  src/Components/<ComponentName>/
    <ComponentName>.tsx
    <ComponentName>.scss      ← only if needed
    <ComponentName>.Types.ts  ← only if types are complex
  ```
- **Page-specific**: place in
  ```
  src/Pages/<Domain>/<PageName>/Components/<ComponentName>.tsx
  ```

### 4B.2 — Generate the Component

- Functional component with explicit `React.FC<I<ComponentName>Props>` and return type `React.ReactElement`
- `Readonly<I<ComponentName>Props>` for all props
- Blank handler bodies for any interactive elements: `const handleXxx = (): void => { /* TODO */ }`
- DS components only — no raw `<div>`, `<button>`, `<input>` unless wrapping a DS component
- Tokens only — no hardcoded values

---

## Phase 4C — Handle Data Patterns (if applicable)

If the design shows data-driven UI (lists from API, user data, etc.):

1. Create typed interfaces for the API response.
2. Create a service file in `src/Redux/<Domain>/Services/`.
3. Create selectors in `src/Redux/<Domain>/Selectors.ts`.

<!-- FIX 3: Service outcomes must be agreed with the user before any service call is written.
     Silent .catch(() => {}) blocks made failures invisible — the feature appeared broken
     because errors produced no feedback. The three questions below are mandatory.
     Never write a .then()/.catch() block without answers to all three. -->
**Before implementing any service call**, ask the user:
> - **Succeeds** — what should happen? (e.g. navigate to a route, show a success toast, close a modal)
> - **Fails** — what should happen? (e.g. show an error toast, display an inline error, stay on screen)
> - **Times out / network error** — same as failure, or different?

Then implement all three outcomes explicitly based on the user's answers.

> **Never write an empty `.catch(() => {})`.** It is a 🔴 Error finding in Phase 6 review and makes service failures invisible to the user. Minimum on failure: call `enqueueSnackbar` with `variant: 'error'` and a descriptive message.

---

## Phase 5 — Code Generation Rules & Conventions

### 5.1 — Map to Design System

Map every visual element to a `@am92/react-design-system` component using the mapping table in `.github/figma-token-map.md`.

If no DS equivalent exists:

- Prefer extending DS primitives (`DsBox` with `sx`) over creating from scratch
- Only create custom components as a last resort

### 5.2 — Use Design Tokens

Always use CSS variables from `.github/figma-token-map.md` for colors, spacing, and border-radius. **NEVER hardcode values.**

<!-- FIX 1: Spacing tokens must be verified before use — never assumed from memory.
     Token names do not map intuitively to px values.
     E.g. quickFreeze=4px, glacial=8px, frostbite=12px, bitterCold=16px, cool=20px, mild=24px.
     Assuming them from name alone has caused visible spacing bugs in production. -->
> **Token verification (mandatory before writing any `dsSpacing.*` call):** Open `.github/figma-token-map.md` and read the spacing table to confirm the exact token name → px mapping. Do not rely on memory or inference from the token name.

### 5.3 — Key Rules

- **Max 200 lines per file**: Split larger components into smaller, single-responsibility sub-components.
- **All handlers in custom hooks**: Components must be purely presentational. All logic (`handleClick`, etc.) must live in a custom hook.
- Use the `sx` prop for styling with DS CSS variables.
- Use the `variant` prop on `DsTypography` for text styling.
- Use `DsStack` for flex layouts and `DsBox` as a general container.
- Type all props with a `Readonly<I<Name>Props>` interface.
- Use `import type` for type-only imports.
- Use `useCallback` for handlers passed to child components and `useMemo` for expensive computations.
- Lazy load route-level pages and use `React.memo` for pure presentational components.
- Include `aria-*` attributes for accessibility.
- Use semantic HTML elements.

### 5.4 — File Naming Conventions

| File type | Convention                     | Example             |
| :-------- | :----------------------------- | :------------------ |
| Page      | `<Name>.Page.tsx`              | `Home.Page.tsx`     |
| Component | `<Name>.tsx` (PascalCase)      | `UserCard.tsx`      |
| Hook      | `use<Name>.ts`                 | `useHomePage.ts`    |
| Constants | `<NAME>.ts` (UPPER_SNAKE_CASE) | `APP_ROUTES.ts`     |
| Types     | `<Name>.types.ts`              | `UserCard.types.ts` |
| Services  | `<name>.Service.ts`            | `auth.Service.ts`   |
| Utilities | `<name>.util.ts`               | `format.util.ts`    |

### 5.5 — Component Template

```tsx
import type { FC } from 'react'
import { DsBox, DsTypography } from '@am92/react-design-system'

import type { I<ComponentName>Props } from './<ComponentName>.types'

const <ComponentName>: FC<I<ComponentName>Props> = ({ prop1, prop2 }) => {
  return (
    <DsBox sx={{ padding: 'var(--ds-spacing-bitterCold)' }}>
      <DsTypography variant="bodyRegularMedium">
        {prop1}
      </DsTypography>
    </DsBox>
  )
}

export default <ComponentName>
```

### 5.6 — Responsive Design

- Use `withBreakpoints` HOC for components that need different layouts per viewport.
- Use `getDeviceActiveScreen(breakpoints)` for conditional rendering.
- Apply responsive `sx` values: `{ xs: 'var(--ds-spacing-glacial)', md: 'var(--ds-spacing-cool)' }`.

### 5.7 — What NEVER to Do

<!-- FIX 6: Visual props and UI elements were added from convention, pattern-matching from
     other screens, or intuition — not from the Figma node. Examples: topBorder on BottomSticker
     rendered a visible divider that wasn't in the design; icons added to buttons that had none
     in Figma. The blockquote below is the single guard against all assumption-based bugs.
     It applies to every visual property without exception. -->
> **Figma is the only source of truth for every visual prop, element, and layout detail.**
> Before adding any prop, icon, border, divider, shadow, color, or spacing value — confirm it
> is explicitly visible in the Figma node. Convention, intuition, and pattern-matching from
> other screens are **not** valid sources. When in doubt, check the Figma node before writing.

- Never set `style={{ color: '#97144D' }}` — use CSS variable.
- Never set `style={{ padding: '16px' }}` — use spacing token.
- Never set `fontSize` manually on a `DsTypography` — use `variant`.
- Never add a new custom SCSS class for something a DS component prop already handles.
- **Never approximate an `SVG_ASSET` node with CSS** (stacked `DsBox` layers, `border-radius` circles, rotated elements, grid overlays). CSS composites cannot be visually verified without a live browser render and require multiple fix iterations. Classify the node using §5.9 and use the correct path.

### 5.8 — DsButton Audit Checklist

<!-- FIX 5: Button props were written from convention rather than from the Figma node.
     This caused wrong `size`, unwanted icons (ri-download-line added to a text-only button),
     and incorrect wrapper behavior (topBorder on BottomSticker that had no divider in Figma).
     Every property in the table below must be confirmed against the Figma node before writing.
     Note: topBorder is just one example of Fix 6 — the Figma-truth rule above covers all cases. -->
Before writing any `DsButton`, verify each property directly from the Figma node. Do **not** infer from context or convention:

| Property | What to verify in Figma | Common mistake to avoid |
| :--- | :--- | :--- |
| `variant` | Is the button filled (contained), outlined, or text-only? | Defaulting to `contained` without checking |
| `size` | What height/size tier does Figma specify? | Using the wrong size tier |
| `startIcon` / `endIcon` | Is there literally a visible icon element in the Figma node? | Adding an icon because the context "seems to call for one" |
| Wrapper context | What wraps the button? Check wrapper props separately against Figma | Adding wrapper props (e.g. dividers, borders) not shown in Figma |

### 5.9 — Icon and Graphic Asset Decision Rule

<!-- FIX: A composite vector icon (circle + calendar + diagonal line) was approximated with a
     CSS grid overlay of DsBox elements instead of being saved as an SVG file. The CSS approach
     could not be verified without a live browser, produced colour mismatches (wrong token on
     circle border), and required three separate fix iterations. The rules below prevent this
     by classifying graphic nodes before any code is written and requiring asset scans and
     user confirmation before any new file is created. -->

#### 5.9.1 — Classification signals

| Signal | Classification | Implementation |
| :--- | :--- | :--- |
| Single `<instance>` child + standard icon size (16/20/24/32 px) + one colour token | `REMIX_ICON` | `DsRemixIcon className='ri-...'` |
| Any `<vector>` child present | `SVG_ASSET` | SVG file in `src/AssetFiles/images/` |
| Multiple layered children (shape + icon + line, etc.) | `SVG_ASSET` | SVG file in `src/AssetFiles/images/` |
| Non-standard size + multiple colour tokens | `SVG_ASSET` | SVG file in `src/AssetFiles/images/` |
| Layout-only node | `DS_COMPONENT` | DS primitives |

#### 5.9.2 — For `REMIX_ICON` nodes

1. Check the child instance node's name. If it contains the full remix path (e.g. `remix-icons/line/business/calendar-line`) the `ri-*` class is directly readable from it.
2. If the name is a **generic slot name** (`trailing_icon`, `icon`, `leading_icon`, `icon_button`, etc.) — **always get a screenshot** of that node before writing any class. Never leave a placeholder or guess the class from context.
3. Call `get_design_context` on the child instance node individually (not from the parent) to get the exact colour token.

#### 5.9.3 — For `SVG_ASSET` nodes

<!-- FIX (2026-08-10): A candidate match (`no-transactions.svg`) was found by scanning, then judged
     a match by the agent itself — comparing hex colours and rotation angles read from the SVG
     source against the Figma design context. The agent then stated "I'll reuse it" as a decision
     instead of a question. The user later confirmed it was NOT the intended asset. Reading
     matching numbers out of source code is not proof of a visual match — only the user can
     confirm that. The steps below make user confirmation mandatory and non-optional. -->

1. **Scan existing assets first.** Run `list_dir src/AssetFiles/images/` and check for files whose names suggest the same visual pattern (e.g. `no-data`, `empty`, `calendar`, `no-orders`).
2. **If a candidate is found, do not judge the match yourself.** Comparing hex values, rotation angles, or path shapes read from the file is a heuristic for finding a *candidate* only — it is never sufficient grounds to decide reuse. Present the candidate and ask:
   > "I found **`<filename>`** which may match this design. Can you confirm — is this the same asset? Reply **reuse** to use it, or **download** to fetch the exact asset from Figma instead."
   - Wait for an explicit answer. A declarative statement like "I'll reuse X" does not satisfy this — it must be phrased as a question and answered before any code references the asset.
3. **If no candidate is found, or the user chooses download:** call `download_assets` on the node and save the returned bytes verbatim — never hand-author, approximate, or reconstruct the SVG from JSX/CSS reference code.
4. **If `download_assets` is unavailable** (the tool is disabled or not permitted): do **not** fall back to creating or approximating the SVG yourself. Tell the user the tool isn't available and either ask them to enable it, or give them the exact command (e.g. the `curl` command against the Figma export URL) to run themselves and confirm once the file is saved.
5. **Ask the user for the file name** before writing any new asset:
   > "What would you like to name this asset file? (e.g. `no-orders.svg`)"
   Never self-assign the name.
6. Call `get_design_context` on **each child node individually** to get the correct colour token per element when documenting the asset. Never assign colours from the parent node's combined token list.
7. Add an entry to `src/Constants/ASSET_MAP.ts` and use `DsImage` with the asset's `srcSet` in the component.

---

## Phase 6 — Output and Validation

### 6.1 — Present and Confirm

Present results in this format before writing:

1. **Design Analysis** (2-3 sentences) — what the design shows
2. **Component Mapping** — table of Figma elements → DS components used
3. **Generated Files** — list of every file to be created/updated with paths
4. **Integration Notes** — any wiring needed (routes, state, handlers)

For **updates**, also show a diff-style summary of every changed line with a brief reason.

Then ask for confirmation: "Ready to write these changes. Shall I proceed?"

### 6.2 — Post-Generation Validation

After ALL files are written, run these checks in order:

1. **Corruption Check**: Read back each generated file and verify there are no garbled/repeated characters. If any file appears corrupted (repeated fragments, missing closing tags), delete and regenerate it.
2. **Prettier**: Run `npx prettier --write "<path>/**/*.{ts,tsx}"`. Prettier is the source of truth for formatting.
3. **ESLint**: Run `npx eslint "<path>/**/*.{ts,tsx}"`. Fix errors in-place. Common issues: import sorting, unused variables, missing types. Run `npx eslint --fix` for auto-fixable issues.
4. **TypeScript Check**: Verify no compile errors using the IDE error checker. Fix any type mismatches, missing imports, or incorrect prop types.
5. **Self-Check**: Run a self-check against `GUIDELINES.md §1–§6`. Report any rules that could not be satisfied and why.
6. **CodeAuditor Review**: Invoke the **CodeAuditor** agent to review all generated files:
   ```
   Review these newly generated files against GUIDELINES.md and .github/review-prompt.md:
   <list all generated file paths>
   Provide findings grouped by severity. Focus on: hardcoded values, missing design tokens, incorrect DS component usage, missing accessibility attributes, and performance issues.
   ```
   Fix all 🔴 Error findings immediately. Fix 🟡 Warnings if the fix is straightforward. Note 🔵 Info items but do not fix unless trivial.
7. **Final Summary**: After all checks pass, present:

| Check       | Status                 |
| :---------- | :--------------------- |
| Corruption  | ✅ Clean               |
| Prettier    | ✅ Formatted           |
| ESLint      | ✅ No errors           |
| TypeScript  | ✅ No errors           |
| Self-Check  | ✅ All §1–§6 satisfied |
| CodeAuditor | ✅ All errors fixed    |

---

## Critical Constraints

- **Context window limit (80%)**: If token usage exceeds 80%, **STOP** and inform the user to select smaller Figma frames. Do not attempt to continue generating code past this threshold.
- **NO Tailwind**: This project does not use Tailwind CSS.
- **NO hardcoded values**: Always use `var(--ds-spacing-*)`, `var(--ds-colour-*)`, `var(--ds-radius-*)`.
- **NO raw HTML** when a DS component exists.
- **NO `any` type**: Use proper TypeScript typing.
- The Figma MCP returns reference code that must be **FULLY ADAPTED** to the project stack.
- If Code Connect snippets are present, use the mapped component directly from the codebase.
