# Getting Started with Agensi MCP

A beginner-friendly guide to setting up the Agensi Model Context Protocol (MCP) so you can start using marketplace-connected skills without configuring MCP manually each time.

This skill includes a portable MCP proxy and clear setup instructions so you can connect your AI coding agent to the Agensi marketplace.

## Compatibility Matrix

| Layer                      | Status          | Notes |
|----------------------------|-----------------|-------|
| MCP protocol bridge        | Supported       | Uses stdio locally and streamable HTTP remotely |
| Windows 11                 | Tested (primary)| Full setup examples included |
| macOS                      | Expected        | Requires Python 3.10+ and shell path adjustments |
| Linux                      | Expected        | Requires Python 3.10+ and shell path adjustments |
| Grok Build                 | Fully documented     | Complete step-by-step instructions included |
| Gemini CLI                 | Adapter pattern provided | Use the prompt below to ask Gemini for exact steps |
| Codex CLI / GPT coding agents | Adapter pattern provided | Use the generic MCP server template and ask your local GPT-based agent to confirm exact config paths, commands, and restart steps |
| Claude Code                | Adapter instructions included | CLI + manual JSON steps provided |
| Other MCP-compatible agents | Generic support     | Use the generic MCP server pattern + test with your agent |

---

## What This Skill Gives You

After following this skill you will have:

- A working Agensi MCP connection in your agent
- A small, portable set of configuration files
- Clear next steps for using higher-value free skills

## Setup Instructions

### Cross-Platform Preparation (All Agents)

1. Copy the entire `mcp/` folder from this skill to a permanent location on your computer (recommended locations below).

2. Inside that folder, copy `.env.example` to `.env` and add your Agensi API key if you have one.

3. Copy `config.example.json` to `config.json` and update the paths to point to your local skill folders. Use **absolute paths**. Example values:

- Windows: `C:/Users/YOURNAME/dev/agensi/skills`
- macOS: `/Users/YOURNAME/dev/agensi/skills`
- Linux: `/home/YOURNAME/dev/agensi/skills`

4. Open a terminal in the `mcp/` folder and install the dependencies (using a virtual environment is recommended):

```bash
pip install -r requirements.txt
```

> For extra beginner-friendly notes about the proxy itself (including virtual environment tips and common issues), see the small `README.md` inside the `mcp/` folder.

**Recommended permanent locations:**

- **Windows**: `C:\Tools\agensi-mcp` or `%USERPROFILE%\.config\agensi-mcp` (Grok-specific example: `%USERPROFILE%\.grok\mcp-servers\agensi`)
- **macOS**: `~/.config/agensi/mcp-servers` or `/Users/YOURNAME/Tools/agensi-mcp`
- **Linux**: `~/.config/agensi/mcp-servers` or `/home/YOURNAME/Tools/agensi-mcp`

### For Grok Build

This is the most complete and tested path in the current bundle.

Add the following entry to your MCP configuration (usually `~/.grok/mcp.json`):

```json
{
  "mcpServers": {
    "agensi": {
      "command": "python",
      "args": ["<absolute-path-to-mcp-folder>/proxy.py"],
      "env": {
        "AGENSI_CONFIG": "<absolute-path-to-mcp-folder>/config.json"
      }
    }
  }
}
```

Then fully restart Grok Build.

### For Gemini CLI

The exact configuration format for Gemini CLI can vary between versions.
Use this generic template as a starting point, then run the prompt below in Gemini to get the precise steps for your version:

**Generic config:**

```json
{
  "mcpServers": {
    "agensi": {
      "command": "python",
      "args": ["<absolute-path-to-mcp-folder>/proxy.py"],
      "env": {
        "AGENSI_CONFIG": "<absolute-path-to-mcp-folder>/config.json"
      }
    }
  }
}
```

**Helpful prompt to ask Gemini:**

```
Adapt this MCP server configuration for the current version of Gemini CLI.
Keep the command, args, and environment variable. Tell me:
1. The exact file or command I should use to register the server
2. The restart steps
3. One simple verification command or prompt
```

### For Codex CLI / GPT-Based Coding Agents

**Status:** Adapter pattern provided — exact setup may vary by Codex/OpenAI tooling version.

Use this generic MCP server template, then ask your Codex-style or GPT-based coding agent to adapt it to the current environment.

**Generic config:**

