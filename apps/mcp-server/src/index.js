import express from 'express';
import { randomUUID } from 'crypto';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { z } from 'zod';

// ==================== DOC INDEX ====================
function loadDocIndex() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  const candidates = [
    resolve(__dirname, '../../../data/doc-index.json'),
    resolve(__dirname, '../../data/doc-index.json'),
    resolve(process.cwd(), 'apps/mcp-server/data/doc-index.json'),
    resolve(process.cwd(), 'data/doc-index.json'),
  ];

  for (const p of candidates) {
    try {
      const raw = readFileSync(p, 'utf8');
      const docs = JSON.parse(raw);
      console.log(`[docIndex] Loaded ${docs.length} documents from ${p}`);
      return docs;
    } catch (err) {
      if (err.code !== 'ENOENT') {
        console.warn(`[docIndex] Failed to load ${p}: ${err.message}`);
      }
    }
  }
  console.warn('[docIndex] No doc-index.json found — using empty index');
  return [];
}

const docIndex = loadDocIndex();

// ==================== LAYER EXTRACTION ====================
function extractLayer(doc) {
  if (Array.isArray(doc.layer) && doc.layer.length > 0) {
    const first = doc.layer[0];
    if (typeof first === 'string' && first.trim()) return first.trim();
    if (typeof first === 'number') return `Layer ${first}`;
  }

  const title = doc.title || '';
  let match = title.match(/Layer\s*[:\-]?\s*(\d+)/i);
  if (match) return `Layer ${match[1]}`;

  match = title.match(/Layer[%_\-\s]?(\d+)/i);
  if (match) return `Layer ${match[1]}`;

  return 'Unspecified';
}

// ==================== TOOL REGISTRATION ====================
function registerTools(mcpServer) {
  mcpServer.tool(
    'get_observatory_overview',
    'High-level summary of the Full Stack Observatory reference architecture',
    {},
    async () => ({
      content: [{
        type: 'text',
        text: `The Observatory currently indexes ${docIndex.length} approved reference documents across multiple architectural layers. Use search_reference_docs for targeted queries or get_layer_details for layer-specific information.`
      }]
    })
  );

  mcpServer.tool(
    'search_reference_docs',
    'Search the approved reference documentation and skills',
    {
      query: z.string().min(2).describe('Search term'),
      layer: z.string().optional().describe('Optional layer filter (e.g. "Layer 7")'),
      category: z.enum(['documentation', 'skill']).optional().describe('Filter by type'),
      limit: z.number().int().min(1).max(15).optional().default(8),
    },
    async ({ query, layer, category, limit = 8 }) => {
      const q = query.toLowerCase();

      let results = docIndex.filter(d => {
        const text = `${d.title} ${d.summary} ${(d.keywords || []).join(' ')}`.toLowerCase();
        return text.includes(q);
      });

      if (layer) {
        const target = layer.toLowerCase();
        results = results.filter(d => extractLayer(d).toLowerCase() === target);
      }

      if (category) {
        results = results.filter(d => d.category === category);
      }

      results = results.slice(0, limit);

      if (results.length === 0) {
        return { content: [{ type: 'text', text: `No results found for "${query}".` }] };
      }

      const output = results
        .map(d => `- **${d.title}** (${extractLayer(d)}) [${d.category}]\n  ${d.summary || ''}`)
        .join('\n\n');

      return { content: [{ type: 'text', text: output }] };
    }
  );

  mcpServer.tool(
    'list_layers',
    'List all architectural layers present in the reference docs',
    {},
    async () => {
      const layers = [...new Set(
        docIndex.map(d => extractLayer(d)).filter(l => l !== 'Unspecified')
      )];

      layers.sort((a, b) => {
        const na = parseInt(a.replace(/\D/g, ''));
        const nb = parseInt(b.replace(/\D/g, ''));
        return isNaN(na) || isNaN(nb) ? a.localeCompare(b) : na - nb;
      });

      return {
        content: [{
          type: 'text',
          text: layers.length > 0 ? layers.join(', ') : 'No layers found.'
        }]
      };
    }
  );

  mcpServer.tool(
    'list_proof_points',
    'List high-quality examples, proof points, and skills',
    {
      layer: z.string().optional().describe('Optional layer filter'),
      category: z.enum(['documentation', 'skill']).optional().describe('Filter by type'),
      limit: z.number().int().min(1).max(12).optional().default(6),
    },
    async ({ layer, category, limit = 6 }) => {
      let candidates = docIndex;

      if (layer) {
        const target = layer.toLowerCase();
        candidates = candidates.filter(d => extractLayer(d).toLowerCase() === target);
      }

      let results = candidates.filter(d => {
        const text = `${d.title} ${d.summary} ${(d.keywords || []).join(' ')}`.toLowerCase();
        return /example|proof|case study|implementation|in practice|real.?world/.test(text);
      });

      if (category) {
        results = results.filter(d => d.category === category);
      } else {
        // Default: prefer skills + strong examples
        const skills = results.filter(d => d.category === 'skill');
        if (skills.length > 0) {
          results = [...skills, ...results.filter(d => d.category !== 'skill')].slice(0, limit);
        }
      }

      results = results.slice(0, limit);

      if (results.length === 0) {
        return { content: [{ type: 'text', text: 'No proof points found for the current filters.' }] };
      }

      const output = results
        .map(d => `- **${d.title}** (${extractLayer(d)}) [${d.category}]\n  ${d.summary || ''}`)
        .join('\n\n');

      return { content: [{ type: 'text', text: output }] };
    }
  );

  mcpServer.tool(
    'get_layer_details',
    'Get details about a specific architectural layer, separated by documentation and skills',
    {
      layer: z.string().min(2).describe('Layer name (e.g. "Layer 7")'),
    },
    async ({ layer }) => {
      const target = layer.toLowerCase();
      const layerDocs = docIndex.filter(d => extractLayer(d).toLowerCase() === target);

      if (layerDocs.length === 0) {
        return { content: [{ type: 'text', text: `No content found for layer "${layer}".` }] };
      }

      const docs = layerDocs.filter(d => d.category === 'documentation');
      const skills = layerDocs.filter(d => d.category === 'skill');

      let text = `**${layer}** contains ${layerDocs.length} items.\n\n`;

      if (docs.length > 0) {
        text += `### Documentation\n` + docs.map(d => `- ${d.title}`).join('\n') + '\n\n';
      }

      if (skills.length > 0) {
        text += `### Skills\n` + skills.map(d => `- ${d.title}`).join('\n');
      }

      return { content: [{ type: 'text', text: text.trim() }] };
    }
  );

  mcpServer.tool(
    'get_document_by_id',
    'Retrieve a specific document or skill by its ID',
    {
      id: z.string().min(1).describe('Document or skill ID'),
    },
    async ({ id }) => {
      const doc = docIndex.find(d => d.id === id);

      if (!doc) {
        return { content: [{ type: 'text', text: `No item found with ID "${id}".` }] };
      }

      return {
        content: [{
          type: 'text',
          text: `**${doc.title}**\nLayer: ${extractLayer(doc)}  |  Type: ${doc.category}\n\n${doc.summary || 'No summary available.'}`
        }]
      };
    }
  );
}

