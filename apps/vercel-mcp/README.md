# vercel-mcp (Dedicated Demo Deployment)

**Draft skeleton** for the canonical public demonstration of the **"Safe Vercel Deploys via MCP with Grok"** skill.

This is the Vercel-side equivalent of `apps/mcp-server` (the live Render skill demo at hpc-observatory-mcp.onrender.com).

## Purpose

- Provide a **skill-primary** public landing page that can serve as the official Documentation URL on Agensi.
- Eventually host a lightweight Streamable HTTP MCP surface (read-only or user-supplied token demo mode).
- Clearly separate the dedicated skill demo from the rich HPC Observatory content (which remains a high-value living example produced *by* the skill).

## Current State (Draft 0.0.1)

- Beautiful, self-contained landing page (Tailwind CDN, no build step).
- Hero, value props, "How it works", and explicit link to the HPC Observatory as a real outcome.
- "DRAFT — WORK IN PROGRESS" banner.
- Basic Express server with health check and placeholder `/mcp` routes.
- Guardrail philosophy documented (complements automatic GitHub deploys, prefers `vercel.deployments.redeploy`).

The actual production driver you run with Grok lives in the sibling `vercel-mcp/` directory at the root of the development tree (local stdio server).

## Running Locally

```bash
cd apps/vercel-mcp
npm install
npm run dev
```

Open http://localhost:3000 — you will see the skill-first landing.

## Deployment

Intended to be deployed as its own Vercel project (separate from `hpc-observatory.vercel.app`).

Once promoted out of draft:
- The root of this deployment becomes the primary Agensi Documentation URL.
- The HPC Observatory site (`hpc-observatory.vercel.app`) will contain a clean meta-reference: "Official live demonstration of the skill".

## Relationship to Other Artifacts

- Companion local driver: `vercel-mcp/` (the one you actually connect to Grok)
- Skill definition: `vercel-mcp/SKILL.md` + `agents/grok.yaml`
- Cross-Platform Synchronization Hub docs
- Living example record: `grok/agensi/skills/working-state/internal/.../vercel-skill-demo-landing-page-adaptation-2026-05-20.md`

This structure preserves the HPC Observatory as valuable content while giving the Vercel skill the clean, dedicated public face it deserves — exactly parallel to the Render precedent.

---

**Status**: Draft skeleton created under Option C (hybrid/staged) of the Vercel living example. Awaiting further iteration and explicit approval before full promotion or live deployment.