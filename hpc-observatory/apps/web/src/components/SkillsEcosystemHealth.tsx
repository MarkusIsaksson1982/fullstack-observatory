'use client';

import { useEffect, useState, useMemo } from 'react';
import { SkillComparison } from '@/lib/skills';

interface ComparisonResponse {
  generatedAt: string;
  localCount: number;
  realAgensiDataUsed: boolean;
  comparisons: SkillComparison[];
}

type StatusFilter = 'all' | 'in-sync' | 'version-drift' | 'only-local';
type SortOption = 'name' | 'installs' | 'changed';

export function SkillsEcosystemHealth() {
  const [data, setData] = useState<ComparisonResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Sorting
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('name');

  useEffect(() => {
    fetch('/api/skills/comparison')
      .then(res => res.json())
      .then((json: ComparisonResponse) => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load skills ecosystem data');
        setLoading(false);
      });
  }, []);

  const filteredAndSorted = useMemo(() => {
    if (!data) return [];

    let result = [...data.comparisons];

    // Filter
    if (statusFilter !== 'all') {
      result = result.filter(item => item.status === statusFilter);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'name') {
        return (a.local?.name || a.id).localeCompare(b.local?.name || b.id);
      }

      if (sortBy === 'installs') {
        const aInstalls = a.agensi?.installs ?? 0;
        const bInstalls = b.agensi?.installs ?? 0;
        return bInstalls - aInstalls;
      }

      // 'changed' — put items with simulated install changes first (demo only)
      const aChanged = (a.agensi?.installs ?? 0) % 7 === 0; // cheap demo heuristic
      const bChanged = (b.agensi?.installs ?? 0) % 7 === 0;
      if (aChanged && !bChanged) return -1;
      if (!aChanged && bChanged) return 1;
      return 0;
    });

    return result;
  }, [data, statusFilter, sortBy]);

  const inSync = data?.comparisons.filter(c => c.status === 'in-sync').length ?? 0;
  const drift = data?.comparisons.filter(c => c.status === 'version-drift').length ?? 0;
  const onlyLocal = data?.comparisons.filter(c => c.status === 'only-local').length ?? 0;
  const total = data?.comparisons.length ?? 0;

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">
        <div className="text-sm text-slate-400">Loading skills ecosystem health...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">
        <div className="text-sm text-red-400">{error || 'Unable to load data'}</div>
      </div>
    );
  }

  const { realAgensiDataUsed } = data;

  // Previous data for change detection (simple in-memory diff)
  const [previousData, setPreviousData] = useState<ComparisonResponse | null>(null);

  useEffect(() => {
    if (data) {
      setPreviousData(data);
    }
  }, [data]);

  // === Change detection helpers ===
  const getInstallDelta = (id: string) => {
    if (!previousData) return 0;
    const prev = previousData.comparisons.find(c => c.id === id);
    const curr = data.comparisons.find(c => c.id === id);
    if (!prev || !curr) return 0;
    return (curr.agensi?.installs ?? 0) - (prev.agensi?.installs ?? 0);
  };

  // === Top Signals / Highlights ===
  const topInstalled = [...data.comparisons].sort((a, b) => (b.agensi?.installs ?? 0) - (a.agensi?.installs ?? 0))[0];
  const topRated = [...data.comparisons].sort((a, b) => (b.agensi?.rating ?? 0) - (a.agensi?.rating ?? 0))[0];
  const topRecent = [...data.comparisons].sort((a, b) => {
    const dateA = a.agensi?.lastPublished ? new Date(a.agensi.lastPublished).getTime() : 0;
    const dateB = b.agensi?.lastPublished ? new Date(b.agensi.lastPublished).getTime() : 0;
    return dateB - dateA;
  })[0];

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">Skills Ecosystem Health</h3>
          <p className="text-xs text-slate-400">
            Comparison between local repository and live Agensi marketplace
            {!realAgensiDataUsed && ' (demo data)'}
          </p>
        </div>

        {/* Summary */}
        <div className="text-right text-xs space-x-3">
          <span className="text-emerald-400 font-mono">{inSync}/{total} in sync</span>
          {drift > 0 && <span className="text-amber-400">{drift} drift</span>}
          {onlyLocal > 0 && <span className="text-blue-400">{onlyLocal} local-only</span>}
        </div>
      </div>

      {/* Top Signals / Standout Skills */}
      <div className="mb-5">
        <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2 px-1">Top Signals</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Most Installed */}
          <div 
            onClick={() => setSortBy('installs')}
            className="cursor-pointer bg-slate-950 border border-slate-700 hover:border-emerald-600/60 rounded-2xl p-3 transition group"
          >
            <div className="flex items-center gap-2 text-emerald-400 text-xs mb-1">
              <span>↑</span> <span>Most Installed</span>
            </div>
            <div className="font-medium truncate group-hover:text-emerald-400 transition">
              {topInstalled?.local?.name || '—'}
            </div>
            <div className="text-[10px] text-slate-400 tabular-nums">
              {(topInstalled?.agensi?.installs ?? 0).toLocaleString()} installs
            </div>
          </div>

          {/* Highest Rated */}
          <div 
            onClick={() => {
              // Quick way to surface high-rated items: sort by installs + filter mentally, or we can add a future "rating" sort
              setSortBy('installs');
            }}
            className="cursor-pointer bg-slate-950 border border-slate-700 hover:border-yellow-500/60 rounded-2xl p-3 transition group"
          >
            <div className="flex items-center gap-2 text-yellow-400 text-xs mb-1">
              <span>★</span> <span>Highest Rated</span>
            </div>
            <div className="font-medium truncate group-hover:text-yellow-400 transition">
              {topRated?.local?.name || '—'}
            </div>
            <div className="text-[10px] text-slate-400">
              {(topRated?.agensi?.rating ?? 0).toFixed(1)} / 5.0
            </div>
          </div>

          {/* Most Recently Updated */}
          <div 
            onClick={() => setSortBy('changed')}
            className="cursor-pointer bg-slate-950 border border-slate-700 hover:border-blue-500/60 rounded-2xl p-3 transition group"
          >
            <div className="flex items-center gap-2 text-blue-400 text-xs mb-1">
              <span>⟳</span> <span>Most Recently Updated</span>
            </div>
            <div className="font-medium truncate group-hover:text-blue-400 transition">
              {topRecent?.local?.name || '—'}
            </div>
            <div className="text-[10px] text-slate-400">
              {topRecent?.agensi?.lastPublished 
                ? new Date(topRecent.agensi.lastPublished).toLocaleDateString() 
                : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Controls: Filters + Sorting */}
      <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
        {/* Status Filters */}
        <div className="flex gap-1">
          {(['all', 'in-sync', 'version-drift', 'only-local'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1 rounded-xl border text-xs transition ${
                statusFilter === f
                  ? 'bg-slate-800 border-slate-500 text-white'
                  : 'border-slate-700 hover:bg-slate-800 text-slate-400'
              }`}
            >
              {f === 'all' ? 'All' : f.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Sorting */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          Sort:
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1 text-white text-xs focus:outline-none"
          >
            <option value="name">Name A–Z</option>
            <option value="installs">Installs (High → Low)</option>
            <option value="changed">Recently Changed</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="space-y-2 max-h-72 overflow-auto pr-2 text-sm">
        {filteredAndSorted.length === 0 && (
          <div className="text-slate-500 py-4 text-center">No skills match the current filter.</div>
        )}

        {filteredAndSorted.map((item) => {
          const installs = item.agensi?.installs ?? 0;
          const showInstallAlert = !realAgensiDataUsed && installs % 5 === 0; // demo heuristic

          return (
            <div key={item.id} className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-medium truncate">{item.local?.name || item.id}</span>
                <span className="text-[10px] text-slate-500 font-mono shrink-0">v{item.local?.version}</span>
              </div>

              <div className="flex items-center gap-2 text-xs shrink-0">
                {/* Status badge */}
                {item.status === 'in-sync' && (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">In sync</span>
                )}
                {item.status === 'version-drift' && (
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400">
                    Drift
                  </span>
                )}
                {item.status === 'only-local' && (
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400">Only local</span>
                )}

                {/* Install count + live change alert */}
                <span className="text-slate-400 font-mono tabular-nums">
                  {installs.toLocaleString()} installs
                </span>

                {(() => {
                  const delta = getInstallDelta(item.id);
                  if (delta > 0) {
                    return (
                      <span className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 animate-pulse">
                        +{delta} since last refresh
                      </span>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-[10px] text-slate-500 flex items-center justify-between">
        <span>
          {data.realAgensiDataUsed 
            ? 'Live data from Agensi marketplace' 
            : 'Showing simulated Agensi data (set AGENSI_API_KEY for real values)'}
        </span>
        <span className="text-emerald-400">Filters &amp; sorting active</span>
      </div>

      {/* Recommended Paid Skills — Stub */}
      <div className="mt-6 border-t border-slate-700 pt-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] uppercase tracking-wider text-slate-500">Recommended Paid Skills (stub)</div>
          <div className="text-[10px] text-amber-400">Phase B — coming with paid catalog</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { name: "Advanced Agensi Analytics Suite", price: 29, reason: "High demand in enterprise segment" },
            { name: "Enterprise Compliance Auditor", price: 49, reason: "Strong signals from regulated industries" },
            { name: "Multi-Agent Workflow Orchestrator", price: 19, reason: "Frequently requested in community" },
          ].map((skill, idx) => (
            <div key={idx} className="border border-slate-700 bg-slate-950 rounded-2xl p-3 text-sm">
              <div className="font-medium">{skill.name}</div>
              <div className="text-emerald-400 text-xs mt-0.5">${skill.price}/mo</div>
              <div className="text-[10px] text-slate-400 mt-1">{skill.reason}</div>
              <button
                onClick={() => alert(`(Stub) Would recommend ${skill.name} via the Vercel skill + Hub`)}
                className="mt-3 text-xs px-3 py-1 rounded-xl border border-slate-600 hover:bg-slate-800 transition"
              >
                Recommend via Grok
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}