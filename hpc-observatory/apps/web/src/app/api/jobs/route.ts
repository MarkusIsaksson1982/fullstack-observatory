import { NextResponse } from 'next/server'

const SCHEDULER_URL = process.env.SCHEDULER_URL || 'http://scheduler:8080'

export async function GET() {
  try {
    const res = await fetch(`${SCHEDULER_URL}/api/jobs`, {
      signal: AbortSignal.timeout(5000)
    })
    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')
    const res = await fetch(`${SCHEDULER_URL}/api/jobs/${jobId}`, { method: 'DELETE' })
    return NextResponse.json({ ok: res.ok })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 })
  }
}
