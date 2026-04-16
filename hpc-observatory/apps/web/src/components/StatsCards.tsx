'use client'

import { ClusterStats } from '@/lib/types'
import { Cpu, MemoryStick, Server, Clock, Activity, Gauge, Zap } from 'lucide-react'

interface StatsCardsProps {
  stats: ClusterStats | null
}

export function StatsCards({ stats }: StatsCardsProps) {
  if (!stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="metric-card animate-pulse">
            <div className="h-4 bg-slate-700 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-slate-700 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  const cards = [
    {
      label: 'Jobs Queued',
      value: stats.jobs.queued,
      icon: Clock,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10'
    },
    {
      label: 'Jobs Running',
      value: stats.jobs.running,
      icon: Activity,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10'
    },
    {
      label: 'CPU Utilization',
      value: `${stats.resources.cpuUtil}%`,
      icon: Cpu,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10'
    },
    {
      label: 'GPU Utilization',
      value: `${stats.resources.gpuUtil}%`,
      icon: Zap,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10'
    },
    {
      label: 'Total Nodes',
      value: stats.nodes,
      icon: Server,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-400/10'
    },
    {
      label: 'CPUs Used',
      value: `${stats.resources.usedCpus}/${stats.resources.totalCpus}`,
      icon: Gauge,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-400/10'
    },
    {
      label: 'GPUs Used',
      value: `${stats.resources.usedGpus}/${stats.resources.totalGpus}`,
      icon: Zap,
      color: 'text-pink-400',
      bgColor: 'bg-pink-400/10'
    },
    {
      label: 'Completed',
      value: stats.jobs.completed,
      icon: Activity,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-400/10'
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div key={i} className={`metric-card ${card.bgColor}`}>
          <div className="flex items-center gap-2 mb-2">
            <card.icon className={`w-4 h-4 ${card.color}`} />
            <span className="text-sm text-slate-400">{card.label}</span>
          </div>
          <div className={`text-2xl font-bold ${card.color}`}>
            {card.value}
          </div>
        </div>
      ))}
    </div>
  )
}
