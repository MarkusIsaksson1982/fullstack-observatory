/**
 * SkillEntry
 * 
 * Unified data model for a skill entry.
 * Designed to work for both:
 *   - Local skills from the repository (Phase A)
 *   - Live Agensi marketplace data (Phase B, future)
 *
 * This abstraction is key for future-proofing and easy relocation of the feature.
 */
export interface SkillEntry {
  id: string;                    // Unique identifier (folder name or agensi slug)
  name: string;
  shortDescription: string;
  version: string;
  tags: string[];
  targetAgents: string[];        // e.g. ["grok", "claude"]
  source: "local-repo" | "agensi";
  url?: string;                  // GitHub path or Agensi URL
  price?: number;                // 0 for free skills
  author?: string;
}

/**
 * Live Agensi representation of a skill (what we can fetch from the marketplace).
 */
export interface AgensiSkillData {
  version: string;
  rating?: number;           // average rating if available
  installs?: number;
  votes?: number;
  lastPublished?: string;    // ISO date
  agensiSlug: string;
  isFree: boolean;
}

/**
 * Result of comparing a local skill against its Agensi counterpart.
 */
export interface SkillComparison {
  id: string;
  local?: SkillEntry;
  agensi?: AgensiSkillData;
  status: 
    | 'only-local'           // exists in repo but not published on Agensi
    | 'only-agensi'          // exists on Agensi but not in this repo
    | 'in-sync'              // versions match and everything looks good
    | 'version-drift'        // different versions between local and Agensi
    | 'needs-publication';   // local is newer / ready to publish
  driftNotes?: string;       // human-readable explanation
}

/**
 * Type guard / normalizer helpers can be added here later
 * when we introduce live Agensi data.
 */