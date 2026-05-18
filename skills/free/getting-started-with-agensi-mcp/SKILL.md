---
name: "Getting Started with Agensi MCP"
description: "A beginner-friendly guide to setting up the Agensi Model Context Protocol (MCP) connection so you can start using marketplace-connected skills without configuring MCP manually each time."
version: 1.0.1
author: Markus Isaksson
license: MIT
price: 0
tags:
  - agensi
  - mcp
  - onboarding
  - setup
  - meta
  - free
  - cross-platform
  - multi-agent
---

# Getting Started with Agensi MCP

**Why This Skill Exists**  
Agensi includes many skills that can run locally, but discovery, evaluation, and marketplace-connected workflows often require a working connection to the Agensi marketplace through the Model Context Protocol, or MCP.  

Without this connection, you can still use many skills, but you miss out on the best parts: being able to search, evaluate, and bring in high-quality skills directly from the marketplace.

This skill gives you a clear, beginner-friendly path to get that connection working so you can start using the rest of the Agensi ecosystem with confidence.

Once the connection is in place, you unlock the ability to work with more advanced skills — such as reference architecture and portfolio-level tools — directly from your agent.

## What You'll Gain

- A working Agensi MCP connection in your agent
- Understanding of what MCP actually does and why it matters
- The ability to start using skills like the Free Skill Explorer and Skill Scout & Evaluator
- A solid foundation for more advanced Agensi workflows later

## When to Use This Skill

Use this skill when:
- You have just started with Agensi and want to unlock its full potential
- You want to use skills that can search or evaluate other skills on the marketplace
- You keep seeing references to “MCP” or “Agensi MCP server” and want to understand what it means in practice
- You want a reliable, low-friction way to get set up across different agents

**When You DON’T Need This Skill**
- You only plan to use simple, self-contained skills that don’t require marketplace access
- You are already comfortable running MCP servers and connecting them to your agent
- You are looking for a specific advanced skill rather than an onboarding guide

## What Is MCP?

Think of MCP as a structured bridge between your AI coding agent and the Agensi marketplace.  

Instead of you manually searching the website and copying skills, your agent can talk directly to Agensi through MCP. This lets skills like the Free Skill Explorer search for relevant free skills, evaluate them, and help you decide what to install or study.

## Agent Operating Procedure

### Phase 1: Understand the Basics
Read the short explanations in this skill about what MCP is and why it’s useful. No technical knowledge is required at this stage.

### Phase 2: Prepare Your Environment
Make sure you have Python 3.10 or newer installed (most developers already do).

### Phase 3: Set Up the Connection
Follow the setup instructions for your agent. The README includes a complete Grok Build example plus adapter notes for Gemini CLI, Codex CLI, and Claude Code.
- Copying a small folder of files
- Creating a simple configuration
- Adding one entry to your agent’s MCP settings

### Phase 4: Verify It Works
See the setup instructions for your specific agent in the README for the exact verification command or prompt.

### Phase 5: Move to the Next Skill
Once the connection is working, you are ready to start using the Free Skill Explorer and other discovery tools.

## Expected Output

After following this skill you will have:
- A working connection between your agent and the Agensi marketplace via a local MCP proxy
- A small but complete set of configuration files you can reuse or adapt
- Clear next steps for using higher-value free skills

## Quick Start Prompt

```
I want to get started with Agensi skills that use MCP. Please walk me through setting it up for my current agent.
```

## Common Pitfalls to Avoid

| Don’t Do This                                      | Do This Instead                                              |
|----------------------------------------------------|--------------------------------------------------------------|
| Skipping the environment variable setup            | Always create the `.env` file, even if you leave `AGENSI_API_KEY` blank at first |
| Using relative paths in the config across machines | Use absolute paths or clearly documented relative ones       |
| Trying to use advanced skills before the connection works | Follow this skill first, then move to the Free Skill Explorer |
| Assuming one setup works for every agent and OS    | Follow the per-agent instructions and adapt as needed        |

## Known Limitations

- Exact MCP configuration paths and formats differ between agents.
- Some agents may use `python3` instead of `python`.
- Marketplace-connected features may require an Agensi API key.
- This skill sets up the connection layer; it does not guarantee that every downstream skill is agent-compatible.

## Works Well With

- **Observability Reference Architectures with Grok** (free) — A good next step once you are connected via MCP, especially if you work with complex or evolving systems and want to make their architecture and documentation agent-accessible.
- **Observability Bootstrapper with Grok** ($5) — Natural follow-up when you want to instrument services after understanding the architectural patterns.
- **Free Skill Explorer** (free) and **Agensi Free Skill Explorer with Grok** (free) — Core skills that become much more powerful once you have an MCP connection.

## Compatibility

This skill is designed as a neutral, multi-agent on-ramp. The bundled MCP proxy is model-agnostic and should work with most MCP-compatible local agents that support stdio MCP servers, when properly configured.

The current bundle has been developed primarily on Windows 11 and tested or drafted against Grok Build, Gemini CLI, Codex CLI, and Claude Code. Exact setup steps may need adaptation depending on each agent’s current MCP configuration format.

---

## Permissions

**Permission Profile**: Setup & Light Analysis (Read + Network)

**Tools Used**

- **Terminal / Shell**: Yes – Required to run the MCP proxy during setup and use.
- **Read Files**: Yes – Reads configuration during setup.
- **Write Files**: Sometimes – Creates configuration files.
- **Network Access**: Yes – Connects to the Agensi MCP server.
- **Browser**: No – Browser access is not required for normal setup.

**Environment Variables**
- `AGENSI_API_KEY` (optional for basic local use; recommended for full marketplace access)

**Allowed Hosts**
- `mcp.agensi.io`

**File Scopes**
- The `mcp/` folder inside this skill
- Your local skill directories (you choose which ones)
- Configuration files you create

**Notes**
This skill focuses on getting the connection working. It does not perform deep evaluation or portfolio analysis — those capabilities are provided by skills you can use *after* completing this one.
```