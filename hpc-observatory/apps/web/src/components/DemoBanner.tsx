import { isDemoMode } from '@/lib/demo-data'

export function DemoBanner() {
  if (!isDemoMode()) return null
  return (
    <div className="w-full bg-amber-500/15 border-b border-amber-500/40 text-amber-200 text-sm px-4 py-2 text-center">
      <strong className="font-semibold">DEMO MODE</strong>
      <span className="mx-2 opacity-50">|</span>
      Sample data, no live scheduler attached.{' '}
      <a
        href="https://github.com/MarkusIsaksson1982/fullstack-observatory"
        className="underline hover:text-amber-100"
        target="_blank"
        rel="noopener noreferrer"
      >
        Clone the repo
      </a>{' '}
      and run <code className="px-1 py-0.5 bg-amber-500/20 rounded">docker compose up</code> for the live dashboard.
    </div>
  )
}
