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

// Public landing page - Live demonstration for the Agensi skill
app.get('/', (req, res) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Safe Render Deploys via MCP • Live Demo</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; }
    .section-header { @apply text-xl font-semibold text-slate-800 mb-3; }
  </style>
</head>
<body class="bg-slate-50 text-slate-900">
  <div class="max-w-5xl mx-auto">
    <!-- Navbar -->
    <nav class="flex items-center justify-between px-8 py-5 border-b bg-white">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center">
          <i class="fa-solid fa-rocket text-white text-xl"></i>
        </div>
        <div>
          <div class="font-semibold text-xl tracking-tight">Safe Render Deploys via MCP</div>
          <div class="text-[10px] text-emerald-600 -mt-1 font-medium">AGENT SKILL DEMONSTRATION</div>
        </div>
      </div>
      <div class="flex items-center gap-4 text-sm">
        <a href="https://agensi.io/skills/safe-render-deploys-via-mcp" target="_blank" 
           class="px-4 py-1.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition flex items-center gap-2">
          <span>View Skill on Agensi</span>
          <i class="fa-solid fa-external-link-alt text-xs"></i>
        </a>
        <a href="https://github.com/MarkusIsaksson1982/fullstack-observatory" target="_blank"
           class="px-4 py-1.5 rounded-xl border text-sm font-medium hover:bg-white transition flex items-center gap-2">
          <i class="fa-brands fa-github"></i>
          <span>Source</span>
        </a>
      </div>
    </nav>

    <!-- Hero -->
    <div class="px-8 pt-12 pb-8">
      <div class="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold tracking-wider mb-4">
        <div class="w-2 h-2 bg-emerald-600 rounded-full animate-pulse"></div>
        LIVE ON RENDER
      </div>
      
      <h1 class="text-5xl font-semibold tracking-tighter leading-none mb-3">
        Safe Render Deploys<br>via MCP
      </h1>
      <p class="text-2xl text-slate-600 max-w-2xl">
        A production-grade demonstration of controlled, guardrail-first deployments to Render using Grok and the Model Context Protocol.
      </p>

      <div class="flex items-center gap-3 mt-8">
        <a href="https://agensi.io/skills/safe-render-deploys-via-mcp" target="_blank"
           class="inline-flex items-center justify-center px-6 py-3 bg-emerald-600 hover:bg-emerald-700 transition text-white rounded-2xl font-semibold text-base shadow-sm">
          Get the Skill on Agensi
        </a>
        <a href="#how-it-works" 
           class="inline-flex items-center justify-center px-6 py-3 border border-slate-300 hover:bg-white transition rounded-2xl font-semibold text-base">
          How it works
        </a>
      </div>
      
      <div class="mt-6 text-xs text-slate-500 flex items-center gap-2">
        <i class="fa-solid fa-check-circle text-emerald-600"></i>
        <span>Real deployment performed on 2026-05-20 • Status: <span class="font-semibold text-emerald-600">Live</span></span>
      </div>
    </div>

    <!-- Status Banner -->
    <div class="mx-8 mb-10 p-5 bg-white border rounded-3xl shadow-sm">
      <div class="flex flex-col md:flex-row md:items-center gap-4">
        <div>
          <div class="uppercase tracking-[1px] text-xs font-semibold text-emerald-700">Current Deployment</div>
          <div class="font-semibold text-lg">hpc-observatory-mcp</div>
          <div class="text-sm text-slate-600">srv-d84gk99kh4rs73d6n3pg • Frankfurt • Free tier</div>
        </div>
        <div class="md:ml-auto flex items-center gap-4 text-sm">
          <div class="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-2xl">
            <i class="fa-solid fa-check"></i>
            <span class="font-medium">Deploy #dep-d86pehbbc2fs73b86ej0 • Live</span>
          </div>
          <a href="https://dashboard.render.com/web/srv-d84gk99kh4rs73d6n3pg" target="_blank" 
             class="text-emerald-600 hover:underline flex items-center gap-1 text-sm">
            View on Render <i class="fa-solid fa-arrow-up-right-from-square text-xs"></i>
          </a>
        </div>
      </div>
    </div>

    <!-- Value Proposition -->
    <div class="px-8 grid md:grid-cols-3 gap-6 mb-12">
      <div class="bg-white border rounded-3xl p-6">
        <div class="text-emerald-600 mb-3"><i class="fa-solid fa-shield-halved text-2xl"></i></div>
        <div class="font-semibold mb-2">Strong Guardrails</div>
        <div class="text-sm text-slate-600">Deployments are blocked unless explicitly enabled via environment variables and an allow-list. No accidental production deploys.</div>
      </div>
      <div class="bg-white border rounded-3xl p-6">
        <div class="text-emerald-600 mb-3"><i class="fa-solid fa-link text-2xl"></i></div>
        <div class="font-semibold mb-2">MCP + Grok Native</div>
        <div class="text-sm text-slate-600">The entire workflow is driven through a dedicated <code class="bg-slate-100 px-1.5 py-px rounded">render-mcp</code> server and the Multi-Platform Deployment skill.</div>
      </div>
      <div class="bg-white border rounded-3xl p-6">
        <div class="text-emerald-600 mb-3"><i class="fa-solid fa-file-lines text-2xl"></i></div>
        <div class="font-semibold mb-2">Living Documentation</div>
        <div class="text-sm text-slate-600">Every deployment automatically produces a detailed, versioned record using Direct File Writing with Grok.</div>
      </div>
    </div>

    <!-- How It Works -->
    <div id="how-it-works" class="px-8 mb-12">
      <div class="section-header">How This Demonstration Works</div>
      <div class="prose prose-slate max-w-none text-[15px] text-slate-700">
        <ol class="list-decimal pl-5 space-y-2">
          <li>Grok loads the <strong>Multi-Platform Deployment &amp; Living Documentation with Grok</strong> skill.</li>
          <li>The <strong>render-mcp</strong> driver is started locally with strict guardrails (<code>RENDER_ALLOW_DEPLOYS=true</code> + service allow-list).</li>
          <li>Services are discovered safely using <code>render.services.list</code>.</li>
          <li>After explicit user approval, a deployment is triggered via <code>render.deploys.trigger</code>.</li>
          <li>Direct File Writing with Grok generates the permanent deployment record you are seeing right now.</li>
        </ol>
      </div>
    </div>

    <!-- Technical Access -->
    <div class="px-8 mb-12">
      <div class="section-header">Technical Access</div>
      <div class="grid sm:grid-cols-2 gap-4 text-sm">
        <a href="/mcp" class="block p-4 border hover:bg-white rounded-2xl transition">
          <div class="font-medium">MCP Endpoint</div>
          <div class="font-mono text-emerald-700">POST /mcp</div>
          <div class="text-xs text-slate-500 mt-1">Streamable HTTP transport for MCP clients</div>
        </a>
        <a href="/health" class="block p-4 border hover:bg-white rounded-2xl transition">
          <div class="font-medium">Health &amp; Readiness</div>
          <div class="font-mono text-emerald-700">GET /health</div>
          <div class="text-xs text-slate-500 mt-1">Used by Render for health checks</div>
        </a>
      </div>
    </div>

    <div class="px-8 pb-12 text-xs text-slate-500 border-t pt-8">
      This live service is maintained as public documentation for the <strong>Safe Render Deploys via MCP</strong> skill on Agensi. 
      All changes are made using the Direct File Writing with Grok primitive with full verification.
    </div>
  </div>
</body>
</html>`;
  res.send(html);
});

// MCP endpoints
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