'use client'

import { useState } from 'react'
import { Job } from '@/lib/types'
import { Play, Trash2, Clock, Cpu, Zap, User } from 'lucide-react'

interface JobTableProps {
  jobs: Job[]
  onDelete: (id: string) => void
}

const stateColors: Record<string, string> = {
  queued: 'text-yellow-400 bg-yellow-400/10',
  running: 'text-green-400 bg-green-400/10',
  completed: 'text-slate-400 bg-slate-400/10',
  failed: 'text-red-400 bg-red-400/10',
  cancelled: 'text-orange-400 bg-orange-400/10'
}

export function JobTable({ jobs, onDelete }: JobTableProps) {
  const [filter, setFilter] = useState<string>('all')

  const filteredJobs = filter === 'all' 
    ? jobs 
    : jobs.filter(j => j.state === filter)

  const formatTime = (timeStr: string | undefined) => {
    if (!timeStr) return '-'
    try {
      return new Date(timeStr).toLocaleTimeString()
    } catch {
      return timeStr
    }
  }

  return (
    <div className="metric-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Jobs</h3>
        <div className="flex gap-2">
          {['all', 'queued', 'running', 'completed', 'failed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded text-sm ${
                filter === f 
                  ? 'bg-blue-500/20 text-blue-400' 
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-400 border-b border-slate-700">
              <th className="text-left py-2 px-2">ID</th>
              <th className="text-left py-2 px-2">Name</th>
              <th className="text-left py-2 px-2">Owner</th>
              <th className="text-left py-2 px-2">Queue</th>
              <th className="text-left py-2 px-2">State</th>
              <th className="text-left py-2 px-2">CPUs</th>
              <th className="text-left py-2 px-2">GPUs</th>
              <th className="text-left py-2 px-2">Submit Time</th>
              <th className="text-left py-2 px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-8 text-slate-500">
                  No jobs found
                </td>
              </tr>
            ) : (
              filteredJobs.slice(0, 20).map((job) => (
                <tr 
                  key={job.id} 
                  className="border-b border-slate-800 hover:bg-slate-800/50"
                >
                  <td className="py-2 px-2 font-mono text-xs">{job.id}</td>
                  <td className="py-2 px-2">{job.name}</td>
                  <td className="py-2 px-2">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {job.owner}
                    </span>
                  </td>
                  <td className="py-2 px-2">{job.queue}</td>
                  <td className="py-2 px-2">
                    <span className={`px-2 py-0.5 rounded ${stateColors[job.state]}`}>
                      {job.state}
                    </span>
                  </td>
                  <td className="py-2 px-2">
                    <span className="flex items-center gap-1">
                      <Cpu className="w-3 h-3" />
                      {job.cpus}
                    </span>
                  </td>
                  <td className="py-2 px-2">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      {job.gpus}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(job.submitTime)}
                    </span>
                  </td>
                  <td className="py-2 px-2">
                    {job.state === 'queued' && (
                      <button
                        onClick={() => onDelete(job.id)}
                        className="p-1 rounded hover:bg-red-500/20 text-red-400"
                        title="Delete job"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    {job.state === 'running' && (
                      <Play className="w-4 h-4 text-green-400 animate-pulse" />
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {filteredJobs.length > 20 && (
        <p className="text-sm text-slate-500 mt-2">
          Showing 20 of {filteredJobs.length} jobs
        </p>
      )}
    </div>
  )
}