// ==================== EXPRESS + TRANSPORT ====================
const app = express();
const ALLOWED_PORTS = [3000, 3001, 3002, 3003, 3004];
const DEBUG = process.env.DEBUG_MCP === 'true';

app.use((req, res, next) => {
  const sid = req.headers['mcp-session-id'] || 'new';
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} | session=${sid}`);
  next();
});

app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    if (DEBUG && req.url.startsWith('/mcp') && req.method === 'POST') {
      console.log('[RAW BODY]', buf.toString('utf8').slice(0, 300));
    }
  }
}));

// Single long-lived transport (required for stable inspector sessions)
const mcpServer = new McpServer({
  name: 'observatory-reference-docs',
  version: '0.1.0',
});
registerTools(mcpServer);

const transport = new StreamableHTTPServerTransport({
  sessionIdGenerator: () => randomUUID(),
});

await mcpServer.connect(transport);

// ==================== ROUTES ====================
app.post('/mcp', async (req, res) => {
  try {
    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    console.error('[MCP] POST error:', err);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: { code: -32603, message: 'Internal server error' },
        id: req.body?.id ?? null,
      });
    }
  }
});

app.get('/mcp', async (req, res) => {
  try {
    await transport.handleRequest(req, res);
  } catch (err) {
    console.error('[MCP] GET error:', err);
    if (!res.headersSent) res.end();
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', documents: docIndex.length });
});

// Discovery endpoints (important for Smithery / Glama)
app.get('/.well-known/mcp.json', (req, res) => {
  res.json({
    mcpVersion: '2025-06-18',
    serverName: 'observatory-reference-docs',
    transport: 'streamable-http',
    endpoints: { mcp: '/mcp' },
    capabilities: {
      tools: ['get_observatory_overview', 'search_reference_docs', 'list_layers', 'list_proof_points', 'get_layer_details', 'get_document_by_id']
    }
  });
});

app.get('/.well-known/mcp/server-card.json', (req, res) => {
  res.json({
    name: 'observatory-reference-docs',
    version: '0.1.0',
    description: 'Read-only MCP server exposing the Full Stack Observatory reference architecture, documentation, and skills.',
    transport: {
      type: 'streamable-http',
      url: '/mcp'
    },
    capabilities: {
      tools: [
        { name: 'search_reference_docs', description: 'Search documentation and skills' },
        { name: 'get_layer_details', description: 'Get documents for a specific layer' },
        { name: 'list_layers', description: 'List all architectural layers' },
        { name: 'list_proof_points', description: 'List examples and skills' },
        { name: 'get_document_by_id', description: 'Fetch a specific document or skill' }
      ]
    }
  });
});

// ==================== START ====================
function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`🚀 Observatory MCP Server (hardened) running → http://localhost:${port}/mcp`);
    console.log(`   Health:          http://localhost:${port}/health`);
    console.log(`   Server Card:     http://localhost:${port}/.well-known/mcp/server-card.json`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      const next = ALLOWED_PORTS[ALLOWED_PORTS.indexOf(port) + 1];
      if (next) startServer(next);
    } else {
      console.error(err);
    }
  });
}

startServer(parseInt(process.env.PORT || '3000', 10));