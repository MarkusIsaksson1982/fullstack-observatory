---
name: "Safe Vercel Deploys via MCP with Grok"
description: "Safely observe and control Vercel deployments from Grok. Complements (does not replace) Vercel’s automatic GitHub deploys with strong guardrails, a preferred redeploy action, and environment variable tools for cross-platform work. Includes a dedicated public demonstration deployment as Documentation URL."
version: 0.1.0
author: Markus Isaksson
license: MIT
price: 0
tags: ["grok", "mcp", "vercel", "deployment", "devops", "infrastructure", "meta", "cross-platform"]
---

# Safe Vercel Deploys via MCP with Grok

**Why This Skill Exists**

Vercel’s automatic GitHub integration is excellent for most deployments. However, agents have historically lacked a safe, first-class way to observe state or perform occasional manual actions without risking accidental deploys.

This skill gives Grok a controlled MCP surface (`vercel-mcp`) that works *with* your existing automatic deploys. It emphasizes observation by default and gates all write actions behind explicit approval and allow-lists.

## What You'll Gain

- Safe, read-only discovery of projects, deployments, and environment variables.
- The ability to trigger clean redeploys of existing deployments using the recommended `vercel.deployments.redeploy` tool.
- Controlled management of environment variables (`vercel.projects.env.*`) — especially valuable when using the Cross-Platform Synchronization Hub.
- Strong, multi-layer guardrails (`VERCEL_ALLOW_DEPLOYS` + project allow-lists).
- A live, skill-primary public demonstration deployment that serves as the official Documentation URL on Agensi.

## When to Use This Skill

Use this skill when you want an agent to:
- Inspect the current state of your Vercel projects without making changes.
- Force a redeploy of an existing deployment (e.g., after an environment variable change or to pick up a specific commit) without pushing new code.
- Maintain environment variable parity across platforms as part of a larger synchronization workflow.
- Generate high-quality living documentation of deployment decisions.

## Recommended Efficient Usage Pattern

The skill is designed for **lightweight supervision**, not for replacing automatic deploys.

**Daily recommended flow:**
1. Let normal Git pushes handle the vast majority of deployments through Vercel’s automatic integration.
2. Use the skill primarily for observation and occasional manual intervention.
3. When a redeploy is needed, prefer `vercel.deployments.redeploy` over creating a new deployment.
4. Use the environment variable tools when you need to keep configuration in sync across platforms (Hub use case).

**Guardrails (set locally in `.env`):**
```
VERCEL_ALLOW_DEPLOYS=true
VERCEL_ALLOWED_PROJECTS=your-project-id-or-slug
```

**Example starting prompt:**
> "Load the Safe Vercel Deploys via MCP with Grok skill. Start by inspecting my projects and recent deployments. I may want to force a clean redeploy on one of them later."

## Agent Operating Procedure

### Phase 1: Guardrail Verification
- Confirm `VERCEL_ALLOW_DEPLOYS=true` and that the target project is in `VERCEL_ALLOWED_PROJECTS` before any write action.

### Phase 2: Discovery (Read-only by default)
- `vercel.projects.list` / `vercel.projects.get`
- `vercel.deployments.list` / `vercel.deployments.get`
- `vercel.projects.env.list` / `vercel.projects.env.get`

### Phase 3: Gated Action
- Prefer `vercel.deployments.redeploy` when the project already uses automatic Git deploys.
- Use `vercel.projects.env.create` only when you have a clear need to update environment variables.
- Every write action requires fresh, explicit user approval.

### Phase 4: Documentation & Hub Integration
- Record outcomes using Direct File Writing with Grok.
- Feed results into the Cross-Platform Synchronization Hub so that Local / GitHub / Vercel / Agensi versions stay in sync.

## Dedicated Public Demonstration Deployment

A minimal, skill-primary public deployment is maintained in this repository under `apps/vercel-mcp/`.

- Its landing page is the canonical, skill-branded documentation and interactive demo.
- It exposes live, callable MCP tools so you can directly experience the interface the skill provides to Grok.
- It contains practical guidance on the efficient usage pattern (daily flow, guardrails, preferred `redeploy` action).
- The HPC Observatory (`https://hpc-observatory.vercel.app/`) serves as a real, high-value living example produced and managed with this skill + the Cross-Platform Hub.

Once the dedicated demo is deployed as its own Vercel project, its root URL will be set as the official **Documentation URL** on the Agensi listing for this skill. This follows the same pattern used successfully by the "Safe Render Deploys via MCP with Grok" skill.

## Works Well With

- **Cross-Platform Synchronization Hub with Grok** — The central orchestrator for GitHub ↔ Vercel ↔ Agensi workflows.
- **Direct File Writing with Grok** (v0.3.3+) — For generating permanent, versioned deployment records.
- **Task Finisher with Grok** — For cleanly closing deployment and documentation loops.

## Compatibility

Optimized for **Grok** inside the Grok Build CLI / TUI. Works with any MCP client capable of running the companion local `vercel-mcp` stdio server.

---

## Permissions

**Permission Profile**: Deployment Observation + Gated Writes (Network + Controlled Write via MCP)

**Environment Variables**:
- `VERCEL_TOKEN` (required for the local driver)
- `VERCEL_ALLOW_DEPLOYS`
- `VERCEL_ALLOWED_PROJECTS`

**Allowed Hosts**:
- `api.vercel.com`

**Notes**:
- The skill and driver are intentionally designed to **complement** Vercel’s automatic GitHub deployment workflow.
- `vercel.deployments.redeploy` is the strongly preferred manual action for projects that already use automatic deploys.
- All write operations are disabled by default and further restricted by allow-lists.
- The companion local driver (`vercel-mcp/`) is the production tool you run with Grok. The public demo deployment provides the documentation and live examples.

---

**Internal 0.0.1 Note – Marketplace URLs for Adjacent Skills**

This skill is published as part of the Cross-Platform Synchronization Hub’s multi-platform coordination (alongside the Render skill and future ones such as Smithery).

**Important**: The final Agensi marketplace listing URL and slug are only known after manual approval.

After approval:
- Check the actual live URL on Agensi.
- Update the Documentation URL reference in the dedicated demo deployment (`apps/vercel-mcp`).
- Update any self-references here if necessary.
- Propagate the correct URL into the Hub’s core documentation and living examples.

Do not assume the final marketplace URL until post-approval verification. This note was added during the initial coordinated drafting of the skill and its dedicated deployment.