import { test, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { GET as stats } from '../src/app/api/stats/route'
import { GET as jobs } from '../src/app/api/jobs/route'
import { GET as nodes } from '../src/app/api/nodes/route'
import { GET as queues } from '../src/app/api/queues/route'

const realFetch = globalThis.fetch
let fetchCalls = 0
beforeEach(() => {
  fetchCalls = 0
  globalThis.fetch = (async () => { fetchCalls++; throw new Error('getaddrinfo ENOTFOUND scheduler') }) as typeof fetch
})
afterEach(() => { globalThis.fetch = realFetch; delete process.env.NEXT_PUBLIC_DEMO_MODE })

const cases = [['stats', stats], ['jobs', jobs], ['nodes', nodes], ['queues', queues]] as const

for (const [key, handler] of cases) {
  test(`/api/${key} serves sample data in demo mode without calling the scheduler`, async () => {
    process.env.NEXT_PUBLIC_DEMO_MODE = 'true'
    const res = await handler()
    assert.equal(res.status, 200)
    const body = await res.json()
    assert.ok(body[key], `response has ${key}`)
    if (Array.isArray(body[key])) assert.ok(body[key].length > 0)
    assert.equal(fetchCalls, 0)
  })

  test(`/api/${key} still proxies (and 500s on scheduler failure) outside demo mode`, async () => {
    const res = await handler()
    assert.equal(res.status, 500)
    assert.equal(fetchCalls, 1)
  })
}
