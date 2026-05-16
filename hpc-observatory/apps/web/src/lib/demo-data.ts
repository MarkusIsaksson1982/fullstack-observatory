import { Job, Node, Queue, ClusterStats } from '@/lib/types'

export const isDemoMode = (): boolean =>
  process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

const minutesAgo = (m: number): string =>
  new Date(Date.now() - m * 60 * 1000).toISOString()

const hoursAgo = (h: number): string => minutesAgo(h * 60)

const minutesAhead = (m: number): string =>
  new Date(Date.now() + m * 60 * 1000).toISOString()

export function getDemoJobs(): Job[] {
  return [
    {
      id: 'job-10421',
      name: 'transformer-train-v3',
      owner: 'alice',
      queue: 'gpu',
      priority: 80,
      state: 'running',
      walltime: '12:00:00',
      walltimeUsed: '04:18:00',
      cpus: 16,
      gpus: 4,
      memoryMb: 131072,
      execHost: 'gpu-node-02',
      submitTime: hoursAgo(5),
      startTime: hoursAgo(4),
    },
    {
      id: 'job-10422',
      name: 'mol-dyn-run-42',
      owner: 'bob',
      queue: 'default',
      priority: 50,
      state: 'running',
      walltime: '08:00:00',
      walltimeUsed: '02:46:00',
      cpus: 32,
      gpus: 0,
      memoryMb: 65536,
      execHost: 'compute-node-04',
      submitTime: hoursAgo(3),
      startTime: hoursAgo(2),
    },
    {
      id: 'job-10423',
      name: 'cfd-airfoil-mesh',
      owner: 'carol',
      queue: 'long',
      priority: 30,
      state: 'running',
      walltime: '24:00:00',
      walltimeUsed: '07:12:00',
      cpus: 64,
      gpus: 0,
      memoryMb: 262144,
      execHost: 'compute-node-01',
      submitTime: hoursAgo(8),
      startTime: hoursAgo(7),
    },
    {
      id: 'job-10424',
      name: 'gnn-inference-batch',
      owner: 'alice',
      queue: 'gpu',
      priority: 75,
      state: 'running',
      walltime: '02:00:00',
      walltimeUsed: '00:34:00',
      cpus: 8,
      gpus: 2,
      memoryMb: 49152,
      execHost: 'gpu-node-01',
      submitTime: minutesAgo(40),
      startTime: minutesAgo(34),
    },
    {
      id: 'job-10425',
      name: 'mri-segment-pipeline',
      owner: 'research-team-1',
      queue: 'gpu',
      priority: 70,
      state: 'running',
      walltime: '06:00:00',
      walltimeUsed: '01:55:00',
      cpus: 12,
      gpus: 1,
      memoryMb: 32768,
      execHost: 'gpu-node-03',
      submitTime: hoursAgo(2),
      startTime: minutesAgo(115),
    },
    {
      id: 'job-10426',
      name: 'llm-eval-harness',
      owner: 'dave',
      queue: 'express',
      priority: 90,
      state: 'queued',
      walltime: '00:30:00',
      cpus: 4,
      gpus: 1,
      memoryMb: 16384,
      submitTime: minutesAgo(6),
    },
    {
      id: 'job-10427',
      name: 'param-sweep-xgb',
      owner: 'bob',
      queue: 'default',
      priority: 55,
      state: 'queued',
      walltime: '04:00:00',
      cpus: 16,
      gpus: 0,
      memoryMb: 32768,
      submitTime: minutesAgo(11),
    },
    {
      id: 'job-10428',
      name: 'seq-align-tcga',
      owner: 'research-team-2',
      queue: 'long',
      priority: 35,
      state: 'queued',
      walltime: '16:00:00',
      cpus: 48,
      gpus: 0,
      memoryMb: 196608,
      submitTime: minutesAgo(22),
    },
    {
      id: 'job-10417',
      name: 'transformer-train-v2',
      owner: 'alice',
      queue: 'gpu',
      priority: 80,
      state: 'completed',
      walltime: '12:00:00',
      walltimeUsed: '11:42:00',
      cpus: 16,
      gpus: 4,
      memoryMb: 131072,
      execHost: 'gpu-node-02',
      submitTime: hoursAgo(28),
      startTime: hoursAgo(27),
      endTime: hoursAgo(15),
    },
    {
      id: 'job-10418',
      name: 'mol-dyn-run-41',
      owner: 'bob',
      queue: 'default',
      priority: 50,
      state: 'completed',
      walltime: '08:00:00',
      walltimeUsed: '07:48:00',
      cpus: 32,
      gpus: 0,
      memoryMb: 65536,
      execHost: 'compute-node-04',
      submitTime: hoursAgo(18),
      startTime: hoursAgo(17),
      endTime: hoursAgo(9),
    },
    {
      id: 'job-10419',
      name: 'cfd-airfoil-mesh',
      owner: 'carol',
      queue: 'long',
      priority: 30,
      state: 'failed',
      walltime: '24:00:00',
      walltimeUsed: '00:08:00',
      cpus: 64,
      gpus: 0,
      memoryMb: 262144,
      execHost: 'compute-node-03',
      submitTime: hoursAgo(12),
      startTime: hoursAgo(11),
      endTime: hoursAgo(11),
    },
    {
      id: 'job-10420',
      name: 'genome-assemble',
      owner: 'research-team-2',
      queue: 'long',
      priority: 35,
      state: 'completed',
      walltime: '20:00:00',
      walltimeUsed: '18:24:00',
      cpus: 48,
      gpus: 0,
      memoryMb: 196608,
      execHost: 'compute-node-02',
      submitTime: hoursAgo(40),
      startTime: hoursAgo(38),
      endTime: hoursAgo(19),
    },
  ]
}

