import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * GET /api/skills/local
 * Returns the build-time generated local skills catalog.
 * This is the foundation for the future live comparison feature.
 */
export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'skills-catalog.json');
    const file = await fs.readFile(filePath, 'utf8');
    const skills = JSON.parse(file);

    return NextResponse.json({
      source: 'local-repo',
      generatedAt: new Date().toISOString(),
      count: skills.length,
      skills,
    });
  } catch (error) {
    console.error('Failed to load local skills catalog:', error);
    return NextResponse.json(
      { error: 'Failed to load local skills catalog' },
      { status: 500 }
    );
  }
}