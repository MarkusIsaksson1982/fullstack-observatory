'use client'

import { useEffect, useState, useCallback } from 'react'
import { Job, Node, ClusterStats } from '@/lib/types'
import { api } from '@/lib/api'

export function useHPCCluster() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [nodes, setNodes] = useState<Node[]>([])
  const [stats, setStats] = useState<ClusterStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      const [jobsData, nodesData, statsData] = await Promise.all([
        api.fetchJobs(),
        api.fetchNodes(),
        api.fetchStats()
      ])
      setJobs(jobsData)
      setNodes(nodesData)
      setStats(statsData)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 5000)
    return () => clearInterval(interval)
  }, [refresh])

  const submitJob = async (job: Partial<Job>) => {
    const result = await api.submitJob(job)
    if (result) {
      await refresh()
    }
    return result
  }

  const deleteJob = async (jobId: string) => {
    const result = await api.deleteJob(jobId)
    if (result) {
      await refresh()
    }
    return result
  }

  return {
    jobs,
    nodes,
    stats,
    loading,
    error,
    refresh,
    submitJob,
    deleteJob
  }
}
