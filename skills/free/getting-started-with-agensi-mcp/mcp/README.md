# MCP Proxy – Quick Notes

This folder contains a minimal, portable stdio-to-HTTP proxy for the Agensi MCP server.

## Why a proxy?

Many local AI coding agents (Grok Build, Gemini CLI, Codex, Claude Code, etc.) currently speak MCP over stdio. Agensi’s marketplace server speaks over Streamable HTTP. This small proxy bridges the two.

## Files

- `proxy.py` — The actual bridge (run this as your MCP server).
- `requirements.txt` — Python packages needed.
- `.env.example` — Template for your Agensi API key.
- `config.example.json` — Example configuration for your local skill roots.

## Quick Local Test (any OS)

```bash
python -m venv .venv
source .venv/bin/activate          # macOS/Linux
.\.venv\Scripts\Activate.ps1       # Windows

pip install -r requirements.txt
python proxy.py
```

You should see it attempt to connect to `https://mcp.agensi.io/mcp`.

If you see a warning about missing `AGENSI_API_KEY`, that is normal for a first test.

## Notes for Advanced Users

- The proxy logs to stderr so it does not interfere with MCP stdio traffic.
- It supports `AGENSI_MCP_URL` override if you ever need to point at a different Agensi endpoint.
- For full multi-root + caching features, see the more complete `agensi_catalog_mcp_server.py` in the sibling `catalog-server/` directory (when available).

This minimal proxy is intentionally kept small and easy to understand so beginners can inspect exactly what is running.
```