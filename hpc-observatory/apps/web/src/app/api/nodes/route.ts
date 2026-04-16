import { NextResponse } from 'next/server'

const SCHEDULER_URL = process.env.SCHEDULER_URL || 'http://scheduler:8080'

export async function GET() {
  try {
    const res = await fetch(`${SCHEDULER_URL}/api/nodes`)
    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch nodes' }, { status: 500 })
  }
}