```json
{
  "mcpServers": {
    "agensi": {
      "command": "python",
      "args": ["<absolute-path-to-mcp-folder>/proxy.py"],
      "env": {
        "AGENSI_CONFIG": "<absolute-path-to-mcp-folder>/config.json"
      }
    }
  }
}
```

**Helpful prompt to ask your GPT/Codex agent:**

```text
You are helping me configure an MCP server for a Codex-style or GPT-based coding agent.

I have a portable Agensi MCP proxy with:
- proxy.py
- requirements.txt
- .env
- config.json

The generic MCP server entry is:

{
  "mcpServers": {
    "agensi": {
      "command": "python",
      "args": ["<absolute-path-to-mcp-folder>/proxy.py"],
      "env": {
        "AGENSI_CONFIG": "<absolute-path-to-mcp-folder>/config.json"
      }
    }
  }
}

Please adapt this to my current environment and tell me:
1. The exact MCP config file location or command I should use
2. The exact server entry I should add
3. Whether I should use python, python3, or a virtualenv Python path
4. Whether AGENSI_CONFIG should be passed through the MCP config or shell environment
5. The restart steps
6. A simple verification command or prompt
7. Any security concerns with file paths, API keys, or network access

Do not assume Windows only.
Do not edit files until you have shown me the proposed config.
```

**Verification:**

After adding the server, ask:

```text
Can you see the Agensi MCP server? What tools does it provide?
```

If the server appears but tools fail, check:

* the Python executable path
* whether dependencies were installed with the same Python
* whether `.env` exists beside `proxy.py`
* whether `AGENSI_CONFIG` points to the copied `config.json`
* whether live marketplace features require `AGENSI_API_KEY`

```

### For Claude Code

**Status:** Instructions provided — full testing pending.

Claude Code supports adding MCP servers via the CLI or by editing JSON settings files.

**Recommended (easiest) method using the Claude CLI:**

```bash
claude mcp add agensi -- python <absolute-path-to-mcp-folder>/proxy.py \
  --env AGENSI_CONFIG=<absolute-path-to-mcp-folder>/config.json
```

**Manual method (edit settings):**

Add the server to your user-level config (`~/.claude.json`) or project-level settings (`.mcp.json` at the project root):

```json
{
  "mcpServers": {
    "agensi": {
      "command": "python",
      "args": ["<absolute-path-to-mcp-folder>/proxy.py"],
      "env": {
        "AGENSI_CONFIG": "<absolute-path-to-mcp-folder>/config.json"
      }
    }
  }
}
```

> **Note:** `.claude/settings.json` is for settings (like `enableAllProjectMcpServers`), not for `mcpServers` entries.

**First-time note:**
Claude Code will prompt you to approve the new MCP server the first time it connects. You can approve it for the current project or globally.

**Verification:**

Run `/mcp` inside Claude Code — you should see "agensi" listed among the connected servers.

Or ask naturally: "Can you see the Agensi MCP server? What tools does it provide?"

---

## How to Check That It Worked

After adding the MCP server to your agent, verify it is working:

- Ask your agent to list connected MCP servers (exact command depends on your agent).
- Or use a simple natural-language prompt: "Can you see the Agensi MCP server? What tools does it provide?"

If your agent reports the server is connected and lists tools such as `scan_local_roots` or `generate_health_report`, the setup succeeded.

---

## Common Issues & Troubleshooting

- **`AGENSI_API_KEY not found`**: The key is only required for live marketplace features. Basic local scanning often works without it.
- **Relative paths not resolving**: Use absolute paths in `config.json` when sharing the setup across machines.
- **Server not appearing**: Make sure you restarted the agent fully after adding the MCP entry. Confirm the same Python that can run `proxy.py` is the one referenced in the config.
- **Permission errors**: The proxy only needs read access to your chosen skill folders and outbound network access to Agensi.

## Suggested Workflow if You're Intending to Use This with Another Model

1. Keep one central copy of the `mcp/` folder (or the full server when available).
2. Use a single shared `config.json` that lists the skill roots for each agent.
3. Share the marketplace cache (when implemented) so one agent fetching live data benefits the others.
4. Read-First by Default — Use read-only tools before making file changes.
5. Owned Writes Only — Only allow write operations on roots the calling model owns.
6. Publishing Gate — Always check `validate_publish_intent` before moving skills to `ready-to-list` or publishing.

**Developed with** Grok in Grok Build, Gemini 3.1 in Gemini CLI, and GPT-5.5 in the Codex CLI on Windows 11. Adapter instructions drafted for Claude Code. It may need adaptations for other environments and CLI configurations.
```