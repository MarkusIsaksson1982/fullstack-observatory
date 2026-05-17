import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import { z } from "zod";

const server = new McpServer({
  name: "hpc-observatory-mcp",
  version: "0.1.0",
});

server.tool(
  "get_hpc_status",
  "Returns the current status of the HPC Observatory (demo data).",
  {},
  async () => ({
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            scheduler: "running",
            runningJobs: 3,
            queuedJobs: 7,
            cpuUtilization: "68%",
            gpuUtilization: "42%",
            nodesOnline: 12,
          },
          null,
          2
        ),
      },
    ],
  })
);

server.tool(
  "list_layers",
  "Returns the 12-layer Full Stack Observatory overview.",
  {},
  async () => ({
    content: [
      {
        type: "text",
        text: [
          "1. Frontend",
          "2. Backend/APIs",
          "3. Database",
          "4. Servers",
          "5. Networking",
          "6. Cloud Infrastructure",
          "7. CI/CD",
          "8. Security",
          "9. Containers",
          "10. CDN/Edge",
          "11. Monitoring & Observability",
          "12. Backups & Recovery",
        ].join("\n"),
      },
    ],
  })
);

server.tool(
  "get_layer_details",
  "Get detailed information about one of the 12 layers.",
  { layer: z.number().int().min(1).max(12) },
  async ({ layer }) => ({
    content: [
      {
        type: "text",
        text: `Layer ${layer} details would go here. (Will be expanded with real content later.)`,
      },
    ],
  })
);

const app = express();
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    name: "hpc-observatory-mcp",
    status: "ok",
    endpoint: "/mcp",
    transport: "streamable-http (stateless)",
  });
});

app.post("/mcp", async (req, res) => {
  try {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    res.on("close", () => {
      transport.close();
    });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    console.error("MCP request error:", err);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: { code: -32603, message: "Internal server error" },
        id: null,
      });
    }
  }
});

const port = Number(process.env.PORT) || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log(`MCP server listening on port ${port}`);
});
