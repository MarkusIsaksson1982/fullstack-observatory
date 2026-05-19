import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

export function loadDocIndex() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  // Try several reasonable locations (protects against the "apps/apps" bug)
  const candidates = [
    resolve(__dirname, '../../../data/doc-index.json'),           // apps/mcp-server/src/utils → data
    resolve(__dirname, '../../data/doc-index.json'),              // apps/mcp-server/src → data
    resolve(process.cwd(), 'apps/mcp-server/data/doc-index.json'),
    resolve(process.cwd(), 'data/doc-index.json'),
    resolve(__dirname, '../../../../data/doc-index.json'),
  ];

  for (const filePath of candidates) {
    try {
      const raw = readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(raw);
      const docs = Array.isArray(parsed) ? parsed : (parsed.documents || parsed.items || []);
      console.log(`[docIndex] Successfully loaded ${docs.length} documents from: ${filePath}`);
      return docs;
    } catch (err) {
      // try next candidate
    }
  }

  console.warn('[docIndex] WARNING: Could not find doc-index.json in any expected location. Returning empty array.');
  return [];
}