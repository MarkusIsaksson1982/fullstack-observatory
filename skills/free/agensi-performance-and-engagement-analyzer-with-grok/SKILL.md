---
name: "Agensi Performance & Engagement Analyzer with Grok"
description: "A data-driven skill that analyzes live Agensi marketplace signals (downloads, votes, reviews, and engagement patterns) to identify what drives traction and conversions, with particular focus on high-signal users and content archetypes."
version: 1.0.0
author: Markus Isaksson
license: MIT
price: 0
tags: ["grok", "agensi", "analytics", "market-intelligence", "performance-analysis", "mcp", "meta", "free"]
---

# Agensi Performance & Engagement Analyzer with Grok

**Why This Skill Exists**
The Agensi platform generates meaningful signals through downloads, votes, reviews, and user behavior. However, while this data exists natively, turning it into reliable, systematic insight is not immediately obvious. Many creators lack a clear starting point or repeatable process for analyzing platform performance in a structured way. This creates a significant disadvantage: significant time and effort can be invested in building skills without a clear feedback loop on which themes, formats, or positioning approaches actually resonate.

This skill treats the Agensi platform itself as a complex system that can be observed and understood. By pulling live data through MCP and analyzing engagement signals — especially the difference between high-signal users and broader consumer behavior — it turns raw marketplace activity into actionable intelligence for skill development and portfolio strategy.

## What You'll Gain

- A repeatable process for extracting and structuring Agensi marketplace data
- The ability to distinguish between different user segments (high-signal users vs. general consumers) and what each group responds to
- Insights into which content archetypes, skill types, and positioning approaches currently drive traction
- Data-informed recommendations for what to build, improve, or deprecate
- A foundation for running regular platform intelligence reviews of your own catalog

## When to Use This Skill

Use this skill when:
- You want to understand what is currently working on the Agensi platform before deciding what to build next
- You are preparing a new skill or major update and want data on similar successful examples
- You want to analyze performance differences between your own skills and comparable ones on the platform
- You are running periodic reviews of your skill portfolio and want fresh marketplace signals
- You are exploring new verticals or positioning approaches and need evidence of demand

**When You DON’T Need This Skill**
- You are purely focused on executing a skill you have already decided to build
- You only need basic discovery of existing skills (use the Free Skill Explorer instead)
- You are looking for implementation help rather than strategic or market insight

## Agent Operating Procedure

When this skill is activated, follow the process below in order.

### Phase 1: Define the Analysis Scope
Clarify what you want to analyze (e.g., a specific vertical, price tier, content type, or comparison against your own catalog). Establish time windows and any relevant user segments (e.g., high-signal users vs. general users).

**Hard Stop:** Do not proceed until the scope and questions are clearly defined.

### Phase 2: Data Collection via MCP
Use available Agensi MCP tools to pull relevant marketplace data, including skill listings, engagement signals, voting data, reviews, and creator information where accessible.

### Phase 3: Segment and Pattern Analysis
Analyze the data to identify meaningful patterns. Pay particular attention to differences between high-signal users and general consumers. Look for correlations between skill characteristics (format, depth, positioning, domain) and engagement outcomes.

### Phase 4: Generate Insights and Recommendations
Translate patterns into clear, actionable recommendations. This includes content archetypes that appear to be working, gaps or underserved areas, positioning opportunities, and specific skills worth studying more closely.

### Phase 5: Produce Structured Intelligence Output
Deliver the findings in a consistent, agent-readable format that can be consumed by higher-level strategy and portfolio skills.

## Expected Output Contract

You must produce an **Agensi Platform Intelligence Report** containing at minimum:

- Scope and questions being answered
- Key data sources used
- Engagement patterns observed (with emphasis on high-signal users vs. general consumers)
- Notable archetypes or positioning approaches that appear to perform well
- Specific recommendations for skill development or portfolio adjustments
- Suggested follow-up questions or deeper analysis areas

## Common Pitfalls to Avoid

| Don’t Do This                                      | Do This Instead                                              |
|----------------------------------------------------|--------------------------------------------------------------|
| Treating all downloads and votes as equal signals  | Segment by user type (high-signal users vs. general consumers) |
| Drawing strong conclusions from very small sample sizes | Note sample size and confidence level explicitly             |
| Only looking at your own skills                    | Compare against relevant peers and category leaders          |
| Ignoring the difference between free and paid dynamics | Account for price tier when analyzing performance            |

## Quick Start Prompt

I want to understand what is currently working on the Agensi platform, especially around [topic or vertical, e.g. "meta skills" or "observability"].

Please apply the Agensi Performance & Engagement Analyzer with Grok skill. Start with Phase 1 (defining the analysis scope) and use live marketplace data where available.

## Works Well With

- **Skill Catalog Strategy & Optimization with Grok** ($10) — Uses the insights from this skill to inform portfolio-level strategy and roadmap decisions.
- **Agensi Portfolio Optimizer with Grok** ($10) — Provides quantitative and qualitative platform signals that feed into portfolio optimization and forecasting.
- **Observability Reference Architectures with Grok** (free) — Shares the philosophy of treating complex systems (in this case, the Agensi platform) as observable and architectable.
- **Making Complex Systems Agent-Readable with Grok** (free) — Complementary — this skill helps structure and expose platform intelligence in agent-friendly ways.
- **Agensi Skill Library Auditor with Grok** ($5) — Can be used in tandem when auditing your own library against platform performance signals.

## Compatibility

This skill follows the open SKILL.md standard and is specifically optimized for **Grok** inside the **Grok Build CLI / TUI**. It is designed to work with the Agensi Catalog MCP tools and other compatible marketplace data sources.

---

## Permissions

**Permission Profile**: Analysis + Research (Read + Network)

**Tools Used**
- **Terminal / Shell**: Sometimes – Useful for running local analysis scripts or MCP tooling.
- **Read Files**: Yes – Required when analyzing local skill files in conjunction with marketplace data.
- **Write Files**: Sometimes – Required when producing structured reports and recommendations.
- **Browser**: Sometimes – Useful for verifying public marketplace listings.
- **Network Access**: Yes – Required to query live Agensi marketplace data via MCP.

**Environment Variables**: None required

**Allowed Hosts**:
- `mcp.agensi.io` (and any future Agensi data endpoints)

**File Scopes**:
- Your local Agensi skill library (for comparison against marketplace data)
- Any generated analysis reports

**Notes**:
This skill is intended to provide strategic and tactical intelligence about the Agensi platform. It does not replace direct user research or qualitative feedback, but it significantly improves the quality of decisions around what to build and how to position it.
