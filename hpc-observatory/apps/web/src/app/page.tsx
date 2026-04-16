'use client'

import { useHPCCluster } from '@/lib/hooks'
import { StatsCards } from '@/components/StatsCards'
import { NodeGrid } from '@/components/NodeGrid'
import { JobTable } from '@/components/JobTable'
import { JobSubmitForm } from '@/components/JobSubmitForm'
import { Activity, Server, Zap, Clock, RefreshCw } from 'lucide-react'

export default function Dashboard() {
  const { jobs, nodes, stats, loading, error, refresh, submitJob, deleteJob } = useHPCCluster()

  return (
    <div className="min-h-screen p-6">
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              HPC-Observatory
            </h1>
            <p className="text-slate-400 mt-1">
              PBS-Style Scheduler with Hybrid Cloud Bursting & GPU-Aware Placement
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={refresh}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg">
              <Activity className="w-4 h-4" />
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Live
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-4 text-sm">
          <a href="http://localhost:9090" target="_blank" className="text-blue-400 hover:underline flex items-center gap-1">
            <Server className="w-4 h-4" /> Prometheus
          </a>
          <a href="http://localhost:3003" target="_blank" className="text-purple-400 hover:underline flex items-center gap-1">
            <Activity className="w-4 h-4" /> Grafana
          </a>
          <a href="http://localhost:9093" target="_blank" className="text-orange-400 hover:underline flex items-center gap-1">
            <Zap className="w-4 h-4" /> Alertmanager
          </a>
        </div>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <StatsCards stats={stats} />
        </div>
        <div className="metric-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            System Status
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Scheduler</span>
              <span className="flex items-center gap-2 text-green-400">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                Running
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Running Jobs</span>
              <span className="text-white font-mono">
                {stats?.jobs?.running ?? '-'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Queued Jobs</span>
              <span className="text-white font-mono">
                {stats?.jobs?.queued ?? '-'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">CPU Utilization</span>
              <span className="text-white font-mono">
                {stats?.resources?.cpuUtil ? `${(stats.resources.cpuUtil * 100).toFixed(1)}%` : '-'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">GPU Utilization</span>
              <span className="text-white font-mono">
                {stats?.resources?.gpuUtil ? `${(stats.resources.gpuUtil * 100).toFixed(1)}%` : '-'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Node Agents</span>
              <span className="flex items-center gap-2 text-green-400">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                {nodes.length} Online
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <NodeGrid nodes={nodes} />
        </div>
        <div>
          <JobSubmitForm onSubmit={submitJob} />
        </div>
      </div>

      <div className="mb-6">
        <JobTable jobs={jobs} onDelete={deleteJob} />
      </div>

      <footer className="text-center text-slate-500 text-sm mt-8">
        <p>HPC-Observatory v0.1.0 | PBS Professional Simulation | Prometheus + Grafana + Loki + Alertmanager</p>
        <p className="mt-1">
          Built as a production-grade showcase for HPC platform engineering
        </p>
      </footer>
    </div>
  )
}
