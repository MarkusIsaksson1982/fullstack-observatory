# Safe Render Deploys via MCP with Grok

**Agensi Slug**: `safe-render-deploys-via-mcp`  
**Version**: 0.1.3 (initial public release)  
**Status**: Ready for human review before Agensi listing

This folder contains the canonical skill definition files for the free Agensi skill **"Safe Render Deploys via MCP with Grok"**.

## Files

- `SKILL.md` — The main skill definition (instructions + frontmatter). This is what the agent loads.
- `agents/grok.yaml` — Grok-specific interface metadata, tags, permissions, and Agensi listing hints.

## Live Demonstration

The public Documentation URL for this skill on Agensi is:

**https://hpc-observatory-mcp.onrender.com**

This Render service hosts the MCP server (`render-mcp`) plus a professional landing page that demonstrates the skill in action.

## Intended Use

- Standalone for focused Render deployment workflows with strong guardrails.
- Together with the **Cross-Platform Synchronization Hub with Grok** for multi-platform coordination (GitHub → Render, drift detection, etc.).

## Marketplace Copy

All rich marketplace copy (full HTML description, detailed use cases, sample input/output, FAQ, etc.) is maintained **internally** during the 0.1.0 → 0.2.0 iteration cycle. Agensi's automated generation will be used for the initial listing. Differences between Agensi suggestions and internal drafts will be compared in later iterations.

## Approval State

This bundle is intentionally placed in a "mainly needing human approval before listing" state. No submission to Agensi should occur until explicit confirmation is given in a session.

See the parent repository's internal documentation and the Cross-Platform Synchronization Hub for the full operating procedures, permission model, and three-way version comparison logic.