# Safe Vercel Deploys via MCP with Grok

This is the public Agensi skill for safely observing and controlling Vercel deployments using Grok and the Model Context Protocol.

## Files in This Bundle

- `SKILL.md` — The main skill definition and documentation (published to Agensi)
- `agents/grok.yaml` — Grok-specific interface metadata
- `safe-vercel-deploys-via-mcp.zip` — Convenient archive of the above files

## Companion Source Code (Referenced)

This skill has two main companion codebases (both in the monorepo):

- **Local driver**: `vercel-mcp/` (the stdio MCP server you actually run with Grok)
- **Dedicated public demonstration deployment**: `apps/vercel-mcp/` (skill-primary landing page + live MCP tools — becomes the Documentation URL on Agensi)

Full source for both is available in the repository. The skill bundle itself only contains the definition files.

## Documentation & Demo

The dedicated demo deployment (`apps/vercel-mcp`) serves as the official Documentation URL on Agensi.

It includes:
- Skill-primary landing page
- Live, callable MCP demo tools
- Detailed guidance on the efficient usage pattern (recommended daily flow, guardrails, preferred `redeploy` action)
- The HPC Observatory as a real living example

Once deployed, its root URL will be linked from the Agensi listing.

## Related Skills

- Cross-Platform Synchronization Hub with Grok
- Direct File Writing with Grok (for living documentation)
- Safe Render Deploys via MCP with Grok (the precedent this skill follows)

## Status

Ready for Agensi marketplace upload (coordinated with dedicated demo deployment).