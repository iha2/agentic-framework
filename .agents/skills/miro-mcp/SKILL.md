---
name: miro-mcp
description: Use Miro MCP in Cursor to create diagrams, board documents, and tables on Miro boards and to read board context. Use when proposals or architecture live on Miro for stakeholder review, when the user wants flowcharts or C4-style diagrams on a board, or when extracting text from frames and documents for specs and Git pointers.
---

# Miro MCP (proposals and architecture)

This skill describes how agents should use **Miro** when the team treats boards as a **stakeholder-facing** surface for **proposals**, **architecture exploration**, or **visual alignment**—alongside Git-tracked **pointers** under `<DOCS_ROOT>/proposals/` and agent-reference markdown in `project.md` / `architecture/`, as documented in the **Agentic Software Delivery Methodology** and [`templates/AGENTS.md`](../../../templates/AGENTS.md).

## Preconditions

- **Miro MCP** is enabled and authenticated in Cursor for this workspace (see Cursor MCP settings).
- Repo **`AGENTS.md`** (or the user) supplies **board URLs**, **frame conventions**, and whether Miro is authoritative for any approval step.

If MCP is unavailable, do not pretend board reads or writes occurred. Fall back to user-supplied links and repo pointers.

## When to use this skill

- Drafting or updating **proposal visuals** (options, tradeoffs, decision flows) on a shared board.
- Creating **architecture diagrams** (flows, contexts, sequences, ER sketches) that complement markdown in `architecture/`.
- **Summarizing** board content into a proposal pointer, `project.md` update, or spec context.
- **Tables** on a board for option matrices, RACI, or milestone tracking when the team standardizes on Miro for that view.

Pair with **`proposal-builder`** and **`architecture-doc-builder`** for narrative and structure; use Miro for **spatial** and **non-technical stakeholder** consumption.

## Methodology alignment

1. Prefer **one canonical board URL** (or per-program boards) declared in `AGENTS.md`.
2. After material Miro changes, update or create the **Git pointer** under `<DOCS_ROOT>/proposals/` (title, owner, status, link, last reviewed).
3. Keep **`project.md`** / **`architecture/*.md`** in sync with board decisions per repo policy—agents update markdown when asked; humans own approval of authoritative surfaces.

## Miro MCP tools (summary)

Tool names and parameters follow the **installed Miro MCP server**; always read the live tool schema in Cursor before calling. Typical surface area:

| Intent | Typical tools |
| ------ | ------------- |
| Discover board layout | Explore/list context tools for frames, docs, diagrams, tables |
| Create diagram from description | Diagram creation (flowchart, mindmap, UML-style, and similar types per server) |
| Create or edit board document | Document create/update with markdown-style structure |
| Tables | Table create and row sync for matrices and status grids |
| Deep read one item | Context get on a specific widget URL (often with `moveToWidget` in the URL) |

**Board URLs:** Miro links like `https://miro.com/app/board/<boardId>=/` (and URLs with `moveToWidget` / `focusWidget` for item focus) are the usual inputs.

**Placement:** Boards use a coordinate system centered at `(0, 0)`; space large artifacts (~2000–3000 units) apart unless the server defaults otherwise. Use **`parent_id`** (frame id) when content must live inside a named frame for governance.

## Operating rules

1. **Read MCP tool schemas first** — do not guess required fields.
2. **Do not invent** board IDs, team IDs, or OAuth flows; use repo config or the user.
3. **Sensitive data** — follow corporate policy; do not duplicate restricted content into Git if policy forbids it; pointers may be enough.
4. **Traceability** — PRs and specs should link the board or frame URL when Miro is part of the decision record.

## Related skills

- `proposal-builder` — decision narrative and repo pointers.
- `architecture-doc-builder` — markdown architecture and ADR-style notes.
- `spec-builder` — bounded execution contracts after direction is agreed.

## Further reference

The Cursor **Miro** extension may ship a fuller **`miro-mcp`** skill in the plugin cache with extended examples (DSL, Mermaid, table columns). This repository copy stays **methodology-focused** and **shorter**; extend here if your org adds mandatory frames, tags, or review gates on Miro.
