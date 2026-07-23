Refer to the following files for all coding standards, review rules, and project conventions:

- `GUIDELINES.md` — Full coding standards, React patterns, TypeScript rules, styling, and security guidelines.
- `.github/review-prompt.md` — Review rules, severity definitions, and output format for code audits.
- `.github/agents/figma-to-react.agent.md` — Figma-to-React agent: orchestrates snapshot capture, feature spec, clarifying questions, and code generation via sub-agents.
- `.github/figma-token-map.md` — Figma-to-token and Figma-to-component mapping for AI code generation from Figma MCP.
- `.github/skills/figma-to-code/SKILL.md` — Step-by-step process for generating or updating React UI from a Figma design link.
- `.github/skills/figma-snapshot/SKILL.md` — Process for capturing and storing Figma design data locally as snapshots.

## Figma Sub-Agents

- `@FigmaToReact` — **Recommended entry point.** Full Figma-to-React workflow: orchestrates snapshot capture, asks clarifying questions (including feature spec), and delegates code generation. Use for all new Figma-to-code requests.
- `@FigmaSnapshot` — Captures a Figma frame and stores it in `.figma-snapshots/` (node tree, screenshot, tokens, metadata). Use before development to cache design data offline.
- `@FigmaDev` — Generates or updates React code from a Figma design. Automatically uses a local snapshot if one exists; falls back to live Figma MCP if not.
