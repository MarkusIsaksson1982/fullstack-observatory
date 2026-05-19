# Smithery Publishing Guide

This document explains how to run and publish the **Observatory Reference Docs** MCP server on [Smithery](https://smithery.ai).

## What This Server Does

A read-only MCP server that exposes the Full Stack Observatory’s architecture documentation and skills. It allows AI agents to search and explore the 12-layer reference architecture, layer documentation, and related skills.

## Local Development

```bash
# From the repository root
node apps/mcp-server/src/index.js

Optional debug logging:

DEBUG_MCP=true node apps/mcp-server/src/index.js

Smithery Configuration

Create a smithery.yaml file in the apps/mcp-server/ directory:

name: observatory-reference-docs
runtime: node
start: node src/index.js

Recommended smithery.yaml (for deployment)

name: observatory-reference-docs
runtime: node
start: node src/index.js
env:
  NODE_ENV: production

Publishing

1. Make sure the server works locally with the MCP Inspector.
2. Commit the following files:
   • smithery.yaml
   • src/index.js
   • data/doc-index.json (generated via scripts/build-observatory-doc-index.js)
3. From the apps/mcp-server/ directory, run:

smithery deploy

Or publish via the web UI at smithery.ai (https://smithery.ai).

Important Notes

• This server is read-only by design.
• It does not execute code, access live systems, or modify any data.
• All data comes from a pre-generated doc-index.json.
• The server exposes the following tools:
  • get_observatory_overview
  • search_reference_docs
  • list_layers
  • get_layer_details
  • list_proof_points
  • get_document_by_id

Discovery

The server supports standard MCP discovery endpoints:

• /.well-known/mcp/server-card.json
• /.well-known/mcp.json

These help Smithery automatically detect and display the server correctly.

Support

For issues or questions, refer to the main repository or open an issue in the fullstack-observatory project.