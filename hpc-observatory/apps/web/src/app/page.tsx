'use client'

import { useEffect, useState } from 'react';
import { ArrowRight, Github, ExternalLink, Zap, Shield, GitBranch } from 'lucide-react';
import { SkillsCatalog } from '@/components/SkillsCatalog';
import { SkillEntry } from '@/lib/skills';

export default function ObservatoryWithVercelSkill() {
  const [skills, setSkills] = useState<SkillEntry[]>([]);

  useEffect(() => {
    fetch('/data/skills-catalog.json')
      .then(res => res.json())
      .then((data: SkillEntry[]) => setSkills(data))
      .catch(() => {
        // Fallback: empty array if JSON not yet generated
        setSkills([]);
      });
  }, []);
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-semibold text-xl tracking-tight">HPC Observatory</div>
              <div className="text-[10px] text-blue-400 -mt-1 font-medium">LIVE ON VERCEL</div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <a
              href="/dashboard"
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition"
            >
              Open Full Dashboard
            </a>
            <a
              href="https://github.com/MarkusIsaksson1982/fullstack-observatory"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-1.5 rounded-xl border border-slate-700 hover:bg-slate-900 transition"
            >
              <Github className="w-4 h-4" />
              <span>Source</span>
            </a>
            <a
              href="https://hpc-observatory-mcp.onrender.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-1.5 rounded-xl border border-slate-700 hover:bg-slate-900 transition"
            >
              <span>Render Demo</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </nav>

      {/* Hero – Observatory First, Skill Context Second */}
      <div className="max-w-5xl mx-auto px-6 pt-12 pb-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium">
            LIVE VERCEL DEPLOYMENT
          </span>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-medium">
            MANAGED WITH GROK + VERCEL MCP
          </span>
        </div>

        <h1 className="text-5xl font-semibold tracking-tighter mb-3">
          HPC Observatory
        </h1>
        <p className="text-2xl text-slate-300 mb-6">
          PBS-Style Scheduler with Real-time Observability
        </p>

        <p className="max-w-2xl text-lg text-slate-400 mb-8">
          This is a production-grade live deployment of the HPC Observatory on Vercel.
          It demonstrates both the scheduler dashboard and how the companion <strong>Safe Vercel Deploys via MCP with Grok</strong> skill
          enables safe, guardrail-first control over such deployments.
        </p>

        <div className="flex flex-wrap gap-4">
          <a
            href="/dashboard"
            className="group inline-flex items-center gap-3 px-8 py-3.5 bg-blue-600 hover:bg-blue-500 rounded-2xl font-medium transition text-lg"
          >
            Open the Live Dashboard
            <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition" />
          </a>
          <a
            href="#skill-context"
            className="inline-flex items-center gap-3 px-8 py-3.5 border border-slate-700 hover:bg-slate-900 rounded-2xl font-medium transition"
          >
            Learn about the Vercel Skill
          </a>
        </div>
      </div>

      {/* Quick Observatory Value */}
      <div className="max-w-5xl mx-auto px-6 pb-12">
        <div className="grid md:grid-cols-3 gap-6 text-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <div className="font-medium mb-2">Real-time HPC Visualization</div>
            <div className="text-slate-400">Jobs, nodes, GPU/CPU utilization, and scheduling decisions in one place.</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <div className="font-medium mb-2">Demo + Production Modes</div>
            <div className="text-slate-400">Runs with sample data by default. Full live version available via the Docker stack in the repo.</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <div className="font-medium mb-2">Deployed on Vercel</div>
            <div className="text-slate-400">Automatic deploys from Git, with additional safe manual control available through the Grok skill.</div>
          </div>
        </div>
      </div>

      {/* Skill Context Section – Balanced, not dominant */}
      <div id="skill-context" className="border-t border-slate-800 bg-slate-900/50 py-12">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-6 h-6 text-emerald-400" />
            <h2 className="text-2xl font-semibold tracking-tight">Safe Vercel Deploys via MCP with Grok</h2>
          </div>

          <p className="text-slate-400 max-w-3xl mb-8">
            This live site is also the official demonstration for a focused Grok skill that lets an agent safely interact with Vercel.
            The skill works <em>with</em> your normal automatic GitHub deploys rather than replacing them.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="font-medium mb-3 flex items-center gap-2 text-emerald-400">
                <Shield className="w-5 h-5" /> Guardrails First
              </div>
              <ul className="text-sm text-slate-400 space-y-1.5">
                <li>• All write actions disabled by default</li>
                <li>• Explicit user approval required for redeploys or env changes</li>
                <li>• Project allow-lists via <code>VERCEL_ALLOWED_PROJECTS</code></li>
              </ul>
            </div>
            <div>
              <div className="font-medium mb-3 flex items-center gap-2 text-emerald-400">
                <GitBranch className="w-5 h-5" /> Works With Your Existing Workflow
              </div>
              <ul className="text-sm text-slate-400 space-y-1.5">
                <li>• Git pushes still trigger automatic Vercel deploys</li>
                <li>• Preferred manual action: <code>vercel.deployments.redeploy</code></li>
                <li>• Environment variable inspection &amp; controlled updates</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 text-sm text-slate-400">
            This pattern is part of the larger <strong>Cross-Platform Synchronization Hub with Grok</strong> — the same approach used for the live Render skill.
          </div>

          {/* Meta-reference to the dedicated skill demo (first light addition under Option C) */}
          <div className="mt-4 p-4 border border-blue-900/30 bg-blue-950/20 rounded-2xl text-sm">
            <span className="font-medium text-blue-300">Dedicated canonical demo in preparation:</span> A new minimal, skill-primary deployment (`apps/vercel-mcp` in this repo) is being built as the official public face and future Agensi Documentation URL for “Safe Vercel Deploys via MCP with Grok”. This Observatory remains a high-value living example produced with the skill. The dedicated demo will be linked here prominently once live.
          </div>
        </div>
      </div>

      {/* Skills Catalog — Observatory Module (Phase A) */}
      <div className="max-w-5xl mx-auto px-6 pb-12">
        <div id="skills-catalog">
          <SkillsCatalog 
            skills={skills} 
            title="Skills Catalog"
          />
          <p className="text-center text-xs text-slate-500 mt-3">
            Generated at build time from the skills in this repository. 
            Future versions will support live comparison against the Agensi marketplace.
          </p>
        </div>
      </div>

      {/* CTA to Full Dashboard */}
      <div className="max-w-5xl mx-auto px-6 py-12 text-center">
        <a
          href="/dashboard"
          className="inline-flex items-center gap-3 px-10 py-4 bg-white text-black rounded-2xl font-semibold hover:bg-slate-200 transition text-lg"
        >
          Explore the Full HPC Observatory Dashboard
          <ArrowRight className="w-5 h-5" />
        </a>
        <p className="text-xs text-slate-500 mt-3">
          Currently running in demo mode with sample data
        </p>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8">
        <div className="max-w-5xl mx-auto px-6 text-sm text-slate-500 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            HPC Observatory • Live on Vercel • Companion to the Safe Vercel Deploys skill
          </div>
          <div className="flex gap-6">
            <a href="https://github.com/MarkusIsaksson1982/fullstack-observatory" target="_blank" className="hover:text-slate-300">GitHub</a>
            <a href="https://hpc-observatory-mcp.onrender.com/" target="_blank" className="hover:text-slate-300">Render Skill Demo</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
