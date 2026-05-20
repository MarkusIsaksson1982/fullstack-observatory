import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { SkillEntry, AgensiSkillData, SkillComparison } from '@/lib/skills';

/**
 * GET /api/skills/comparison
 *
 * Returns a combined view of local skills + live Agensi marketplace data
 * with computed drift status.
 *
 * Features:
 * - Server-side caching with TTL (default 10 minutes)
 * - Support for ?force=true to bypass cache and fetch fresh data
 * - Targeted lookups per local skill (using get_skill / search_skills) for relevance
 * - Graceful fallback to mock data when no AGENSI_API_KEY or on error
 */
// Simple in-memory cache
let cachedComparison: { data: any; timestamp: number } | null = null;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes for demo

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const forceRefresh = searchParams.get('force') === 'true';

  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'skills-catalog.json');
    const file = await fs.readFile(filePath, 'utf8');
    const localSkills: SkillEntry[] = JSON.parse(file);

    const now = Date.now();
    const shouldRefresh = forceRefresh || !cachedComparison || (now - cachedComparison.timestamp > CACHE_TTL_MS);

    let agensiDataMap = new Map<string, AgensiSkillData>();
    let realAgensiDataUsed = false;

    const agensiApiKey = process.env.AGENSI_API_KEY;

    if (shouldRefresh && agensiApiKey) {
      try {
        const client = new Client({ name: 'hpc-observatory-comparison', version: '0.1.0' });
        const transport = new StreamableHTTPClientTransport(
          new URL('https://mcp.agensi.io/mcp'),
          {
            requestInit: {
              headers: { Authorization: `Bearer ${agensiApiKey}` },
            },
          }
        );
        await client.connect(transport);

        // Targeted lookup for each local skill (much more relevant than broad get_popular)
        for (const local of localSkills) {
          try {
            const result = await client.callTool({
              name: 'get_skill',
              arguments: { slug: local.id },
            });

            const text = (result.content as any[])?.[0]?.text;
            if (text) {
              const skill = JSON.parse(text);
              if (skill.agensi_slug || skill.slug) {
                const slug = skill.agensi_slug || skill.slug;
                agensiDataMap.set(slug, {
                  version: skill.version || 'unknown',
                  rating: skill.rating,
                  installs: skill.installs,
                  votes: skill.votes,
                  lastPublished: skill.updated_at || skill.last_published,
                  agensiSlug: slug,
                  isFree: true,
                });
              }
            }
          } catch (innerErr) {
            // Individual skill lookup failed — continue with others
            console.warn(`Agensi lookup failed for ${local.id}`);
          }
        }

        await client.close();
        realAgensiDataUsed = agensiDataMap.size > 0;

        // Cache the result
        cachedComparison = {
          data: {
            agensiDataMap: Array.from(agensiDataMap.entries()),
            realAgensiDataUsed,
          },
          timestamp: now,
        };
      } catch (err) {
        console.warn('Real Agensi MCP call failed, falling back to cache or mock:', err);
      }
    } else if (cachedComparison) {
      // Use cached data
      const cached = cachedComparison.data;
      agensiDataMap = new Map(cached.agensiDataMap);
      realAgensiDataUsed = cached.realAgensiDataUsed;
    }

    // Build comparisons
    const comparisons: SkillComparison[] = localSkills.map((local) => {
      const realAgensi = agensiDataMap.get(local.id);

      let agensi: AgensiSkillData;

      if (realAgensi) {
        agensi = realAgensi;
      } else {
        agensi = {
          version: local.version,
          rating: 4.2 + Math.random() * 0.6,
          installs: Math.floor(Math.random() * 600) + 80,
          votes: Math.floor(Math.random() * 90) + 15,
          lastPublished: new Date(Date.now() - Math.random() * 1000 * 3600 * 24 * 30).toISOString(),
          agensiSlug: local.id,
          isFree: local.price === 0,
        };
      }

      let status: SkillComparison['status'] = 'in-sync';
      let driftNotes = '';

      if (!realAgensi && !realAgensiDataUsed) {
        status = 'only-local';
        driftNotes = 'Not yet found on Agensi (or no AGENSI_API_KEY provided)';
      } else if (agensi.version !== local.version) {
        status = 'version-drift';
        driftNotes = `Local ${local.version} vs Agensi ${agensi.version}`;
      }

      return {
        id: local.id,
        local,
        agensi,
        status,
        driftNotes: driftNotes || undefined,
      };
    });

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      localCount: localSkills.length,
      realAgensiDataUsed,
      forceRefreshed: forceRefresh,
      comparisons,
    });
  } catch (error) {
    console.error('Failed to build skills comparison:', error);
    return NextResponse.json(
      { error: 'Failed to build skills comparison' },
      { status: 500 }
    );
  }
}