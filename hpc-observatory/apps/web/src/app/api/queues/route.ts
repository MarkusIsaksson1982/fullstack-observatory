import { NextResponse } from 'next/server'
import { isDemoMode, getDemoQueues } from '@/lib/demo-data'

const SCHEDULER_URL = process.env.SCHEDULER_URL || 'http://scheduler:8080'

export async function GET() {
  // Demo deployments (e.g. Vercel) have no scheduler to proxy to.
  if (isDemoMode()) return NextResponse.json({ queues: getDemoQueues() })
  try {
    const res = await fetch(`${SCHEDULER_URL}/api/queues`)
    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch queues' }, { status: 500 })
  }
}
