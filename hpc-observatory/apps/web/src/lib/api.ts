import { Job, Node, Queue, ClusterStats, HPCApi } from '@/lib/types'

class HPCApiClient implements HPCApi {

  async fetchJobs(): Promise<Job[]> {
    try {
      const res = await fetch('/api/jobs')
      if (!res.ok) throw new Error('Failed to fetch jobs')
      const data = await res.json()
      return data.jobs || []
    } catch (error) {
      console.error('Error fetching jobs:', error)
      return []
    }
  }

  async fetchNodes(): Promise<Node[]> {
    try {
      const res = await fetch('/api/nodes')
      if (!res.ok) throw new Error('Failed to fetch nodes')
      const data = await res.json()
      return data.nodes || []
    } catch (error) {
      console.error('Error fetching nodes:', error)
      return []
    }
  }

  async fetchQueues(): Promise<Queue[]> {
    try {
      const res = await fetch('/api/queues')
      if (!res.ok) throw new Error('Failed to fetch queues')
      const data = await res.json()
      return data.queues || []
    } catch (error) {
      console.error('Error fetching queues:', error)
      return []
    }
  }

  async fetchStats(): Promise<ClusterStats | null> {
    try {
      const res = await fetch('/api/stats')
      if (!res.ok) throw new Error('Failed to fetch stats')
      const data = await res.json()
      return data.stats || null
    } catch (error) {
      console.error('Error fetching stats:', error)
      return null
    }
  }

  async submitJob(job: Partial<Job>): Promise<Job | null> {
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(job)
      })
      if (!res.ok) throw new Error('Failed to submit job')
      return await res.json()
    } catch (error) {
      console.error('Error submitting job:', error)
      return null
    }
  }

  async deleteJob(jobId: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/jobs?jobId=${jobId}`, {
        method: 'DELETE'
      })
      return res.ok
    } catch (error) {
      console.error('Error deleting job:', error)
      return false
    }
  }
}

export const api = new HPCApiClient()
