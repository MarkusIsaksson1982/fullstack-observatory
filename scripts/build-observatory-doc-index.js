#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const fg = require('fast-glob');

const CONFIG_PATH = path.resolve(__dirname, 'doc-index-config.json');
const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

const {
  approvedPaths = [],
  skills = [],
  metadataDefaults = {},
  output = 'apps/mcp-server/data/doc-index.json'
} = config;

function extractTitle(content) {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : 'Untitled';
}

function extractSummary(content) {
  // Remove title
  let text = content.replace(/^# .*$/m, '').trim();
  // Remove code blocks
  text = text.replace(/```[\s\S]*?```/g, '');
  // Remove image links (badges etc.)
  text = text.replace(/!\[.*?\]\(.*?\)/g, '');
  // Take first 2–3 paragraphs or ~450 chars of meaningful text
  const paragraphs = text.split(/\n{2,}/).filter(p => p.trim().length > 20);
  let summary = paragraphs.slice(0, 2).join(' ').trim();
  if (!summary) summary = text.slice(0, 450);
  return summary.replace(/\s+/g, ' ').slice(0, 450).trim();
}

function extractLayer(title) {
  if (!title) return null;

  // Common patterns in your docs
  // "Layer 7", "Layer 11", "Layer: 9", "- Layer 7", "Layer 2: Backend"
  let match = title.match(/Layer\s*[:\-]?\s*(\d+)/i);
  if (match) return `Layer ${match[1]}`;

  // Badge-style URLs (Layer%207, Layer-7, Layer_7, Layer 2-orange, etc.)
  match = title.match(/Layer[%_\-\s]?(\d+)/i);
  if (match) return `Layer ${match[1]}`;

  // Sometimes the layer appears later in the title after a dash or colon
  match = title.match(/[-:]\s*Layer\s*(\d+)/i);
  if (match) return `Layer ${match[1]}`;

  return null;
}

async function build() {
  const allPatterns = [...approvedPaths, ...skills];

  const files = await fg(allPatterns, {
    cwd: process.cwd(),
    absolute: true,
    onlyFiles: true,
    ignore: ['**/node_modules/**']
  });

  const documents = [];

  for (const absolutePath of files) {
    const relativePath = path.relative(process.cwd(), absolutePath).replace(/\\/g, '/');
    const content = fs.readFileSync(absolutePath, 'utf8');

    const title = extractTitle(content);
    const summary = extractSummary(content);
    const layer = extractLayer(title);

    const isSkill = skills.some(pattern =>
      fg.sync(pattern, { cwd: process.cwd() }).includes(relativePath)
    );

    documents.push({
      id: relativePath.replace(/\.md$/, '').replace(/\//g, '-'),
      title,
      path: relativePath,
      category: isSkill ? 'skill' : 'documentation',
      audience: metadataDefaults.audience || ['engineer', 'agent'],
      observatory: metadataDefaults.observatory || 'fullstack',
      layer: layer ? [layer] : [],
      summary,
      keywords: []
    });
  }

  // Sort for stable, deterministic output
  documents.sort((a, b) => a.id.localeCompare(b.id));

  const outputPath = path.resolve(output);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(documents, null, 2));

  console.log(`✅ Built doc-index with ${documents.length} entries → ${output}`);
}

build().catch(err => {
  console.error('Failed to build doc index:', err);
  process.exit(1);
});