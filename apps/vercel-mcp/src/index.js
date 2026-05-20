import express from 'express';
import { randomUUID } from 'crypto';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Simple in-memory transport placeholder for future real MCP tools
// (the real vercel-mcp driver remains the local stdio version for now)
const mcpServer = new McpServer({
  name: 'vercel-mcp-demo',
  version: '0.1.0',
  description: 'Public demonstration server for Safe Vercel Deploys via MCP with Grok. Currently serves the canonical skill landing page.'
});

// ==================== DEMO-ONLY TOOLS (read-only, illustrative) ====================
// Register tools BEFORE connecting the transport.
// These are intentionally limited. The real production driver is the local stdio vercel-mcp.
mcpServer.tool(
  'get_skill_overview',
  'High-level explanation of the Safe Vercel Deploys via MCP with Grok skill and how this demo relates to the local driver.',
  {},
  async () => ({
    content: [{
      type: 'text',
      text: `This is the dedicated public demonstration deployment for the "Safe Vercel Deploys via MCP with Grok" skill.

Core idea: Complement Vercel's excellent automatic GitHub deploys with safe, guardrail-first observation and manual control (primarily via vercel.deployments.redeploy and environment variable tools).

The primary way to use the skill is with the local vercel-mcp stdio driver (in the sibling vercel-mcp/ directory). This hosted demo provides:
- The canonical skill-primary landing page (this site)
- A lightweight discovery surface for inspectors and future Agensi/Smithery integration

All write actions remain disabled in this public demo.`
    }]
  })
);

mcpServer.tool(
  'list_demo_examples',
  'Return the key living examples associated with this skill (HPC Observatory + Render precedent).',
  {},
  async () => ({
    content: [{
      type: 'text',
      text: JSON.stringify({
        primary_living_example: {
          name: "HPC Observatory",
          url: "https://hpc-observatory.vercel.app/",
          description: "Full production Next.js dashboard deployed on Vercel. Managed with the skill + Cross-Platform Hub."
        },
        render_precedent: {
          name: "Safe Render Deploys via MCP",
          url: "https://hpc-observatory-mcp.onrender.com/",
          description: "The original dedicated skill demo that this Vercel deployment mirrors."
        }
      }, null, 2)
    }]
  })
);

const transport = new StreamableHTTPServerTransport({
  sessionIdGenerator: () => randomUUID(),
});

await mcpServer.connect(transport);

// ==================== LANDING PAGE (Skill-Primary, modeled on Render precedent) ====================

