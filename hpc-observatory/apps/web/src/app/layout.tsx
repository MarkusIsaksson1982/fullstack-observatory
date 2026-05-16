import type { Metadata } from 'next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/next'
import { DemoBanner } from '@/components/DemoBanner'
import './globals.css'

export const metadata: Metadata = {
  title: 'HPC-Observatory | PBS-Style Scheduler Dashboard',
  description: 'Production-grade HPC scheduler with real-time observability',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-900 text-slate-100">
        <DemoBanner />
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
