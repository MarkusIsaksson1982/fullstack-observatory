'use client'

import { Node } from '@/lib/types'
import { Server, Cpu, Zap } from 'lucide-react'

interface NodeGridProps {
  nodes: Node[]
}

export function NodeGrid({ nodes }: NodeGridProps) {
  const getNodeColor = (node: Node) => {
    if (node.state === 'free') return 'border-green-500/50 bg-green-500/10'
    if (node.state === 'busy') return 'border-blue-500/50 bg-blue-500/10'
    return 'border-red-500/50 bg-red-500/10'
  }

  const getNodeIcon = (node: Node) => {
    if (node.type === 'gpu') return Zap
    return Server
  }

  return (
    <div className="metric-card">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Server className="w-5 h-5 text-blue-400" />
        Compute Nodes
      </h3>
      <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
        {nodes.map((node) => {
          const Icon = getNodeIcon(node)
          return (
            <div
              key={node.name}
              className={`p-2 rounded border ${getNodeColor(node)} transition-all hover:scale-105`}
              title={`${node.name}\nCPUs: ${node.cpus}\nGPUs: ${node.gpus}\nState: ${node.state}`}
            >
              <div className="flex flex-col items-center">
                <Icon className={`w-4 h-4 ${
                  node.state === 'free' ? 'text-green-400' : 
                  node.state === 'busy' ? 'text-blue-400' : 'text-red-400'
                }`} />
                <span className="text-xs mt-1 truncate w-full text-center">
                  {node.name}
                </span>
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-4 flex gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-500/50"></div>
          <span>Free</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-blue-500/50"></div>
          <span>Busy</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-500/50"></div>
          <span>Down</span>
        </div>
      </div>
    </div>
  )
}
