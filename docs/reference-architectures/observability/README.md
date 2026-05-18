# Observability Reference Architectures

This is the central documentation for building and maintaining production-grade observability systems, using the **Full Stack Observatory** as the primary reference implementation.

## What This Is

The Full Stack Observatory is a 12-layer production reference architecture focused on observability. It covers both general full-stack systems and specialized workloads (such as HPC schedulers), with real deployments on Vercel and Render.

This documentation extracts the repeatable patterns, architectural decisions, and operational practices from that work so they can be reused.

## Structure

- [Architecture](./architecture/01-overview.md) — Core models and the 12-layer system
- [Deployment](./deployment/01-vercel-patterns.md) — How we deploy and observe systems on Vercel and Render
- [Stack](./stack/) — Metrics, logging, tracing, and alerting patterns
- [Agent Integration](./agent-integration/01-mcp-patterns.md) — Making the system accessible to AI agents via MCP
- [Evolution](./evolution/) — How to maintain and improve the reference architecture over time

## How to Use This Documentation

- **Humans**: Start with the overview and follow the links relevant to your current problem.
- **Agensi Skills**: This folder (or specific files within it) can be referenced via the Documentation URL field when publishing skills.
- **AI Agents**: Parts of this documentation are intended to be exposed through MCP servers.

## Related Work

- [Full Stack Observatory Repository](https://github.com/MarkusIsaksson1982/fullstack-observatory)
- Agensi skill: *Observability Reference Architectures with Grok* (in development)
- MCP server: `observatory-reference-docs` (planned)
