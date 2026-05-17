# Full Stack Observatory — MCP Server

Minimal [Model Context Protocol](https://modelcontextprotocol.io) server exposing demo tools for the Full Stack Observatory. Deployable to Render's free tier as a Node Web Service.

## Tools

- `get_hpc_status` — returns demo HPC cluster status (scheduler, jobs, utilization).
- `list_layers` — returns the 12-layer Observatory overview.
- `get_layer_details({ layer: 1..12 })` — returns details for one layer (placeholder).

## Run locally

```
cd apps/mcp-server
npm install
npm start
```

Server listens on `PORT` (default 8080). Health check: `GET /`. MCP endpoint: `POST /mcp`.

## Deploy to Render

- **New Web Service** → connect this repo.
- **Root Directory:** `apps/mcp-server`
- **Environment:** Node
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- Free tier is fine; service sleeps after inactivity.

The public MCP URL will be `https://<service-name>.onrender.com/mcp`.
