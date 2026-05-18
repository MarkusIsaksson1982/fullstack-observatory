# Agent Integration via MCP

One of the goals of the Full Stack Observatory is to make production patterns accessible not only to humans but also to AI agents.

## Why This Matters

As more engineering work is done with agents, having high-quality, structured reference material that agents can query becomes increasingly valuable.

## Current Approach

We expose parts of the Observatory through the Model Context Protocol (MCP). This allows agents to:

- Retrieve architectural patterns
- Get deployment guidance for Vercel and Render
- Understand observability decisions
- (Future) Query live system state

## Planned MCP Server

**Name**: `observatory-reference-docs`

**Initial Scope**:
- Architecture overviews
- Deployment patterns
- Agent integration guidance

**Hosting**: Currently running on Render (`hpc-observatory-mcp.onrender.com`)

## Design Principles

- Start narrow and useful
- Keep documentation as the source of truth
- Make the server portable between platforms (Smithery, Glama, Official Registry)
