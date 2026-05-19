# Observatory Reference Docs MCP Server

A small, read-only MCP server that exposes the Full Stack Observatory’s architecture documentation and skills through the Model Context Protocol.

This server is designed to let AI coding agents (and humans using MCP clients) explore the 12-layer reference architecture, find relevant documentation, and discover useful skills.

## Purpose

- Make the Observatory’s documentation and skills queryable by agents
- Provide a clean, inspectable surface for Smithery, Glama, and local MCP clients
- Serve as the foundation for future, more advanced Observatory MCP servers

## Features

- 6 tools for searching and exploring the reference material
- Layer-aware navigation
- Clear separation between documentation and skills
- Streamable HTTP transport (compatible with the official MCP Inspector)

## Prerequisites

- Node.js 20+
- The generated `data/doc-index.json` (run the build script in the root if missing)

## Running Locally

```bash
# From the repository root
node apps/mcp-server/src/index.js

Optional: Enable Verbose Logging

DEBUG_MCP=true node apps/mcp-server/src/index.js

Testing with the MCP Inspector

1. Start the server.
2. Open the MCP Inspector:
   npx @modelcontextprotocol/inspector

3. Create a new connection and enter:
   http://localhost:3000/mcp
4. Connect using Streamable HTTP.

Once connected, you should see the following tools:

• get_observatory_overview
• search_reference_docs
• list_layers
• list_proof_points
• get_layer_details
• get_document_by_id

Available Tools (Summary)

┌──────────────────────────┬──────────────────────────────────────────┬──────────────────────────┐
│ Tool                     │ Description                              │ Key Parameters           │
├──────────────────────────┼──────────────────────────────────────────┼──────────────────────────┤
│ get_observatory_overview │ High-level summary of the Observatory    │ —                        │
├──────────────────────────┼──────────────────────────────────────────┼──────────────────────────┤
│ search_reference_docs    │ Search docs and skills                   │ query, layer?, category? │
├──────────────────────────┼──────────────────────────────────────────┼──────────────────────────┤
│ list_layers              │ List available architectural layers      │ —                        │
├──────────────────────────┼──────────────────────────────────────────┼──────────────────────────┤
│ get_layer_details        │ Get documents for a specific layer       │ layer                    │
├──────────────────────────┼──────────────────────────────────────────┼──────────────────────────┤
│ list_proof_points        │ List good examples and skills            │ layer?, category?        │
├──────────────────────────┼──────────────────────────────────────────┼──────────────────────────┤
│ get_document_by_id       │ Fetch a specific document or skill by ID │ id                       │
└──────────────────────────┴──────────────────────────────────────────┴──────────────────────────┘

Notes

• The server is read-only by design.
• Layer information is extracted from document titles and the generated index.
• For best results, regenerate the doc index after making documentation changes:

  node scripts/build-observatory-doc-index.js


Health Check

GET http://localhost:3000/health


Discovery

• Server Card: /.well-known/mcp/server-card.json
• MCP Discovery: /.well-known/mcp.json