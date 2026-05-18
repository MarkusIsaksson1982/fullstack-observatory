# Observability Skills Ecosystem

This page provides an overview of the skills related to observability in the Agensi catalog and how they connect to the **Full Stack Observatory** — a 12-layer production reference architecture.

The goal of this ecosystem is to offer both high-level architectural thinking and practical implementation guidance, while also making observability systems more accessible to AI agents through MCP.

## The Two Core Observability Skills

| Skill | Price | Focus | Best Used When | Primary Connection to Observatory |
|-------|-------|-------|----------------|-----------------------------------|
| **Observability Reference Architectures with Grok** | Free | Architectural models, system design, long-term evolution, and agent accessibility | You need to design or evaluate observability at a strategic or reference-architecture level | The primary reference implementation (12-layer model, deployment patterns, documentation standards) |
| **Observability Bootstrapper with Grok** | $5 | Concrete instrumentation, OpenTelemetry (or vendor tools), phased rollout, and production implementation | You are ready to implement observability in a specific service or codebase | Provides the implementation patterns that support the architectures described in the reference skill |

## Recommended Usage Paths

### Path A – Architectural First (Recommended for new systems or major redesigns)
1. Start with **Observability Reference Architectures with Grok**
2. Move to **Observability Bootstrapper with Grok** for implementation
3. Use **Getting Started with Agensi MCP** to expose relevant parts of the system to agents

### Path B – Implementation First (Good for existing services)
1. Start with **Observability Bootstrapper with Grok** if you need to instrument something quickly
2. Later refer to **Observability Reference Architectures with Grok** to improve structure and long-term maintainability

## Connection to Agent Tooling and MCP

The Observatory is intentionally designed to be partially agent-accessible. Skills in this ecosystem increasingly consider how documentation, architecture decisions, and operational data can be exposed via MCP servers (such as the planned `observatory-reference-docs` server).

This enables agents to:
- Retrieve architectural patterns
- Understand deployment and observability decisions
- Query relevant parts of the system (future)

## Related Higher-Level Skills

The following $10 skills can benefit from the observability ecosystem when making portfolio-level decisions:

- **Skill Catalog Strategy & Optimization with Grok**
- **Agensi Portfolio Optimizer with Grok**

These skills can reference the Observatory and its supporting skills when evaluating how observability capabilities should be developed, documented, or prioritized across a catalog.

## Current Status

This ecosystem is still maturing. The following elements are in progress or planned:

- Expansion of the reference documentation in this repository
- Development of the `observatory-reference-docs` MCP server
- Tighter integration between the skills and the living documentation in the Full Stack Observatory repo

Because the ecosystem is evolving, some cross-references between skills and documentation may still be in development. Each skill documents its current level of integration in its own Known Limitations section.

## Documentation & Source

- Main reference repository: [Full Stack Observatory](https://github.com/MarkusIsaksson1982/fullstack-observatory)
- This page and related documentation: `docs/reference-architectures/observability/`
- Individual skill documentation is linked from each skill’s Agensi listing
