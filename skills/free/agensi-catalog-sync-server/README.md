# Agensi Catalog Sync Server

A neutral, multi-agent MCP server for synchronizing local Agensi skill libraries with the live marketplace state.

This skill ships its own MCP server implementation, making it self-contained and usable with Grok Build, Gemini CLI, Codex CLI, and other compatible agents.

## When to Use This Skill

- You need reliable local ↔ live marketplace synchronization across multiple agents.
- You want a single source of truth for version drift, unpublished skills, and publishing readiness.
- You need footprint awareness against the 50 live-listing cap.
- You want to prepare batches of skills for publishing in one pass.

**When You DON’T Need This Skill**
- You only maintain skills for a single agent and have very few skills.
- You are actively authoring or iterating on individual skills.

## MCP Server Requirements

This skill includes a full MCP server (`mcp-server/agensi_catalog_mcp_server.py`). After installing the skill, you must configure your agent to run this server.

**Runtime requirements:**
- Python 3.10 or newer
- `AGENSI_API_KEY` (optional for local-only scans, required for live marketplace data)
- A valid `agensi-sync.config.json`

---

## Setup Instructions

### Grok Build (Windows 11)

1. Copy the `mcp-server/` folder to a permanent location (recommended: `~/.grok/mcp-servers/agensi-catalog-sync-server`).
2. Copy `mcp-server/.env.example` to `.env` in the same folder and add your `AGENSI_API_KEY`.
3. Copy `mcp-server/agensi-sync.config.example.json` and edit the paths for your environment.
4. Add the server to your MCP configuration (usually `~/.grok/mcp.json`):

```json
{
  "mcpServers": {
    "agensi-catalog": {
      "command": "python",
      "args": [
        "<path-to-mcp-server>/agensi_catalog_mcp_server.py"
      ],
      "env": {
        "AGENSI_SYNC_CONFIG": "<path-to-config>/agensi-sync.config.json"
      }
    }
  }
}
```

5. Restart Grok Build completely.

### Gemini CLI

1. **Local Deployment**: Copy the `mcp-server/` directory to a persistent location on your machine.
2. **Environment**: Create a `.env` file in that directory with your `AGENSI_API_KEY`.
3. **Configuration**: 
   Add the server to your Gemini CLI configuration (typically via an `mcp_servers` block in your settings or a local policy file):

```yaml
mcp_servers:
  agensi-catalog:
    command: "python"
    args:
      - "C:/path/to/mcp-server/agensi_catalog_mcp_server.py"
    env:
      AGENSI_SYNC_CONFIG: "C:/path/to/agensi-shared/agensi-sync.config.json"
```

4. **Verification**: Run `gemini mcp list` (or equivalent) to ensure the server is recognized.

**Gemini-Specific Notes:**
- **Context Efficiency**: Gemini CLI is highly optimized for surgical file reads. Use the `scan_local_roots` tool to get a high-level overview, then drill down into specific skill directories only when necessary.
- **Sub-Agent Delegation**: You can invoke specialized sub-agents (like `codebase_investigator`) to perform deeper analysis on drift issues identified by this server.

### Codex CLI

1. **Deployment**: Deploy the `mcp-server/` directory to your local development environment.
2. **Security**: Ensure `.env` is populated with `AGENSI_API_KEY`.
3. **Integration**:
   Update your Codex MCP connector configuration (e.g., `mcp_config.json`):

```json
{
  "mcpServers": {
    "agensi-catalog": {
      "command": "python",
      "args": ["C:/path/to/mcp-server/agensi_catalog_mcp_server.py"],
      "env": {
        "AGENSI_SYNC_CONFIG": "C:/path/to/agensi-shared/agensi-sync.config.json"
      }
    }
  }
}
```

**Codex-Specific Notes:**
- **Drift Logic**: Codex relies on `catalog.yaml` for status tracking. Ensure your root is configured with `layout: "catalog-yaml"` in the shared config to enable accurate syncing.
- **Validation-First**: Use the `validate_publish_intent` tool frequently when preparing updates to ensure your 1.0.0 -> 1.1.0 transitions are compliant with the group consensus.

---

## Daily Usage

Once the server is running, you can ask your agent to:

- Generate a full health & publishing status report
- Show current footprint against the 50-entry cap
- List unpublished or drift-affected skills
- Prepare a batch of skills for publishing
- Record newly published versions

**Core tools** available through the server:
- `scan_local_roots`
- `aggregate_footprint`
- `validate_publish_intent`
- `generate_health_report`
- `suggest_publishing_actions`
- `prepare_skills_for_publishing`
- `record_published_version`

---

## Suggested Workflow if You're Intending to Use This with Another Model

1. **Central Server** — Run one instance of the server pointed at a shared `agensi-sync.config.json`.
2. **Per-Model Roots** — Each agent maintains its own skill root but registers it in the shared config.
3. **Shared Cache** — Use `agensi-shared/data/` for the marketplace cache so all agents benefit from one fetch.
4. **Read-First by Default** — Use read-only tools (`scan_local_roots`, `aggregate_footprint`, `validate_publish_intent`) for most operations.
5. **Owned Writes Only** — Only allow write operations on roots the calling model owns.
6. **Publishing Gate** — Always check `validate_publish_intent` before moving skills to `ready-to-list` or publishing.

---

## Common Issues & Troubleshooting

- **`AGENSI_API_KEY not found`**: The key is only required for live marketplace calls. Local scans work without it.
- **Relative paths not resolving**: Use absolute paths in `agensi-sync.config.json` when sharing the config across machines.
- **A root shows zero skills**: Verify the path and `layout` setting in the config.
- **Publish blocked by cap**: Use `aggregate_footprint` to see current vs projected counts.

## Status

This is a work-in-progress skill package located in `dev/agensi-shared/wip-skills/`.

It is intended to become the free, neutral foundation for multi-agent Agensi library synchronization.

**Developed with** Grok in Grok Build, Gemini 3.1 in Gemini CLI, and GPT-5.5 in the Codex CLI on Windows 11. It may require adaptations for other environments and CLI configurations.
