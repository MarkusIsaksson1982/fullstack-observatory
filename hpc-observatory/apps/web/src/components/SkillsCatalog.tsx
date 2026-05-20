'use client';

import { useState } from 'react';
import { SkillEntry } from '@/lib/skills';

interface SkillsCatalogProps {
  skills: SkillEntry[];
  title?: string;
  showSourceBadge?: boolean;
}

/**
 * SkillsCatalog
 * 
 * Portable, future-proof component for displaying a catalog of skills.
 * 
 * Designed for easy relocation between:
 *   - Root landing page
 *   - Dashboard
 *   - Dedicated /skills route
 * 
 * Also designed to accept either local-repo data or future live Agensi data.
 */
export function SkillsCatalog({ 
  skills, 
  title = "Skills in this Repository",
  showSourceBadge = true 
}: SkillsCatalogProps) {
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');

  const allTags = Array.from(
    new Set(skills.flatMap(s => s.tags))
  ).sort();

  const filteredSkills = skills.filter(skill => {
    const matchesSearch = 
      skill.name.toLowerCase().includes(search.toLowerCase()) ||
      skill.shortDescription.toLowerCase().includes(search.toLowerCase());
    
    const matchesTag = !selectedTag || skill.tags.includes(selectedTag);

    return matchesSearch && matchesTag;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
          <p className="text-sm text-slate-400 mt-1">
            {skills.length} skills available locally in this repository
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm w-full sm:w-64 focus:outline-none focus:border-emerald-600"
          />

          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm w-full sm:w-48 focus:outline-none focus:border-emerald-600"
          >
            <option value="">All tags</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSkills.length === 0 && (
          <div className="col-span-full text-center py-8 text-slate-500">
            No skills match your filters.
          </div>
        )}

        {filteredSkills.map(skill => (
          <div 
            key={skill.id} 
            className="border border-slate-700 bg-slate-950 rounded-2xl p-5 hover:border-slate-600 transition group"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-medium text-lg group-hover:text-emerald-400 transition">
                  {skill.name}
                </div>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  v{skill.version}
                </div>
              </div>
              {showSourceBadge && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                  {skill.source === 'local-repo' ? 'Local' : 'Agensi'}
                </span>
              )}
            </div>

            <p className="text-sm text-slate-400 line-clamp-3 mb-4">
              {skill.shortDescription}
            </p>

            <div className="flex flex-wrap gap-1.5">
              {skill.tags.slice(0, 4).map(tag => (
                <span 
                  key={tag} 
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400"
                >
                  {tag}
                </span>
              ))}
              {skill.tags.length > 4 && (
                <span className="text-[10px] px-2 py-0.5 text-slate-500">
                  +{skill.tags.length - 4}
                </span>
              )}
            </div>

            {skill.targetAgents?.length > 0 && (
              <div className="mt-3 text-xs text-slate-500">
                Targets: {skill.targetAgents.join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 text-xs text-slate-500 text-center">
        This catalog is generated at build time from the repository. 
        Future versions will support live comparison with the Agensi marketplace.
      </div>
    </div>
  );
}