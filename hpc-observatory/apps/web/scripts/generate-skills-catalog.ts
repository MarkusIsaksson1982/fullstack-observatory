/**
 * generate-skills-catalog.ts
 * 
 * Build-time script that scans the local skills repository
 * and generates a JSON catalog for the frontend.
 *
 * This approach is chosen for scalability:
 * - No runtime filesystem access needed on Vercel.
 * - Easy to replace later with a live Agensi data fetcher.
 * - Keeps the UI component completely decoupled from data source.
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const REPO_ROOT = path.resolve(__dirname, '../../../../'); // from hpc-observatory/apps/web/scripts up to repo root
const SKILLS_DIR = path.join(REPO_ROOT, 'skills', 'free');
const OUTPUT_DIR = path.join(__dirname, '../public/data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'skills-catalog.json');

interface RawSkill {
  id: string;
  name: string;
  shortDescription: string;
  version: string;
  tags: string[];
  targetAgents: string[];
  source: 'local-repo';
  price: number;
}

function extractTargetAgents(agentsDir: string): string[] {
  try {
    const files = fs.readdirSync(agentsDir);
    return files
      .filter(f => f.endsWith('.yaml') || f.endsWith('.yml'))
      .map(f => f.replace(/\.(yaml|yml)$/, ''));
  } catch {
    return ['grok']; // fallback
  }
}

function generateCatalog() {
  if (!fs.existsSync(SKILLS_DIR)) {
    console.error(`Skills directory not found at ${SKILLS_DIR}`);
    process.exit(1);
  }

  const skillFolders = fs.readdirSync(SKILLS_DIR).filter(name => {
    const fullPath = path.join(SKILLS_DIR, name);
    return fs.statSync(fullPath).isDirectory();
  });

  const skills: RawSkill[] = [];

  for (const folder of skillFolders) {
    const skillPath = path.join(SKILLS_DIR, folder);
    const skillMdPath = path.join(skillPath, 'SKILL.md');
    const grokYamlPath = path.join(skillPath, 'agents', 'grok.yaml');
    const agentsDir = path.join(skillPath, 'agents');

    if (!fs.existsSync(skillMdPath)) continue;

    try {
      const fileContent = fs.readFileSync(skillMdPath, 'utf8');
      const { data } = matter(fileContent);

      // Try to enrich from agents/grok.yaml (many skills put better metadata here)
      let grokData: any = {};
      if (fs.existsSync(grokYamlPath)) {
        try {
          const yamlContent = fs.readFileSync(grokYamlPath, 'utf8');
          // Very lightweight yaml parse for the fields we care about
          const displayMatch = yamlContent.match(/display_name:\s*["']?([^"'\n]+)["']?/);
          const shortMatch = yamlContent.match(/short_description:\s*["']?([^"'\n]+)["']?/);
          if (displayMatch) grokData.name = displayMatch[1].trim();
          if (shortMatch) grokData.shortDescription = shortMatch[1].trim();
        } catch {}
      }

      const targetAgents = extractTargetAgents(agentsDir);

      const name = grokData.name || data.name || folder;
      let shortDescription = grokData.shortDescription || data.description || '';

      // Stronger fallback: extract the first real prose paragraph from the markdown body
      if (!shortDescription || shortDescription.length < 40) {
        const body = fileContent.split('---').pop() || '';
        // Remove any embedded yaml blocks that some skills accidentally include
        const cleaned = body.replace(/interface:[\s\S]*?```/g, '').replace(/```[\s\S]*?```/g, '');
        const paragraphs = cleaned.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
        const firstGood = paragraphs.find(p => p.length > 50 && !p.startsWith('#') && !p.startsWith('-'));
        if (firstGood) {
          shortDescription = firstGood.replace(/\n/g, ' ').trim().slice(0, 220);
        }
      }

      skills.push({
        id: folder,
        name,
        shortDescription: shortDescription || 'No description available.',
        version: data.version || '0.0.0',
        tags: Array.isArray(data.tags) ? data.tags : [],
        targetAgents,
        source: 'local-repo',
        price: typeof data.price === 'number' ? data.price : 0,
      });
    } catch (err) {
      console.warn(`Failed to parse ${folder}:`, err);
    }
  }

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(skills, null, 2));
  console.log(`Generated skills catalog with ${skills.length} skills → ${OUTPUT_FILE}`);
}

generateCatalog();