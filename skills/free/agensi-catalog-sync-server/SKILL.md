---
name: "Agensi Catalog Sync Server"
description: "A shared, multi-agent MCP server that synchronizes local Agensi skill libraries with the live marketplace. Provides tools for scanning, version comparison, drift detection, footprint tracking, and publishing preparation across Grok, Gemini, and Codex."
version: 1.0.0
author: Markus Isaksson
license: MIT
price: 0
tags: ["grok", "gemini", "codex", "agensi", "mcp", "sync", "library-audit", "publishing", "meta", "free"]
---

# Agensi Catalog Sync Server

**Why This Skill Exists**  
As creators maintain skills across multiple AI coding agents (Grok, Gemini, Codex, and others), keeping local libraries in sync with the live Agensi marketplace becomes increasingly difficult. Version drift, unpublished work, and the 50-entry live cap are hard to manage when each agent only sees its own slice of the catalog. This skill provides the shared infrastructure layer that gives all supported agents a consistent, real-time view of local vs. live state.

## What You'll Gain

- A single, reusable MCP server that can scan multiple agent skill roots
- Automated detection of version drift, unpublished skills, and ready-to-publish items
- Footprint awareness against the 50-entry live cap
- Tools to prepare skills for publishing and record published versions
- A foundation that higher-tier skills can build upon

## When to Use This Skill

Use this skill when:
- You want a reliable way to keep your local skill library in sync with what is actually live on Agensi
- You maintain skills across multiple agents (Grok + Gemini + Codex) and need a shared source of truth
- You need to run regular hygiene checks before a publishing push
- You want to enforce the 50 live-listing cap across your entire portfolio

**When You DON’T Need This Skill**
- You only work with a single agent and a very small number of skills
- You are actively authoring or iterating on individual skills (use Skill Authoring or Evaluation & Iteration instead)
- You only need one-time manual checks or ad-hoc marketplace searches

## MCP Server Requirements

This skill ships its own MCP server (`mcp-server/agensi_catalog_mcp_server.py`). After installing the skill, you must configure your agent (Grok, Gemini, or Codex) to run the server. The server requires:

- Python 3.10+
- An `AGENSI_API_KEY` (optional for local-only scans, required for live marketplace data)
- A valid `agensi-sync.config.json` pointing to your skill roots

See the included `README.md` for per-agent setup instructions.

## Agent Operating Procedure

When this skill is activated, follow this structured process.

### Phase 1: Configuration & Discovery
Load the multi-root configuration and discover all configured local skill roots.

### Phase 2: Local Scan
Call `scan_local_roots` to scan configured roots and extract normalized metadata.

### Phase 3: Live Marketplace Fetch
Use the configured Agensi MCP connection and shared cache to retrieve current published state.

### Phase 4: Comparison & Analysis
Compare local vs live state to detect:
- Unpublished skills
- Version drift
- Footprint pressure (50-entry cap)
- Skills ready for update or publishing

### Phase 5: Recommendations & Actions
Generate prioritized actions. Only perform write operations (`prepare_skills_for_publishing`, `record_published_version`) on roots owned by the calling model and with explicit user approval.

## Expected Output

A structured report containing:
- Summary counts (local vs live, unpublished, drift, cap status)
- Categorized lists of skills needing attention
- Specific recommended actions
- Optional machine-readable export using the `live-local-status` schema

## Quick Start Prompt

```
Set up the Agensi Catalog Sync Server so I can see which of my skills are out of sync with the live marketplace across my Grok, Gemini, and Codex libraries.
```

## Common Pitfalls to Avoid

| Don’t Do This                                      | Do This Instead                                              |
|----------------------------------------------------|--------------------------------------------------------------|
| Running the server without a valid multi-root config | Always start from `agensi-sync.config.example.json`          |
| Expecting live data without an API key             | Use local-only scans when you don’t have (or need) an API key |
| Letting the server write to roots it doesn’t own   | Restrict write tools to owned roots only                     |
| Ignoring the 50-entry cap until publishing fails   | Check `validate_publish_intent` or `aggregate_footprint` early |

## Works Well With

**Free meta layer (foundational group):**
- **Agensi Skill Authoring** (free)
- **Iterating Agensi Skills** (free)
- **Agensi Free Skill Explorer with Grok** (free)
- **Agensi Skill Publishing Assistant with Grok** (free)

**Higher-tier Grok-optimized tools:**
- **Agensi Skill Library Auditor with Grok** ($5)
- **Agensi Skill Scout & Evaluator with Grok** ($8)
- **Skill Evaluation & Iteration with Grok** ($5)
- **Skill Catalog Strategy & Optimization with Grok** ($10)

## Compatibility

This skill is designed as a **neutral, multi-agent foundation**. It has been developed with **Grok in Grok Build**, **Gemini 3.1 in Gemini CLI**, and **GPT-5.5 in the Codex CLI** on **Windows 11**. It may need adaptations to setup in various environments and CLI configurations.

The bundled MCP server (`mcp-server/agensi_catalog_mcp_server.py`) is the canonical implementation maintained in `dev/agensi-shared/mcp/catalog-server/`.

---

## Permissions

**Permission Profile**: Analysis + Limited Write + Network (MCP Server)

**Tools Used**

- **Terminal / Shell**: Sometimes – Required to run the MCP server process
- **Read Files**: Yes – Scans local skill directories across configured roots
- **Write Files**: Sometimes – Generates reports and can prepare skills for publishing (with explicit user approval)
- **Browser / Network Access**: Yes – Connects to the Agensi MCP server

**Environment Variables**
- `AGENSI_API_KEY` (optional for local-only scans; required for live marketplace data)
- `AGENSI_SYNC_CONFIG` (path to multi-root configuration)

**Allowed Hosts**
- `mcp.agensi.io`

**File Scopes**
- All configured skill roots (via config)
- `mcp-server/` (inside this skill package)
- Reports and data directories

**Notes**
This skill ships its own MCP server. The core local scanning and reporting features work without an `AGENSI_API_KEY`. Live marketplace data requires a valid key.
```