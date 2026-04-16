export type JobState = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled'

export interface Job {
  id: string
  name: string
  owner: string
  queue: string
  priority: number
  state: JobState
  walltime: string
  walltimeUsed?: string
  cpus: number
  gpus: number
  memoryMb: number
  execHost?: string
  submitTime: string
  startTime?: string
  endTime?: string
}

export interface Node {
  name: string
  state: 'free' | 'busy' | 'down'
  type: 'baremetal' | 'virtual' | 'gpu'
  cpus: number
  gpus: number
  memoryMb: number
  jobs?: Job[]
}

export interface Queue {
  name: string
  priority: number
  maxJobs: number
  timeLimit: string
}

export interface ClusterStats {
  jobs: {
    queued: number
    running: number
    completed: number
    failed: number
  }
  resources: {
    totalCpus: number
    usedCpus: number
    cpuUtil: number
    totalGpus: number
    usedGpus: number
    gpuUtil: number
  }
  nodes: number
  queues: number
  updated: string
}

export interface HPCApi {
  fetchJobs(): Promise<Job[]>
  fetchNodes(): Promise<Node[]>
  fetchQueues(): Promise<Queue[]>
  fetchStats(): Promise<ClusterStats | null>
  submitJob(job: Partial<Job>): Promise<Job | null>
  deleteJob(jobId: string): Promise<boolean>
}
