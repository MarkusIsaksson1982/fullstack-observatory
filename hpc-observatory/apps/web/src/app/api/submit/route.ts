import { NextResponse } from 'next/server'

const SCHEDULER_URL = process.env.SCHEDULER_URL || 'http://scheduler:8080'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const res = await fetch(`${SCHEDULER_URL}/api/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit job' }, { status: 500 })
  }
}
