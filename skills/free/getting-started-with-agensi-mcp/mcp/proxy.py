#!/usr/bin/env python3
"""
Minimal Agensi MCP Proxy (Beginner Version)

This is a simple, transparent bridge that lets your AI agent talk to the Agensi
marketplace over the Model Context Protocol (MCP).

It is designed to be easy to understand and adapt for any MCP-compatible agent
(Grok, Gemini, Codex, Claude Code, etc.) on different operating systems.

Usage:
- Configure your agent to run this script as an MCP server.
- The script will forward messages between your agent and Agensi.

Requirements:
- Python 3.10+
- The packages listed in requirements.txt
"""

import os
import sys
import signal
import logging
from pathlib import Path

from dotenv import load_dotenv
import anyio
from mcp.client.streamable_http import streamablehttp_client
from mcp.server.stdio import stdio_server

# --- Logging (goes to stderr so it doesn't interfere with MCP) ---
logging.basicConfig(
    level=logging.INFO,
    stream=sys.stderr,
    format="%(levelname)s: %(message)s",
)
logger = logging.getLogger("agensi-mcp-proxy")


def _handle_sigterm(signum, frame):
    """Graceful shutdown on SIGTERM (some agents use this instead of KeyboardInterrupt)."""
    logger.info("Received SIGTERM, shutting down proxy...")
    sys.exit(0)


# --- Load environment from the same folder as this script ---
SCRIPT_DIR = Path(__file__).resolve().parent
load_dotenv(SCRIPT_DIR / ".env")

# AGENSI_CONFIG is currently validated for setup coherence.
# The minimal proxy does not parse local roots yet; advanced tools may use this file.
CONFIG_PATH = os.getenv("AGENSI_CONFIG")
if CONFIG_PATH:
    config_file = Path(CONFIG_PATH).expanduser()
    if config_file.exists():
        logger.info(f"Using Agensi config file: {config_file}")
    else:
        logger.warning(f"AGENSI_CONFIG points to a missing file: {config_file}")
else:
    logger.info("No AGENSI_CONFIG set. Continuing with proxy-only configuration.")

API_KEY = os.getenv("AGENSI_API_KEY")
MCP_URL = os.getenv("AGENSI_MCP_URL", "https://mcp.agensi.io/mcp")

if not API_KEY:
    logger.warning(
        "No AGENSI_API_KEY found in .env. "
        "The proxy will still start, but live marketplace features may fail or be limited."
    )

if not MCP_URL.startswith(("http://", "https://")):
    logger.error(f"Invalid AGENSI_MCP_URL: {MCP_URL}")
    sys.exit(1)

HEADERS = {"Authorization": f"Bearer {API_KEY}"} if API_KEY else {}


async def pump(name: str, src, dst):
    """Forward messages between two streams."""
    try:
        async for message in src:
            await dst.send(message)
    except anyio.EndOfStream:
        pass
    except Exception as exc:
        # Cancel the task group; the other pump direction will also be cancelled.
        logger.error(f"[{name}] stream error: {exc}")
        raise
    finally:
        logger.info(f"[{name}] closed")


async def main():
    logger.info(f"Connecting to Agensi MCP server: {MCP_URL}")

    try:
        async with streamablehttp_client(url=MCP_URL, headers=HEADERS) as (
            remote_read,
            remote_write,
            _get_session_id,
        ):
            # _get_session_id is currently unused. It may become relevant for
            # future Agensi authentication or session management.
            logger.info("Connected to Agensi MCP server.")

            async with stdio_server() as (local_read, local_write):
                logger.info("Local stdio bridge ready. Forwarding messages...")

                async with anyio.create_task_group() as tg:
                    tg.start_soon(pump, "agent-to-agensi", local_read, remote_write)
                    tg.start_soon(pump, "agensi-to-agent", remote_read, local_write)

    except Exception as exc:
        logger.error(
            f"Could not connect to Agensi MCP. "
            f"Check your internet connection, AGENSI_MCP_URL, and AGENSI_API_KEY "
            f"(if marketplace features are required). Error: {exc}"
        )
        raise


if __name__ == "__main__":
    # Python version guard for beginners
    if sys.version_info < (3, 10):
        sys.exit("Error: Python 3.10 or newer is required to run this MCP proxy.")

    # Handle SIGTERM gracefully on systems that use it for shutdown
    signal.signal(signal.SIGTERM, _handle_sigterm)

    try:
        anyio.run(main)
    except KeyboardInterrupt:
        logger.info("Proxy stopped by user.")
    except Exception as exc:
        logger.error(f"Fatal error: {exc}")
        sys.exit(1)
```