export function getDemoNodes(): Node[] {
  return [
    {
      name: 'gpu-node-01',
      state: 'busy',
      type: 'gpu',
      cpus: 32,
      gpus: 4,
      memoryMb: 262144,
    },
    {
      name: 'gpu-node-02',
      state: 'busy',
      type: 'gpu',
      cpus: 32,
      gpus: 4,
      memoryMb: 262144,
    },
    {
      name: 'gpu-node-03',
      state: 'busy',
      type: 'gpu',
      cpus: 32,
      gpus: 4,
      memoryMb: 262144,
    },
    {
      name: 'gpu-node-04',
      state: 'free',
      type: 'gpu',
      cpus: 32,
      gpus: 4,
      memoryMb: 262144,
    },
    {
      name: 'compute-node-01',
      state: 'busy',
      type: 'baremetal',
      cpus: 64,
      gpus: 0,
      memoryMb: 524288,
    },
    {
      name: 'compute-node-02',
      state: 'free',
      type: 'baremetal',
      cpus: 64,
      gpus: 0,
      memoryMb: 524288,
    },
    {
      name: 'compute-node-03',
      state: 'down',
      type: 'baremetal',
      cpus: 64,
      gpus: 0,
      memoryMb: 524288,
    },
    {
      name: 'compute-node-04',
      state: 'busy',
      type: 'baremetal',
      cpus: 64,
      gpus: 0,
      memoryMb: 524288,
    },
  ]
}

export function getDemoQueues(): Queue[] {
  return [
    { name: 'express', priority: 90, maxJobs: 4, timeLimit: '00:30:00' },
    { name: 'gpu', priority: 75, maxJobs: 16, timeLimit: '24:00:00' },
    { name: 'default', priority: 50, maxJobs: 64, timeLimit: '08:00:00' },
    { name: 'long', priority: 30, maxJobs: 16, timeLimit: '72:00:00' },
    { name: 'debug', priority: 95, maxJobs: 2, timeLimit: '00:15:00' },
  ]
}

export function getDemoStats(): ClusterStats {
  const nodes = getDemoNodes()
  const jobs = getDemoJobs()
  const busyNodes = nodes.filter((n) => n.state === 'busy')
  const totalCpus = nodes.reduce((s, n) => s + n.cpus, 0)
  const totalGpus = nodes.reduce((s, n) => s + n.gpus, 0)
  const usedCpus = busyNodes.reduce((s, n) => s + n.cpus, 0)
  const usedGpus = busyNodes.reduce((s, n) => s + n.gpus, 0)

  return {
    jobs: {
      queued: jobs.filter((j) => j.state === 'queued').length,
      running: jobs.filter((j) => j.state === 'running').length,
      completed: jobs.filter((j) => j.state === 'completed').length,
      failed: jobs.filter((j) => j.state === 'failed').length,
    },
    resources: {
      totalCpus,
      usedCpus,
      cpuUtil: usedCpus / totalCpus,
      totalGpus,
      usedGpus,
      gpuUtil: usedGpus / totalGpus,
    },
    nodes: nodes.length,
    queues: getDemoQueues().length,
    updated: new Date().toISOString(),
  }
}

export function buildDemoSubmittedJob(input: Partial<Job>): Job {
  return {
    id: `job-${Math.floor(10500 + Math.random() * 500)}`,
    name: input.name ?? 'demo-job',
    owner: input.owner ?? 'demo-user',
    queue: input.queue ?? 'default',
    priority: input.priority ?? 50,
    state: 'queued',
    walltime: input.walltime ?? '01:00:00',
    cpus: input.cpus ?? 4,
    gpus: input.gpus ?? 0,
    memoryMb: input.memoryMb ?? 8192,
    submitTime: new Date().toISOString(),
  }
}
