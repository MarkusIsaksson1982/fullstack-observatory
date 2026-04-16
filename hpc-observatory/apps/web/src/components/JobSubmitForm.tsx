'use client'

import { useState } from 'react'
import { Job } from '@/lib/types'
import { Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

interface JobSubmitFormProps {
  onSubmit: (job: Partial<Job>) => Promise<Job | null>
}

export function JobSubmitForm({ onSubmit }: JobSubmitFormProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '',
    owner: 'researcher1',
    queue: 'default',
    cpus: 1,
    gpus: 0,
    memoryMb: 4096,
    walltime: '01:00:00',
    priority: 100
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const walltimeParts = form.walltime.split(':')
      const hours = parseInt(walltimeParts[0]) || 1
      const minutes = parseInt(walltimeParts[1]) || 0
      const seconds = parseInt(walltimeParts[2]) || 0
      const totalMs = (hours * 3600 + minutes * 60 + seconds) * 1000

      const result = await onSubmit({
        name: form.name || `job-${Date.now()}`,
        owner: form.owner,
        queue: form.queue,
        cpus: form.cpus,
        gpus: form.gpus,
        memoryMb: form.memoryMb,
        walltime: `${totalMs}ms`,
        priority: form.priority
      })

      if (result) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
        setForm({
          ...form,
          name: ''
        })
      } else {
        setError('Failed to submit job')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="metric-card">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Send className="w-5 h-5 text-blue-400" />
        Submit Job
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Job Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="my-job"
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Owner</label>
            <select
              value={form.owner}
              onChange={(e) => setForm({ ...form, owner: e.target.value })}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm"
            >
              <option value="researcher1">researcher1</option>
              <option value="researcher2">researcher2</option>
              <option value="data scientist">data scientist</option>
              <option value="ml-engineer">ml-engineer</option>
              <option value="analyst">analyst</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Queue</label>
            <select
              value={form.queue}
              onChange={(e) => setForm({ ...form, queue: e.target.value })}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm"
            >
              <option value="default">default</option>
              <option value="short">short (30min)</option>
              <option value="long">long (168h)</option>
              <option value="gpu">gpu</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">CPUs</label>
            <input
              type="number"
              min={1}
              max={64}
              value={form.cpus}
              onChange={(e) => setForm({ ...form, cpus: parseInt(e.target.value) || 1 })}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">GPUs</label>
            <input
              type="number"
              min={0}
              max={8}
              value={form.gpus}
              onChange={(e) => setForm({ ...form, gpus: parseInt(e.target.value) || 0 })}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Memory (MB)</label>
            <input
              type="number"
              min={256}
              max={524288}
              step={256}
              value={form.memoryMb}
              onChange={(e) => setForm({ ...form, memoryMb: parseInt(e.target.value) || 4096 })}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Walltime (HH:MM:SS)</label>
            <input
              type="text"
              value={form.walltime}
              onChange={(e) => setForm({ ...form, walltime: e.target.value })}
              placeholder="01:00:00"
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1">Priority (0-1000)</label>
          <input
            type="range"
            min={0}
            max={1000}
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="text-sm text-slate-400 text-right">{form.priority}</div>
        </div>

        {success && (
          <div className="flex items-center gap-2 text-green-400 bg-green-400/10 p-2 rounded">
            <CheckCircle2 className="w-4 h-4" />
            <span>Job submitted successfully!</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-2 rounded">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 text-white font-medium py-2 px-4 rounded flex items-center justify-center gap-2 transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Submit Job
            </>
          )}
        </button>
      </form>
    </div>
  )
}