app.get('/', (req, res) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Safe Vercel Deploys via MCP with Grok • Live Demo</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; }
    .section-header { @apply text-xl font-semibold text-slate-800 mb-3; }
    .vercel-blue { color: #000000; }
  </style>
</head>
<body class="bg-slate-50 text-slate-900">
  <div class="max-w-5xl mx-auto">
    <!-- Navbar -->
    <nav class="flex items-center justify-between px-8 py-5 border-b bg-white">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 bg-black rounded-xl flex items-center justify-center">
          <i class="fa-brands fa-vuejs text-white text-xl"></i>
        </div>
        <div>
          <div class="font-semibold text-xl tracking-tight">Safe Vercel Deploys via MCP</div>
          <div class="text-[10px] text-blue-600 -mt-1 font-medium">AGENT SKILL DEMONSTRATION</div>
        </div>
      </div>
      <div class="flex items-center gap-4 text-sm">
        <a href="https://www.agensi.io/skills/safe-vercel-deploys-via-mcp-with-grok" target="_blank" 
           class="px-4 py-1.5 rounded-xl bg-black text-white text-sm font-medium hover:bg-gray-800 transition flex items-center gap-2">
          <span>View Skill on Agensi</span>
          <i class="fa-solid fa-external-link-alt text-xs"></i>
        </a>
        <a href="https://github.com/MarkusIsaksson1982/fullstack-observatory/tree/main/skills/free/safe-vercel-deploys-via-mcp" target="_blank"
           class="px-4 py-1.5 rounded-xl border text-sm font-medium hover:bg-white transition flex items-center gap-2">
          <i class="fa-brands fa-github"></i>
          <span>Source</span>
        </a>
      </div>
    </nav>

    <!-- Hero -->
    <div class="px-8 pt-12 pb-8">
      <div class="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold tracking-wider mb-4">
        <div class="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
        LIVE DEMONSTRATION
      </div>
      
      <h1 class="text-5xl font-semibold tracking-tighter leading-none mb-3">
        Safe Vercel Deploys<br>via MCP with Grok
      </h1>
      <p class="text-2xl text-slate-600 max-w-2xl">
        A production-grade demonstration of controlled, guardrail-first observation and manual actions on Vercel using Grok and the Model Context Protocol.
      </p>

      <div class="flex items-center gap-3 mt-8">
        <a href="https://www.agensi.io/skills/safe-vercel-deploys-via-mcp-with-grok" target="_blank"
           class="inline-flex items-center justify-center px-6 py-3 bg-black hover:bg-gray-800 transition text-white rounded-2xl font-semibold text-base shadow-sm">
          Get the Skill on Agensi
        </a>
        <a href="#how-it-works" 
           class="inline-flex items-center justify-center px-6 py-3 border border-slate-300 hover:bg-white transition rounded-2xl font-semibold text-base">
          How it works
        </a>
      </div>
      
      <div class="mt-6 text-xs text-slate-500 flex items-center gap-2">
        <i class="fa-solid fa-check-circle text-blue-600"></i>
        <span>Complements (does not replace) Vercel’s automatic GitHub deploys • Preferred action: <code class="bg-slate-100 px-1 py-px rounded">vercel.deployments.redeploy</code></span>
      </div>
    </div>

    <!-- Status Banner -->
    <div class="mx-8 mb-10 p-5 bg-white border rounded-3xl shadow-sm">
      <div class="flex flex-col md:flex-row md:items-center gap-4">
        <div>
          <div class="uppercase tracking-[1px] text-xs font-semibold text-blue-700">Current Demonstration</div>
          <div class="font-semibold text-lg">Dedicated Skill Demo</div>
          <div class="text-sm text-slate-600">This is the canonical public Documentation URL for the skill on Agensi.</div>
        </div>
        <div class="md:ml-auto flex items-center gap-4 text-sm">
          <div class="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-2xl">
            <i class="fa-solid fa-info-circle"></i>
            <span class="font-medium">Parallel to the live Render MCP demo</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Value Proposition -->
    <div class="px-8 grid md:grid-cols-3 gap-6 mb-12">
      <div class="bg-white border rounded-3xl p-6">
        <div class="text-blue-600 mb-3"><i class="fa-solid fa-shield-halved text-2xl"></i></div>
        <div class="font-semibold mb-2">Strong Guardrails</div>
        <div class="text-sm text-slate-600">All write actions off by default. <code>VERCEL_ALLOW_DEPLOYS</code> + project allow-lists. Explicit approval required for redeploys and env changes.</div>
      </div>
      <div class="bg-white border rounded-3xl p-6">
        <div class="text-blue-600 mb-3"><i class="fa-solid fa-link text-2xl"></i></div>
        <div class="font-semibold mb-2">Complements Automatic Deploys</div>
        <div class="text-sm text-slate-600">Your Git pushes continue to trigger normal Vercel deployments. This skill adds safe, on-demand visibility and the ability to force <strong>redeploy</strong> or manage environment variables.</div>
      </div>
      <div class="bg-white border rounded-3xl p-6">
        <div class="text-blue-600 mb-3"><i class="fa-solid fa-file-lines text-2xl"></i></div>
        <div class="font-semibold mb-2">Living Documentation</div>
        <div class="text-sm text-slate-600">Every meaningful action is recorded with Direct File Writing with Grok and feeds the Cross-Platform Synchronization Hub (GitHub ↔ Vercel ↔ Agensi).</div>
      </div>
    </div>

    <!-- Living Example -->
    <div class="px-8 mb-12">
      <div class="section-header">Real Outcome Produced With This Skill</div>
      <div class="bg-white border rounded-3xl p-6">
        <div class="flex flex-col md:flex-row md:items-center gap-6">
          <div class="flex-1">
            <div class="font-semibold mb-1">HPC Observatory</div>
            <div class="text-sm text-slate-600 mb-3">
              The full-featured HPC scheduler dashboard you see at <a href="https://hpc-observatory.vercel.app/" target="_blank" class="text-blue-600 hover:underline">hpc-observatory.vercel.app</a> was deployed and is maintained on Vercel using the exact workflow this skill enables (automatic Git + controlled manual redeploys + Hub documentation).
            </div>
            <a href="https://hpc-observatory.vercel.app/" target="_blank"
               class="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700">
              Visit the living Observatory example <i class="fa-solid fa-arrow-right"></i>
            </a>
          </div>
          <div class="text-xs text-slate-500 md:w-64">
            This dedicated demo site is the primary public face and Agensi Documentation URL for the skill. The HPC Observatory remains a high-value, separate deployment produced and managed with this skill + the Cross-Platform Hub.
          </div>
        </div>
      </div>
    </div>

    <!-- How It Works -->
    <div id="how-it-works" class="px-8 mb-12">
      <div class="section-header">How This Demonstration Works</div>
      <div class="prose prose-slate max-w-none text-[15px] text-slate-700">
        <ol class="list-decimal pl-5 space-y-2">
          <li>Grok loads the <strong>Safe Vercel Deploys via MCP with Grok</strong> skill (or the broader Cross-Platform Synchronization Hub).</li>
          <li>The local <code>vercel-mcp</code> driver is started with strict guardrails (<code>VERCEL_ALLOW_DEPLOYS=true</code> + project allow-list).</li>
          <li>Projects and deployments are discovered safely using <code>vercel.projects.*</code> and <code>vercel.deployments.*</code>.</li>
          <li>After explicit user approval, a redeploy is triggered via the recommended <code>vercel.deployments.redeploy</code> tool (or env var changes via <code>vercel.projects.env.*</code>).</li>
          <li>Direct File Writing with Grok records the outcome. The Cross-Platform Hub maintains three-way awareness (Local / GitHub / Vercel / Agensi).</li>
        </ol>
      </div>
      <div class="mt-4 text-sm text-slate-500">
        The companion local driver lives in the repository alongside this demo: <code>vercel-mcp/</code> (the stdio server you actually run with Grok).
      </div>

      <!-- Efficient Usage Guidance (Documentation + Demo value) -->
      <div class="mt-6 bg-blue-50 border border-blue-200 rounded-3xl p-6">
        <div class="font-semibold text-blue-800 mb-3 flex items-center gap-2">
          <i class="fa-solid fa-lightbulb"></i>
          Efficient Real-World Usage Pattern
        </div>
        <div class="text-sm text-slate-700 space-y-3">
          <p class="font-medium">The Vercel skill is designed for <strong>efficient supervision</strong>, not for replacing Vercel’s automatic GitHub deploys.</p>

          <div>
            <div class="font-medium mb-1">Recommended daily flow:</div>
            <ol class="list-decimal pl-5 space-y-1 text-sm">
              <li>Let normal Git pushes + Vercel’s automatic deploys handle 95% of releases.</li>
              <li>Use the skill when you need <strong>observation</strong> or a <strong>quick manual redeploy</strong> without pushing code.</li>
              <li>Prefer <code>vercel.deployments.redeploy</code> over <code>vercel.deployments.create</code> whenever a project already has Git auto-deploys configured.</li>
              <li>Use the environment variable tools (<code>vercel.projects.env.*</code>) when you need parity across platforms (the Cross-Platform Hub use case).</li>
            </ol>
          </div>

          <div class="pt-2 border-t border-blue-200">
            <div class="font-medium mb-1">Strongly recommended guardrails (set in your local .env):</div>
            <div class="font-mono text-xs bg-white px-3 py-2 rounded-xl">
              VERCEL_ALLOW_DEPLOYS=true<br>
              VERCEL_ALLOWED_PROJECTS=your-project-slug-or-id
            </div>
          </div>

          <div>
            <div class="font-medium mb-1">Example first prompt for Grok:</div>
            <div class="bg-white p-3 rounded-2xl text-xs font-mono border">
              "I want to inspect my Vercel projects and be ready to force a clean redeploy on the HPC Observatory project if needed. Load the Safe Vercel Deploys via MCP with Grok skill and start with read-only discovery."
            </div>
          </div>
        </div>
        <div class="mt-3 text-[11px] text-blue-700">
          This pattern is what makes the skill efficient in real teams: minimal friction, maximum safety, and perfect complementarity with existing Vercel workflows.
        </div>
      </div>
    </div>

    <!-- Live MCP Functionality – Highlights Vercel Skill Specifics -->
    <div class="px-8 mb-12">
      <div class="section-header flex items-center gap-3">
        Live MCP Surface
        <span class="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">Real &amp; Callable</span>
      </div>
      <p class="text-sm text-slate-600 mb-4 max-w-3xl">
        This demo server exposes actual MCP tools (using the official SDK). 
        Calling them here demonstrates the exact interface the Vercel skill gives to Grok — 
        structured discovery of projects, deployments, and environment variables, with strong guardrails.
      </p>

      <div class="grid md:grid-cols-2 gap-4">
        <!-- Tool 1 -->
        <div class="bg-white border rounded-3xl p-5 flex flex-col">
          <div class="font-semibold mb-1">get_skill_overview</div>
          <div class="text-xs text-slate-500 mb-3">Returns the core philosophy and relationship to the local driver (Vercel-specific guardrails + redeploy preference).</div>
          <button onclick="callMcpTool('get_skill_overview')" 
                  class="mt-auto px-4 py-2 bg-black hover:bg-gray-800 text-white text-sm font-medium rounded-2xl transition">
            Call Tool
          </button>
          <pre id="result-get_skill_overview" class="mt-3 text-[12px] bg-slate-50 p-3 rounded-xl overflow-auto max-h-40 hidden"></pre>
        </div>

        <!-- Tool 2 -->
        <div class="bg-white border rounded-3xl p-5 flex flex-col">
          <div class="font-semibold mb-1">list_demo_examples</div>
          <div class="text-xs text-slate-500 mb-3">Returns the living examples this skill has produced (HPC Observatory on Vercel + the Render precedent).</div>
          <button onclick="callMcpTool('list_demo_examples')" 
                  class="mt-auto px-4 py-2 bg-black hover:bg-gray-800 text-white text-sm font-medium rounded-2xl transition">
            Call Tool
          </button>
          <pre id="result-list_demo_examples" class="mt-3 text-[12px] bg-slate-50 p-3 rounded-xl overflow-auto max-h-40 hidden"></pre>
        </div>
      </div>

      <div class="mt-3 text-[11px] text-slate-500">
        These tools are the public demo surface. The full power (write actions like <code>vercel.deployments.redeploy</code> and env management) lives in the local <code>vercel-mcp</code> driver with your own <code>VERCEL_TOKEN</code> and allow-lists.
      </div>
    </div>

    <!-- Technical Access -->
    <div class="px-8 mb-12">
      <div class="section-header">Technical Access</div>
      <div class="grid sm:grid-cols-2 gap-4 text-sm">
        <div class="block p-4 border hover:bg-white rounded-2xl transition bg-slate-50">
          <div class="font-medium">MCP Endpoint (demo tools live)</div>
          <div class="font-mono text-blue-700">POST /mcp</div>
          <div class="text-xs text-slate-500 mt-1">Currently exposes get_skill_overview + list_demo_examples. Real power is in the local driver.</div>
        </div>
        <a href="/health" class="block p-4 border hover:bg-white rounded-2xl transition">
          <div class="font-medium">Health &amp; Readiness</div>
          <div class="font-mono text-blue-700">GET /health</div>
          <div class="text-xs text-slate-500 mt-1">Used by Vercel for health checks</div>
        </a>
      </div>
    </div>

    <div class="px-8 pb-12 text-xs text-slate-500 border-t pt-8">
      This dedicated demo deployment is the intended canonical public face for the <strong>Safe Vercel Deploys via MCP with Grok</strong> skill on Agensi.
      It is being built in parallel with the driver, the Cross-Platform Hub, and the HPC Observatory living example using Direct File Writing with Grok.
    </div>
  </div>

  <script>
    async function callMcpTool(toolName) {
      const pre = document.getElementById('result-' + toolName);
      pre.classList.remove('hidden');
      pre.textContent = 'Calling ' + toolName + '...';

      try {
        // Use the simple reliable demo endpoints for the landing page
        const response = await fetch('/demo-tool/' + toolName);
        const data = await response.json();

        if (data.content && data.content[0]) {
          const text = data.content[0].text;
          pre.textContent = text;
        } else {
          pre.textContent = JSON.stringify(data, null, 2);
        }
      } catch (err) {
        pre.textContent = 'Error: ' + err.message;
      }
    }
  </script>
</body>
</html>`;
  res.send(html);
});

// ==================== BASIC ROUTES ====================

app.get('/health', (req, res) => {
  res.json({ status: 'ok', mode: 'live', skill: 'Safe Vercel Deploys via MCP with Grok' });
});

// Simple direct endpoints for the landing page demo (reliable, no full MCP session needed)
app.get('/demo-tool/get_skill_overview', (req, res) => {
  res.json({
    content: [{
      type: 'text',
      text: `This is the dedicated public demonstration deployment for the "Safe Vercel Deploys via MCP with Grok" skill.

Core idea: Complement Vercel's excellent automatic GitHub deploys with safe, guardrail-first observation and manual control (primarily via vercel.deployments.redeploy and environment variable tools).

The primary way to use the skill is with the local vercel-mcp stdio driver (in the sibling vercel-mcp/ directory). This hosted demo provides:
- The canonical skill-primary landing page (this site)
- A lightweight discovery surface for inspectors and future Agensi/Smithery integration

All write actions remain disabled in this public demo.`
    }]
  });
});

app.get('/demo-tool/list_demo_examples', (req, res) => {
  res.json({
    content: [{
      type: 'text',
      text: JSON.stringify({
        primary_living_example: {
          name: "HPC Observatory",
          url: "https://hpc-observatory.vercel.app/",
          description: "Full production Next.js dashboard deployed on Vercel. Managed with the skill + Cross-Platform Hub."
        },
        render_precedent: {
          name: "Safe Render Deploys via MCP",
          url: "https://hpc-observatory-mcp.onrender.com/",
          description: "The original dedicated skill demo that this Vercel deployment mirrors."
        }
      }, null, 2)
    }]
  });
});

// Real MCP endpoint (demo tools only)
app.post('/mcp', async (req, res) => {
  try {
    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    console.error('[MCP] POST error:', err);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: { code: -32603, message: 'Internal server error in demo MCP surface' },
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

// Discovery (for Smithery / Agensi / Glama / inspectors)
app.get('/.well-known/mcp.json', (req, res) => {
  res.json({
    mcpVersion: '2025-06-18',
    serverName: 'vercel-mcp-demo',
    transport: 'streamable-http',
    endpoints: { mcp: '/mcp' },
    capabilities: {
      tools: [
        { name: 'get_skill_overview', description: 'Explain the skill and this demo deployment' },
        { name: 'list_demo_examples', description: 'Key living examples (HPC Observatory + Render precedent)' }
      ]
    },
    note: 'Demo-only surface. Real production usage is via the local vercel-mcp stdio driver + guardrails.'
  });
});

// ==================== START ====================
app.listen(PORT, () => {
  console.log(`🚀 Vercel MCP Demo running → http://localhost:${PORT}/`);
  console.log(`   Health:     http://localhost:${PORT}/health`);
  console.log(`   Landing is skill-primary and serves as the Agensi Documentation URL.`);
});